/**
 * Stripe Session Retrieval API
 *
 * GET /api/stripe/session?session_id=xxx
 *
 * SECURITY: Requires authentication and verifies session ownership
 * to prevent information disclosure of other users' payment data.
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // SECURITY: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    // SECURITY: Verify session belongs to authenticated user
    // Allow if: session email matches user email, OR user has admin role
    const userEmail = user.email?.toLowerCase();
    const sessionEmail = session.customer_email?.toLowerCase();
    const metadataEmail = session.metadata?.customerEmail?.toLowerCase();
    const isAdmin = user.user_metadata?.role === "admin";

    const emailMatches =
      (sessionEmail && sessionEmail === userEmail) ||
      (metadataEmail && metadataEmail === userEmail);

    if (!emailMatches && !isAdmin) {
      console.warn(
        `SECURITY: User ${userEmail} attempted to access session ${sessionId} belonging to ${sessionEmail || metadataEmail}`
      );
      return NextResponse.json(
        { error: "Access denied - session does not belong to you" },
        { status: 403 }
      );
    }

    // Get line items for the session
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        created: session.created,
        line_items: lineItems.data.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          amount_total: item.amount_total,
        })),
      },
    });
  } catch (error) {
    console.error("Stripe session retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
