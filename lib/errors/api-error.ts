/**
 * Standardized API Error Handling
 *
 * Provides consistent error response format across all API routes.
 * Ensures security by hiding internal details from clients while
 * preserving full context for logging.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Error codes for API responses
 */
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  STRIPE_ERROR: 'STRIPE_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CALENDAR_ERROR: 'CALENDAR_ERROR',

  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Error response structure
 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: unknown // Only included in development
  }
  requestId?: string
}

/**
 * Error code to HTTP status mapping
 */
const errorStatusMap: Record<ErrorCode, number> = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  SESSION_EXPIRED: 401,
  INVALID_TOKEN: 401,
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  MISSING_FIELD: 400,
  RATE_LIMIT_EXCEEDED: 429,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  EXTERNAL_SERVICE_ERROR: 502,
  STRIPE_ERROR: 502,
  EMAIL_ERROR: 502,
  DATABASE_ERROR: 500,
  CALENDAR_ERROR: 502,
  INTERNAL_ERROR: 500,
  BAD_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
}

/**
 * User-friendly error messages
 */
const errorMessages: Record<ErrorCode, string> = {
  AUTH_REQUIRED: 'Authentication is required to access this resource.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_TOKEN: 'Invalid or expired token.',
  VALIDATION_ERROR: 'The provided data is invalid.',
  INVALID_INPUT: 'Invalid input provided.',
  MISSING_FIELD: 'Required field is missing.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This resource already exists.',
  CONFLICT: 'The request conflicts with the current state.',
  EXTERNAL_SERVICE_ERROR: 'An external service is temporarily unavailable.',
  STRIPE_ERROR: 'Payment processing failed. Please try again.',
  EMAIL_ERROR: 'Unable to send email. Please try again later.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  CALENDAR_ERROR: 'Calendar operation failed. Please try again.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
  BAD_REQUEST: 'Invalid request.',
  METHOD_NOT_ALLOWED: 'This method is not allowed.',
}

interface ApiErrorOptions {
  code: ErrorCode
  message?: string // Override default message
  details?: unknown // Additional details (dev only)
  originalError?: Error | unknown // Original error for logging
  context?: Record<string, unknown> // Logging context
  requestId?: string
  route?: string
}

/**
 * Create a standardized API error response
 */
export function apiError(options: ApiErrorOptions): NextResponse<ApiErrorResponse> {
  const {
    code,
    message,
    details,
    originalError,
    context,
    requestId,
    route,
  } = options

  const status = errorStatusMap[code] || 500
  const userMessage = message || errorMessages[code] || 'An error occurred.'

  // Log the error with full context
  logger.error(
    `API Error: ${code} - ${userMessage}`,
    originalError,
    {
      route,
      requestId,
      errorCode: code,
      statusCode: status,
      ...context,
    }
  )

  // Build response
  const response: ApiErrorResponse = {
    error: {
      code,
      message: userMessage,
    },
  }

  // Include details only in development
  if (process.env.NODE_ENV === 'development' && details) {
    response.error.details = details
  }

  // Include request ID if available
  if (requestId) {
    response.requestId = requestId
  }

  // Create response with appropriate headers
  const nextResponse = NextResponse.json(response, { status })

  // Add Retry-After header for rate limiting
  if (code === ErrorCodes.RATE_LIMIT_EXCEEDED) {
    nextResponse.headers.set('Retry-After', '60')
  }

  return nextResponse
}

/**
 * Shorthand error creators
 */
export const errors = {
  unauthorized: (options?: Partial<ApiErrorOptions>) =>
    apiError({ code: ErrorCodes.AUTH_REQUIRED, ...options }),

  forbidden: (options?: Partial<ApiErrorOptions>) =>
    apiError({ code: ErrorCodes.FORBIDDEN, ...options }),

  notFound: (resource?: string, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.NOT_FOUND,
      message: resource ? `${resource} not found.` : undefined,
      ...options,
    }),

  validation: (message: string, details?: unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.VALIDATION_ERROR,
      message,
      details,
      ...options,
    }),

  rateLimit: (options?: Partial<ApiErrorOptions>) =>
    apiError({ code: ErrorCodes.RATE_LIMIT_EXCEEDED, ...options }),

  internal: (error?: Error | unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.INTERNAL_ERROR,
      originalError: error,
      ...options,
    }),

  badRequest: (message?: string, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.BAD_REQUEST,
      message,
      ...options,
    }),

  stripe: (error?: Error | unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.STRIPE_ERROR,
      originalError: error,
      ...options,
    }),

  email: (error?: Error | unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.EMAIL_ERROR,
      originalError: error,
      ...options,
    }),

  database: (error?: Error | unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.DATABASE_ERROR,
      originalError: error,
      ...options,
    }),

  external: (service: string, error?: Error | unknown, options?: Partial<ApiErrorOptions>) =>
    apiError({
      code: ErrorCodes.EXTERNAL_SERVICE_ERROR,
      message: `${service} is temporarily unavailable.`,
      originalError: error,
      ...options,
    }),
}

/**
 * Wrap an API handler with standardized error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>,
  route: string,
  requestId?: string
): Promise<NextResponse<T | ApiErrorResponse>> {
  return handler().catch((error) => {
    return errors.internal(error, { route, requestId })
  })
}

/**
 * Type guard to check if an error is an API error response
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'object' &&
    'code' in (response as ApiErrorResponse).error
  )
}

export default errors
