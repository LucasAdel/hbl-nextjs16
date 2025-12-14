/**
 * Account Lockout Check API
 *
 * POST /api/auth/check-lockout
 *
 * Checks if an account is locked and records failed login attempts.
 * Called by the frontend login form.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isAccountLocked,
  recordFailedAttempt,
  clearLoginAttempts,
} from "@/lib/auth/account-lockout";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);

  // Rate limit this endpoint heavily
  const rateLimit = checkRateLimit(`lockout-check-${clientId}`, {
    maxRequests: 10,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { email, action } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account is locked
    if (action === "check") {
      const lockStatus = await isAccountLocked(normalizedEmail);
      return NextResponse.json({
        locked: lockStatus.locked,
        remainingMs: lockStatus.remainingMs,
        message: lockStatus.message,
      });
    }

    // Record failed attempt
    if (action === "failed") {
      const result = await recordFailedAttempt(normalizedEmail);
      return NextResponse.json({
        locked: result.locked,
        attempts: result.attempts,
        remainingAttempts: result.remainingAttempts,
        message: result.message,
      });
    }

    // Clear attempts on success
    if (action === "success") {
      await clearLoginAttempts(normalizedEmail);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action. Use: check, failed, or success" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Lockout check error:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
