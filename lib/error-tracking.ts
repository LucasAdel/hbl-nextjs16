/**
 * Error tracking and logging utility
 * In production, integrate with Sentry, LogRocket, or similar service
 */

interface ErrorContext {
  userId?: string;
  email?: string;
  route?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

interface TrackedError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: "low" | "medium" | "high" | "critical";
}

// In-memory error store for development (limited to last 100 errors)
const errorStore: TrackedError[] = [];
const MAX_STORED_ERRORS = 100;

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Determine error severity based on error type
 */
function determineSeverity(error: Error, context: ErrorContext): TrackedError["severity"] {
  const message = error.message.toLowerCase();

  // Critical errors
  if (
    message.includes("payment") ||
    message.includes("stripe") ||
    message.includes("database") ||
    message.includes("authentication")
  ) {
    return "critical";
  }

  // High severity
  if (
    message.includes("api") ||
    message.includes("fetch") ||
    message.includes("network") ||
    context.action?.includes("booking") ||
    context.action?.includes("checkout")
  ) {
    return "high";
  }

  // Medium severity
  if (
    message.includes("validation") ||
    message.includes("form") ||
    message.includes("email")
  ) {
    return "medium";
  }

  return "low";
}

/**
 * Track an error
 */
export function trackError(
  error: Error | string,
  context: ErrorContext = {}
): string {
  const err = typeof error === "string" ? new Error(error) : error;
  const errorId = generateErrorId();

  const trackedError: TrackedError = {
    id: errorId,
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    context,
    severity: determineSeverity(err, context),
  };

  // Store error
  errorStore.unshift(trackedError);
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.pop();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR ${errorId}]`, {
      message: err.message,
      severity: trackedError.severity,
      context,
      stack: err.stack,
    });
  }

  // In production, send to external service
  if (process.env.NODE_ENV === "production") {
    sendToErrorService(trackedError);
  }

  return errorId;
}

/**
 * Send error to external service (Sentry, etc.)
 */
async function sendToErrorService(error: TrackedError): Promise<void> {
  // If using Sentry
  if (process.env.SENTRY_DSN) {
    try {
      // Sentry integration would go here
      // Sentry.captureException(error);
    } catch {
      console.error("Failed to send error to Sentry");
    }
  }

  // If using custom webhook
  if (process.env.ERROR_WEBHOOK_URL) {
    try {
      await fetch(process.env.ERROR_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error),
      });
    } catch {
      console.error("Failed to send error to webhook");
    }
  }

  // Log critical errors to database
  if (error.severity === "critical" && process.env.SUPABASE_URL) {
    try {
      // Would log to Supabase here if needed
    } catch {
      console.error("Failed to log critical error to database");
    }
  }
}

/**
 * Get recent errors (for admin dashboard)
 */
export function getRecentErrors(limit: number = 20): TrackedError[] {
  return errorStore.slice(0, limit);
}

/**
 * Get errors by severity
 */
export function getErrorsBySeverity(
  severity: TrackedError["severity"]
): TrackedError[] {
  return errorStore.filter((e) => e.severity === severity);
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  bySeverity: Record<string, number>;
  last24Hours: number;
} {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  return {
    total: errorStore.length,
    bySeverity: {
      critical: errorStore.filter((e) => e.severity === "critical").length,
      high: errorStore.filter((e) => e.severity === "high").length,
      medium: errorStore.filter((e) => e.severity === "medium").length,
      low: errorStore.filter((e) => e.severity === "low").length,
    },
    last24Hours: errorStore.filter(
      (e) => new Date(e.timestamp).getTime() > oneDayAgo
    ).length,
  };
}

/**
 * Higher-order function to wrap handlers with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T,
  context: Partial<ErrorContext> = {}
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const errorId = trackError(error as Error, context);

      // Re-throw with error ID for client-side display
      const enhancedError = new Error(
        `An error occurred. Reference: ${errorId}`
      );
      (enhancedError as unknown as { originalError: Error; errorId: string }).originalError = error as Error;
      (enhancedError as unknown as { errorId: string }).errorId = errorId;
      throw enhancedError;
    }
  }) as T;
}

/**
 * Create an API error response
 */
export function createErrorResponse(
  error: Error,
  context: ErrorContext = {},
  status: number = 500
): Response {
  const errorId = trackError(error, context);

  return new Response(
    JSON.stringify({
      error: "An error occurred",
      message: process.env.NODE_ENV === "development" ? error.message : "Please try again later",
      errorId,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
