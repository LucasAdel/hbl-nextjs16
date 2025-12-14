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
import { createServiceRoleClient } from "@/lib/supabase/server";

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
    const supabase = createServiceRoleClient();
    // Simple query to verify database connectivity
    const { error } = await supabase
      .from("contacts")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Health check DB error:", error.message, error.code);
      return {
        status: "fail",
        latencyMs: Date.now() - start,
        message: `Database query failed: ${error.code}`,
      };
    }

    return {
      status: "pass",
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      status: "fail",
      latencyMs: Date.now() - start,
      message: "Database connection failed",
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
