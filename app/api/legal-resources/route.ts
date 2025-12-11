import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email-service";

/**
 * Legal Resources Lead Capture API
 *
 * Captures leads interested in the free legal resources bundle and sends
 * download links via email. Resources include:
 * - Practice Compliance Checklist
 * - Employment Contract Essentials Guide
 * - Medical Practice Structure Overview
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://hamiltonbailey.com";

const RESOURCES = [
  {
    name: "Practice Compliance Checklist",
    description: "A comprehensive 12-section checklist covering all key regulatory obligations for Australian medical practices",
    url: `${BASE_URL}/documents/legal-resources/practice-compliance-checklist.pdf`,
  },
  {
    name: "Employment Contract Essentials Guide",
    description: "Essential contract terms, Award coverage, and common pitfalls for medical practice employment",
    url: `${BASE_URL}/documents/legal-resources/employment-contract-essentials.pdf`,
  },
  {
    name: "Medical Practice Structure Overview",
    description: "Business structure options, tax comparisons, and decision frameworks for medical practices",
    url: `${BASE_URL}/documents/legal-resources/medical-practice-structure-overview.pdf`,
  },
];

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
    const { error: leadError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        first_name: leadFirstName,
        last_name: fullName.split(" ").slice(1).join(" ") || null,
        source: "legal_resources_download",
        interests: ["legal_resources", "compliance", "employment", "practice_structure"],
        status: "active",
      })
      .select()
      .maybeSingle();

    if (leadError && !leadError.message.includes("duplicate")) {
      console.error("Error storing legal resources lead:", leadError);
      // Continue even if lead storage fails - we still want to send the resources
    }

    // Track the action
    try {
      await supabase.from("user_actions").insert({
        email,
        action: "legal_resources_requested",
        metadata: {
          name: fullName,
          resources: RESOURCES.map((r) => r.name),
        },
      });
    } catch (err) {
      console.error("Error tracking action:", err);
    }

    // Send the legal resources email
    const emailHtml = generateEmailTemplate(leadFirstName);

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Free Legal Resources - Hamilton Bailey",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Failed to send legal resources email:", emailResult.error);
      return NextResponse.json({
        success: true,
        message: "Lead captured successfully. Resource delivery may be delayed.",
        emailSent: false,
      });
    }

    // Enroll in welcome series sequence
    try {
      await supabase.from("email_sequence_enrollments").insert({
        email,
        sequence_type: "welcome_series",
        current_step: 1,
        status: "active",
        next_email_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days later
        metadata: {
          name: fullName,
          resources_downloaded: true,
          source: "legal_resources_lead_magnet",
        },
      });
    } catch (err) {
      console.error("Error enrolling in sequence:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Resources sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Legal resources API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

function generateEmailTemplate(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free Legal Resources</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px;">
    <div style="display: inline-flex; align-items: center; gap: 10px;">
      <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">HB</div>
    </div>
    <h1 style="color: #0D9488; margin: 10px 0 5px 0; font-size: 24px;">Hamilton Bailey</h1>
    <p style="color: #6B7280; font-size: 14px; margin: 0;">Medical Practice Law Specialists</p>
  </div>

  <!-- Main Content -->
  <div style="background-color: #ffffff; padding: 35px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

    <h2 style="color: #111827; margin-top: 0; margin-bottom: 15px; font-size: 22px;">Hi ${firstName},</h2>

    <p style="margin-bottom: 20px; font-size: 15px;">Thank you for subscribing! As promised, here are your three free legal resources designed specifically for Australian medical practice owners and managers.</p>

    <!-- Resources Section -->
    <div style="margin: 30px 0;">

      <!-- Resource 1 -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
        <h3 style="color: #0F766E; margin: 0 0 8px 0; font-size: 16px;">📋 Practice Compliance Checklist</h3>
        <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">A comprehensive 12-section checklist covering AHPRA registration, privacy compliance, WHS, employment, Medicare billing, and more.</p>
        <a href="${RESOURCES[0].url}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Checklist</a>
      </div>

      <!-- Resource 2 -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
        <h3 style="color: #0F766E; margin: 0 0 8px 0; font-size: 16px;">📝 Employment Contract Essentials Guide</h3>
        <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">Essential contract terms, Award coverage, professional obligations, restraint clauses, and common pitfalls to avoid.</p>
        <a href="${RESOURCES[1].url}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Guide</a>
      </div>

      <!-- Resource 3 -->
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 20px; border-radius: 12px;">
        <h3 style="color: #0F766E; margin: 0 0 8px 0; font-size: 16px;">🏢 Medical Practice Structure Overview</h3>
        <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">Compare sole trader, partnership, company, and trust structures with tax implications and decision frameworks.</p>
        <a href="${RESOURCES[2].url}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Overview</a>
      </div>

    </div>

    <!-- CTA Section -->
    <div style="background-color: #f0fdfa; padding: 25px; border-radius: 12px; border-left: 4px solid #0D9488; margin-top: 30px;">
      <h3 style="color: #0F766E; margin: 0 0 10px 0; font-size: 17px;">Need Personalised Legal Advice?</h3>
      <p style="margin: 0 0 15px 0; font-size: 14px; color: #374151;">Our team specialises exclusively in medical practice law. Book a consultation to discuss your specific compliance, employment, or structuring needs.</p>
      <a href="${BASE_URL}/book-appointment" style="display: inline-block; background: #0F766E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Book a Consultation →</a>
    </div>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 30px 20px; color: #6B7280; font-size: 12px;">
    <p style="margin: 0 0 5px 0; font-weight: 600; color: #0D9488;">Hamilton Bailey Law</p>
    <p style="margin: 0 0 5px 0;">Adelaide, South Australia</p>
    <p style="margin: 15px 0 0 0;">
      <a href="${BASE_URL}" style="color: #0D9488; text-decoration: none;">hamiltonbailey.com</a>
    </p>
    <p style="margin: 15px 0 0 0; font-size: 11px; color: #9CA3AF;">
      You're receiving this email because you requested our free legal resources.
      <br>
      <a href="${BASE_URL}/unsubscribe" style="color: #6B7280;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
`;
}
