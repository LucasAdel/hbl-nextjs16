/**
 * Email Automation System
 * Manages scheduled email sequences, triggers, and automated campaigns
 */

import { createClient } from "@/lib/supabase/server";

// Email sequence types
export type SequenceType =
  | "welcome_series"
  | "post_consultation"
  | "post_purchase"
  | "booking_reminder"
  | "re_engagement"
  | "cart_abandonment";

export type SequenceStatus = "active" | "paused" | "completed" | "cancelled";

export interface EmailSequenceStep {
  stepNumber: number;
  delayHours: number; // Hours after trigger or previous step
  subject: string;
  templateId: string;
  conditions?: {
    skipIf?: string[]; // Skip if user has done these actions
    onlyIf?: string[]; // Only send if user matches these conditions
  };
}

export interface EmailSequence {
  id: string;
  type: SequenceType;
  name: string;
  description: string;
  steps: EmailSequenceStep[];
  isActive: boolean;
}

// Pre-defined email sequences
export const EMAIL_SEQUENCES: Record<SequenceType, EmailSequence> = {
  welcome_series: {
    id: "welcome_series",
    type: "welcome_series",
    name: "Newsletter Welcome Series",
    description: "Onboard new newsletter subscribers with valuable content",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: 0, // Immediate
        subject: "Welcome to Hamilton Bailey Law - Here's What You'll Get",
        templateId: "welcome_1_intro",
      },
      {
        stepNumber: 2,
        delayHours: 48, // 2 days later
        subject: "5 Legal Mistakes Medical Practices Make (And How to Avoid Them)",
        templateId: "welcome_2_value",
      },
      {
        stepNumber: 3,
        delayHours: 120, // 5 days later
        subject: "Free Resource: Medical Practice Compliance Checklist",
        templateId: "welcome_3_resource",
      },
      {
        stepNumber: 4,
        delayHours: 168, // 7 days later
        subject: "Ready for a Legal Health Check? Book Your Free Consultation",
        templateId: "welcome_4_cta",
        conditions: {
          skipIf: ["has_booked", "has_purchased"],
        },
      },
    ],
  },

  post_consultation: {
    id: "post_consultation",
    type: "post_consultation",
    name: "Post-Consultation Follow-up",
    description: "Follow up after consultations to nurture clients",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: 2, // 2 hours after consultation
        subject: "Thank You for Your Consultation - Next Steps",
        templateId: "post_consult_1_thanks",
      },
      {
        stepNumber: 2,
        delayHours: 72, // 3 days later
        subject: "Your Consultation Summary & Recommended Actions",
        templateId: "post_consult_2_summary",
      },
      {
        stepNumber: 3,
        delayHours: 168, // 7 days later
        subject: "How Can We Help Further? Your Options",
        templateId: "post_consult_3_services",
        conditions: {
          skipIf: ["has_engaged_service"],
        },
      },
      {
        stepNumber: 4,
        delayHours: 336, // 14 days later
        subject: "Quick Check-in: Any Questions?",
        templateId: "post_consult_4_checkin",
        conditions: {
          skipIf: ["has_engaged_service", "has_responded"],
        },
      },
    ],
  },

  post_purchase: {
    id: "post_purchase",
    type: "post_purchase",
    name: "Post-Purchase Onboarding",
    description: "Help customers get the most from their document purchase",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: 0, // Immediate
        subject: "Your Documents Are Ready - Download & Getting Started Guide",
        templateId: "purchase_1_delivery",
      },
      {
        stepNumber: 2,
        delayHours: 24, // 1 day later
        subject: "How to Customize Your Legal Documents (Step-by-Step)",
        templateId: "purchase_2_guide",
      },
      {
        stepNumber: 3,
        delayHours: 72, // 3 days later
        subject: "Need Help? Common Questions About Your Documents",
        templateId: "purchase_3_faq",
      },
      {
        stepNumber: 4,
        delayHours: 168, // 7 days later
        subject: "Complete Your Legal Protection - Related Documents",
        templateId: "purchase_4_upsell",
        conditions: {
          skipIf: ["purchased_all_related"],
        },
      },
      {
        stepNumber: 5,
        delayHours: 336, // 14 days later
        subject: "How Did Your Documents Work Out? Quick Feedback Request",
        templateId: "purchase_5_feedback",
      },
    ],
  },

  booking_reminder: {
    id: "booking_reminder",
    type: "booking_reminder",
    name: "Booking Reminder Sequence",
    description: "Remind clients of upcoming appointments",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: -24, // 24 hours BEFORE appointment
        subject: "Reminder: Your Consultation Tomorrow with Hamilton Bailey Law",
        templateId: "reminder_24hr",
      },
      {
        stepNumber: 2,
        delayHours: -1, // 1 hour BEFORE appointment
        subject: "Starting Soon: Your Consultation in 1 Hour",
        templateId: "reminder_1hr",
      },
    ],
  },

  re_engagement: {
    id: "re_engagement",
    type: "re_engagement",
    name: "Re-engagement Campaign",
    description: "Win back inactive subscribers",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: 0, // Triggered after 30 days inactive
        subject: "We Miss You! Here's What's New at Hamilton Bailey Law",
        templateId: "reengage_1_miss_you",
      },
      {
        stepNumber: 2,
        delayHours: 168, // 7 days later
        subject: "Exclusive: 15% Off Your Next Legal Document",
        templateId: "reengage_2_offer",
        conditions: {
          skipIf: ["has_opened_email", "has_visited_site"],
        },
      },
      {
        stepNumber: 3,
        delayHours: 336, // 14 days later
        subject: "Last Chance: Stay Subscribed?",
        templateId: "reengage_3_last_chance",
        conditions: {
          skipIf: ["has_engaged"],
        },
      },
    ],
  },

  cart_abandonment: {
    id: "cart_abandonment",
    type: "cart_abandonment",
    name: "Cart Abandonment Recovery",
    description: "Recover abandoned shopping carts",
    isActive: true,
    steps: [
      {
        stepNumber: 1,
        delayHours: 1, // 1 hour after abandonment
        subject: "You Left Something Behind - Your Cart is Waiting",
        templateId: "cart_1_reminder",
      },
      {
        stepNumber: 2,
        delayHours: 24, // 24 hours later
        subject: "Still Thinking About It? Here's Why Our Clients Trust Us",
        templateId: "cart_2_social_proof",
      },
      {
        stepNumber: 3,
        delayHours: 72, // 3 days later
        subject: "Final Reminder: Your Cart Expires Soon",
        templateId: "cart_3_urgency",
      },
    ],
  },
};

