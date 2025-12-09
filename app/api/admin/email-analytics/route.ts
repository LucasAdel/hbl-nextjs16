import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SequenceStats {
  sequenceType: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  pausedEnrollments: number;
}

interface EmailEventStats {
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper admin auth
    const authHeader = request.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET;

    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      // Allow in development
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const sequenceType = searchParams.get("sequenceType");

    // Get enrollment stats by sequence type
    const { data: enrollments } = await supabase
      .from("email_sequence_enrollments")
      .select("sequence_type, status");

    const sequenceStats: Record<string, SequenceStats> = {};

    if (enrollments) {
      for (const enrollment of enrollments) {
        const type = enrollment.sequence_type;
        if (!sequenceStats[type]) {
          sequenceStats[type] = {
            sequenceType: type,
            totalEnrollments: 0,
            activeEnrollments: 0,
            completedEnrollments: 0,
            cancelledEnrollments: 0,
            pausedEnrollments: 0,
          };
        }

        sequenceStats[type].totalEnrollments++;

        switch (enrollment.status) {
          case "active":
            sequenceStats[type].activeEnrollments++;
            break;
          case "completed":
            sequenceStats[type].completedEnrollments++;
            break;
          case "cancelled":
            sequenceStats[type].cancelledEnrollments++;
            break;
          case "paused":
            sequenceStats[type].pausedEnrollments++;
            break;
        }
      }
    }

    // Get email event stats
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let eventsQuery = supabase
      .from("email_sequence_events")
      .select("event_type, created_at")
      .gte("created_at", startDate.toISOString());

    if (sequenceType) {
      // Get enrollment IDs for this sequence type
      const { data: typeEnrollments } = await supabase
        .from("email_sequence_enrollments")
        .select("id")
        .eq("sequence_type", sequenceType as "welcome_series" | "post_consultation" | "post_purchase" | "booking_reminder" | "re_engagement" | "cart_abandonment");

      if (typeEnrollments && typeEnrollments.length > 0) {
        const enrollmentIds = typeEnrollments.map(e => e.id);
        eventsQuery = eventsQuery.in("enrollment_id", enrollmentIds);
      }
    }

    const { data: events } = await eventsQuery;

    const eventCounts: EmailEventStats = {
      sent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    };

    if (events) {
      for (const event of events) {
        switch (event.event_type) {
          case "sent":
            eventCounts.sent++;
            break;
          case "opened":
            eventCounts.opened++;
            break;
          case "clicked":
            eventCounts.clicked++;
            break;
          case "bounced":
            eventCounts.bounced++;
            break;
          case "unsubscribed":
            eventCounts.unsubscribed++;
            break;
        }
      }

      // Calculate rates
      if (eventCounts.sent > 0) {
        eventCounts.openRate = Math.round((eventCounts.opened / eventCounts.sent) * 100);
        eventCounts.clickRate = Math.round((eventCounts.clicked / eventCounts.sent) * 100);
        eventCounts.bounceRate = Math.round((eventCounts.bounced / eventCounts.sent) * 100);
      }
    }

    // Get daily stats for chart
    const dailyStats: DailyStats[] = [];
    const dailyMap = new Map<string, DailyStats>();

    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyMap.set(dateStr, {
        date: dateStr,
        sent: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      });
    }

    // Fill in actual data
    if (events) {
      for (const event of events) {
        const dateStr = event.created_at.split("T")[0];
        const dayStats = dailyMap.get(dateStr);
        if (dayStats) {
          switch (event.event_type) {
            case "sent":
              dayStats.sent++;
              break;
            case "opened":
              dayStats.opened++;
              break;
            case "clicked":
              dayStats.clicked++;
              break;
            case "bounced":
              dayStats.bounced++;
              break;
          }
        }
      }
    }

    dailyMap.forEach((value) => dailyStats.push(value));

    // Get recent enrollments for the table
    const { data: recentEnrollments } = await supabase
      .from("email_sequence_enrollments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      sequenceStats: Object.values(sequenceStats),
      eventStats: eventCounts,
      dailyStats,
      recentEnrollments: recentEnrollments || [],
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Email analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// Pause/Resume enrollment
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { enrollmentId, action } = body;

    if (!enrollmentId || !["pause", "resume", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const newStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled";

    const { error } = await supabase
      .from("email_sequence_enrollments")
      .update({ status: newStatus })
      .eq("id", enrollmentId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("Enrollment update error:", error);
    return NextResponse.json(
      { error: "Failed to update enrollment" },
      { status: 500 }
    );
  }
}
