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

    // Delete user data from related tables first (only tables that have user_id)
    await serviceClient
      .from("advanced_bookings")
      .delete()
      .eq("user_id", user.id);

    await serviceClient
      .from("simple_bookings")
      .delete()
      .eq("user_id", user.id);

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
