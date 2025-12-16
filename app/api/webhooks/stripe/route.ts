import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  notifyPaymentReceived,
  notifyDocumentPurchased,
  notifyXPEarned,
  notifyAchievementUnlocked,
} from "@/lib/notifications/notification-triggers";
import { processWebhookIdempotent } from "@/lib/webhooks/idempotency";
import { createCalendarEvent } from "@/lib/google-calendar";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

// SECURITY: Use environment variable for admin email
const ADMIN_EMAIL = env.ADMIN_NOTIFICATION_EMAIL;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// XP rewards for purchases
const PURCHASE_XP = {
  basePerDollar: 10, // 10 XP per dollar spent
  firstPurchaseBonus: 500, // First purchase bonus
  bundleMultiplier: 3, // 3x XP for bundles
  referralBonus: 100, // Bonus if referred
};

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isBundle?: boolean;
}

/**
 * Award XP for a purchase
 */
async function awardPurchaseXP(
  supabase: ReturnType<typeof createServiceRoleClient>,
  email: string,
  amount: number,
  isFirstPurchase: boolean,
  hasBundle: boolean,
  sessionId: string
): Promise<number> {

  // Calculate base XP (10 XP per dollar)
  let xpAmount = Math.round(amount * PURCHASE_XP.basePerDollar);

  // Apply bundle multiplier
  if (hasBundle) {
    xpAmount = Math.round(xpAmount * PURCHASE_XP.bundleMultiplier);
  }

  // Record base XP transaction
  await supabase.from("xp_transactions").insert({
    user_email: email,
    amount: xpAmount,
    source: "purchase",
    multiplier: hasBundle ? PURCHASE_XP.bundleMultiplier : 1.0,
    description: `Purchase XP (${hasBundle ? "3x bundle bonus" : "standard"})`,
    metadata: { session_id: sessionId, amount_spent: amount },
  });

  // First purchase bonus
  if (isFirstPurchase) {
    await supabase.from("xp_transactions").insert({
      user_email: email,
      amount: PURCHASE_XP.firstPurchaseBonus,
      source: "achievement",
      multiplier: 1.0,
      description: "First Purchase Bonus!",
      metadata: { achievement: "first_purchase", session_id: sessionId },
    });
    xpAmount += PURCHASE_XP.firstPurchaseBonus;
  }

  // Update user profile total XP
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, total_xp")
    .eq("email", email)
    .single();

  if (profile) {
    await supabase
      .from("user_profiles")
      .update({ total_xp: (profile.total_xp || 0) + xpAmount })
      .eq("id", profile.id);
  } else {
    // Create profile if doesn't exist
    await supabase.from("user_profiles").insert({
      email,
      total_xp: xpAmount,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
    });
  }

  return xpAmount;
}

/**
 * Check if this is the user's first purchase
 */
async function isFirstPurchase(supabase: ReturnType<typeof createServiceRoleClient>, email: string): Promise<boolean> {
  const { count } = await supabase
    .from("document_purchases")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email)
    .eq("status", "completed");

  return (count || 0) === 0;
}

/**
 * Record purchase to database
 */
