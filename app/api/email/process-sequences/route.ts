import { NextRequest, NextResponse } from "next/server";
import { createElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import {
  getPendingSequenceEmails,
  advanceSequence,
  trackEmailEvent,
  EMAIL_SEQUENCES,
  type SequenceType,
} from "@/lib/email-automation";
import * as SequenceTemplates from "@/lib/email-sequence-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const pendingEmails = await getPendingSequenceEmails();

    if (pendingEmails.length === 0) {
      return NextResponse.json({ message: "No pending emails", sent: 0 });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const enrollment of pendingEmails) {
      try {
        const sequence = EMAIL_SEQUENCES[enrollment.sequenceType as SequenceType];
        if (!sequence) continue;

        const currentStep = sequence.steps.find(
          (s) => s.stepNumber === enrollment.currentStep
        );
        if (!currentStep) continue;

        // Check conditions
        if (currentStep.conditions) {
          const { skipIf, onlyIf } = currentStep.conditions;

          if (skipIf && skipIf.length > 0) {
            // Check if user has done any skip actions
            const { data: userActions } = await supabase
              .from("user_actions")
              .select("action")
              .eq("email", enrollment.email)
              .in("action", skipIf);

            if (userActions && userActions.length > 0) {
              // Skip this step
              await advanceSequence(enrollment.id);
              continue;
            }
          }

          if (onlyIf && onlyIf.length > 0) {
            // Check if user matches required conditions
            const { data: userConditions } = await supabase
              .from("user_conditions")
              .select("condition")
              .eq("email", enrollment.email)
              .in("condition", onlyIf);

            if (!userConditions || userConditions.length === 0) {
              await advanceSequence(enrollment.id);
              continue;
            }
          }
        }

        // Get subscriber info
        const { data: subscriber } = await supabase
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", enrollment.email)
          .single();

        // Build template props
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbailey.com";
        const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(enrollment.email)}&type=sequence`;

        const templateProps: Record<string, unknown> = {
          subscriberName: subscriber?.name || undefined,
          customerName: (enrollment.triggerData as Record<string, unknown>)?.customerName || subscriber?.name || "there",
          unsubscribeUrl,
          ...enrollment.triggerData,
        };

        // Get template component
        const TemplateComponent = (SequenceTemplates.sequenceTemplates as Record<string, React.ComponentType<Record<string, unknown>>>)[currentStep.templateId];

        if (!TemplateComponent) {
          console.error(`Template not found: ${currentStep.templateId}`);
          continue;
        }

        // Render email HTML
        const emailHtml = await render(
          createElement(TemplateComponent, templateProps)
        );

        // Send email
        if (process.env.RESEND_API_KEY) {
          const result = await resend.emails.send({
            from: "Hamilton Bailey Law <noreply@hamiltonbailey.com>",
            to: [enrollment.email],
            subject: currentStep.subject,
            html: emailHtml,
          });

          if (result.data?.id) {
            // Track sent event
            await trackEmailEvent(enrollment.id, "sent", {
              messageId: result.data.id,
              stepNumber: currentStep.stepNumber,
              templateId: currentStep.templateId,
            });

            // Advance to next step
            await advanceSequence(enrollment.id);
            sentCount++;
          } else {
            errorCount++;
          }
        } else {
          // Development mode - log and advance
          console.log(`[DEV] Would send email to ${enrollment.email}:`, currentStep.subject);
          await advanceSequence(enrollment.id);
          sentCount++;
        }
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingEmails.length} enrollments`,
      sent: sentCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("Process sequences error:", error);
    return NextResponse.json(
      { error: "Failed to process sequences" },
      { status: 500 }
    );
  }
}
