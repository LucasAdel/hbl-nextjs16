import { NextResponse } from "next/server";
import {
  getDashboardStats,
  getRecentActivity,
  getUpcomingBookings,
} from "@/lib/db/admin-queries";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role || "client";
    if (userRole !== "admin" && userRole !== "staff") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all dashboard data in parallel
    const [stats, recentActivity, upcomingBookings] = await Promise.all([
      getDashboardStats(),
      getRecentActivity(10),
      getUpcomingBookings(5),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity,
        upcomingBookings,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
