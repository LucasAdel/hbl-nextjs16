import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email-service";

/**
 * Healthcare Visa Guide Lead Capture API
 *
 * Captures leads interested in the healthcare visa guide and sends the PDF via email.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, firstName, lastName } = body;

    // Support both combined name and separate firstName/lastName
    const fullName = name || `${firstName || ""} ${lastName || ""}`.trim();
    const leadFirstName = firstName || name?.split(" ")[0] || "there";

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
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Store the lead in newsletter_subscribers table
    const { error: leadError } = await supabase.from("newsletter_subscribers").insert({
      email,
      first_name: leadFirstName,
      last_name: fullName.split(" ").slice(1).join(" ") || null,
      source: "visa_guide_download",
      interests: ["healthcare_visa"],
      status: "active",
    }).select().maybeSingle();

    if (leadError && !leadError.message.includes("duplicate")) {
      console.error("Error storing visa guide lead:", leadError);
      // Continue even if lead storage fails - we still want to send the guide
    }

    // Track the action
    try {
      await supabase.from("user_actions").insert({
        email,
        action: "visa_guide_requested",
        metadata: {
          name: fullName,
          guide_type: "healthcare_visa",
        },
      });
    } catch (err) {
      console.error("Error tracking action:", err);
    }

    // Send the visa guide email
    const guideUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://hamiltonbailey.com"}/guides/healthcare-visa-guide.pdf`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Healthcare Visa Guide</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0D9488; margin-bottom: 10px;">Hamilton Bailey</h1>
          <p style="color: #666; font-size: 14px;">Medical Practice Law Specialists</p>
        </div>

        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${leadFirstName},</h2>
          <p>Thank you for your interest in our Healthcare Professional Visa Guide. This comprehensive resource covers everything you need to know about Australian immigration pathways for medical professionals.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${guideUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">Download Your Guide</a>
          </div>

          <h3 style="color: #0D9488; margin-top: 30px;">What's Inside:</h3>
          <ul style="padding-left: 20px;">
            <li>6 visa pathways explained (482, 186, 189, 190, 491, 494)</li>
            <li>Skills assessment requirements for healthcare professionals</li>
            <li>Points calculator and eligibility criteria</li>
            <li>Processing times and cost breakdowns</li>
            <li>Step-by-step application guides</li>
          </ul>
        </div>

        <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; border-left: 4px solid #0D9488; margin-bottom: 30px;">
          <h3 style="color: #0F766E; margin-top: 0;">Need Personalised Advice?</h3>
          <p style="margin-bottom: 15px;">Our immigration specialists work exclusively with healthcare professionals. Book a consultation to discuss your specific situation and get a tailored pathway assessment.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://hamiltonbailey.com"}/book-appointment" style="color: #0D9488; font-weight: 600;">Book a Consultation &rarr;</a>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Hamilton Bailey Law</p>
          <p>Adelaide, South Australia</p>
          <p style="margin-top: 10px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://hamiltonbailey.com"}" style="color: #0D9488;">hamiltonbailey.com</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Healthcare Professional Visa Guide - Hamilton Bailey",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Failed to send visa guide email:", emailResult.error);
      // Return success anyway - we've captured the lead
      return NextResponse.json({
        success: true,
        message: "Lead captured successfully. Guide delivery may be delayed.",
        emailSent: false,
      });
    }

    // Enroll in visa guide nurture sequence
    try {
      await supabase.from("email_sequence_enrollments").insert({
        email,
        sequence_type: "welcome_series",
        current_step: 1,
        status: "active",
        next_email_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days later
        metadata: {
          name: fullName,
          guide_downloaded: true,
        },
      });
    } catch (err) {
      console.error("Error enrolling in sequence:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Guide sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Visa guide API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
