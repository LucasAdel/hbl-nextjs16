import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface TimelineEvent {
  event_type: string;
  description?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matterId = searchParams.get("matterId");
    const email = searchParams.get("email");

    if (!matterId || !email) {
      return NextResponse.json(
        { error: "Matter ID and email required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get timeline events
    const { data: events, error } = await supabase
      .from("case_timeline_events")
      .select("*")
      .eq("matter_id", matterId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching timeline:", error);
      return NextResponse.json(
        { error: "Failed to fetch timeline" },
        { status: 500 }
      );
    }

    // Get current status from the most recent status_change event
    const statusEvents = ((events as TimelineEvent[]) || []).filter(
      (e) => e.event_type === "status_change"
    );
    // Use description field to store status, or default to "active"
    const currentStatus =
      statusEvents.length > 0
        ? statusEvents[0].description || "active"
        : "active";

    return NextResponse.json({
      events: events || [],
      currentStatus,
    });
  } catch (error) {
    console.error("Timeline fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matterId, eventType, title, description, metadata, createdBy } = body;

    if (!matterId || !eventType || !title) {
      return NextResponse.json(
        { error: "Matter ID, event type, and title required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from("case_timeline_events")
      .insert({
        matter_id: matterId,
        event_type: eventType,
        title,
        description: description || null,
        event_date: new Date().toISOString(),
        created_by: createdBy || "System",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating timeline event:", error);
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Timeline event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
