import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL("/admin/settings?error=google_auth_failed", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/settings?error=no_code", request.url)
    );
  }

  try {
    // Exchange code for tokens via REST API
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenResponse.json();

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get tokens from Google");
    }

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // Store tokens in settings table
    const { error: upsertError } = await supabase
      .from("settings")
      .upsert({
        key: "google_calendar_tokens",
        value: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: Date.now() + tokens.expires_in * 1000,
          token_type: tokens.token_type,
          scope: tokens.scope,
          updated_at: new Date().toISOString(),
        },
      }, { onConflict: "key" });

    if (upsertError) {
      console.error("Failed to store tokens:", upsertError);
      throw new Error("Failed to store Google tokens");
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/admin/settings?success=google_connected", request.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/admin/settings?error=token_exchange_failed", request.url)
    );
  }
}
