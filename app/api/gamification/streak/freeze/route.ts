import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// In-memory freeze state for demo (per-session simulation)
const freezeState = new Map<string, {
  freezeTokens: number;
  freezeActiveUntil: string | null;
}>();

/**
 * POST /api/gamification/streak/freeze
 * Use a freeze token to protect streak
 * Currently uses demo mode - database tables will be added in future
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== "use") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // For demo, use session-based state
    const userId = user?.id || "demo-user";
    let state = freezeState.get(userId) || {
      freezeTokens: 2,
      freezeActiveUntil: null,
    };

    // Check if user has freeze tokens
    if (state.freezeTokens <= 0) {
      return NextResponse.json(
        { error: "No freeze tokens available" },
        { status: 400 }
      );
    }

    // Use freeze token
    state = {
      freezeTokens: state.freezeTokens - 1,
      freezeActiveUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    freezeState.set(userId, state);

    return NextResponse.json({
      success: true,
      freezeTokensRemaining: state.freezeTokens,
      streakProtected: true,
      protectedUntil: state.freezeActiveUntil,
      message: "Streak protected for 24 hours",
    });
  } catch (error) {
    console.error("Error processing freeze:", error);

    // Demo fallback
    return NextResponse.json({
      success: true,
      freezeTokensRemaining: 1,
      streakProtected: true,
      message: "Streak protected for 24 hours (demo mode)",
    });
  }
}

/**
 * GET /api/gamification/streak/freeze
 * Check freeze token status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user";
    const state = freezeState.get(userId) || {
      freezeTokens: 2,
      freezeActiveUntil: null,
    };

    const freezeActiveUntil = state.freezeActiveUntil
      ? new Date(state.freezeActiveUntil)
      : null;
    const freezeActive = freezeActiveUntil && freezeActiveUntil > new Date();

    return NextResponse.json({
      freezeTokens: state.freezeTokens,
      maxFreezeTokens: 3,
      freezeActive,
      freezeActiveUntil: freezeActive ? state.freezeActiveUntil : null,
      canEarnMoreAt: {
        days: 14,
        daysRemaining: 7,
      },
    });
  } catch (error) {
    console.error("Error fetching freeze status:", error);
    return NextResponse.json({
      freezeTokens: 2,
      maxFreezeTokens: 3,
      freezeActive: false,
      freezeActiveUntil: null,
      canEarnMoreAt: {
        days: 14,
        daysRemaining: 7,
      },
    });
  }
}
