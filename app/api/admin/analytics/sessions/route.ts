import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

/**
 * GET /api/admin/analytics/sessions
 *
 * List analytics sessions with filtering and pagination.
 * Query params:
 *   - days: number (default 7)
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - device: string (filter by device type)
 *   - hasConversion: boolean (filter to only sessions with conversions)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const days = Math.min(parseInt(searchParams.get("days") || "7"), 90);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100);
    const deviceFilter = searchParams.get("device");
    const hasConversionFilter = searchParams.get("hasConversion");

    const offset = (page - 1) * limit;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const supabase = await createClient();

    // Build the query to aggregate sessions
    // Using a raw query for complex aggregation (RPC may not exist yet)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessions, error } = await (supabase as any).rpc("get_session_list", {
      p_start_date: startDate.toISOString(),
      p_limit: limit,
      p_offset: offset,
      p_device_filter: deviceFilter || null,
      p_has_conversion: hasConversionFilter === "true" ? true : hasConversionFilter === "false" ? false : null,
    });

    if (error) {
      // Fallback to a simpler query if the RPC doesn't exist
      console.warn("RPC not available, using fallback query:", error.message);

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("analytics_events")
        .select("session_id, device_type, country_code, timestamp, event_name")
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (fallbackError) {
        throw fallbackError;
      }

      // Aggregate sessions from raw events
      const sessionMap = new Map<string, {
        session_id: string;
        first_event: string;
        last_event: string;
        event_count: number;
        pages: Set<string>;
        device_type: string;
        country_code: string;
        has_conversion: boolean;
      }>();

      const conversionEvents = new Set([
        "booking_confirmed",
        "contact_submitted",
        "purchase_complete",
        "checkout_complete",
      ]);

      for (const event of fallbackData || []) {
        // Skip events without session_id
        if (!event.session_id) continue;

        const existing = sessionMap.get(event.session_id);
        if (existing) {
          existing.event_count++;
          if (new Date(event.timestamp) < new Date(existing.first_event)) {
            existing.first_event = event.timestamp;
          }
          if (new Date(event.timestamp) > new Date(existing.last_event)) {
            existing.last_event = event.timestamp;
          }
          if (event.event_name && conversionEvents.has(event.event_name)) {
            existing.has_conversion = true;
          }
        } else {
          sessionMap.set(event.session_id, {
            session_id: event.session_id,
            first_event: event.timestamp,
            last_event: event.timestamp,
            event_count: 1,
            pages: new Set(),
            device_type: event.device_type || "unknown",
            country_code: event.country_code || "unknown",
            has_conversion: event.event_name ? conversionEvents.has(event.event_name) : false,
          });
        }
      }

      // Convert to array and apply filters
      let sessionList = Array.from(sessionMap.values())
        .map((s) => ({
          session_id: s.session_id,
          first_event: s.first_event,
          last_event: s.last_event,
          duration_seconds: Math.round(
            (new Date(s.last_event).getTime() - new Date(s.first_event).getTime()) / 1000
          ),
          page_count: s.pages.size || 1,
          event_count: s.event_count,
          device_type: s.device_type,
          country_code: s.country_code,
          has_conversion: s.has_conversion,
          has_summary: false, // Will check separately
        }))
        .sort((a, b) => new Date(b.last_event).getTime() - new Date(a.last_event).getTime());

      // Apply filters
      if (deviceFilter) {
        sessionList = sessionList.filter((s) => s.device_type === deviceFilter);
      }
      if (hasConversionFilter === "true") {
        sessionList = sessionList.filter((s) => s.has_conversion);
      } else if (hasConversionFilter === "false") {
        sessionList = sessionList.filter((s) => !s.has_conversion);
      }

      // Paginate
      const paginatedSessions = sessionList.slice(offset, offset + limit);

      // Check which sessions have summaries
      const sessionIds = paginatedSessions.map((s) => s.session_id);
      const { data: summaryData } = await supabase
        .from("analytics_session_summaries")
        .select("session_id")
        .in("session_id", sessionIds);

      const summarySet = new Set((summaryData || []).map((s) => s.session_id));
      for (const session of paginatedSessions) {
        session.has_summary = summarySet.has(session.session_id);
      }

      return NextResponse.json({
        success: true,
        data: {
          sessions: paginatedSessions,
          pagination: {
            page,
            limit,
            total: sessionList.length,
            totalPages: Math.ceil(sessionList.length / limit),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions || [],
        pagination: {
          page,
          limit,
          total: sessions?.length || 0,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
