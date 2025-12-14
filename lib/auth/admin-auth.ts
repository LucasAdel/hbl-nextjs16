import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  Permission,
  hasPermission,
  PERMISSIONS,
} from "./permissions";

// Re-export for convenience
export { PERMISSIONS, hasPermission } from "./permissions";
export type { Permission } from "./permissions";

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

/**
 * Permission-based authentication
 *
 * Validates that the current user has a specific permission.
 * Uses the granular RBAC system defined in permissions.ts.
 *
 * @param requiredPermission - The permission required to access the resource
 * @returns Authorized user or error response
 *
 * @example
 * ```typescript
 * const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
 * if (!auth.authorized) return auth.response;
 * // User has VIEW_ANALYTICS permission
 * ```
 */
export async function requirePermission(
  requiredPermission: Permission
): Promise<
  | { authorized: true; user: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  // First check basic admin auth (user must be admin or staff)
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult;
  }

  // Then check specific permission
  if (!hasPermission(authResult.user.role, requiredPermission)) {
    console.warn(
      `SECURITY: Permission denied - ${authResult.user.email} (${authResult.user.role}) lacks ${requiredPermission}`
    );
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Forbidden - Requires ${requiredPermission} permission` },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Multi-permission authentication (AND logic)
 *
 * Validates that the current user has ALL specified permissions.
 *
 * @param requiredPermissions - Array of permissions ALL required
 * @returns Authorized user or error response
 */
export async function requireAllPermissions(
  requiredPermissions: Permission[]
): Promise<
  | { authorized: true; user: { id: string; email: string; role: string } }
  | { authorized: false; response: NextResponse }
> {
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult;
  }

  const missingPermissions = requiredPermissions.filter(
    (p) => !hasPermission(authResult.user.role, p)
  );

  if (missingPermissions.length > 0) {
    console.warn(
      `SECURITY: Permission denied - ${authResult.user.email} (${authResult.user.role}) lacks ${missingPermissions.join(", ")}`
    );
    return {
      authorized: false,
      response: NextResponse.json(
        { error: `Forbidden - Requires permissions: ${missingPermissions.join(", ")}` },
        { status: 403 }
      ),
    };
  }

  return authResult;
}
