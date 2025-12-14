import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getRecentActivity,
  getUpcomingBookings,
} from "@/lib/db/admin-queries";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

export async function GET() {
  try {
    // SECURITY: Verify user has VIEW_DASHBOARD permission
    const auth = await requirePermission(PERMISSIONS.VIEW_DASHBOARD);
    if (!auth.authorized) {
      return auth.response;
    }

    // Fetch all dashboard data in parallel
    const [stats, recentActivity, upcomingBookings] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(10),
      getUpcomingBookings(5),
    ]);

    const response = NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity,
        upcomingBookings,
      },
    });

    // Add caching headers (30s cache, 60s stale-while-revalidate)
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
