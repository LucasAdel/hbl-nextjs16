import type { Config, Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

// Email templates mapping
const TEMPLATE_SUBJECTS: Record<string, string> = {
  welcome_1_intro: "Welcome to Hamilton Bailey Law - Here's What You'll Get",
  welcome_2_value: "5 Legal Mistakes Medical Practices Make (And How to Avoid Them)",
  welcome_3_resource: "Free Resource: Medical Practice Compliance Checklist",
  welcome_4_cta: "Ready for a Legal Health Check? Book Your Free Consultation",
};

export default async (req: Request, context: Context) => {
  console.log("🕐 Processing email queue...");

  // Use Netlify.env for environment variables
  const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Netlify.env.get("RESEND_API_KEY");
  const sendgridApiKey = Netlify.env.get("SENDGRID_API_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!resendApiKey && !sendgridApiKey) {
    console.error("No email provider configured (need RESEND_API_KEY or SENDGRID_API_KEY)");
    return new Response(
      JSON.stringify({ error: "No email provider configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get enrollments that need emails sent
    const now = new Date().toISOString();
    const { data: pendingEnrollments, error: fetchError } = await supabase
      .from("email_sequence_enrollments")
      .select("*")
      .eq("status", "active")
      .lte("next_email_at", now)
      .limit(50); // Process 50 at a time

    if (fetchError) {
      console.error("Error fetching pending enrollments:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!pendingEnrollments || pendingEnrollments.length === 0) {
      console.log("No pending emails to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${pendingEnrollments.length} pending emails`);

    let processed = 0;
    let errors = 0;

    for (const enrollment of pendingEnrollments) {
      try {
        // Get sequence steps (simplified - in production, fetch from config)
        const sequenceSteps = getSequenceSteps(enrollment.sequence_type);
        const currentStep = sequenceSteps.find(
          (s) => s.stepNumber === enrollment.current_step
        );

        if (!currentStep) {
          // Sequence complete
          await supabase
            .from("email_sequence_enrollments")
            .update({
              status: "completed",
              completed_at: now,
            })
            .eq("id", enrollment.id);
          continue;
        }

        // Check if current step has a send window restriction
        if (currentStep.sendWindow && !isWithinSendWindow(currentStep.sendWindow)) {
          // Outside send window - skip this enrollment for now, will retry next run
          console.log(
            `Skipping ${enrollment.email} step ${currentStep.stepNumber} - outside send window (${currentStep.sendWindow.startDate} to ${currentStep.sendWindow.endDate})`
          );
          continue;
        }

        // Send the email
        const emailResult = await sendEmail({
          to: enrollment.email,
          subject: currentStep.subject,
          templateId: currentStep.templateId,
          resendApiKey,
          sendgridApiKey,
        });

        if (emailResult.success) {
          // Calculate next step
          const nextStep = sequenceSteps.find(
            (s) => s.stepNumber === enrollment.current_step + 1
          );

          if (nextStep) {
            // Schedule next email
            const nextEmailAt = new Date(
              Date.now() + nextStep.delayHours * 60 * 60 * 1000
            ).toISOString();

            await supabase
              .from("email_sequence_enrollments")
              .update({
                current_step: nextStep.stepNumber,
                next_email_at: nextEmailAt,
                last_email_sent_at: now,
              })
              .eq("id", enrollment.id);
          } else {
            // Sequence complete
            await supabase
              .from("email_sequence_enrollments")
              .update({
                status: "completed",
                completed_at: now,
                last_email_sent_at: now,
              })
              .eq("id", enrollment.id);
          }

          processed++;
        } else {
          console.error(`Failed to send email to ${enrollment.email}:`, emailResult.error);
          errors++;
        }
      } catch (err) {
        console.error(`Error processing enrollment ${enrollment.id}:`, err);
        errors++;
      }
    }

    console.log(`✅ Processed ${processed} emails, ${errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        errors,
        total: pendingEnrollments.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email queue processing error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process email queue" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Sequence step type with optional send window
interface SequenceStep {
  stepNumber: number;
  delayHours: number;
  subject: string;
  templateId: string;
  sendWindow?: {
    startDate: string; // MM-DD format
    endDate: string; // MM-DD format
  };
}

// Check if current date is within the send window (Australian timezone)
function isWithinSendWindow(sendWindow?: { startDate: string; endDate: string }): boolean {
  if (!sendWindow) return true; // No window restriction

  const now = new Date();
  // Get current month and day
  const currentMonth = now.getMonth() + 1; // 0-indexed
  const currentDay = now.getDate();
  const currentMMDD = currentMonth * 100 + currentDay; // e.g., January 15 = 115, June 30 = 630

  const [startMonth, startDay] = sendWindow.startDate.split("-").map(Number);
  const [endMonth, endDay] = sendWindow.endDate.split("-").map(Number);
  const startMMDD = startMonth * 100 + startDay;
  const endMMDD = endMonth * 100 + endDay;

  // Handle same-year window (e.g., Jan 15 to Jun 30)
  if (startMMDD <= endMMDD) {
    return currentMMDD >= startMMDD && currentMMDD <= endMMDD;
  }
  // Handle cross-year window (e.g., Nov 1 to Feb 28)
  return currentMMDD >= startMMDD || currentMMDD <= endMMDD;
}

// Sequence step definitions
function getSequenceSteps(sequenceType: string): SequenceStep[] {
  const sequences: Record<string, SequenceStep[]> = {
    welcome_series: [
      { stepNumber: 1, delayHours: 0, subject: "Welcome to Hamilton Bailey Law - Here's What You'll Get", templateId: "welcome_1_intro" },
      { stepNumber: 2, delayHours: 48, subject: "5 Legal Mistakes Medical Practices Make (And How to Avoid Them)", templateId: "welcome_2_value" },
      { stepNumber: 3, delayHours: 120, subject: "Free Resource: Medical Practice Compliance Checklist", templateId: "welcome_3_resource" },
      { stepNumber: 4, delayHours: 168, subject: "Ready for a Legal Health Check? Book Your Free Consultation", templateId: "welcome_4_cta" },
    ],
    post_purchase: [
      { stepNumber: 1, delayHours: 0, subject: "Your Documents Are Ready - Download & Getting Started Guide", templateId: "purchase_1_delivery" },
      { stepNumber: 2, delayHours: 24, subject: "How to Customize Your Legal Documents (Step-by-Step)", templateId: "purchase_2_guide" },
      { stepNumber: 3, delayHours: 72, subject: "Need Help? Common Questions About Your Documents", templateId: "purchase_3_faq" },
      { stepNumber: 4, delayHours: 168, subject: "Complete Your Legal Protection - Related Documents", templateId: "purchase_4_upsell" },
      { stepNumber: 5, delayHours: 336, subject: "How Did Your Documents Work Out? Quick Feedback Request", templateId: "purchase_5_feedback" },
      {
        stepNumber: 6,
        delayHours: 4320, // 6 months
        subject: "Schedule Your Annual Service Agreement Review - Book with Your Accountant & Our Team",
        templateId: "purchase_6_annual_review",
        sendWindow: { startDate: "01-15", endDate: "06-30" } // Only send Jan 15 - Jun 30
      },
    ],
    cart_abandonment: [
      { stepNumber: 1, delayHours: 4, subject: "You Left Something Behind - Your Cart is Waiting", templateId: "cartRecovery1" },
      { stepNumber: 2, delayHours: 48, subject: "Still Thinking It Over? Here's Why 700+ Doctors Trust Us", templateId: "cartRecovery2" },
      { stepNumber: 3, delayHours: 168, subject: "Last Chance: 10% Off Your Cart - Expires in 48 Hours!", templateId: "cartRecovery3" },
    ],
    financial_year_review: [
      { stepNumber: 1, delayHours: 0, subject: "FY Ending Soon - Schedule Your Service Agreement Review with Your Accountant & Hamilton Bailey Law", templateId: "fy_review_reminder" },
      { stepNumber: 2, delayHours: 168, subject: "Reminder: Book Your Annual Agreement Review Before June 30 - Coordinate with Your Accountant & Our Team", templateId: "fy_review_followup" },
    ],
  };

  return sequences[sequenceType] || [];
}

// Send email via configured provider
async function sendEmail(options: {
  to: string;
  subject: string;
  templateId: string;
  resendApiKey?: string;
  sendgridApiKey?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, subject, templateId, resendApiKey, sendgridApiKey } = options;

  // Generate simple HTML (in production, use proper templates)
  const html = generateEmailHtml(templateId, subject);

  try {
    if (resendApiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Hamilton Bailey Law <noreply@hamiltonbailey.com>",
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message };
      }

      return { success: true };
    }

    if (sendgridApiKey) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "noreply@hamiltonbailey.com", name: "Hamilton Bailey Law" },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (!response.ok) {
        return { success: false, error: "SendGrid API error" };
      }

      return { success: true };
    }

    return { success: false, error: "No email provider configured" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate basic HTML email
function generateEmailHtml(templateId: string, subject: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2AAFA2; margin: 0;">Hamilton Bailey Law</h1>
    <p style="color: #666; margin: 5px 0 0;">Legal Excellence for Healthcare Professionals</p>
  </div>

  <h2 style="color: #1a1a1a;">${subject}</h2>

  <p>Thank you for subscribing to our newsletter. We're excited to share valuable legal insights and resources with you.</p>

  <p>As specialists in healthcare law, we help medical practitioners navigate complex legal requirements with confidence.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://hamiltonbailey.com" style="background: #2AAFA2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Our Website</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 12px; text-align: center;">
    Hamilton Bailey Law | 147 Pirie Street, Adelaide SA 5000<br>
    <a href="https://hamiltonbailey.com/unsubscribe" style="color: #666;">Unsubscribe</a>
  </p>
</body>
</html>
  `.trim();
}

// Netlify scheduled function configuration
// Runs every 6 hours (4 times per day) - optimized for free tier
// Email sequences have delays of hours/days, so frequent checks aren't needed
// Free tier: 125,000 invocations/month, this uses ~120/month
export const config: Config = {
  schedule: "0 */6 * * *",
};
