/**
 * Environment Variable Validation
 *
 * Centralised Zod schema for all environment variables.
 * Validates at import time - fails fast if required vars are missing.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const url = env.NEXT_PUBLIC_SUPABASE_URL;
 */

import { z } from "zod";

// Schema for server-side environment variables (secrets)
const serverSchema = z.object({
  // Supabase (Required)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // Email (Required for notifications)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  ADMIN_NOTIFICATION_EMAIL: z.string().email("ADMIN_NOTIFICATION_EMAIL must be a valid email").default("lw@hamiltonbailey.com"),

  // Stripe (Required for payments)
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Google OAuth (Optional - for calendar integration)
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // AI Providers (At least one recommended)
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),

  // Rate Limiting (Highly recommended)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Webhooks
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // Error Tracking
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // SMS (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Accounting (Optional)
  XERO_CLIENT_ID: z.string().optional(),
  XERO_CLIENT_SECRET: z.string().optional(),
  XERO_REDIRECT_URI: z.string().url().optional(),

  // Testing
  TEST_ADMIN_EMAIL: z.string().email().optional(),
  TEST_ADMIN_PASSWORD: z.string().optional(),
});

// Schema for public environment variables (exposed to client)
const publicSchema = z.object({
  // Supabase (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3016"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://hamiltonbailey.com"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_PRIMARY_CALENDAR_EMAIL: z.string().email().optional(),

  // Mapbox
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// Combined schema
const envSchema = serverSchema.merge(publicSchema);

// Type for validated environment
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Called once at module load time
 */
function validateEnv(): Env {
  // In edge runtime, only validate public vars
  const isEdge = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

  // Build the env object from process.env
  const envObj: Record<string, string | undefined> = {};

  // Add all env vars that match our schema
  const allKeys = [
    ...Object.keys(serverSchema.shape),
    ...Object.keys(publicSchema.shape),
  ];

  for (const key of allKeys) {
    envObj[key] = process.env[key];
  }

  // In development or test, be more lenient with optional vars
  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  // Parse with Zod
  const result = envSchema.safeParse(envObj);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
      .join("\n");

    // In production, fail hard on required vars
    if (!isDev && !isTest) {
      console.error("❌ Environment validation failed:\n" + errorMessages);
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }

    // In development, warn but continue
    console.warn("⚠️ Environment validation warnings:\n" + errorMessages);
  }

  return result.success ? result.data : (envObj as unknown as Env);
}

/**
 * Validated environment variables
 * Access like: env.NEXT_PUBLIC_SUPABASE_URL
 */
export const env = validateEnv();

/**
 * Check if a specific env var is configured
 */
export function hasEnvVar(key: keyof Env): boolean {
  return Boolean(env[key]);
}

/**
 * Get env var with fallback
 */
export function getEnvVar<K extends keyof Env>(
  key: K,
  fallback: NonNullable<Env[K]>
): NonNullable<Env[K]> {
  return (env[key] as NonNullable<Env[K]>) ?? fallback;
}

/**
 * Check if AI is configured (at least one provider)
 */
export function isAIConfigured(): boolean {
  return Boolean(
    env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY || env.GOOGLE_AI_API_KEY
  );
}

/**
 * Check if rate limiting is configured
 */
export function isRateLimitConfigured(): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

/**
 * Check if payments are configured
 */
export function isPaymentsConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}
