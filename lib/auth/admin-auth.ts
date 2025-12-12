import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Admin Authentication Helper
 *
 * Validates that the current user is authenticated and has admin role.
 * Returns the user if authorized, or an appropriate error response.
 */
export async function requireAdminAuth(): Promise<
  | { authorized: true; user: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("SECURITY: Unauthorized access attempt to admin endpoint");
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized - Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Check role from user metadata
    // SECURITY: Role is stored in user_metadata and can only be set by admins via service role
    const role = user.user_metadata?.role;

    if (role !== "admin" && role !== "staff") {
      console.warn(
        `SECURITY: Forbidden access attempt to admin endpoint by user ${user.email} with role ${role}`
      );
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email || "",
        role,
      },
    };
  } catch (error) {
    console.error("Admin auth error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Require super admin role (admin only, not staff)
 */
export async function requireSuperAdminAuth(): Promise<
  | { authorized: true; user: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn("SECURITY: Unauthorized access attempt to super admin endpoint");
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized - Authentication required" },
          { status: 401 }
        ),
      };
    }

    const role = user.user_metadata?.role;

    if (role !== "admin") {
      console.warn(
        `SECURITY: Forbidden access attempt to super admin endpoint by user ${user.email} with role ${role}`
      );
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden - Super admin access required" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email || "",
        role,
      },
    };
  } catch (error) {
    console.error("Super admin auth error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      ),
    };
  }
}
