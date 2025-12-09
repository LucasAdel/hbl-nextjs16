import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, email, action, newDate, newTime, reason } = body;

    if (!bookingId || !email || !action) {
      return NextResponse.json(
        { error: "Booking ID, email, and action are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the booking belongs to this email
    const { data: booking, error: fetchError } = await supabase
      .from("advanced_bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("client_email", email.toLowerCase())
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if booking can be modified (at least 24 hours before)
    const bookingTime = new Date(booking.start_time);
    const now = new Date();
    const hoursUntilBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return NextResponse.json(
        { error: "Bookings can only be modified at least 24 hours in advance" },
        { status: 400 }
      );
    }

    if (action === "cancel") {
      // Cancel the booking
      const { error: updateError } = await supabase
        .from("advanced_bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "Client requested cancellation",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error cancelling booking:", updateError);
        return NextResponse.json(
          { error: "Failed to cancel booking" },
          { status: 500 }
        );
      }

      // Send cancellation email
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: "Hamilton Bailey Law <bookings@hamiltonbaileylaw.com.au>",
            to: [email],
            subject: "Booking Cancelled - Hamilton Bailey Law",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #40E0D0, #2AAFA2); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p>Dear ${booking.client_name},</p>
                  <p>Your consultation has been cancelled as requested.</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Cancelled Appointment:</strong></p>
                    <p>${booking.event_type_name}</p>
                    <p>${new Date(booking.start_time).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>${new Date(booking.start_time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p>If you'd like to book a new consultation, please visit our website.</p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://hamiltonbaileylaw.com.au/book-appointment" style="background: #40E0D0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book New Appointment</a>
                  </div>
                </div>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Error sending cancellation email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    }

    if (action === "reschedule") {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { error: "New date and time are required for rescheduling" },
          { status: 400 }
        );
      }

      // Parse the new date and time
      const [hours, minutes] = newTime.split(":");
      const newStartTime = new Date(newDate);
      newStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Calculate end time based on original duration
      const originalStart = new Date(booking.start_time);
      const originalEnd = new Date(booking.end_time);
      const duration = originalEnd.getTime() - originalStart.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      // Update the booking
      const { error: updateError } = await supabase
        .from("advanced_bookings")
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          rescheduled_from: booking.start_time,
          rescheduled_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error rescheduling booking:", updateError);
        return NextResponse.json(
          { error: "Failed to reschedule booking" },
          { status: 500 }
        );
      }

      // Send reschedule confirmation email
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: "Hamilton Bailey Law <bookings@hamiltonbaileylaw.com.au>",
            to: [email],
            subject: "Booking Rescheduled - Hamilton Bailey Law",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #40E0D0, #2AAFA2); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Booking Rescheduled</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <p>Dear ${booking.client_name},</p>
                  <p>Your consultation has been rescheduled successfully.</p>
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>New Appointment Details:</strong></p>
                    <p>${booking.event_type_name}</p>
                    <p>${newStartTime.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>${newStartTime.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
                    ${booking.google_meet_link ? `<p><a href="${booking.google_meet_link}" style="color: #40E0D0;">Join Google Meet</a></p>` : ''}
                  </div>
                  <p style="color: #666; font-size: 14px;">Previous time: ${originalStart.toLocaleDateString('en-AU')} at ${originalStart.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Error sending reschedule email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Booking rescheduled successfully",
        newStartTime: newStartTime.toISOString(),
        newEndTime: newEndTime.toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'cancel' or 'reschedule'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reschedule error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
