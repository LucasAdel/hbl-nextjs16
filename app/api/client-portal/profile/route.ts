import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/client-portal/profile - Get client profile from user metadata
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Return profile from user metadata
    const metadata = user.user_metadata || {};

    return NextResponse.json({
      success: true,
      profile: {
        firstName: metadata.first_name || "",
        lastName: metadata.last_name || "",
        email: email,
        phone: metadata.phone || "",
        company: metadata.company || "",
        address: metadata.address || "",
        city: metadata.city || "",
        state: metadata.state || "QLD",
        postcode: metadata.postcode || "",
        emailNotifications: metadata.email_notifications ?? true,
        smsNotifications: metadata.sms_notifications ?? false,
      },
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/client-portal/profile - Update client profile in user metadata
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profile, notifications } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Build metadata update
    const metadataUpdate: Record<string, unknown> = {};

    if (profile) {
      if (profile.firstName !== undefined) metadataUpdate.first_name = profile.firstName;
      if (profile.lastName !== undefined) metadataUpdate.last_name = profile.lastName;
      if (profile.phone !== undefined) metadataUpdate.phone = profile.phone;
      if (profile.company !== undefined) metadataUpdate.company = profile.company;
      if (profile.address !== undefined) metadataUpdate.address = profile.address;
      if (profile.city !== undefined) metadataUpdate.city = profile.city;
      if (profile.state !== undefined) metadataUpdate.state = profile.state;
      if (profile.postcode !== undefined) metadataUpdate.postcode = profile.postcode;
    }

    if (notifications) {
      if (notifications.emailNotifications !== undefined) {
        metadataUpdate.email_notifications = notifications.emailNotifications;
      }
      if (notifications.smsNotifications !== undefined) {
        metadataUpdate.sms_notifications = notifications.smsNotifications;
      }
    }

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: metadataUpdate,
    });

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
