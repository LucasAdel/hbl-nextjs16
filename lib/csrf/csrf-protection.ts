/**
 * CSRF Protection Utility
 *
 * Provides CSRF token generation and validation for protecting
 * state-changing API endpoints from cross-site request forgery.
 *
 * Uses the double-submit cookie pattern for stateless CSRF protection.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Get or create a CSRF token
 *
 * This should be called on page load to set the cookie,
 * then the token value should be included in form submissions.
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existingToken) {
    return existingToken;
  }

  // Generate new token
  const token = generateToken();

  // Note: Cookie will be set by the response
  return token;
}

/**
 * Set CSRF cookie on response
 */
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

/**
 * Validate CSRF token from request
 *
 * Compares the token from the cookie with the token from the header.
 * Both must be present and match.
 *
 * @param request - The incoming request
 * @returns true if valid, false if invalid
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF for non-mutation methods
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true;
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Both must be present
  if (!cookieToken || !headerToken) {
    console.warn("[CSRF] Missing token - cookie:", !!cookieToken, "header:", !!headerToken);
    return false;
  }

  // Tokens must match (constant-time comparison)
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  if (result !== 0) {
    console.warn("[CSRF] Token mismatch");
    return false;
  }

  return true;
}

/**
 * CSRF validation middleware helper
 *
 * Use this in API routes that need CSRF protection.
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const csrfError = await requireCSRF(request);
 *   if (csrfError) return csrfError;
 *
 *   // Process the request...
 * }
 * ```
 */
export async function requireCSRF(
  request: NextRequest
): Promise<NextResponse | null> {
  const isValid = await validateCSRFToken(request);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token" },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Endpoints that should skip CSRF validation
 *
 * Webhooks and public APIs that don't use cookies for auth
 * should be exempt from CSRF protection.
 *
 * Public forms (newsletter, legal resources) are exempt because:
 * - They are heavily rate-limited
 * - They don't modify sensitive data
 * - Anonymous users don't have CSRF cookies
 */
export const CSRF_EXEMPT_PATHS = [
  "/api/webhooks/", // All webhook endpoints
  "/api/chat", // Chat API (rate limited, no session)
  "/api/chat/stream", // Chat streaming
  "/api/cron/", // Cron jobs (authenticated differently)
  "/api/health", // Health check
  "/api/newsletter", // Public signup (rate limited)
  "/api/legal-resources", // Public signup (rate limited)
  "/api/auth/", // Auth endpoints (magic link, password reset)
  "/api/google/", // OAuth callbacks
];

/**
 * Check if a path should skip CSRF validation
 */
export function isCSRFExempt(pathname: string): boolean {
  return CSRF_EXEMPT_PATHS.some(
    (exempt) => pathname === exempt || pathname.startsWith(exempt)
  );
}