// Database record for tracking sequence enrollments
export interface SequenceEnrollment {
  id: string;
  email: string;
  sequenceType: SequenceType;
  currentStep: number;
  status: SequenceStatus;
  triggerData: Record<string, unknown>;
  startedAt: string;
  nextEmailAt: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Enroll a user in an email sequence
 */
export async function enrollInSequence(
  email: string,
  sequenceType: SequenceType,
  triggerData: Record<string, unknown> = {}
): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  const supabase = await createClient();
  const sequence = EMAIL_SEQUENCES[sequenceType];

  if (!sequence || !sequence.isActive) {
    return { success: false, error: "Sequence not found or inactive" };
  }

  // Check if already enrolled in this sequence
  const { data: existing } = await supabase
    .from("email_sequence_enrollments")
    .select("id, status")
    .eq("email", email.toLowerCase())
    .eq("sequence_type", sequenceType)
    .in("status", ["active", "paused"])
    .single();

  if (existing) {
    return { success: false, error: "Already enrolled in this sequence" };
  }

  // Calculate first email send time
  const firstStep = sequence.steps[0];
  const nextEmailAt = new Date(Date.now() + firstStep.delayHours * 60 * 60 * 1000);

  // Create enrollment
  const { data, error } = await supabase
    .from("email_sequence_enrollments")
    .insert({
      email: email.toLowerCase(),
      sequence_type: sequenceType,
      current_step: 1,
      status: "active",
      trigger_data: triggerData as unknown as Record<string, never>,
      started_at: new Date().toISOString(),
      next_email_at: nextEmailAt.toISOString(),
      metadata: {} as unknown as Record<string, never>,
    })
    .select()
    .single();

  if (error) {
    console.error("Error enrolling in sequence:", error);
    return { success: false, error: error.message };
  }

  return { success: true, enrollmentId: data.id };
}

/**
 * Remove user from a sequence
 */
