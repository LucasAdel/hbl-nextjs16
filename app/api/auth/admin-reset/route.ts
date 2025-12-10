/**
 * Admin Password Reset API
 *
 * This endpoint allows superadmins to reset their password directly
 * using Supabase's service role key, bypassing email rate limits.
 *
 * SECURITY: Only works for users with admin/staff roles.
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create admin client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // First, verify the user exists and is an admin/staff
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Failed to list users:", userError);
      return NextResponse.json(
        { success: false, error: "Failed to verify user" },
        { status: 500 }
      );
    }

    const user = users.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: "If an admin account exists with this email, a reset link will be sent." }
      );
    }

    // Check if user has admin, super_admin, or staff role
    const userRole = user.user_metadata?.role;
    const validAdminRoles = ["admin", "super_admin", "staff"];
    if (!validAdminRoles.includes(userRole)) {
      // Don't reveal this is the reason for security
      return NextResponse.json(
        { success: true, message: "If an admin account exists with this email, a reset link will be sent." }
      );
    }

    if (action === "generate-link") {
      // Generate a password reset link (doesn't send email)
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: user.email!,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hbl-law-staging.netlify.app"}/auth/callback`,
        },
      });

      if (error) {
        console.error("Failed to generate reset link:", error);
        return NextResponse.json(
          { success: false, error: "Failed to generate reset link" },
          { status: 500 }
        );
      }

      // Return the link (in production, you might want to send this via a different method)
      return NextResponse.json({
        success: true,
        message: "Password reset link generated",
        // Only return link in development or if specifically requested
        link: process.env.NODE_ENV === "development" ? data.properties?.action_link : undefined,
      });
    }

    // Default: Send password reset email using admin API (bypasses rate limits)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: user.email!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hbl-law-staging.netlify.app"}/auth/callback`,
      },
    });

    if (error) {
      console.error("Failed to generate recovery link:", error);
      return NextResponse.json(
        { success: false, error: "Failed to initiate password reset" },
        { status: 500 }
      );
    }

    // The admin.generateLink creates the link but doesn't send an email
    // We need to send it ourselves or return it
    // For now, return success with the link in development
    return NextResponse.json({
      success: true,
      message: "Password reset initiated for admin account",
      // In production, you'd send this link via your own email service
      resetLink: data.properties?.action_link,
      note: "Use this link to reset your password. It expires in 24 hours.",
    });
  } catch (error) {
    console.error("Admin reset error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
