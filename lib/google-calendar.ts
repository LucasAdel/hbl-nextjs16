// Google Calendar integration for HBL Legal
// Uses direct REST API calls instead of googleapis package for lighter footprint
import { createServerClient } from "@supabase/ssr";

const PRIMARY_CALENDAR_EMAIL = process.env.NEXT_PUBLIC_PRIMARY_CALENDAR_EMAIL || "lw@hamiltonbailey.com";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`;

interface CalendarEventInput {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail?: string;
  attendeeName?: string;
  location?: string;
}

interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  message?: string;
  error?: string;
  eventData?: Record<string, unknown>;
}

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

// Get stored Google tokens from database
async function getStoredTokens(): Promise<StoredTokens | null> {
  try {
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

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "google_calendar_tokens")
      .single();

    if (error || !data) {
      console.log("No Google Calendar tokens stored");
      return null;
    }

    return data.value as StoredTokens;
  } catch (error) {
    console.error("Error fetching stored tokens:", error);
    return null;
  }
}

// Update stored tokens when refreshed
async function updateStoredTokens(tokens: Partial<StoredTokens>) {
  try {
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

    const existingTokens = await getStoredTokens();

    await supabase
      .from("settings")
      .upsert({
        key: "google_calendar_tokens",
        value: {
          ...existingTokens,
          ...tokens,
          updated_at: new Date().toISOString(),
        },
      }, { onConflict: "key" });
  } catch (error) {
    console.error("Error updating stored tokens:", error);
  }
}

// Refresh access token if expired
async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  // Check if token is expired (with 5 minute buffer)
  const isExpired = tokens.expiry_date < Date.now() + 5 * 60 * 1000;

  if (!isExpired) {
    return tokens.access_token;
  }

  // Refresh the token
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token");
      return null;
    }

    const newTokens = await response.json();

    await updateStoredTokens({
      access_token: newTokens.access_token,
      expiry_date: Date.now() + newTokens.expires_in * 1000,
    });

    return newTokens.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEventResult> {
  try {
    // Prepare event data
    const eventData = {
      summary: input.summary,
      description: input.description,
      start: {
        dateTime: input.startTime.toISOString(),
        timeZone: "Australia/Adelaide",
      },
      end: {
        dateTime: input.endTime.toISOString(),
        timeZone: "Australia/Adelaide",
      },
      attendees: input.attendeeEmail
        ? [{ email: input.attendeeEmail, displayName: input.attendeeName }]
        : [],
      location: input.location || "147 Pirie Street, Adelaide SA 5000",
      conferenceData: {
        createRequest: {
          requestId: `hbl-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 24 hours before
          { method: "email", minutes: 60 }, // 1 hour before
          { method: "popup", minutes: 30 }, // 30 mins before
        ],
      },
    };

    // Try to get valid access token
    const accessToken = await getValidAccessToken();

    if (accessToken) {
      // Create actual Google Calendar event via REST API
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );

      if (response.ok) {
        const createdEvent = await response.json();
        console.log("Google Calendar event created:", createdEvent.id);

        return {
          success: true,
          eventId: createdEvent.id,
          htmlLink: createdEvent.htmlLink,
          message: "Calendar event created successfully",
          eventData: createdEvent,
        };
      }

      console.error("Failed to create calendar event:", await response.text());
    }

    // Fallback: OAuth not set up or failed, return prepared event data
    console.log("Calendar event prepared for:", PRIMARY_CALENDAR_EMAIL);
    console.log("Event details:", {
      summary: eventData.summary,
      start: eventData.start.dateTime,
      end: eventData.end.dateTime,
      attendees: eventData.attendees,
    });

    return {
      success: true,
      eventId: `pending-${Date.now()}`,
      message: "Calendar event prepared - OAuth setup required for automatic calendar integration",
      eventData,
    };
  } catch (error) {
    console.error("Calendar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calendar error",
    };
  }
}

// Check if Google Calendar is connected
export async function isCalendarConnected(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens !== null;
}

// Parse time string like "9:00 AM" to hours/minutes
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { hours: 9, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

// Get duration in minutes for consultation type
export function getConsultationDuration(consultationType: string): number {
  const durations: Record<string, number> = {
    "Initial Consultation": 30,
    "Urgent Legal Advice": 30,
    "Follow-up Consultation": 15,
    "Document Review Session": 60,
    "Strategy Planning Session": 90,
  };

  return durations[consultationType] || 30;
}

// Create event dates from booking data
export function createEventDates(
  dateString: string,
  timeString: string,
  durationMinutes: number
): { start: Date; end: Date } {
  const { hours, minutes } = parseTimeString(timeString);

  const start = new Date(dateString);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);

  return { start, end };
}
