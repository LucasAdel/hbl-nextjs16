import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

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

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

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
