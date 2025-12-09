import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { trackError, createErrorResponse } from "@/lib/error-tracking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  // Rate limiting for payment endpoint
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`payment-${clientId}`, RATE_LIMITS.payment);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Please wait before making another payment request",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const {
      consultationType,
      consultationName,
      price,
      customerEmail,
      customerName,
      bookingId,
      date,
      time,
      // For document purchases
      items,
      type = "consultation", // "consultation" or "document"
    } = body;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let metadata: Record<string, string>;

    if (type === "document" && items && Array.isArray(items)) {
      // Document purchase
      lineItems = items.map((item: { name: string; price: number; quantity?: number }) => ({
        price_data: {
          currency: "aud",
          product_data: {
            name: item.name,
            description: "Legal Document",
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      }));

      metadata = {
        type: "document",
        customerEmail: customerEmail || "",
        customerName: customerName || "",
        itemCount: String(items.length),
      };
    } else {
      // Consultation booking
      const priceWithGST = Math.round(price * 1.1 * 100); // Add GST and convert to cents

      lineItems = [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: consultationName || "Legal Consultation",
              description: `${consultationName} - ${date} at ${time}`,
            },
            unit_amount: priceWithGST,
          },
          quantity: 1,
        },
      ];

      metadata = {
        type: "consultation",
        consultationType: consultationType || "",
        consultationName: consultationName || "",
        bookingId: bookingId || "",
        date: date || "",
        time: time || "",
        customerEmail: customerEmail || "",
        customerName: customerName || "",
      };
    }

    // Determine success and cancel URLs based on purchase type
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3016";
    const successUrl = type === "document"
      ? `${baseUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = type === "document"
      ? `${baseUrl}/documents`
      : `${baseUrl}/book-appointment`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata,
      invoice_creation: {
        enabled: true,
      },
      automatic_tax: {
        enabled: false, // We're manually adding GST
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return createErrorResponse(error as Error, { route: "/api/stripe/create-checkout", action: "checkout" });
  }
}
