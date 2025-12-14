import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { trackError, createErrorResponse } from "@/lib/error-tracking";

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`contact-${clientId}`, RATE_LIMITS.contact);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Please wait before submitting another contact form",
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
    const { firstName, lastName, email, phone, message, service } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: firstName, lastName, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Create Supabase client with service role key
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // First check if contacts table exists by doing a select
    const { data: tableCheck, error: tableError } = await supabase
      .from("contacts")
      .select("*")
      .limit(1);

    if (tableError) {
      // Try contact_submissions table instead
      const { data: altData, error: altError } = await supabase
        .from("contact_submissions")
        .select("*")
        .limit(1);

      if (!altError) {
        // Use contact_submissions table
        const { data, error } = await supabase
          .from("contact_submissions")
          .insert({
            name: `${firstName} ${lastName}`,
            email,
            phone: phone || null,
            message: service ? `[Service Interest: ${service}]\n\n${message}` : message,
          })
          .select()
          .single();

        if (error) {
          console.error("Contact submission error:", error.message, error.code, error.details);
          return NextResponse.json(
            { error: "Failed to submit contact form. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Contact form submitted successfully",
          contact: data,
        });
      }

      console.error("No valid contact table found");
      return NextResponse.json(
        { error: "Contact form temporarily unavailable." },
        { status: 500 }
      );
    }

    // Create contact in contacts table
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        message: service ? `[Service Interest: ${service}]\n\n${message}` : message,
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Contact insert error:", error.message, error.code, error.details);
      return NextResponse.json(
        { error: "Failed to submit contact form. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      contact: data,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return createErrorResponse(error as Error, { route: "/api/contact", action: "contact_submit" });
  }
}
