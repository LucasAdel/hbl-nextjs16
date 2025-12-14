import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Resend webhook event types
interface ResendWebhookEvent {
  type: "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.complained";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    click?: {
      link: string;
      timestamp: string;
    };
    bounce?: {
      message: string;
    };
  };
}

// Verify Resend webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Alert threshold for bounce rate
const BOUNCE_RATE_ALERT_THRESHOLD = 5; // 5%

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("resend-signature") || "";
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify signature in production
    if (webhookSecret && process.env.NODE_ENV === "production") {
      if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event: ResendWebhookEvent = JSON.parse(payload);
    const supabase = await createClient();

    // Extract email from the "to" array
    const recipientEmail = event.data.to[0]?.toLowerCase();

    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email" }, { status: 400 });
    }

    // Find the enrollment by email and recent send
    const { data: enrollments } = await supabase
      .from("email_sequence_enrollments")
      .select("id")
      .eq("email", recipientEmail)
      .in("status", ["active", "paused", "completed"])
      .order("updated_at", { ascending: false })
      .limit(1);

    const enrollmentId = enrollments?.[0]?.id;

    // Map Resend event type to our event type
    let eventType: "sent" | "opened" | "clicked" | "bounced" | "unsubscribed" | null = null;
    const metadata: Record<string, unknown> = {
      resendEmailId: event.data.email_id,
      subject: event.data.subject,
      timestamp: event.created_at,
    };

    switch (event.type) {
      case "email.sent":
      case "email.delivered":
        eventType = "sent";
        break;
      case "email.opened":
        eventType = "opened";
        break;
      case "email.clicked":
        eventType = "clicked";
        metadata.clickedLink = event.data.click?.link;
        break;
      case "email.bounced":
        eventType = "bounced";
        metadata.bounceMessage = event.data.bounce?.message;
        break;
      case "email.complained":
        eventType = "unsubscribed";
        break;
    }

    if (eventType && enrollmentId) {
      // Record the event
      await supabase.from("email_sequence_events").insert({
        enrollment_id: enrollmentId,
        event_type: eventType,
        metadata: metadata as unknown as Record<string, never>,
        created_at: new Date().toISOString(),
      });

      // Handle bounces - mark enrollment as cancelled if hard bounce
      if (eventType === "bounced") {
        await supabase
          .from("email_sequence_enrollments")
          .update({ status: "cancelled" })
          .eq("id", enrollmentId);

        // Check bounce rate and send alert if threshold exceeded
        await checkBounceRateAlert(supabase);
      }

      // Handle unsubscribes
      if (eventType === "unsubscribed") {
        // Cancel all active sequences for this email
        await supabase
          .from("email_sequence_enrollments")
          .update({ status: "cancelled" })
          .eq("email", recipientEmail)
          .eq("status", "active");

        // Update newsletter subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ status: "unsubscribed" })
          .eq("email", recipientEmail);
      }
    }

    // Update daily analytics
    const today = new Date().toISOString().split("T")[0];

    // Try to get existing record for today
    const { data: existingStats } = await supabase
      .from("email_analytics_daily")
      .select("*")
      .eq("date", today)
      .eq("sequence_type", "all")
      .single();

    if (existingStats) {
      // Update existing record
      const updates: Record<string, number> = {};
      if (eventType === "sent") updates.sent_count = existingStats.sent_count + 1;
      if (eventType === "opened") updates.opened_count = existingStats.opened_count + 1;
      if (eventType === "clicked") updates.clicked_count = existingStats.clicked_count + 1;
      if (eventType === "bounced") updates.bounced_count = existingStats.bounced_count + 1;
      if (eventType === "unsubscribed") updates.unsubscribed_count = existingStats.unsubscribed_count + 1;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("email_analytics_daily")
          .update(updates)
          .eq("id", existingStats.id);
      }
    } else {
      // Create new record
      await supabase.from("email_analytics_daily").insert({
        date: today,
        sequence_type: "all",
        sent_count: eventType === "sent" ? 1 : 0,
        opened_count: eventType === "opened" ? 1 : 0,
        clicked_count: eventType === "clicked" ? 1 : 0,
        bounced_count: eventType === "bounced" ? 1 : 0,
        unsubscribed_count: eventType === "unsubscribed" ? 1 : 0,
      });
    }

    return NextResponse.json({ success: true, eventType });
  } catch (error) {
    console.error("Resend webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Check bounce rate and send alert if needed
async function checkBounceRateAlert(supabase: Awaited<ReturnType<typeof createClient>>) {
  // Get last 7 days of stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: events } = await supabase
    .from("email_sequence_events")
    .select("event_type")
    .gte("created_at", sevenDaysAgo.toISOString())
    .in("event_type", ["sent", "bounced"]);

  if (!events || events.length === 0) return;

  const sentCount = events.filter(e => e.event_type === "sent").length;
  const bouncedCount = events.filter(e => e.event_type === "bounced").length;

  if (sentCount > 0) {
    const bounceRate = (bouncedCount / sentCount) * 100;

    if (bounceRate >= BOUNCE_RATE_ALERT_THRESHOLD) {
      // Log alert (in production, send email/Slack notification)
      console.error(`[ALERT] High bounce rate detected: ${bounceRate.toFixed(2)}% (${bouncedCount}/${sentCount} emails)`);

      // Could integrate with notification service here
      // await sendSlackAlert(`High bounce rate: ${bounceRate.toFixed(2)}%`);
    }
  }
}
