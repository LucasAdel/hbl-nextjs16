/**
 * Rate Limiter with Upstash Redis
 * Uses Upstash for distributed rate limiting in production
 * Falls back to in-memory for development
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// In-memory fallback for development
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const inMemoryStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (for in-memory fallback)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of inMemoryStore.entries()) {
      if (entry.resetTime < now) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000);
}

// Check if Upstash is configured
const hasUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Initialize Upstash Redis if configured
let redis: Redis | null = null;
let upstashLimiters: Map<string, Ratelimit> | null = null;

if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  upstashLimiters = new Map();
}

/**
 * Get or create an Upstash rate limiter for a specific config
 */
function getUpstashLimiter(config: RateLimitConfig): Ratelimit {
  if (!redis || !upstashLimiters) {
    throw new Error("Upstash not initialized");
  }

  const key = `${config.windowMs}-${config.maxRequests}`;

  if (!upstashLimiters.has(key)) {
    // Convert windowMs to seconds for Upstash
    const windowSec = Math.ceil(config.windowMs / 1000);

    upstashLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSec} s`),
        analytics: false, // IMPORTANT: true doubles Redis commands, hits free tier limit
        prefix: "hbl-ratelimit",
      })
    );
  }

  return upstashLimiters.get(key)!;
}

/**
 * In-memory rate limit check (fallback for development)
 */
function checkInMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const existing = inMemoryStore.get(identifier);

  if (!existing || existing.resetTime < now) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  existing.count++;

  if (existing.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: existing.resetTime - now,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetIn: existing.resetTime - now,
  };
}

/**
 * Check if a request should be rate limited
 * Uses Upstash in production, in-memory in development
 */
export async function checkRateLimitAsync(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): Promise<RateLimitResult> {
  // Use Upstash if available
  if (hasUpstash && redis) {
    try {
      const limiter = getUpstashLimiter(config);
      const result = await limiter.limit(identifier);

      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn: result.reset - Date.now(),
      };
    } catch (error) {
      console.error("Upstash rate limit error, falling back to in-memory:", error);
      // Fall through to in-memory
    }
  }

  // Fallback to in-memory
  return checkInMemoryRateLimit(identifier, config);
}

/**
 * Synchronous rate limit check (for backwards compatibility)
 * Only uses in-memory store
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): RateLimitResult {
  // Log warning if Upstash is configured but sync function is used
  if (hasUpstash && process.env.NODE_ENV === "development") {
    console.warn(
      "Using synchronous checkRateLimit with Upstash configured. " +
      "Consider using checkRateLimitAsync for distributed rate limiting."
    );
  }

  return checkInMemoryRateLimit(identifier, config);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua-${hashString(userAgent)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Rate limit configurations for different routes
 */
export const RATE_LIMITS = {
  contact: { windowMs: 60000, maxRequests: 5 },
  booking: { windowMs: 60000, maxRequests: 10 },
  payment: { windowMs: 60000, maxRequests: 20 },
  general: { windowMs: 60000, maxRequests: 100 },
  newsletter: { windowMs: 60000, maxRequests: 3 },
  clientPortal: { windowMs: 60000, maxRequests: 30 },
  cartAbandon: { windowMs: 60000, maxRequests: 10 },
  chat: { windowMs: 60000, maxRequests: 30 },
  webhook: { windowMs: 60000, maxRequests: 100 },
};

/**
 * Higher-order function to wrap API handlers with async rate limiting
 */
export function withRateLimitAsync<T>(
  handler: (request: Request) => Promise<T>,
  config: RateLimitConfig = RATE_LIMITS.general,
  routeKey?: string
) {
  return async (request: Request): Promise<T | Response> => {
    const identifier = routeKey
      ? `${routeKey}-${getClientIdentifier(request)}`
      : getClientIdentifier(request);

    const { allowed, remaining, resetIn } = await checkRateLimitAsync(identifier, config);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Please wait before making another request",
          retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
          },
        }
      );
    }

    const response = await handler(request);

    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Remaining", String(remaining));
      headers.set("X-RateLimit-Reset", String(Math.ceil(resetIn / 1000)));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      }) as unknown as T;
    }

    return response;
  };
}

/**
 * Synchronous wrapper (backwards compatibility)
 */
export function withRateLimit<T>(
  handler: (request: Request) => Promise<T>,
  config: RateLimitConfig = RATE_LIMITS.general,
  routeKey?: string
) {
  return async (request: Request): Promise<T | Response> => {
    const identifier = routeKey
      ? `${routeKey}-${getClientIdentifier(request)}`
      : getClientIdentifier(request);

    const { allowed, remaining, resetIn } = checkRateLimit(identifier, config);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Please wait before making another request",
          retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(resetIn / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
          },
        }
      );
    }

    const response = await handler(request);

    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Remaining", String(remaining));
      headers.set("X-RateLimit-Reset", String(Math.ceil(resetIn / 1000)));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      }) as unknown as T;
    }

    return response;
  };
}

/**
 * Check if Upstash is properly configured
 */
export function isDistributedRateLimitingEnabled(): boolean {
  return hasUpstash;
}
