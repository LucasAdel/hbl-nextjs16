/**
 * Booking API
 *
 * POST /api/booking
 *
 * SECURITY:
 * - Creates booking with "pending_payment" status
 * - NO calendar event or emails until payment confirmed via Stripe webhook
 * - Rate limited to prevent spam
 * - Slot reservation to prevent double-booking
 *
 * Flow:
 * 1. User submits booking form → This endpoint creates booking (pending_payment)
 * 2. User redirected to Stripe checkout with booking ID in metadata
 * 3. Stripe webhook confirms payment → booking confirmed + calendar + emails
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  createEventDates,
  getConsultationDuration,
} from "@/lib/google-calendar";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { createErrorResponse } from "@/lib/error-tracking";

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`booking-${clientId}`, RATE_LIMITS.booking);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Too many requests",
        message: "Please wait before making another booking request",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      date,
      time,
      message,
      consultationType,
      practiceType,
      practiceWebsite,
      uploadedFiles,
      slotId, // Optional: ID of availability slot being booked
    } = body;

    // Validate required fields
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, date, and time are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Create Supabase client directly with service role key
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // First, get or create a default event type
    const eventTypeName = consultationType || "Initial Consultation";

    // Try to fetch existing event type
    const { data: eventTypes, error: eventTypeError } = await supabase
      .from("event_types")
      .select("id, name")
      .limit(10);

    let selectedEventType: { id: string; name: string } | null = null;

    if (eventTypes && eventTypes.length > 0) {
      // Find matching event type or use first one
      const matchingType = eventTypes.find(
        (et: { id: string; name: string }) =>
          et.name.toLowerCase().includes("initial") ||
          et.name.toLowerCase().includes("consultation")
      );
      selectedEventType = matchingType || eventTypes[0];
    }

    if (!selectedEventType) {
      console.error("No event types found in database");
      return NextResponse.json(
        { error: "Booking configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Validate and block availability slot if provided
    let availabilitySlotId: string | null = null;
    if (slotId) {
      // Validate slot is still available
      const { data: slot, error: slotError } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("id", slotId)
        .single();

      if (slotError || !slot) {
        return NextResponse.json(
          { error: "Selected time slot not found. Please select another time." },
          { status: 404 }
        );
      }

      // Check if slot is still available
      if (!slot.is_available || slot.blocked_by_calendar || slot.blocked_by_booking) {
        return NextResponse.json(
          { error: "This time slot is no longer available. Please select another time." },
          { status: 409 }
        );
      }

      // Atomically block the slot to prevent race conditions
      const { error: blockError } = await supabase
        .from("availability_slots")
        .update({
          blocked_by_booking: true,
          is_available: false,
        })
        .eq("id", slotId)
        .eq("is_available", true) // Only update if still available
        .eq("blocked_by_booking", false);

      if (blockError) {
        console.error("Error blocking slot:", blockError);
        return NextResponse.json(
          { error: "Failed to reserve time slot. Please try again." },
          { status: 500 }
        );
      }

      availabilitySlotId = slotId;
    }

    // Convert date/time to ISO timestamp format
    const durationMinutes = getConsultationDuration(consultationType);
    const { start: startDateTime, end: endDateTime } = createEventDates(
      date,
      time,
      durationMinutes
    );

    // Create booking in advanced_bookings table with status "pending_payment"
    // SECURITY: Calendar event and emails are ONLY sent after Stripe payment confirmation
    const bookingData = {
      client_name: name,
      client_email: email.toLowerCase(),
      client_phone: phone || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      event_type_id: selectedEventType.id,
      event_type_name: consultationType || selectedEventType.name,
      location_type: "video",
      status: "pending_payment", // Will be updated to "confirmed" by Stripe webhook
      notes: message || null,
      timezone: "Australia/Adelaide",
      custom_answers: practiceType || practiceWebsite ? {
        practiceType: practiceType || "",
        practiceWebsite: practiceWebsite || "",
        uploadedFiles: uploadedFiles || [],
      } : null,
      availability_slot_id: availabilitySlotId,
    };

    const { data, error } = await supabase
      .from("advanced_bookings")
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error("Booking insert error:", error.message, error.code, error.details);

      // If booking failed and we blocked a slot, unblock it
      if (availabilitySlotId) {
        await supabase
          .from("availability_slots")
          .update({
            blocked_by_booking: false,
            is_available: true,
            booking_id: null,
          })
          .eq("id", availabilitySlotId);
      }

      return NextResponse.json(
        { error: "Failed to create booking. Please try again." },
        { status: 500 }
      );
    }

    // Link the slot to the booking
    if (availabilitySlotId && data.id) {
      await supabase
        .from("availability_slots")
        .update({ booking_id: data.id })
        .eq("id", availabilitySlotId);
    }

    // SECURITY: NO calendar event created here - only after payment confirmed
    // SECURITY: NO emails sent here - only after payment confirmed
    // The Stripe webhook handler will:
    // 1. Update booking status to "confirmed"
    // 2. Create Google Calendar event
    // 3. Send confirmation emails to client and admin

    return NextResponse.json({
      success: true,
      message: "Booking created - awaiting payment",
      booking: {
        id: data.id,
        status: "pending_payment",
        clientName: name,
        clientEmail: email,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        consultationType: consultationType || selectedEventType.name,
        durationMinutes,
      },
      // Include booking ID for Stripe checkout metadata
      bookingId: data.id,
      redirectToPayment: true,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return createErrorResponse(error as Error, { route: "/api/booking", action: "booking_create" });
  }
}
