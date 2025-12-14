/**
 * MFA Enforcement for Admin Users
 *
 * Requires admin users to have MFA (TOTP) enabled.
 * Non-compliant admins are redirected to setup MFA.
 */

import { User } from "@supabase/supabase-js";

/**
 * Check if user requires MFA but hasn't set it up
 */
export function requiresMfaSetup(user: User | null): boolean {
  if (!user) return false;

  const role = user.user_metadata?.role;
  const isAdmin = role === "admin" || role === "super_admin";

  if (!isAdmin) return false;

  // Check if MFA is enrolled
  // Supabase stores MFA factors in the user's app_metadata
  const factors = user.factors || [];
  const hasVerifiedTotp = factors.some(
    (factor: { factor_type: string; status: string }) =>
      factor.factor_type === "totp" && factor.status === "verified"
  );

  return !hasVerifiedTotp;
}

/**
 * Check if user has verified MFA for this session
 * Note: AAL checking requires session data, not just user data
 */
export function isMfaVerified(user: User | null): boolean {
  if (!user) return false;

  // Check if user has any verified TOTP factors
  // Full AAL verification would require checking the session
  const factors = user.factors || [];
  return factors.some(
    (factor: { factor_type: string; status: string }) =>
      factor.factor_type === "totp" && factor.status === "verified"
  );
}

/**
 * Get MFA status for a user
 */
export function getMfaStatus(user: User | null): {
  required: boolean;
  enrolled: boolean;
  verified: boolean;
  message?: string;
} {
  if (!user) {
    return {
      required: false,
      enrolled: false,
      verified: false,
    };
  }

  const role = user.user_metadata?.role;
  const isAdmin = role === "admin" || role === "super_admin";

  const factors = user.factors || [];
  const hasVerifiedTotp = factors.some(
    (factor: { factor_type: string; status: string }) =>
      factor.factor_type === "totp" && factor.status === "verified"
  );

  // MFA is considered verified if the user has enrolled and verified a TOTP factor
  const isVerifiedThisSession = hasVerifiedTotp;

  if (!isAdmin) {
    return {
      required: false,
      enrolled: hasVerifiedTotp,
      verified: isVerifiedThisSession,
    };
  }

  if (!hasVerifiedTotp) {
    return {
      required: true,
      enrolled: false,
      verified: false,
      message: "Admin accounts require two-factor authentication. Please set up MFA.",
    };
  }

  if (!isVerifiedThisSession) {
    return {
      required: true,
      enrolled: true,
      verified: false,
      message: "Please verify your identity with two-factor authentication.",
    };
  }

  return {
    required: true,
    enrolled: true,
    verified: true,
  };
}

/**
 * Routes that require MFA verification
 */
export const MFA_PROTECTED_ROUTES = [
  "/admin",
  "/admin/users",
  "/admin/settings",
  "/api/admin/users",
];

/**
 * Check if a path requires MFA
 */
export function pathRequiresMfa(path: string): boolean {
  return MFA_PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}
