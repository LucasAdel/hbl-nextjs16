/**
 * Security Audit Logger
 *
 * Logs security-relevant events to the audit_logs table for compliance and monitoring.
 * Used by authentication, authorization, and sensitive operations.
 *
 * IMPORTANT: Never log sensitive data (passwords, tokens, PII beyond what's necessary)
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

// Event types for classification
export const AUDIT_EVENT_TYPES = {
  AUTH: "auth",
  PERMISSION: "permission",
  DATA_ACCESS: "data_access",
  RATE_LIMIT: "rate_limit",
  SECURITY: "security",
  ADMIN_ACTION: "admin_action",
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];

// Severity levels
export const AUDIT_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
} as const;

export type AuditSeverity =
  (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];

// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILURE: "login_failure",
  LOGOUT: "logout",
  PASSWORD_RESET_REQUEST: "password_reset_request",
  PASSWORD_CHANGED: "password_changed",
  SESSION_EXPIRED: "session_expired",

  // Authorization
  PERMISSION_DENIED: "permission_denied",
  ROLE_CHECK_FAILED: "role_check_failed",
  ADMIN_ACCESS_GRANTED: "admin_access_granted",

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
  RATE_LIMIT_WARNING: "rate_limit_warning",

  // Data access
  SENSITIVE_DATA_ACCESSED: "sensitive_data_accessed",
  DATA_EXPORT: "data_export",
  BULK_OPERATION: "bulk_operation",

  // Security events
  SUSPICIOUS_REQUEST: "suspicious_request",
  INVALID_TOKEN: "invalid_token",
  CSRF_VIOLATION: "csrf_violation",
  XSS_ATTEMPT: "xss_attempt",
  SQL_INJECTION_ATTEMPT: "sql_injection_attempt",

  // Admin actions
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",
  ROLE_CHANGED: "role_changed",
  SETTINGS_CHANGED: "settings_changed",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

interface AuditLogEntry {
  eventType: AuditEventType;
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  endpoint: string;
  method: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction | string;
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Extract IP address from request headers
 */
export function extractIpAddress(headers: Headers): string | undefined {
  // Check various headers in order of trust
  // Note: In production behind a trusted proxy, prefer CF-Connecting-IP or X-Real-IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Take the first IP (original client)
    return xForwardedFor.split(",")[0].trim();
  }

  return undefined;
}

/**
 * Sanitize user agent to prevent log injection
 */
function sanitizeUserAgent(userAgent: string | null): string | undefined {
  if (!userAgent) return undefined;
  // Limit length and remove control characters
  return userAgent.substring(0, 500).replace(/[\x00-\x1f\x7f]/g, "");
}

/**
 * Log a security audit event
 *
 * @example
 * await auditLog({
 *   eventType: AUDIT_EVENT_TYPES.AUTH,
 *   action: AUDIT_ACTIONS.LOGIN_FAILURE,
 *   severity: AUDIT_SEVERITY.WARNING,
 *   endpoint: '/api/auth/login',
 *   method: 'POST',
 *   ipAddress: '192.168.1.1',
 *   userEmail: 'user@example.com',
 *   errorMessage: 'Invalid credentials'
 * });
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    await supabase.from("audit_logs").insert({
      event_type: entry.eventType,
      severity: entry.severity || AUDIT_SEVERITY.INFO,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      endpoint: entry.endpoint,
      method: entry.method,
      user_id: entry.userId,
      user_email: entry.userEmail,
      user_role: entry.userRole,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      success: entry.success ?? true,
      metadata: (entry.metadata || {}) as unknown as Json,
      error_code: entry.errorCode,
      error_message: entry.errorMessage,
    });
  } catch (error) {
    // Log to console but don't throw - audit logging should never break the application
    console.error("[AUDIT] Failed to write audit log:", error);
  }
}

/**
 * Helper for logging authentication events
 */
