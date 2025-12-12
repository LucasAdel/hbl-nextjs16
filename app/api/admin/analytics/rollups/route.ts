import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin-auth";
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
    // SECURITY: Verify admin authentication using role-based check
    const authResult = await requireAdminAuth();
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
        // Return all dashboard metrics in one call
        const metrics = await getDashboardMetrics(days);
        return NextResponse.json({
          success: true,
          view: "dashboard",
          data: metrics,
        });
      }

      case "events": {
        // Return event data
        const start = startDate || getDateNDaysAgo(days);
        const end = endDate || getTodayDate();
        const events = await getEventsByDateRange(start, end, category);
        return NextResponse.json({
          success: true,
          view: "events",
          dateRange: { start, end },
          data: events,
        });
      }

      case "xp-economy": {
        // Return XP economy trends and summary
        const trend = await getXPEconomyTrend(days);
        const start = startDate || getDateNDaysAgo(days);
        const end = endDate || getTodayDate();
        const summary = await getXPEconomySummary(start, end);
        return NextResponse.json({
          success: true,
          view: "xp-economy",
          data: {
            trend,
            summary,
          },
        });
      }

      case "funnel": {
        // Return conversion funnel data
        const funnel = await getConversionFunnelTrend(days);
        return NextResponse.json({
          success: true,
          view: "funnel",
          data: funnel,
        });
      }

      case "features": {
        // Return feature engagement data
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const features = await getTopFeatures(days, limit);
        return NextResponse.json({
          success: true,
          view: "features",
          data: features,
        });
      }

      case "cohorts": {
        // Return cohort retention matrix
        const weeks = parseInt(searchParams.get("weeks") || "12", 10);
        const cohorts = await getCohortRetentionMatrix(weeks);
        return NextResponse.json({
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
    // SECURITY: Verify admin authentication using role-based check
    const authResult = await requireAdminAuth();
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