async function recordPurchase(
  supabase: ReturnType<typeof createServiceRoleClient>,
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): Promise<void> {

  const email = session.customer_email || session.metadata?.customerEmail || "";
  const metadata = session.metadata || {};

  // Parse items from line items
  const items: PurchaseItem[] = lineItems.map((item) => ({
    id: item.price?.product?.toString() || item.id,
    name: item.description || "Document",
    price: (item.amount_total || 0) / 100, // Convert from cents
    quantity: item.quantity || 1,
    isBundle: item.description?.toLowerCase().includes("bundle"),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = (session.amount_total || 0) / 100;
  const gst = Math.round((total / 11) * 100) / 100; // Extract GST from total

  await supabase.from("document_purchases").insert({
    user_email: email,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent?.toString(),
    items: items as unknown as Json,
    subtotal: Math.round(subtotal * 100), // Store in cents
    discount: 0,
    gst: Math.round(gst * 100),
    total: Math.round(total * 100),
    coupon_code: metadata.couponCode || null,
    status: "completed",
    metadata: {
      type: metadata.type,
      customer_name: metadata.customerName,
    } as unknown as Json,
  });
}

/**
 * Update referral status if purchase was from referred user
 */
async function checkReferralPurchase(supabase: ReturnType<typeof createServiceRoleClient>, email: string): Promise<void> {
  // Check if user was referred and hasn't purchased before
  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_email, status")
    .eq("referred_email", email)
    .eq("status", "signed_up")
    .single();

  if (referral) {
    // Update referral to purchased
    await supabase
      .from("referrals")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
        purchase_xp_awarded: 500,
      })
      .eq("id", referral.id);

    // Award referrer XP
    await supabase.from("xp_transactions").insert({
      user_email: referral.referrer_email,
      amount: 500,
      source: "referral",
      multiplier: 1.0,
      description: "Referral made a purchase!",
      metadata: { referred_email: email },
    });

    // Update referrer's total XP
    const { data: referrerProfile } = await supabase
      .from("user_profiles")
      .select("id, total_xp")
      .eq("email", referral.referrer_email)
      .single();

    if (referrerProfile) {
      await supabase
        .from("user_profiles")
        .update({ total_xp: (referrerProfile.total_xp || 0) + 500 })
        .eq("id", referrerProfile.id);
    }
  }
}

/**
 * PAYMENT-GATED WORKFLOW: Post-Payment Booking Confirmation
 *
 * This is the ONLY function that confirms bookings after payment.
 *
 * Process:
 * 1. Updates advanced_bookings: "pending_payment" -> "confirmed"
 * 2. Creates Google Calendar event with Meet link
 * 3. Sends confirmation email to client
 * 4. Sends notification email to admin
 *
 * SECURITY: Payment-gating prevents spam/fake bookings
 * - Calendar events ONLY created here (after payment)
 * - Emails ONLY sent here (after payment)
 *
 * See: /docs/BOOKING_SYSTEM_ARCHITECTURE.md for workflow diagram
 * See: CLAUDE.md Section 11 for payment-gating security rules
 */
async function updateBookingStatusAfterPayment(
  supabase: ReturnType<typeof createServiceRoleClient>,
  session: Stripe.Checkout.Session
): Promise<void> {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.log("No booking ID in session metadata, skipping booking update");
    return;
  }

  try {
    // Fetch full booking details
    const { data: booking, error: fetchError } = await supabase
      .from("advanced_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("Failed to fetch booking:", fetchError);
      return;
    }

    // Update status to confirmed
    await supabase
      .from("advanced_bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    console.log(`Booking confirmed: ${bookingId}`);

    // Extract booking details
    const clientName = booking.client_name;
    const clientEmail = booking.client_email;
    const clientPhone = booking.client_phone;
    const consultationType = booking.event_type_name || "Consultation";
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const notes = booking.notes || "";
    const customAnswers = (booking.custom_answers || {}) as Record<string, unknown>;
    const practiceType = (customAnswers.practiceType as string) || "";
    const practiceWebsite = (customAnswers.practiceWebsite as string) || "";
    const uploadedFiles = (customAnswers.uploadedFiles as string[]) || [];

    // Calculate duration
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Create Google Calendar event NOW (after payment confirmed)
    let meetLink: string | null = null;
    const calendarResult = await createCalendarEvent({
      summary: `${consultationType} - ${clientName}`,
      description: `
Client: ${clientName}
Email: ${clientEmail}
Phone: ${clientPhone || "Not provided"}
Practice Type: ${practiceType || "Not specified"}
Practice Website: ${practiceWebsite || "Not provided"}

Notes:
${notes || "No additional notes"}

${uploadedFiles && uploadedFiles.length > 0 ? `Uploaded Documents: ${uploadedFiles.join(", ")}` : ""}
      `.trim(),
      startTime,
      endTime,
      attendeeEmail: clientEmail,
      attendeeName: clientName,
      location: "Video Conference",
    });

    // Store calendar event ID if created
    if (calendarResult.success && calendarResult.eventId) {
      await supabase
        .from("advanced_bookings")
        .update({ google_event_id: calendarResult.eventId })
        .eq("id", bookingId);

      // Extract Meet link from calendar event
      if (calendarResult.eventData) {
        const eventData = calendarResult.eventData as Record<string, unknown>;
        meetLink = (eventData.hangoutLink as string) || null;
      }

      console.log(`Calendar event created for booking ${bookingId}: ${calendarResult.eventId}`);
    } else {
      console.error(`Failed to create calendar event for booking ${bookingId}`);
    }

    // Format date for display
    const formattedDate = startTime.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = startTime.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Send confirmation email to client
    try {
      await resend.emails.send({
        from: "HBL Legal <noreply@hamiltonbailey.com>",
        to: clientEmail,
        subject: `Booking Confirmed - ${consultationType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #40E0D0; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Booking Confirmed</h1>
            </div>

            <div style="padding: 30px; background: #f9f9f9;">
              <p>Dear ${clientName},</p>

              <p>Thank you for your payment. Your <strong>${consultationType}</strong> with Hamilton Bailey Legal is now confirmed.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #40E0D0; margin-top: 0;">Appointment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedTime} (ACST)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Duration:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${durationMinutes} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Format:</td>
                    <td style="padding: 8px 0; font-weight: bold;">Video Conference</td>
                  </tr>
                </table>
              </div>

              ${meetLink ? `
              <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #2E7D32; font-weight: bold;">
                  Your Video Conference Link
                </p>
                <a href="${meetLink}" style="display: inline-block; background: #0F9D58; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Join Google Meet
                </a>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
                  ${meetLink}
                </p>
              </div>
              ` : `
              <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <p style="margin: 0; color: #92400E;">
                  <strong>What's Next?</strong><br />
                  You will receive a calendar invitation with a video conference link. Please ensure you have a stable internet connection and a quiet space for your consultation.
                </p>
              </div>
              `}

              <p style="color: #666;">If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>

              <p>We look forward to speaking with you.</p>

              <p>Best regards,<br />
              <strong>Hamilton Bailey Legal</strong></p>
            </div>

            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hamilton Bailey Legal | 147 Pirie Street, Adelaide SA 5000<br />
                Phone: 08 5122 6500 | lw@hamiltonbailey.com
              </p>
            </div>
          </div>
        `,
      });
      console.log(`Confirmation email sent to client: ${clientEmail}`);
    } catch (emailError) {
      console.error("Client email error:", emailError);
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: "HBL Legal <noreply@hamiltonbailey.com>",
        to: ADMIN_EMAIL,
        subject: `New Paid Booking: ${consultationType} - ${clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #40E0D0; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Paid Booking</h1>
            </div>

            <div style="padding: 30px; background: #f9f9f9;">
              <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50; margin-bottom: 20px;">
                <p style="margin: 0; color: #2E7D32; font-weight: bold;">
                  ✓ Payment Confirmed - Booking Active
                </p>
              </div>

              <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;">Consultation:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${consultationType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedTime} (ACST)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Duration:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${durationMinutes} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Payment:</td>
                    <td style="padding: 8px 0; font-weight: bold; color: #4CAF50;">$${((session.amount_total || 0) / 100).toFixed(2)} AUD</td>
                  </tr>
                </table>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #40E0D0; margin-top: 0;">Client Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;">Name:</td>
                    <td style="padding: 8px 0;">${clientName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${clientEmail}">${clientEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Phone:</td>
                    <td style="padding: 8px 0;">${clientPhone || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Practice Type:</td>
                    <td style="padding: 8px 0;">${practiceType || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Practice Website:</td>
                    <td style="padding: 8px 0;">
                      ${practiceWebsite ? `<a href="${practiceWebsite}">${practiceWebsite}</a>` : "Not provided"}
                    </td>
                  </tr>
                </table>
              </div>

              ${notes ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #40E0D0; margin-top: 0;">Client Notes</h3>
                <p style="color: #333; margin: 0; white-space: pre-wrap;">${notes}</p>
              </div>
              ` : ""}

              ${meetLink ? `
              <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #2E7D32; font-weight: bold;">
                  Google Meet Link
                </p>
                <a href="${meetLink}" style="display: inline-block; background: #0F9D58; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Join Meeting
                </a>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
                  ${meetLink}
                </p>
              </div>
              ` : ""}
            </div>

            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from the HBL website booking system.
              </p>
            </div>
          </div>
        `,
      });
      console.log(`Notification email sent to admin: ${ADMIN_EMAIL}`);
    } catch (emailError) {
      console.error("Admin email error:", emailError);
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createServiceRoleClient();

  const email = session.customer_email || session.metadata?.customerEmail || "";
  const purchaseType = session.metadata?.type || "document";

  if (!email) {
    console.error("No customer email in session:", session.id);
    return;
  }

  // Update booking status if this checkout includes a booking
  await updateBookingStatusAfterPayment(supabase, session);

  // Only process document purchases
  if (purchaseType !== "document") {
    console.log("Skipping non-document purchase:", purchaseType);
    return;
  }

  // Get line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  // Check if first purchase
  const firstPurchase = await isFirstPurchase(supabase, email);

  // Check for bundle in items
  const hasBundle = lineItems.data.some(
    (item) => item.description?.toLowerCase().includes("bundle")
  );

  // Record purchase
  await recordPurchase(supabase, session, lineItems.data);

  // Award XP
  const totalAmount = (session.amount_total || 0) / 100;
  const xpAwarded = await awardPurchaseXP(
    supabase,
    email,
    totalAmount,
    firstPurchase,
    hasBundle,
    session.id
  );

  // Check referral
  await checkReferralPurchase(supabase, email);

  // Send notifications
  const documentNames = lineItems.data.map(item => item.description || "Document");

  // Payment received notification
  await notifyPaymentReceived(email, {
    amount: Math.round(totalAmount * 100), // Convert to cents
    description: documentNames.length === 1 ? documentNames[0] : `${documentNames.length} documents`,
    paymentId: session.payment_intent?.toString() || session.id,
  });

  // Document purchased notification
  await notifyDocumentPurchased(email, {
    documentNames,
    total: totalAmount,
    purchaseId: session.id,
  });

  // XP earned notification (only for significant amounts)
  if (xpAwarded >= 50) {
    await notifyXPEarned(email, {
      amount: xpAwarded,
      source: "purchase",
      multiplier: hasBundle ? 3 : 1,
    });
  }

  // First purchase achievement notification
  if (firstPurchase) {
    await notifyAchievementUnlocked(email, {
      name: "First Purchase",
      description: "Welcome to the community! You made your first purchase.",
      xpReward: PURCHASE_XP.firstPurchaseBonus,
      badge: "first-purchase",
      achievementId: "first_purchase",
    });
  }

  console.log(`Purchase recorded: ${email}, $${totalAmount}, ${xpAwarded} XP`);
}

/**
 * Handle refund and cancel associated booking
 */
async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const supabase = createServiceRoleClient();

  const paymentIntent = charge.payment_intent?.toString();

  if (!paymentIntent) {
    console.error("No payment intent in refund:", charge.id);
    return;
  }

  // Update purchase status
  await supabase
    .from("document_purchases")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent", paymentIntent);

  console.log(`Purchase refunded: ${paymentIntent}`);
}

/**
 * Handle checkout session expiration
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createServiceRoleClient();
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.log("No booking ID in expired session, skipping");
    return;
  }

  try {
    // Mark booking as pending payment (user can try again)
    await supabase
      .from("advanced_bookings")
      .update({ status: "pending" })
      .eq("id", bookingId);

    console.log(`Booking reset to pending due to checkout expiration: ${bookingId}`);
  } catch (error) {
    console.error("Error resetting booking on checkout expiration:", error);
  }
}

/**
 * Verify Stripe webhook signature
 */
function verifyWebhook(payload: string, signature: string): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // In development without webhook secret, parse directly
    if (process.env.NODE_ENV === "development") {
      console.warn("No STRIPE_WEBHOOK_SECRET set, skipping signature verification");
      return JSON.parse(payload) as Stripe.Event;
    }
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return null;
  }
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify webhook
    const event = verifyWebhook(payload, signature);

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    console.log(`Stripe webhook received: ${event.type}`);

    // Process with idempotency check to prevent duplicate handling
    const { processed, status } = await processWebhookIdempotent(
      "stripe",
      event.id,
      event.type,
      async () => {
        // Handle different event types
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutComplete(session);
            break;
          }

          case "payment_intent.succeeded": {
            // Log for debugging, main processing is in checkout.session.completed
            console.log("Payment intent succeeded:", event.data.object.id);
            break;
          }

          case "charge.refunded": {
            const charge = event.data.object as Stripe.Charge;
            await handleRefund(charge);
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutExpired(session);
            break;
          }

          case "payment_intent.payment_failed": {
            // Payment failed - log for debugging
            console.log("Payment intent failed:", event.data.object.id);
            break;
          }

          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
      }
    );

    if (status === "duplicate") {
      console.log(`Stripe webhook ${event.id} already processed, skipping`);
    }

    return NextResponse.json({ received: true, processed, status });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
