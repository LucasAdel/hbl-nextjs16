/**
 * Structured Logger
 *
 * Centralized logging utility for consistent, structured logs across the application.
 * Integrates with Sentry for error tracking in production.
 *
 * Features:
 * - Consistent log format with timestamps and context
 * - Log levels (debug, info, warn, error)
 * - Request correlation via request IDs
 * - Automatic Sentry integration for errors
 * - Environment-aware (dev shows all, prod filters debug)
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  route?: string
  userId?: string
  email?: string
  requestId?: string
  sessionId?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error | unknown
  stack?: string
}

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry

  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
  }

  const reset = '\x1b[0m'
  const color = levelColors[level]

  let output = `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`

  if (context && Object.keys(context).length > 0) {
    output += `\n  Context: ${JSON.stringify(context, null, 2)}`
  }

  if (error) {
    if (error instanceof Error) {
      output += `\n  Error: ${error.message}`
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`
      }
    } else {
      output += `\n  Error: ${JSON.stringify(error)}`
    }
  }

  return output
}

/**
 * Format log entry for structured JSON output (production)
 */
function formatLogEntryJSON(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    error: entry.error instanceof Error
      ? {
          message: entry.error.message,
          name: entry.error.name,
          stack: entry.error.stack,
        }
      : entry.error,
  })
}

/**
 * Output log to console
 */
function outputLog(entry: LogEntry): void {
  const consoleMethod = entry.level === 'error'
    ? console.error
    : entry.level === 'warn'
      ? console.warn
      : entry.level === 'debug'
        ? console.debug
        : console.log

  if (isDevelopment) {
    consoleMethod(formatLogEntry(entry))
  } else {
    // In production, use JSON format for log aggregation
    consoleMethod(formatLogEntryJSON(entry))
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error | unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
    stack: error instanceof Error ? error.stack : undefined,
  }
}

/**
 * Report error to Sentry (production only)
 */
function reportToSentry(
  error: Error | unknown,
  context?: LogContext,
  level: 'error' | 'warning' = 'error'
): void {
  if (!isProduction) return

  try {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        level: level === 'warning' ? 'warning' : 'error',
        tags: {
          route: context?.route,
          requestId: context?.requestId,
        },
        extra: context,
        user: context?.userId
          ? { id: context.userId, email: context.email }
          : undefined,
      })
    } else {
      Sentry.captureMessage(String(error), {
        level: level === 'warning' ? 'warning' : 'error',
        extra: { ...context, rawError: error },
      })
    }
  } catch (sentryError) {
    // Silently fail if Sentry reporting fails
    console.error('Failed to report to Sentry:', sentryError)
  }
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Debug level - only shown in development
   */
  debug: (message: string, context?: LogContext): void => {
    if (!isDevelopment) return
    const entry = createLogEntry('debug', message, context)
    outputLog(entry)
  },

  /**
   * Info level - general information
   */
  info: (message: string, context?: LogContext): void => {
    const entry = createLogEntry('info', message, context)
    outputLog(entry)
  },

  /**
   * Warning level - potential issues
   */
  warn: (message: string, context?: LogContext, error?: Error | unknown): void => {
    const entry = createLogEntry('warn', message, context, error)
    outputLog(entry)

    // Report warnings to Sentry if they include errors
    if (error) {
      reportToSentry(error, context, 'warning')
    }
  },

  /**
   * Error level - errors that need attention
   */
  error: (
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void => {
    const entry = createLogEntry('error', message, context, error)
    outputLog(entry)

    // Always report errors to Sentry in production
    if (error) {
      reportToSentry(error, context, 'error')
    } else {
      // If no error object, report the message as an error
      reportToSentry(new Error(message), context, 'error')
    }
  },

  /**
   * Create a child logger with preset context
   */
  child: (defaultContext: LogContext) => ({
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error | unknown) =>
      logger.warn(message, { ...defaultContext, ...context }, error),
    error: (message: string, error?: Error | unknown, context?: LogContext) =>
      logger.error(message, error, { ...defaultContext, ...context }),
  }),

  /**
   * Create a request-scoped logger with request ID
   */
  withRequest: (requestId: string, route?: string) => {
    return logger.child({ requestId, route })
  },

  /**
   * Log security-related events (always logged, always reported)
   */
  security: (message: string, context?: LogContext): void => {
    const entry = createLogEntry('warn', `[SECURITY] ${message}`, context)
    outputLog(entry)

    // Always report security events to Sentry
    reportToSentry(new Error(`Security Event: ${message}`), context, 'warning')
  },

  /**
   * Log performance metrics
   */
  perf: (operation: string, durationMs: number, context?: LogContext): void => {
    const entry = createLogEntry('info', `[PERF] ${operation}`, {
      ...context,
      durationMs,
    })
    outputLog(entry)

    // Report slow operations (> 5s) to Sentry
    if (durationMs > 5000) {
      reportToSentry(
        new Error(`Slow operation: ${operation} took ${durationMs}ms`),
        { ...context, durationMs },
        'warning'
      )
    }
  },
}

/**
 * Utility to measure operation duration
 */
export function measureDuration(
  operation: string,
  context?: LogContext
): () => void {
  const start = Date.now()

  return () => {
    const duration = Date.now() - start
    logger.perf(operation, duration, context)
  }
}

/**
 * Utility to wrap async functions with error logging
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  operation: string,
  context?: LogContext
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      logger.error(`${operation} failed`, error, context)
      throw error
    }
  }) as T
}

export default logger
