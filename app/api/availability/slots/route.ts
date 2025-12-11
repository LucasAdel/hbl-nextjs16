import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /api/availability/slots
 *
 * Returns available booking slots grouped by date.
 * Only returns slots that are:
 * - is_available = true
 * - Not blocked by calendar
 * - Not blocked by booking
 * - On or after today
 *
 * Query params:
 * - startDate: YYYY-MM-DD (default: today)
 * - endDate: YYYY-MM-DD (default: today + 14 days)
 */

interface AvailabilitySlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

interface SlotsByDate {
  [date: string]: AvailabilitySlot[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse date parameters
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(today.getDate() + 14);

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam)
      : today;

    const endDate = endDateParam
      ? new Date(endDateParam)
      : defaultEndDate;

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Ensure startDate is not before today
    if (startDate < today) {
      startDate.setTime(today.getTime());
    }

    // Create Supabase client with service role for full access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    // Fetch available slots
    const { data: slots, error } = await supabase
      .from("availability_slots")
      .select("id, slot_date, start_time, end_time, duration_minutes, is_available")
      .eq("is_available", true)
      .eq("blocked_by_calendar", false)
      .eq("blocked_by_booking", false)
      .gte("slot_date", startDate.toISOString().split("T")[0])
      .lte("slot_date", endDate.toISOString().split("T")[0])
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching availability slots:", error);
      return NextResponse.json(
        { error: "Failed to fetch availability slots" },
        { status: 500 }
      );
    }

    // Group slots by date
    const slotsByDate: SlotsByDate = {};

    for (const slot of slots || []) {
      const date = slot.slot_date;
      if (!slotsByDate[date]) {
        slotsByDate[date] = [];
      }
      slotsByDate[date].push({
        id: slot.id,
        slot_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration_minutes: slot.duration_minutes,
        is_available: slot.is_available,
      });
    }

    // Calculate total slots
    const totalSlots = slots?.length || 0;

    // Get sync health status
    const { data: syncState } = await supabase
      .from("calendar_sync_state")
      .select("last_sync_at, is_healthy")
      .eq("calendar_email", "lw@hamiltonbailey.com")
      .single();

    return NextResponse.json({
      success: true,
      slots: slotsByDate,
      totalSlots,
      dateRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      syncStatus: syncState ? {
        lastSync: syncState.last_sync_at,
        isHealthy: syncState.is_healthy,
      } : null,
    });
  } catch (error) {
    console.error("Availability slots API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
