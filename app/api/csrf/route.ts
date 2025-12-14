/**
 * CSRF Token Endpoint
 *
 * GET /api/csrf - Returns a CSRF token and sets the cookie
 *
 * Frontend should call this on app initialization and include
 * the token in the X-CSRF-Token header for all mutations.
 */

import { NextResponse } from "next/server";
import { getCSRFToken, setCSRFCookie } from "@/lib/csrf/csrf-protection";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getCSRFToken();

  const response = NextResponse.json({ token });

  // Set the CSRF cookie
  setCSRFCookie(response, token);

  return response;
}
