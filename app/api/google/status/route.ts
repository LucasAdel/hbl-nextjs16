import { NextResponse } from "next/server";
import { isCalendarConnected } from "@/lib/google-calendar";

export async function GET() {
  try {
    const connected = await isCalendarConnected();

    return NextResponse.json({
      connected,
      message: connected
        ? "Google Calendar is connected"
        : "Google Calendar not connected - OAuth required",
      authUrl: connected ? null : "/api/google/auth",
    });
  } catch (error) {
    console.error("Calendar status check error:", error);
    return NextResponse.json({
      connected: false,
      error: "Failed to check calendar status",
    });
  }
}
