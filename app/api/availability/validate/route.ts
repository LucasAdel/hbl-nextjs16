import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * POST /api/availability/validate
 *
 * Validates that a slot is still available for booking.
 * Use this before submitting a booking to check for race conditions.
 *
 * Body:
 * - slotId: UUID of the slot to validate
 *
 * Response:
 * - available: boolean - whether the slot can be booked
 * - slot: full slot object if available
 * - reason: string if not available
 */

interface ValidateRequest {
  slotId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();

    if (!body.slotId) {
      return NextResponse.json(
        { error: "Missing slotId in request body" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.slotId)) {
      return NextResponse.json(
        { error: "Invalid slotId format" },
        { status: 400 }
      );
    }

    // Create Supabase client
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

    // Fetch the slot
    const { data: slot, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", body.slotId)
      .single();

    if (error || !slot) {
      return NextResponse.json({
        available: false,
        reason: "Slot not found",
      });
    }

    // Check if slot is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(slot.slot_date);

    if (slotDate < today) {
      return NextResponse.json({
        available: false,
        reason: "Slot date has passed",
        slot: null,
      });
    }

    // Check availability flags
    if (!slot.is_available) {
      return NextResponse.json({
        available: false,
        reason: "Slot is no longer available",
        slot: null,
      });
    }

    if (slot.blocked_by_calendar) {
      return NextResponse.json({
        available: false,
        reason: "Slot is blocked by a calendar event",
        slot: null,
      });
    }

    if (slot.blocked_by_booking) {
      return NextResponse.json({
        available: false,
        reason: "Slot has already been booked",
        slot: null,
      });
    }

    // Slot is available
    return NextResponse.json({
      available: true,
      slot: {
        id: slot.id,
        slot_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration_minutes: slot.duration_minutes,
      },
    });
  } catch (error) {
    console.error("Validate slot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
