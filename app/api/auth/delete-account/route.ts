import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to delete your account" },
        { status: 401 }
      );
    }

    // Use service role client to delete user (admin-level operation)
    const serviceClient = createServiceRoleClient();

    // Get user's email for booking lookup (bookings link by email, not user_id)
    const userEmail = user.email ?? "";

    if (userEmail) {
      /**
       * ANONYMIZE BOOKINGS (DO NOT DELETE)
       *
       * Australian Legal Requirement: Financial/booking records must be retained for 7 years
       * GDPR Compliance: Right to Erasure allows anonymization when retention is legally required
       *
       * Booking System: advanced_bookings (production system with payment integration)
       * Pattern matches: /app/api/user/delete-data/route.ts
       */

      // Anonymize advanced_bookings (production system)
      await serviceClient
        .from("advanced_bookings")
        .update({
          client_name: "[DELETED]",
          client_email: "[DELETED]",
          client_phone: null,
          notes: null,
        })
        .eq("client_email", userEmail);
    }

    // Delete from tables without retention requirements
    await serviceClient
      .from("email_sequence_enrollments")
      .delete()
      .eq("user_id", user.id);

    // Delete the user from Supabase Auth
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    // Sign out the current session
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please contact support." },
      { status: 500 }
    );
  }
}
