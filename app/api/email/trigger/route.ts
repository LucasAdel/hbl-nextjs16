import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  triggerEmailSequence,
  cancelSequence,
  getPendingEmails,
  markEmailSent,
  getUserSequenceStatus,
  type EmailTrigger,
} from "@/lib/email/email-sequences";

/**
 * POST /api/email/trigger
 * Trigger an email sequence for a user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { trigger, email, metadata } = body;

    // Validate trigger
    const validTriggers: EmailTrigger[] = [
      "signup",
      "first_purchase",
      "cart_abandoned",
      "inactive_7_days",
      "inactive_30_days",
      "streak_at_risk",
      "level_up",
      "tier_upgrade",
      "referral_earned",
      "milestone_reached",
    ];

    if (!validTriggers.includes(trigger)) {
      return NextResponse.json(
        { error: "Invalid trigger type" },
        { status: 400 }
      );
    }

    // Get user email
    const userEmail = email || user?.email;
    const userId = user?.id || `anon-${Date.now()}`;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Trigger the sequence
    const queuedEmails = triggerEmailSequence(
      trigger,
      userId,
      userEmail,
      {
        ...metadata,
        firstName: user?.user_metadata?.first_name || metadata?.firstName,
      }
    );

    if (queuedEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No emails queued (sequence may be inactive or user already in sequence)",
        queued: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${queuedEmails.length} emails`,
      queued: queuedEmails.length,
      emails: queuedEmails.map((e) => ({
        id: e.id,
        scheduledFor: e.scheduledFor,
      })),
    });
  } catch (error) {
    console.error("Error triggering email sequence:", error);
    return NextResponse.json(
      { error: "Failed to trigger email sequence" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/trigger
 * Cancel a sequence for a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sequenceId } = body;

    if (!sequenceId) {
      return NextResponse.json(
        { error: "Sequence ID is required" },
        { status: 400 }
      );
    }

    const cancelled = cancelSequence(user.id, sequenceId);

    return NextResponse.json({
      success: true,
      cancelled,
      message: `Cancelled ${cancelled} pending emails`,
    });
  } catch (error) {
    console.error("Error cancelling sequence:", error);
    return NextResponse.json(
      { error: "Failed to cancel sequence" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/trigger
 * Get user's sequence status or pending emails (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Get pending emails (for cron job)
    if (action === "pending") {
      const pendingEmails = getPendingEmails();
      return NextResponse.json({
        success: true,
        pending: pendingEmails.length,
        emails: pendingEmails,
      });
    }

    // Get user's sequence status
    if (user) {
      const status = getUserSequenceStatus(user.id);
      const statusObj: Record<string, unknown> = {};
      status.forEach((value, key) => {
        statusObj[key] = value;
      });

      return NextResponse.json({
        success: true,
        userId: user.id,
        sequences: statusObj,
      });
    }

    return NextResponse.json({
      success: true,
      sequences: {},
    });
  } catch (error) {
    console.error("Error getting email status:", error);
    return NextResponse.json(
      { error: "Failed to get email status" },
      { status: 500 }
    );
  }
}