export async function auditAuthEvent(
  action: AuditAction,
  request: {
    headers: Headers;
    url: string;
    method: string;
  },
  options: {
    userId?: string;
    userEmail?: string;
    success?: boolean;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const url = new URL(request.url);

  await auditLog({
    eventType: AUDIT_EVENT_TYPES.AUTH,
    severity: options.success ? AUDIT_SEVERITY.INFO : AUDIT_SEVERITY.WARNING,
    action,
    endpoint: url.pathname,
    method: request.method,
    ipAddress: extractIpAddress(request.headers),
    userAgent: sanitizeUserAgent(request.headers.get("user-agent")),
    userId: options.userId,
    userEmail: options.userEmail,
    success: options.success,
    errorMessage: options.errorMessage,
    metadata: options.metadata,
  });
}

/**
 * Helper for logging permission denied events
 */
export async function auditPermissionDenied(
  request: {
    headers: Headers;
    url: string;
    method: string;
  },
  user: {
    id: string;
    email: string;
    role: string;
  },
  requiredPermission: string
): Promise<void> {
  const url = new URL(request.url);

  await auditLog({
    eventType: AUDIT_EVENT_TYPES.PERMISSION,
    severity: AUDIT_SEVERITY.WARNING,
    action: AUDIT_ACTIONS.PERMISSION_DENIED,
    endpoint: url.pathname,
    method: request.method,
    ipAddress: extractIpAddress(request.headers),
    userAgent: sanitizeUserAgent(request.headers.get("user-agent")),
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    success: false,
    metadata: {
      requiredPermission,
    },
  });
}

/**
 * Helper for logging rate limit events
 */
export async function auditRateLimitExceeded(
  request: {
    headers: Headers;
    url: string;
    method: string;
  },
  options?: {
    userId?: string;
    userEmail?: string;
    limit?: number;
    window?: string;
  }
): Promise<void> {
  const url = new URL(request.url);

  await auditLog({
    eventType: AUDIT_EVENT_TYPES.RATE_LIMIT,
    severity: AUDIT_SEVERITY.WARNING,
    action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
    endpoint: url.pathname,
    method: request.method,
    ipAddress: extractIpAddress(request.headers),
    userAgent: sanitizeUserAgent(request.headers.get("user-agent")),
    userId: options?.userId,
    userEmail: options?.userEmail,
    success: false,
    metadata: {
      limit: options?.limit,
      window: options?.window,
    },
  });
}

/**
 * Helper for logging suspicious security events
 */
export async function auditSecurityEvent(
  action: AuditAction | string,
  request: {
    headers: Headers;
    url: string;
    method: string;
  },
  options?: {
    userId?: string;
    userEmail?: string;
    severity?: AuditSeverity;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const url = new URL(request.url);

  await auditLog({
    eventType: AUDIT_EVENT_TYPES.SECURITY,
    severity: options?.severity || AUDIT_SEVERITY.WARNING,
    action,
    endpoint: url.pathname,
    method: request.method,
    ipAddress: extractIpAddress(request.headers),
    userAgent: sanitizeUserAgent(request.headers.get("user-agent")),
    userId: options?.userId,
    userEmail: options?.userEmail,
    success: false,
    metadata: options?.metadata,
  });
}

/**
 * Helper for logging admin actions
 */
export async function auditAdminAction(
  action: AuditAction | string,
  request: {
    headers: Headers;
    url: string;
    method: string;
  },
  admin: {
    id: string;
    email: string;
    role: string;
  },
  options?: {
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const url = new URL(request.url);

  await auditLog({
    eventType: AUDIT_EVENT_TYPES.ADMIN_ACTION,
    severity: AUDIT_SEVERITY.INFO,
    action,
    endpoint: url.pathname,
    method: request.method,
    ipAddress: extractIpAddress(request.headers),
    userAgent: sanitizeUserAgent(request.headers.get("user-agent")),
    userId: admin.id,
    userEmail: admin.email,
    userRole: admin.role,
    success: true,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    metadata: options?.metadata,
  });
}
