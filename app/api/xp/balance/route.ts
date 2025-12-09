import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateUserXPState, formatXP, getNextDiscountTier } from "@/lib/xp-economy";

// In-memory XP state for demo
const xpState = new Map<string, {
  totalXP: number;
  redeemedXP: number;
  lifetimeSpend: number;
}>();

/**
 * GET /api/xp/balance
 * Returns the current user's XP balance and state
 * Currently uses demo mode - database tables will be added in future
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user";
    let state = xpState.get(userId);

    // Initialize state if not exists
    if (!state) {
      state = {
        totalXP: user ? 2500 : 1750, // Authenticated users get more demo XP
        redeemedXP: 500,
        lifetimeSpend: 250,
      };
      xpState.set(userId, state);
    }

    const userState = calculateUserXPState(
      state.totalXP,
      state.redeemedXP,
      0, // expired XP
      state.lifetimeSpend
    );
    const nextTier = getNextDiscountTier(userState.availableXP);

    return NextResponse.json({
      ...userState,
      nextTier: nextTier.nextTier,
      xpToNextTier: nextTier.xpNeeded,
      nearMissMessage: nextTier.message,
      formatted: {
        availableXP: formatXP(userState.availableXP),
        lifetimeXP: formatXP(userState.lifetimeXP),
        redeemedXP: formatXP(userState.redeemedXP),
      },
      isDemo: true,
    });
  } catch {
    // Fallback demo data on error
    const demoState = calculateUserXPState(1750, 500, 0, 250);
    const nextTier = getNextDiscountTier(demoState.availableXP);

    return NextResponse.json({
      ...demoState,
      nextTier: nextTier.nextTier,
      xpToNextTier: nextTier.xpNeeded,
      nearMissMessage: nextTier.message,
      formatted: {
        availableXP: formatXP(demoState.availableXP),
        lifetimeXP: formatXP(demoState.lifetimeXP),
        redeemedXP: formatXP(demoState.redeemedXP),
      },
      isDemo: true,
    });
  }
}

// Export for use by other XP routes
export { xpState };
