import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      occupation,
      businessName,
      practiceType,
      matterType,
      matterDescription,
      preferredContactMethod,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !matterDescription) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: firstName, lastName, email, and matterDescription are required",
        },
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

    // Check which intake table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from("client_intake")
      .select("*")
      .limit(1);

    if (tableError) {
      // Try intake_submissions table
      const { data: altCheck, error: altError } = await supabase
        .from("intake_submissions")
        .select("*")
        .limit(1);

      if (!altError) {
        // Use intake_submissions table
        const { data, error } = await supabase
          .from("intake_submissions")
          .insert({
            name: `${firstName} ${lastName}`,
            email,
            phone: phone || null,
            occupation: occupation || null,
            business_name: businessName || null,
            matter_type: matterType || "General",
            description: matterDescription,
            preferred_contact: preferredContactMethod || "email",
          })
          .select()
          .single();

        if (error) {
          console.error("Intake submission error:", error.message, error.code, error.details);
          return NextResponse.json(
            { error: "Failed to submit intake form. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Client intake form submitted successfully",
          intake: data,
        });
      }

      // Try the contact_submissions table as fallback (matches working contact form)
      const { data: contactSubmCheck, error: contactSubmError } = await supabase
        .from("contact_submissions")
        .select("*")
        .limit(1);

      if (!contactSubmError) {
        // Use contact_submissions table as fallback
        const fullMessage = `[CLIENT INTAKE]
Occupation: ${occupation || "Not specified"}
Business: ${businessName || "Not specified"}
Practice Type: ${practiceType || "Not specified"}
Matter Type: ${matterType || "General"}
Preferred Contact: ${preferredContactMethod || "email"}

Description:
${matterDescription}`;

        const { data, error } = await supabase
          .from("contact_submissions")
          .insert({
            name: `${firstName} ${lastName}`,
            email,
            phone: phone || null,
            message: fullMessage,
          })
          .select()
          .single();

        if (error) {
          console.error("Contact submissions fallback error:", error.message, error.code, error.details);
          return NextResponse.json(
            { error: "Failed to submit intake form. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Client intake form submitted successfully",
          intake: data,
        });
      }

      console.error("No valid intake table found");
      return NextResponse.json(
        { error: "Intake form temporarily unavailable." },
        { status: 500 }
      );
    }

    // Create client intake record in client_intake table
    const { data, error } = await supabase
      .from("client_intake")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        client_type: occupation || "Unknown",
        business_name: businessName || null,
        practice_type: practiceType || null,
        matter_description: `[${matterType || "General"}]\n\n${matterDescription}`,
        preferred_contact: preferredContactMethod || "email",
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Client intake error:", error.message, error.code, error.details);
      return NextResponse.json(
        { error: "Failed to submit intake form. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Client intake form submitted successfully",
      intake: data,
    });
  } catch (error) {
    console.error("Intake API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
