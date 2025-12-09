import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { trackError, createErrorResponse } from "@/lib/error-tracking";

export async function POST(request: NextRequest) {
  // Rate limiting for cart tracking
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`cart-${clientId}`, RATE_LIMITS.cartAbandon);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, items, totalValue, sessionId } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Email and cart items are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if there's already an active abandoned cart for this email
    const { data: existingCart } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .single();

    if (existingCart) {
      // Update existing abandoned cart
      const { error: updateError } = await supabase
        .from("abandoned_carts")
        .update({
          items: JSON.stringify(items),
          total_value: totalValue,
          updated_at: new Date().toISOString(),
          reminder_count: 0, // Reset reminder count on cart update
        })
        .eq("id", existingCart.id);

      if (updateError) {
        console.error("Error updating abandoned cart:", updateError);
      }

      return NextResponse.json({
        success: true,
        message: "Abandoned cart updated",
        cartId: existingCart.id,
      });
    }

    // Create new abandoned cart record
    const { data: newCart, error: insertError } = await supabase
      .from("abandoned_carts")
      .insert({
        email: email.toLowerCase(),
        items: JSON.stringify(items),
        total_value: totalValue,
        session_id: sessionId,
        status: "pending",
        reminder_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating abandoned cart:", insertError);
      return NextResponse.json(
        { error: "Failed to save cart" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Abandoned cart saved",
      cartId: newCart.id,
    });
  } catch (error) {
    console.error("Abandoned cart error:", error);
    return createErrorResponse(error as Error, { route: "/api/cart/abandon", action: "cart_track" });
  }
}

// Mark cart as recovered (when purchase is completed)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("abandoned_carts")
      .update({ status: "recovered" })
      .eq("email", email.toLowerCase())
      .eq("status", "pending");

    if (error) {
      console.error("Error marking cart as recovered:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse(error as Error, { route: "/api/cart/abandon", action: "cart_recover" });
  }
}
