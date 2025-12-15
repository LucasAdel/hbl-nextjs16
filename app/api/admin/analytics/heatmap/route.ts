import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

/**
 * GET /api/admin/analytics/heatmap
 *
 * Get heatmap click data for a specific page.
 * Query params:
 *   - page: string (required) - URL path to get heatmap for
 *   - days: number (default 7) - Number of days of data
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const pageUrl = searchParams.get("page");
    const days = Math.min(parseInt(searchParams.get("days") || "7"), 90);

    if (!pageUrl) {
      return NextResponse.json(
        { error: "Page URL is required" },
        { status: 400 }
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const supabase = await createClient();

    // Fetch click events with position data for the specified page
    // Note: Table columns will be available after running migration and regenerating types
    const { data: clickEvents, error } = await (supabase as any)
      .from("analytics_events")
      .select("click_x, click_y, viewport_width, viewport_height, element_selector, element_text, session_id")
      .eq("event_name", "click")
      .like("page_url", `${pageUrl}%`)
      .gte("timestamp", startDate.toISOString())
      .not("click_x", "is", null)
      .not("click_y", "is", null)
      .limit(2000);

    if (error) {
      throw error;
    }

    // Aggregate clicks by position (rounded to 10px grid for grouping)
    const clickMap = new Map<string, {
      x: number;
      y: number;
      count: number;
      elements: Map<string, number>;
    }>();

    const uniqueSessions = new Set<string>();
    let totalClicks = 0;
    let avgViewportWidth = 0;

    for (const event of clickEvents || []) {
      if (event.click_x === null || event.click_y === null) continue;

      uniqueSessions.add(event.session_id);
      totalClicks++;

      if (event.viewport_width) {
        avgViewportWidth += event.viewport_width;
      }

      // Round to 10px grid for aggregation
      const gridX = Math.round(event.click_x / 10) * 10;
      const gridY = Math.round(event.click_y / 10) * 10;
      const key = `${gridX},${gridY}`;

      const existing = clickMap.get(key);
      if (existing) {
        existing.count++;
        if (event.element_selector) {
          existing.elements.set(
            event.element_selector,
            (existing.elements.get(event.element_selector) || 0) + 1
          );
        }
      } else {
        const elements = new Map<string, number>();
        if (event.element_selector) {
          elements.set(event.element_selector, 1);
        }
        clickMap.set(key, {
          x: gridX,
          y: gridY,
          count: 1,
          elements,
        });
      }
    }

    // Convert to array and sort by count
    const clicks = Array.from(clickMap.values())
      .map((item) => {
        // Get the most common element selector for this position
        let topElement: string | undefined;
        let topCount = 0;
        for (const [selector, count] of item.elements) {
          if (count > topCount) {
            topCount = count;
            topElement = selector;
          }
        }

        return {
          x: item.x,
          y: item.y,
          count: item.count,
          element_selector: topElement,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 1000); // Limit to 1000 data points

    return NextResponse.json({
      success: true,
      data: {
        page_url: pageUrl,
        viewport_width: totalClicks > 0 ? Math.round(avgViewportWidth / totalClicks) : 1920,
        clicks,
        total_clicks: totalClicks,
        unique_sessions: uniqueSessions.size,
        days,
      },
    });
  } catch (error) {
    console.error("Heatmap API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}
