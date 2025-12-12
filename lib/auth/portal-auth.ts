import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Portal Authentication Helper
 *
 * SECURITY: This ensures users can only access their own data.
 * Prevents IDOR (Insecure Direct Object Reference) attacks where
 * attackers could query data for other users by providing their email.
 */
export async function requirePortalAuth(requestedEmail?: string): Promise<
  | { authorized: true; user: { id: string; email: string } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      console.warn("SECURITY: Unauthorized portal access attempt");
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized - Please sign in to access your portal" },
          { status: 401 }
        ),
      };
    }

    // SECURITY: If an email was provided in the request, verify it matches the authenticated user
    // This prevents IDOR attacks where an attacker provides someone else's email
    if (requestedEmail && requestedEmail.toLowerCase() !== user.email.toLowerCase()) {
      console.warn(
        `SECURITY: IDOR attempt detected - User ${user.email} tried to access data for ${requestedEmail}`
      );
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden - You can only access your own data" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Portal auth error:", error);
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
 * Admin portal auth - allows admins to access any user's data
 * Used for admin-created invoices, admin messaging, etc.
 */
export async function requirePortalOrAdminAuth(requestedEmail?: string): Promise<
  | { authorized: true; user: { id: string; email: string; isAdmin: boolean } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      console.warn("SECURITY: Unauthorized portal access attempt");
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Unauthorized - Please sign in" },
          { status: 401 }
        ),
      };
    }

    const role = user.user_metadata?.role;
    const isAdmin = role === "admin" || role === "staff";

    // Admins can access any user's data
    if (isAdmin) {
      return {
        authorized: true,
        user: {
          id: user.id,
          email: user.email,
          isAdmin: true,
        },
      };
    }

    // Regular users can only access their own data
    if (requestedEmail && requestedEmail.toLowerCase() !== user.email.toLowerCase()) {
      console.warn(
        `SECURITY: IDOR attempt detected - User ${user.email} tried to access data for ${requestedEmail}`
      );
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden - You can only access your own data" },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: false,
      },
    };
  } catch (error) {
    console.error("Portal auth error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      ),
    };
  }
}
