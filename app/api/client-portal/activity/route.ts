import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ActivityItem {
  id: string;
  type: "booking" | "document" | "payment" | "profile" | "system";
  action: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "failed";
  metadata?: Record<string, unknown>;
}

// GET /api/client-portal/activity - Get client activity feed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities: ActivityItem[] = [];

    // Get recent bookings
    const { data: bookings } = await supabase
      .from("advanced_bookings")
      .select("id, event_type_name, start_time, status, created_at, updated_at")
      .eq("client_email", email)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (bookings) {
      for (const booking of bookings) {
        // Add booking creation activity
        activities.push({
          id: `booking-created-${booking.id}`,
          type: "booking",
          action: "Consultation Booked",
          description: `${booking.event_type_name}`,
          timestamp: booking.created_at,
          status: "success",
          metadata: { bookingId: booking.id },
        });

        // Add status change if updated after creation
        if (booking.updated_at !== booking.created_at) {
          let action = "Booking Updated";
          let status: "success" | "pending" | "failed" = "success";

          if (booking.status === "cancelled") {
            action = "Booking Cancelled";
            status = "failed";
          } else if (booking.status === "confirmed") {
            action = "Booking Confirmed";
            status = "success";
          } else if (booking.status === "completed") {
            action = "Consultation Completed";
            status = "success";
          } else if (booking.status === "pending") {
            action = "Booking Pending";
            status = "pending";
          }

          activities.push({
            id: `booking-status-${booking.id}`,
            type: "booking",
            action,
            description: `${booking.event_type_name}`,
            timestamp: booking.updated_at,
            status,
            metadata: { bookingId: booking.id, newStatus: booking.status },
          });
        }
      }
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Deduplicate by ID and limit
    const uniqueActivities = activities.filter(
      (activity, index, self) => index === self.findIndex((a) => a.id === activity.id)
    );

    return NextResponse.json({
      success: true,
      activities: uniqueActivities.slice(0, limit),
    });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/client-portal/activity - Log a new activity
// Note: Activity logging is optional and requires client_activity table to be created
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, action } = body;

    if (!email || !type || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Activity logging would require client_activity table to be created
    // For now, we just acknowledge the request
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
