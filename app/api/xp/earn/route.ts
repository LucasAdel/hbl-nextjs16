import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateActionXP,
  calculatePurchaseXP,
  XPActionType,
  XP_CONFIG,
} from "@/lib/xp-economy";

// In-memory XP state for demo
const xpState = new Map<string, {
  totalXP: number;
  redeemedXP: number;
  lifetimeSpend: number;
}>();

interface EarnXPRequest {
  action: XPActionType | "purchase";
  amount?: number; // For purchase amounts
  metadata?: {
    streakDays?: number;
    bonusConditions?: Record<string, boolean>;
    enableVariableReinforcement?: boolean;
    [key: string]: unknown;
  };
}

/**
 * POST /api/xp/earn
 * Awards XP for various actions with variable reinforcement
 * Currently uses demo mode - database tables will be added in future
 */
export async function POST(request: NextRequest) {
  try {
    const body: EarnXPRequest = await request.json();
    const { action, amount, metadata = {} } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action type is required" },
        { status: 400 }
      );
    }

    // Calculate XP based on action type
    let earnResult;

    if (action === "purchase" && amount) {
      // Purchase XP calculation with variable reinforcement
      earnResult = calculatePurchaseXP(amount);
    } else if (action in XP_CONFIG.ACTION_REWARDS) {
      // Action-based XP calculation
      earnResult = calculateActionXP(action as XPActionType, {
        enableVariableReinforcement: metadata.enableVariableReinforcement ?? true,
        streakDays: metadata.streakDays,
        bonusConditions: metadata.bonusConditions,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user";

    // Get or initialize state
    let state = xpState.get(userId) || {
      totalXP: user ? 2500 : 1750,
      redeemedXP: 500,
      lifetimeSpend: 250,
    };

    // Update state
    state = {
      ...state,
      totalXP: state.totalXP + earnResult.totalXP,
      lifetimeSpend: action === "purchase" && amount ? state.lifetimeSpend + amount : state.lifetimeSpend,
    };
    xpState.set(userId, state);

    return NextResponse.json({
      success: true,
      ...earnResult,
      action,
      userId: user?.id || null,
      newBalance: state.totalXP - state.redeemedXP,
    });
  } catch (error) {
    console.error("Error earning XP:", error);

    // Return demo calculation even on error
    const earnResult = calculateActionXP("daily_visit", {
      enableVariableReinforcement: true,
    });

    return NextResponse.json({
      success: true,
      ...earnResult,
      isDemo: true,
    });
  }
}
