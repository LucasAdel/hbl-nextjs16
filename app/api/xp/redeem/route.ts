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

interface RedeemXPRequest {
  xpToRedeem: number;
  orderId: string;
  orderTotal: number;
}

/**
 * POST /api/xp/redeem
 * Processes XP redemption for an order
 * Currently uses demo mode - database tables will be added in future
 */
export async function POST(request: NextRequest) {
  try {
    const body: RedeemXPRequest = await request.json();
    const { xpToRedeem, orderId, orderTotal } = body;

    // Validate input
    if (!xpToRedeem || xpToRedeem <= 0) {
      return NextResponse.json(
        { error: "Invalid XP amount" },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!orderTotal || orderTotal <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get or initialize state
    let state = xpState.get(userId) || {
      totalXP: 2500,
      redeemedXP: 500,
      lifetimeSpend: 250,
    };

    const availableXP = state.totalXP - state.redeemedXP;

    // Validate redemption
    if (xpToRedeem > availableXP) {
      return NextResponse.json(
        { error: "Insufficient XP balance" },
        { status: 400 }
      );
    }

    if (xpToRedeem < XP_CONFIG.MIN_REDEMPTION_XP) {
      return NextResponse.json(
        { error: `Minimum ${XP_CONFIG.MIN_REDEMPTION_XP} XP required` },
        { status: 400 }
      );
    }

    const redemptionInfo = calculateMaxRedeemableXP(orderTotal, availableXP);
    if (xpToRedeem > redemptionInfo.maxXP) {
      return NextResponse.json(
        { error: "Exceeds maximum redemption for this order" },
        { status: 400 }
      );
    }

    // Calculate discount
    const discountAmount = xpToDiscount(xpToRedeem);

    // Update state
    state = {
      ...state,
      redeemedXP: state.redeemedXP + xpToRedeem,
    };
    xpState.set(userId, state);

    return NextResponse.json({
      success: true,
      xpRedeemed: xpToRedeem,
      discountAmount,
      remainingXP: state.totalXP - state.redeemedXP,
      message: `Successfully redeemed ${xpToRedeem} XP for $${discountAmount.toFixed(2)} off`,
    });
  } catch (error) {
    console.error("Error redeeming XP:", error);
    return NextResponse.json(
      { error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
