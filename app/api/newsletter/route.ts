import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { trackError, createErrorResponse } from "@/lib/error-tracking";
import { enrollInSequence } from "@/lib/email-automation";

export async function POST(request: NextRequest) {
  // Rate limiting - very strict for newsletter to prevent spam
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`newsletter-${clientId}`, RATE_LIMITS.newsletter);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Please wait before trying again",
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Verify environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "You're already subscribed to our newsletter" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        });
      }
    }

    // Insert new subscriber
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.toLowerCase(),
      status: "active",
      source: "website",
    });

    if (error) {
      console.error("Newsletter subscription error:", JSON.stringify(error, null, 2));
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error details:", error.details);

      // Handle unique constraint violation gracefully
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You're already subscribed to our newsletter" },
          { status: 400 }
        );
      }

      // Return more detailed error in development/staging
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          error: "Failed to subscribe. Please try again.",
          ...(isDev && { debug: { code: error.code, message: error.message } })
        },
        { status: 500 }
      );
    }

    // Enroll in welcome email sequence
    try {
      await enrollInSequence(email.toLowerCase(), "welcome_series", {
        source: "newsletter_signup",
        signupDate: new Date().toISOString(),
      });
    } catch (sequenceError) {
      // Log but don't fail the subscription if sequence enrollment fails
      console.error("Failed to enroll in welcome sequence:", sequenceError);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    console.error("Newsletter error:", error);
    return createErrorResponse(error as Error, { route: "/api/newsletter", action: "newsletter_subscribe" });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Mark as unsubscribed instead of deleting
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        updated_at: new Date().toISOString()
      })
      .eq("email", email.toLowerCase());

    if (error) {
      console.error("Newsletter unsubscribe error:", error);
      return NextResponse.json(
        { error: "Failed to unsubscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from the newsletter.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return createErrorResponse(error as Error, { route: "/api/newsletter", action: "newsletter_unsubscribe" });
  }
}
