import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sessionId } = body;

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: "Email and session ID are required" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    if (session.customer_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get line items
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${session.created}-${sessionId.slice(-6).toUpperCase()}`,
      date: new Date(session.created * 1000).toISOString(),
      customerEmail: session.customer_email,
      customerName: session.customer_details?.name || session.metadata?.clientName || "Client",
      items: lineItems.data.map((item) => ({
        description: item.description || "Item",
        quantity: item.quantity || 1,
        unitPrice: item.price?.unit_amount || 0,
        total: item.amount_total || 0,
      })),
      subtotal: session.amount_subtotal || 0,
      tax: (session.amount_total || 0) - (session.amount_subtotal || 0),
      total: session.amount_total || 0,
      paymentMethod: "Credit Card",
      transactionId: typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || sessionId,
      type: session.metadata?.type || "purchase",
      consultationType: session.metadata?.consultationName,
      consultationDate: session.metadata?.date,
      consultationTime: session.metadata?.time,
    };

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
    });
  } catch (error) {
    console.error("Invoice error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
