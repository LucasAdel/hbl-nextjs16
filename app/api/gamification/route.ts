import { NextRequest, NextResponse } from "next/server";
import {
  awardXP,
  getUserProfile,
  trackActivity,
  trackDocumentView,
  type ActivityType,
} from "@/lib/gamification";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";

// Rate limit: 30 requests per minute for activity tracking
const GAMIFICATION_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60000,
};

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`gamification-${clientId}`, GAMIFICATION_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { action, email, sessionId, activityType, documentId, metadata } = body;

    switch (action) {
      case "award_xp": {
        if (!email || !activityType) {
          return NextResponse.json(
            { error: "Email and activity type required" },
            { status: 400 }
          );
        }

        const result = await awardXP(email, activityType as ActivityType, metadata || {});

        return NextResponse.json({
          success: true,
          ...result,
          message: getRewardMessage(result.rewardType, result.totalXP),
        });
      }

      case "track_activity": {
        if (!sessionId || !activityType) {
          return NextResponse.json(
            { error: "Session ID and activity type required" },
            { status: 400 }
          );
        }

        await trackActivity(email || null, sessionId, activityType, metadata || {});

        // If user has email, also award XP for certain activities
        if (email && isXPActivity(activityType)) {
          const result = await awardXP(email, activityType as ActivityType, metadata || {});
          return NextResponse.json({
            success: true,
            xpAwarded: true,
            ...result,
          });
        }

        return NextResponse.json({ success: true });
      }

      case "track_document_view": {
        if (!sessionId || !documentId) {
          return NextResponse.json(
            { error: "Session ID and document ID required" },
            { status: 400 }
          );
        }

        await trackDocumentView(
          email || null,
          sessionId,
          documentId,
          metadata?.viewDuration as number || 0,
          metadata?.scrollDepth as number || 0
        );

        // Award XP if user is logged in
        if (email) {
          const result = await awardXP(email, "document_view", { documentId });
          return NextResponse.json({
            success: true,
            xpAwarded: true,
            ...result,
          });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Gamification error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const profile = await getUserProfile(email);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// Helper to check if activity awards XP
function isXPActivity(activityType: string): boolean {
  const xpActivities = [
    "page_view",
    "document_view",
    "newsletter_signup",
    "consultation_booked",
    "document_purchase",
    "intake_complete",
    "return_visit",
  ];
  return xpActivities.includes(activityType);
}

// Generate exciting reward messages for variable reinforcement
function getRewardMessage(rewardType: string, xp: number): string {
  switch (rewardType) {
    case "jackpot":
      return `JACKPOT! You earned ${xp} XP!`;
    case "rare":
      return `RARE reward! +${xp} XP!`;
    case "bonus":
      return `Bonus! +${xp} XP`;
    default:
      return `+${xp} XP`;
  }
}
