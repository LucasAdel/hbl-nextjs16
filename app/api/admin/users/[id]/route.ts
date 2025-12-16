import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Valid roles whitelist - prevents privilege escalation via arbitrary role injection
const ALLOWED_ROLES = ["client", "staff", "admin", "super_admin"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

// Roles that require super_admin to assign
const PRIVILEGED_ROLES: AllowedRole[] = ["admin", "super_admin"];

// GET /api/admin/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check current user is admin
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = currentUser.user_metadata?.role as AllowedRole | undefined;
    if (!currentUserRole || !["admin", "super_admin"].includes(currentUserRole)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Use service role to get user
    const serviceClient = createServiceRoleClient();
    const { data: userData, error: getUserError } = await serviceClient.auth.admin.getUserById(id);

    if (getUserError) {
      console.error("Get user error:", getUserError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        role: userData.user.user_metadata?.role || "client",
        firstName: userData.user.user_metadata?.first_name,
        lastName: userData.user.user_metadata?.last_name,
        emailConfirmedAt: userData.user.email_confirmed_at,
        createdAt: userData.user.created_at,
        lastSignInAt: userData.user.last_sign_in_at,
      },
    });
  } catch (error) {
    console.error("Get user API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check current user is admin
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = currentUser.user_metadata?.role as AllowedRole | undefined;
    if (!currentUserRole || !["admin", "super_admin"].includes(currentUserRole)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, role, email, password } = body;

    // Validate role if provided - prevents privilege escalation
    if (role !== undefined) {
      // Check role is in whitelist
      if (!ALLOWED_ROLES.includes(role as AllowedRole)) {
        console.warn(`SECURITY: ${currentUser.email} attempted to assign invalid role "${role}" to user ${id}`);
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }

      // Only super_admin can assign privileged roles (admin, super_admin)
      if (PRIVILEGED_ROLES.includes(role as AllowedRole) && currentUserRole !== "super_admin") {
        console.warn(`SECURITY: ${currentUser.email} (${currentUserRole}) attempted to assign privileged role "${role}" to user ${id}`);
        return NextResponse.json({ error: "Only super_admin can assign admin or super_admin roles" }, { status: 403 });
      }
    }

    // Use service role to update user
    const serviceClient = createServiceRoleClient();

    // Build update object
    const updateData: {
      email?: string;
      password?: string;
      user_metadata?: Record<string, string>;
    } = {};

    if (email) {
      updateData.email = email;
    }

    if (password) {
      // Log password changes for security audit
      console.warn(`SECURITY: ${currentUser.email} changed password for user ${id}`);
      updateData.password = password;
    }

    // Build metadata update
    const metadataUpdate: Record<string, string> = {};
    if (firstName !== undefined) metadataUpdate.first_name = firstName;
    if (lastName !== undefined) metadataUpdate.last_name = lastName;
    if (role !== undefined) metadataUpdate.role = role;

    if (Object.keys(metadataUpdate).length > 0) {
      updateData.user_metadata = metadataUpdate;
    }

    const { data: updatedUser, error: updateError } = await serviceClient.auth.admin.updateUserById(
      id,
      updateData
    );

    if (updateError) {
      console.error("Update user error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: updatedUser.user.user_metadata?.role,
        firstName: updatedUser.user.user_metadata?.first_name,
        lastName: updatedUser.user.user_metadata?.last_name,
      },
    });
  } catch (error) {
    console.error("Update user API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check current user is admin
    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserRole = currentUser.user_metadata?.role as AllowedRole | undefined;
    if (!currentUserRole || !["admin", "super_admin"].includes(currentUserRole)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Use service role to delete user
    const serviceClient = createServiceRoleClient();

    // Get user's email first for booking lookup
    const { data: userData, error: getUserError } = await serviceClient.auth.admin.getUserById(id);

    if (getUserError) {
      console.error("Get user error during deletion:", getUserError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = userData?.user?.email;

    if (userEmail) {
      /**
       * ANONYMIZE BOOKINGS (DO NOT DELETE)
       *
       * Australian Legal Requirement: Financial/booking records must be retained for 7 years
       * GDPR Compliance: Right to Erasure allows anonymization when retention is legally required
       *
       * Pattern matches: /app/api/user/delete-data/route.ts
       *
       * Booking System: advanced_bookings (production system with payment integration)
       */

      // Anonymize advanced_bookings (production system)
      await serviceClient
        .from("advanced_bookings")
        .update({
          client_name: "[DELETED BY ADMIN]",
          client_email: "[DELETED BY ADMIN]",
          client_phone: null,
          notes: null,
        })
        .eq("client_email", userEmail);
    }

    // Delete from tables without retention requirements
    await serviceClient.from("email_sequence_enrollments").delete().eq("user_id", id);

    // Delete the user from auth
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
