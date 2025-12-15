import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, PERMISSIONS } from "@/lib/auth/admin-auth";

// Type definitions for session timeline (match database schema)
interface TimelineEvent {
  id: string;
  timestamp: string;
  event_name: string | null;
  event_category: string | null;
  page_url: string | null;
  page_title: string | null;
  properties: unknown;
  click_x: number | null;
  click_y: number | null;
  element_selector: string | null;
  element_text: string | null;
}

interface PageGroup {
  page_url: string;
  page_title: string | null;
  events: TimelineEvent[];
  duration_seconds: number;
}

interface AnalyticsEvent {
  id: string;
  timestamp: string;
  event_name: string;
  event_category: string;
  page_url: string | null;
  page_title: string | null;
  properties: Record<string, unknown> | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country_code: string | null;
  city: string | null;
  referrer: string | null;
  click_x: number | null;
  click_y: number | null;
  element_selector: string | null;
  element_text: string | null;
}

interface SessionSummary {
  summary: string;
  key_actions: string[];
  conversion_intent: string;
  generated_at: string;
}

/**
 * GET /api/admin/analytics/sessions/[sessionId]
 *
 * Get detailed session data including timeline and summary (if exists).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Verify admin permissions
    const auth = await requirePermission(PERMISSIONS.VIEW_ANALYTICS);
    if (!auth.authorized) {
      return auth.response;
    }

    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch all events for this session
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (eventsError) {
      throw eventsError;
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Fetch existing summary if available
    const { data: summaryData } = await supabase
      .from("analytics_session_summaries")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    // Calculate session statistics
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const uniquePages = new Set(events.map((e) => e.page_url).filter(Boolean));

    const conversionEvents = events.filter((e) =>
      e.event_name && ["booking_confirmed", "contact_submitted", "purchase_complete", "checkout_complete"].includes(
        e.event_name
      )
    );

    const stats = {
      duration_seconds: Math.round(
        (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000
      ),
      pages_visited: uniquePages.size,
      event_count: events.length,
      device_type: firstEvent.device_type || "unknown",
      browser: firstEvent.browser || "unknown",
      os: firstEvent.os || "unknown",
      country_code: firstEvent.country_code || "unknown",
      city: firstEvent.city || "unknown",
      referrer: firstEvent.referrer,
      has_conversion: conversionEvents.length > 0,
      conversion_types: conversionEvents.map((e) => e.event_name),
    };

    // Build timeline grouped by page
    const timeline: TimelineEvent[] = events.map((event) => ({
      id: event.id,
      timestamp: event.timestamp,
      event_name: event.event_name,
      event_category: event.event_category,
      page_url: event.page_url,
      page_title: event.page_title,
      properties: event.properties,
      click_x: event.click_x,
      click_y: event.click_y,
      element_selector: event.element_selector,
      element_text: event.element_text,
    }));

    // Group timeline by page for easier visualization
    const pageGroups: PageGroup[] = [];

    let currentPage: PageGroup | null = null;
    let currentPageUrl: string | null = null;

    for (const event of timeline) {
      const eventPageUrl = event.page_url;
      if (eventPageUrl !== currentPageUrl) {
        if (currentPage) {
          pageGroups.push(currentPage);
        }
        currentPageUrl = eventPageUrl;
        currentPage = {
          page_url: eventPageUrl || "unknown",
          page_title: event.page_title,
          events: [event],
          duration_seconds: 0,
        };
      } else if (currentPage) {
        currentPage.events.push(event);
      }
    }
    if (currentPage) {
      pageGroups.push(currentPage);
    }

    // Calculate duration for each page group
    for (let i = 0; i < pageGroups.length; i++) {
      const group = pageGroups[i];
      const nextGroup = pageGroups[i + 1];
      if (group.events.length > 0) {
        const firstEventTime = new Date(group.events[0].timestamp).getTime();
        const lastEventTime = nextGroup
          ? new Date(nextGroup.events[0].timestamp).getTime()
          : new Date(lastEvent.timestamp).getTime();
        group.duration_seconds = Math.round((lastEventTime - firstEventTime) / 1000);
      }
    }

    const response = {
      session_id: sessionId,
      stats,
      summary: summaryData
        ? {
            text: summaryData.summary,
            key_actions: summaryData.key_actions,
            conversion_intent: summaryData.conversion_intent,
            generated_at: summaryData.generated_at,
          }
        : null,
      timeline,
      page_groups: pageGroups,
      first_event: firstEvent.timestamp,
      last_event: lastEvent.timestamp,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Session detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session details" },
      { status: 500 }
    );
  }
}
