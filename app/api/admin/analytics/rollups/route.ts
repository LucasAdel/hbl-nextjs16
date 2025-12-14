import { NextRequest, NextResponse } from "next/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";
import type { Json } from "@/lib/supabase/types";
import {
  getDashboardMetrics,
  getEventsByDateRange,
  getXPEconomyTrend,
  getConversionFunnelTrend,
  getTopFeatures,
  getCohortRetentionMatrix,
  getXPEconomySummary,
} from "@/lib/db/analytics-rollups";
import {
  runDailyAggregation,
  backfillAggregations,
} from "@/lib/analytics/aggregation-job";

// GET /api/admin/analytics/rollups - Get pre-aggregated analytics data
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify user has VIEW_ANALYTICS permission
    const authResult = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view") || "dashboard";
    const days = parseInt(searchParams.get("days") || "30", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category") || undefined;

    switch (view) {
      case "dashboard": {
        // Return all dashboard metrics in one call (5 min cache)
        const metrics = await getDashboardMetrics(days);
        return cachedResponse({
          success: true,
          view: "dashboard",
          data: metrics,
        });
      }

      case "events": {
        // Return event data (5 min cache)
        const start = startDate || getDateNDaysAgo(days);
        const end = endDate || getTodayDate();
        const events = await getEventsByDateRange(start, end, category);
        return cachedResponse({
          success: true,
          view: "events",
          dateRange: { start, end },
          data: events,
        });
      }

      case "xp-economy": {
        // Return XP economy trends and summary (5 min cache)
        const trend = await getXPEconomyTrend(days);
        const start = startDate || getDateNDaysAgo(days);
        const end = endDate || getTodayDate();
        const summary = await getXPEconomySummary(start, end);
        return cachedResponse({
          success: true,
          view: "xp-economy",
          data: {
            trend,
            summary,
          },
        });
      }

      case "funnel": {
        // Return conversion funnel data (5 min cache)
        const funnel = await getConversionFunnelTrend(days);
        return cachedResponse({
          success: true,
          view: "funnel",
          data: funnel,
        });
      }

      case "features": {
        // Return feature engagement data (5 min cache)
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const features = await getTopFeatures(days, limit);
        return cachedResponse({
          success: true,
          view: "features",
          data: features,
        });
      }

      case "cohorts": {
        // Return cohort retention matrix (5 min cache)
        const weeks = parseInt(searchParams.get("weeks") || "12", 10);
        const cohorts = await getCohortRetentionMatrix(weeks);
        return cachedResponse({
          success: true,
          view: "cohorts",
          data: cohorts,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown view: ${view}. Valid: dashboard, events, xp-economy, funnel, features, cohorts` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics rollups API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/analytics/rollups - Trigger aggregation job
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify user has VIEW_ANALYTICS permission (for triggering aggregation)
    const authResult = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json().catch(() => ({}));
    const { action, date, startDate, endDate } = body;

    switch (action) {
      case "aggregate": {
        // Run aggregation for a specific date (or yesterday)
        const result = await runDailyAggregation(date);
        return NextResponse.json({
          success: result.success,
          action: "aggregate",
          result,
        });
      }

      case "backfill": {
        // Backfill a date range
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: "startDate and endDate required for backfill" },
            { status: 400 }
          );
        }
        const result = await backfillAggregations(startDate, endDate);
        return NextResponse.json({
          success: result.failed === 0,
          action: "backfill",
          result,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid: aggregate, backfill` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Analytics rollups trigger error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper functions
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

/**
 * Create a cached JSON response
 * Analytics data can be cached for 5 minutes with stale-while-revalidate
 */
function cachedResponse(data: Record<string, unknown>, cacheDuration = 300): NextResponse {
  const response = NextResponse.json(data);
  response.headers.set(
    "Cache-Control",
    `private, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`
  );
  return response;
}
