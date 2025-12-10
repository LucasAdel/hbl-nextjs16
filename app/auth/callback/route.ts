import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // Supabase sends type for different auth flows
  const next = searchParams.get("next") ?? "/portal";

  // Handle token hash in URL (for password reset email links)
  const token_hash = searchParams.get("token_hash");
  const authType = searchParams.get("type");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors when setting cookies in server component
          }
        },
      },
    }
  );

  // Handle OTP/token hash flow (used by password reset emails)
  if (token_hash && authType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: authType as "recovery" | "email" | "signup" | "invite" | "magiclink",
    });

    if (!error && data.session) {
      // For password recovery, redirect to reset-password page
      if (authType === "recovery") {
        return getRedirectResponse(request, origin, "/reset-password");
      }

      // For email verification, redirect to portal
      if (authType === "email" || authType === "signup") {
        return getRedirectResponse(request, origin, "/portal");
      }
    }

    // Error handling for OTP verification
    console.error("OTP verification error:", error);
    return NextResponse.redirect(`${origin}/login?error=verification_failed`);
  }

  // Handle code exchange flow (PKCE)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Check if this is a password recovery flow
      // Supabase sets the session type in the response
      if (type === "recovery" || data.session.user?.recovery_sent_at) {
        return getRedirectResponse(request, origin, "/reset-password");
      }

      // Check user role and redirect accordingly
      const userRole = data.session.user.user_metadata?.role || "client";

      // Determine redirect based on role
      let redirectTo = next;
      if (userRole === "admin" || userRole === "staff") {
        redirectTo = "/admin";
      } else if (userRole === "client") {
        redirectTo = "/portal";
      }

      return getRedirectResponse(request, origin, redirectTo);
    }

    // Log error for debugging
    console.error("Code exchange error:", error);
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}

/**
 * Helper to get the correct redirect response based on environment
 */
function getRedirectResponse(request: NextRequest, origin: string, redirectTo: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
  } else {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }
}
