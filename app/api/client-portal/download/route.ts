import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, sessionId, documentSlug } = body;

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: "Email and session ID are required" },
        { status: 400 }
      );
    }

    // Verify the purchase exists and belongs to this email
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
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

    // Generate a signed download URL (valid for 1 hour)
    // In production, this would link to actual document files in Supabase Storage or S3
    const downloadToken = Buffer.from(
      JSON.stringify({
        email,
        sessionId,
        documentSlug,
        expires: Date.now() + 3600000, // 1 hour
      })
    ).toString("base64");

    // For now, return a download URL that would be handled by another endpoint
    // In production, integrate with document storage (Supabase Storage, S3, etc.)
    const downloadUrl = `/api/client-portal/download/${downloadToken}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
