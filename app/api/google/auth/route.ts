import { NextRequest, NextResponse } from "next/server";

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

// Scopes needed for Calendar access
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

export async function GET(request: NextRequest) {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", "calendar_auth");

  return NextResponse.redirect(authUrl.toString());
}
