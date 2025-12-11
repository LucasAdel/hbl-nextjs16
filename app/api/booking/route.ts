import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";
import {
  createCalendarEvent,
  createEventDates,
  getConsultationDuration,
} from "@/lib/google-calendar";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limiter";
import { trackError, createErrorResponse } from "@/lib/error-tracking";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "lw@hamiltonbailey.com";

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
    let eventTypeId: string | null = null;

    // Try to fetch existing event type
    const { data: eventTypes, error: eventTypeError } = await supabase
      .from("event_types")
      .select("id, name")
      .limit(10);

    console.log("Event types query result:", { eventTypes, eventTypeError });

    let selectedEventType: { id: string; name: string } | null = null;

    if (eventTypes && eventTypes.length > 0) {
      // Find matching event type or use first one
      const matchingType = eventTypes.find(
        (et: { id: string; name: string }) =>
          et.name.toLowerCase().includes("initial") ||
          et.name.toLowerCase().includes("consultation")
      );
      selectedEventType = matchingType || eventTypes[0];
      console.log("Using event type:", selectedEventType);
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
      console.log(`Blocked availability slot: ${slotId}`);
    }

    // Convert date/time to ISO timestamp format
    const durationMinutes = getConsultationDuration(consultationType);
    const { start: startDateTime, end: endDateTime } = createEventDates(
      date,
      time,
      durationMinutes
    );

    // Create booking in advanced_bookings table with all required fields
    // Status is "pending_payment" until Stripe webhook confirms payment
    const bookingData = {
      client_name: name,
      client_email: email,
      client_phone: phone || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      event_type_id: selectedEventType.id,
      event_type_name: consultationType || selectedEventType.name,
      location_type: "video",
      status: "pending_payment",
      notes: message || null,
      timezone: "Australia/Adelaide",
      custom_answers: practiceType || practiceWebsite ? {
        practiceType: practiceType || "",
        practiceWebsite: practiceWebsite || "",
        uploadedFiles: uploadedFiles || [],
      } : null,
      availability_slot_id: availabilitySlotId,
    };

    console.log("Attempting insert with data:", JSON.stringify(bookingData, null, 2));

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

      console.log(`Linked availability slot ${availabilitySlotId} to booking ${data.id}`);
    }

    // Create Google Calendar event
    const calendarResult = await createCalendarEvent({
      summary: `${consultationType} - ${name}`,
      description: `
Client: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Practice Type: ${practiceType || "Not specified"}
Practice Website: ${practiceWebsite || "Not provided"}

Notes:
${message || "No additional notes"}

${uploadedFiles && uploadedFiles.length > 0 ? `Uploaded Documents: ${uploadedFiles.join(", ")}` : ""}
      `.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      attendeeEmail: email,
      attendeeName: name,
      location: "Video Conference",
    });

    // Store calendar event ID if created
    let meetLink: string | null = null;
    if (calendarResult.success && calendarResult.eventId) {
      await supabase
        .from("advanced_bookings")
        .update({ google_event_id: calendarResult.eventId })
        .eq("id", data.id);

      // Extract Meet link from calendar event
      if (calendarResult.eventData) {
        const eventData = calendarResult.eventData as Record<string, unknown>;
        meetLink = (eventData.hangoutLink as string) || null;
      }
    }

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send confirmation email to client
    try {
      await resend.emails.send({
        from: "HBL Legal <noreply@hamiltonbailey.com>",
        to: email,
        subject: `Booking Confirmation - ${consultationType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #40E0D0; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Booking Confirmed</h1>
            </div>

            <div style="padding: 30px; background: #f9f9f9;">
              <p>Dear ${name},</p>

              <p>Thank you for booking your <strong>${consultationType}</strong> with Hamilton Bailey Legal.</p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #40E0D0; margin-top: 0;">Appointment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${time} (ACST)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Duration:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${durationMinutes} minutes</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Format:</td>
                    <td style="padding: 8px 0; font-weight: bold;">Video Conference</td>
                  </tr>
                </table>
              </div>

              ${meetLink ? `
              <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #2E7D32; font-weight: bold;">
                  Your Video Conference Link
                </p>
                <a href="${meetLink}" style="display: inline-block; background: #0F9D58; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Join Google Meet
                </a>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
                  ${meetLink}
                </p>
              </div>
              ` : `
              <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <p style="margin: 0; color: #92400E;">
                  <strong>What's Next?</strong><br />
                  You will receive a calendar invitation with a video conference link. Please ensure you have a stable internet connection and a quiet space for your consultation.
                </p>
              </div>
              `}

              <p style="color: #666;">If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>

              <p>We look forward to speaking with you.</p>

              <p>Best regards,<br />
              <strong>Hamilton Bailey Legal</strong></p>
            </div>

            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Hamilton Bailey Legal | 147 Pirie Street, Adelaide SA 5000<br />
                Phone: 08 5122 6500 | lw@hamiltonbailey.com
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Client email error:", emailError);
    }

    // Send notification email to admin
    try {
      await resend.emails.send({
        from: "HBL Legal <noreply@hamiltonbailey.com>",
        to: ADMIN_EMAIL,
        subject: `New Booking: ${consultationType} - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #40E0D0; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Booking Received</h1>
            </div>

            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;">Consultation:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${consultationType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Date:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Time:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${time} (ACST)</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Duration:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${durationMinutes} minutes</td>
                  </tr>
                </table>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #40E0D0; margin-top: 0;">Client Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 140px;">Name:</td>
                    <td style="padding: 8px 0;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Phone:</td>
                    <td style="padding: 8px 0;">${phone || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Practice Type:</td>
                    <td style="padding: 8px 0;">${practiceType || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Practice Website:</td>
                    <td style="padding: 8px 0;">
                      ${practiceWebsite ? `<a href="${practiceWebsite}">${practiceWebsite}</a>` : "Not provided"}
                    </td>
                  </tr>
                </table>
              </div>

              ${message ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #40E0D0; margin-top: 0;">Client Notes</h3>
                <p style="color: #333; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              ` : ""}

              ${uploadedFiles && uploadedFiles.length > 0 ? `
              <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400E;">
                  <strong>Documents Uploaded:</strong> ${uploadedFiles.length} file(s)<br />
                  Check your email for attached documents.
                </p>
              </div>
              ` : ""}

              ${meetLink ? `
              <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #2E7D32; font-weight: bold;">
                  Google Meet Link
                </p>
                <a href="${meetLink}" style="display: inline-block; background: #0F9D58; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Join Meeting
                </a>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
                  ${meetLink}
                </p>
              </div>
              ` : ""}
            </div>

            <div style="background: #333; padding: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from the HBL website booking system.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Admin email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking: data,
      calendarEvent: calendarResult,
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return createErrorResponse(error as Error, { route: "/api/booking", action: "booking_create" });
  }
}

function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}:00`;
}
