import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // If "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/portal";

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check user role and redirect accordingly
      const userRole = data.user.user_metadata?.role || "client";

      // Determine redirect based on role
      let redirectTo = next;
      if (userRole === "admin" || userRole === "staff") {
        redirectTo = "/admin";
      } else if (userRole === "client") {
        redirectTo = "/portal";
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // Local development - use origin directly
        return NextResponse.redirect(`${origin}${redirectTo}`);
      } else if (forwardedHost) {
        // Production with reverse proxy
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
      } else {
        // Production without reverse proxy
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
