import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { requirePortalAuth } from "@/lib/auth/portal-auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

/**
 * POST /api/client-portal
 * Get client portal data (bookings, document purchases, consultation payments)
 * SECURITY: Requires authentication and verifies user can only access their own data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is authenticated and requesting their own data
    const authResult = await requirePortalAuth(email);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Use authenticated user's email for the query (prevents manipulation)
    const userEmail = authResult.user.email;

    const supabase = await createClient();

    // Fetch bookings from Supabase using verified email
    const { data: bookings, error: bookingsError } = await supabase
      .from("advanced_bookings")
      .select("*")
      .eq("client_email", userEmail.toLowerCase())
      .order("start_time", { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
    }

    // Fetch document purchases from Stripe
    let documentPurchases: Array<{
      id: string;
      created: number;
      amount: number;
      status: string;
      items: Array<{ description: string; quantity: number; amount: number }>;
    }> = [];

    try {
      // Search for checkout sessions by customer email
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        expand: ["data.line_items"],
      });

      // Filter sessions by verified email and document type
      const customerSessions = sessions.data.filter(
        (session) =>
          session.customer_email?.toLowerCase() === userEmail.toLowerCase() &&
          session.metadata?.type === "document" &&
          session.payment_status === "paid"
      );

      for (const session of customerSessions) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        documentPurchases.push({
          id: session.id,
          created: session.created,
          amount: session.amount_total || 0,
          status: session.payment_status,
          items: lineItems.data.map((item) => ({
            description: item.description || "Document",
            quantity: item.quantity || 1,
            amount: item.amount_total || 0,
          })),
        });
      }
    } catch (stripeError) {
      console.error("Error fetching Stripe data:", stripeError);
    }

    // Fetch consultation payments from Stripe
    let consultationPayments: Array<{
      id: string;
      created: number;
      amount: number;
      status: string;
      consultationType: string;
      date: string;
      time: string;
    }> = [];

    try {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });

      const consultationSessions = sessions.data.filter(
        (session) =>
          session.customer_email?.toLowerCase() === userEmail.toLowerCase() &&
          session.metadata?.type === "consultation" &&
          session.payment_status === "paid"
      );

      consultationPayments = consultationSessions.map((session) => ({
        id: session.id,
        created: session.created,
        amount: session.amount_total || 0,
        status: session.payment_status,
        consultationType: session.metadata?.consultationName || "Consultation",
        date: session.metadata?.date || "",
        time: session.metadata?.time || "",
      }));
    } catch (stripeError) {
      console.error("Error fetching consultation payments:", stripeError);
    }

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings || [],
        documentPurchases,
        consultationPayments,
      },
    });
  } catch (error) {
    console.error("Client portal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client data" },
      { status: 500 }
    );
  }
}
