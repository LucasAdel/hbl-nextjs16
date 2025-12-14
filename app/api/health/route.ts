/**
 * Health Check Endpoint
 *
 * Provides system status information for monitoring and alerting.
 * Used by uptime monitors, load balancers, and deployment systems.
 *
 * GET /api/health
 * - Returns 200 if healthy, 503 if unhealthy
 * - Does NOT expose sensitive information
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
  };
}

interface CheckResult {
  status: "pass" | "fail" | "skip";
  latencyMs?: number;
  message?: string;
}

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    // Just verify Supabase URL is configured and reachable
    // The actual DB queries work (homepage loads), this is just a connectivity check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return {
        status: "fail",
        latencyMs: Date.now() - start,
        message: "Missing Supabase configuration",
      };
    }

    // Ping the Supabase REST endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      return {
        status: "fail",
        latencyMs: Date.now() - start,
        message: `Supabase unreachable: ${response.status}`,
      };
    }

    return {
      status: "pass",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      message: `Database connection failed: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

async function checkRedis(): Promise<CheckResult> {
  // Check if Redis is configured
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return {
      status: "skip",
      message: "Redis not configured",
    };
  }

  const start = Date.now();
  try {
    // Dynamic import to avoid loading Redis when not configured
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Simple ping to verify connectivity
    await redis.ping();

    return {
      status: "pass",
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      message: "Redis connection failed",
    };
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);

  // Determine overall status
  const hasCriticalFailure = database.status === "fail";
  const hasDegradation = redis.status === "fail";

  let status: HealthStatus["status"] = "healthy";
  if (hasCriticalFailure) {
    status = "unhealthy";
  } else if (hasDegradation) {
    status = "degraded";
  }

  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    checks: {
      database,
      redis,
    },
  };

  // Return 503 Service Unavailable if unhealthy
  const httpStatus = status === "unhealthy" ? 503 : 200;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
