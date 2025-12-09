import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  xpToDiscount,
  calculateMaxRedeemableXP,
  XP_CONFIG,
} from "@/lib/xp-economy";

// In-memory XP state for demo
const xpState = new Map<string, {
  totalXP: number;
  redeemedXP: number;
  lifetimeSpend: number;
}>();

interface ValidateRedemptionRequest {
  xpToRedeem: number;
  orderTotal: number;
}

/**
 * POST /api/xp/validate-redemption
 * Validates an XP redemption request before applying it
 * Currently uses demo mode - database tables will be added in future
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRedemptionRequest = await request.json();
    const { xpToRedeem, orderTotal } = body;

    // Validate input
    if (!xpToRedeem || xpToRedeem <= 0) {
      return NextResponse.json(
        { error: "Invalid XP amount", valid: false },
        { status: 400 }
      );
    }

    if (!orderTotal || orderTotal <= 0) {
      return NextResponse.json(
        { error: "Invalid order total", valid: false },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || "demo-user";

    // Get or initialize state
    const state = xpState.get(userId) || {
      totalXP: user ? 2500 : 1750,
      redeemedXP: 500,
      lifetimeSpend: 250,
    };

    const availableXP = state.totalXP - state.redeemedXP;

    // Check if user has enough XP
    if (xpToRedeem > availableXP) {
      return NextResponse.json({
        valid: false,
        error: "Insufficient XP balance",
        availableXP,
        requestedXP: xpToRedeem,
      });
    }

    // Check minimum redemption
    if (xpToRedeem < XP_CONFIG.MIN_REDEMPTION_XP) {
      return NextResponse.json({
        valid: false,
        error: `Minimum ${XP_CONFIG.MIN_REDEMPTION_XP} XP required for redemption`,
        minRequired: XP_CONFIG.MIN_REDEMPTION_XP,
      });
    }

    // Calculate maximum allowed
    const redemptionInfo = calculateMaxRedeemableXP(orderTotal, availableXP);

    if (xpToRedeem > redemptionInfo.maxXP) {
      return NextResponse.json({
        valid: false,
        error: "Requested XP exceeds maximum allowed for this order",
        maxAllowed: redemptionInfo.maxXP,
        reason: redemptionInfo.reason,
      });
    }

    // Calculate discount amount
    const discountAmount = xpToDiscount(xpToRedeem);

    return NextResponse.json({
      valid: true,
      xpToRedeem,
      discountAmount,
      remainingXP: availableXP - xpToRedeem,
      message: `Redeeming ${xpToRedeem} XP for $${discountAmount.toFixed(2)} off`,
    });
  } catch (error) {
    console.error("Error validating XP redemption:", error);
    return NextResponse.json(
      { error: "Failed to validate redemption", valid: false },
      { status: 500 }
    );
  }
}
