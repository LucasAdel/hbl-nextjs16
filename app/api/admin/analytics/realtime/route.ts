import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

/**
 * GET /api/admin/analytics/realtime
 *
 * Get currently active visitors (sessions active in last N minutes).
 * Query params:
 *   - minutes: number (default 5, max 30)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const minutes = Math.min(parseInt(searchParams.get("minutes") || "5"), 30);

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    const supabase = await createClient();

    // Get recent events grouped by session
    // Note: Using any to bypass type checking until types are regenerated
    const { data: recentEvents, error } = await (supabase as any)
      .from("analytics_events")
      .select("session_id, page_url, page_title, device_type, country_code, timestamp")
      .gte("timestamp", cutoffTime.toISOString())
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    // Aggregate by session
    const sessionMap = new Map<string, {
      session_id: string;
      current_page: string;
      current_page_title: string | null;
      device_type: string;
      country_code: string;
      pages_viewed: Set<string>;
      started_at: string;
      last_activity: string;
    }>();

    for (const event of recentEvents || []) {
      const existing = sessionMap.get(event.session_id);

      if (existing) {
        if (event.page_url) {
          existing.pages_viewed.add(event.page_url);
        }
        // Update current page to the most recent
        if (new Date(event.timestamp) > new Date(existing.last_activity)) {
          existing.current_page = event.page_url || existing.current_page;
          existing.current_page_title = event.page_title || existing.current_page_title;
          existing.last_activity = event.timestamp;
        }
        // Update started_at to the earliest
        if (new Date(event.timestamp) < new Date(existing.started_at)) {
          existing.started_at = event.timestamp;
        }
      } else {
        sessionMap.set(event.session_id, {
          session_id: event.session_id,
          current_page: event.page_url || "/",
          current_page_title: event.page_title,
          device_type: event.device_type || "unknown",
          country_code: event.country_code || "unknown",
          pages_viewed: new Set(event.page_url ? [event.page_url] : []),
          started_at: event.timestamp,
          last_activity: event.timestamp,
        });
      }
    }

    // Convert to array and sort by last activity
    const visitors = Array.from(sessionMap.values())
      .map((session) => ({
        session_id: session.session_id,
        current_page: session.current_page,
        current_page_title: session.current_page_title,
        device_type: session.device_type,
        country_code: session.country_code,
        pages_viewed: session.pages_viewed.size,
        started_at: session.started_at,
        last_activity: session.last_activity,
        duration_seconds: Math.round(
          (new Date(session.last_activity).getTime() - new Date(session.started_at).getTime()) / 1000
        ),
      }))
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
      .slice(0, 100); // Limit to 100 visitors

    // Get device breakdown
    const deviceCounts: Record<string, number> = {};
    for (const visitor of visitors) {
      deviceCounts[visitor.device_type] = (deviceCounts[visitor.device_type] || 0) + 1;
    }

    // Get country breakdown
    const countryCounts: Record<string, number> = {};
    for (const visitor of visitors) {
      countryCounts[visitor.country_code] = (countryCounts[visitor.country_code] || 0) + 1;
    }

    // Get page breakdown
    const pageCounts: Record<string, number> = {};
    for (const visitor of visitors) {
      pageCounts[visitor.current_page] = (pageCounts[visitor.current_page] || 0) + 1;
    }

    const response = NextResponse.json({
      success: true,
      data: {
        active_visitors: visitors.length,
        visitors,
        breakdown: {
          by_device: deviceCounts,
          by_country: countryCounts,
          by_page: pageCounts,
        },
        minutes,
        timestamp: new Date().toISOString(),
      },
    });

    // Short cache for real-time data (10 seconds)
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=10, stale-while-revalidate=5"
    );

    return response;
  } catch (error) {
    console.error("Realtime API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch realtime data" },
      { status: 500 }
    );
  }
}