export async function removeFromSequence(
  email: string,
  sequenceType: SequenceType,
  reason: string = "manual"
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("email_sequence_enrollments")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      metadata: { cancellation_reason: reason },
    })
    .eq("email", email.toLowerCase())
    .eq("sequence_type", sequenceType)
    .eq("status", "active");

  return !error;
}

/**
 * Mark sequence step as completed and schedule next
 */
export async function advanceSequence(
  enrollmentId: string
): Promise<{ success: boolean; nextStep?: number; completed?: boolean }> {
  const supabase = await createClient();

  // Get current enrollment
  const { data: enrollment, error: fetchError } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .single();

  if (fetchError || !enrollment) {
    return { success: false };
  }

  const sequence = EMAIL_SEQUENCES[enrollment.sequence_type as SequenceType];
  const nextStepNumber = enrollment.current_step + 1;
  const nextStep = sequence.steps.find((s) => s.stepNumber === nextStepNumber);

  if (!nextStep) {
    // Sequence completed
    await supabase
      .from("email_sequence_enrollments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        next_email_at: null,
      })
      .eq("id", enrollmentId);

    return { success: true, completed: true };
  }

  // Calculate next email time
  const nextEmailAt = new Date(Date.now() + nextStep.delayHours * 60 * 60 * 1000);

  await supabase
    .from("email_sequence_enrollments")
    .update({
      current_step: nextStepNumber,
      next_email_at: nextEmailAt.toISOString(),
    })
    .eq("id", enrollmentId);

  return { success: true, nextStep: nextStepNumber };
}

/**
 * Get pending emails that need to be sent
 */
export async function getPendingSequenceEmails(): Promise<SequenceEnrollment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_sequence_enrollments")
    .select("*")
    .eq("status", "active")
    .lte("next_email_at", new Date().toISOString())
    .order("next_email_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Error fetching pending emails:", error);
    return [];
  }

  // Map snake_case database fields to camelCase interface
  return (data || []).map((row) => ({
    id: row.id,
    email: row.email,
    sequenceType: row.sequence_type as SequenceType,
    currentStep: row.current_step,
    status: row.status as SequenceStatus,
    triggerData: (row.trigger_data as Record<string, unknown>) || {},
    startedAt: row.started_at,
    nextEmailAt: row.next_email_at,
    completedAt: row.completed_at,
    metadata: (row.metadata as Record<string, unknown>) || {},
  }));
}

/**
 * Track email events (opens, clicks, etc.)
 */
export async function trackEmailEvent(
  enrollmentId: string,
  event: "sent" | "opened" | "clicked" | "bounced" | "unsubscribed",
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("email_sequence_events").insert({
    enrollment_id: enrollmentId,
    event_type: event,
    metadata: metadata as unknown as Record<string, never>,
    created_at: new Date().toISOString(),
  });

  // Handle special events
  if (event === "unsubscribed") {
    await supabase
      .from("email_sequence_enrollments")
      .update({ status: "cancelled" })
      .eq("id", enrollmentId);
  }
}

/**
 * Get sequence analytics
 */
export async function getSequenceAnalytics(
  sequenceType: SequenceType
): Promise<{
  totalEnrolled: number;
  active: number;
  completed: number;
  cancelled: number;
  openRate: number;
  clickRate: number;
}> {
  const supabase = await createClient();

  // Get enrollment counts
  const { data: enrollments } = await supabase
    .from("email_sequence_enrollments")
    .select("status")
    .eq("sequence_type", sequenceType);

  const counts = {
    totalEnrolled: enrollments?.length || 0,
    active: enrollments?.filter((e) => e.status === "active").length || 0,
    completed: enrollments?.filter((e) => e.status === "completed").length || 0,
    cancelled: enrollments?.filter((e) => e.status === "cancelled").length || 0,
  };

  // Get event counts for open/click rates
  const { data: events } = await supabase
    .from("email_sequence_events")
    .select("event_type, enrollment_id")
    .in("event_type", ["sent", "opened", "clicked"]);

  const sent = events?.filter((e) => e.event_type === "sent").length || 1;
  const opened = events?.filter((e) => e.event_type === "opened").length || 0;
  const clicked = events?.filter((e) => e.event_type === "clicked").length || 0;

  return {
    ...counts,
    openRate: Math.round((opened / sent) * 100),
    clickRate: Math.round((clicked / sent) * 100),
  };
}
