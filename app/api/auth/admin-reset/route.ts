/**
 * Admin Password Reset API
 *
 * SECURITY: This endpoint is DISABLED in production.
 * Admin password resets should only be done through:
 * 1. Supabase Dashboard directly
 * 2. CLI with proper authentication
 *
 * This endpoint previously had a critical vulnerability where
 * it returned password reset links to unauthenticated users.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // SECURITY: This endpoint is permanently disabled
  // Password reset links should NEVER be returned in API responses
  // Use Supabase Dashboard or standard email-based password reset instead

  console.warn("SECURITY: Blocked attempt to use disabled admin-reset endpoint");

  return NextResponse.json(
    {
      success: false,
      error: "This endpoint has been disabled for security reasons. Please use the standard password reset flow or contact support."
    },
    { status: 403 }
  );
}
