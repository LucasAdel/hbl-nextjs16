/**
 * Google Calendar Integration Service
 * Handles syncing appointments with Google Calendar
 *
 * Required environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 */

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "accepted" | "declined" | "tentative";
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: "hangoutsMeet";
      };
    };
  };
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SyncResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  meetLink?: string;
  error?: string;
}

// OAuth configuration
const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

/**
 * Generate OAuth authorization URL for Google Calendar
 */
export function getGoogleAuthUrl(state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to exchange code");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to refresh token");
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent,
  calendarId: string = "primary"
): Promise<SyncResult> {
  try {
    const params = new URLSearchParams({
      conferenceDataVersion: "1",
    });

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Failed to create event",
      };
    }

    const data = await response.json();

    return {
      success: true,
      eventId: data.id,
      eventLink: data.htmlLink,
      meetLink: data.conferenceData?.entryPoints?.find(
        (e: { entryPointType: string }) => e.entryPointType === "video"
      )?.uri,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>,
  calendarId: string = "primary"
): Promise<SyncResult> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Failed to update event",
      };
    }

    const data = await response.json();

    return {
      success: true,
      eventId: data.id,
      eventLink: data.htmlLink,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = "primary"
): Promise<SyncResult> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 410) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Failed to delete event",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * List upcoming events
 */
export async function listUpcomingEvents(
  accessToken: string,
  calendarId: string = "primary",
  maxResults: number = 10
): Promise<{ events: GoogleCalendarEvent[]; error?: string }> {
  try {
    const now = new Date().toISOString();
    const params = new URLSearchParams({
      timeMin: now,
      maxResults: maxResults.toString(),
      singleEvents: "true",
      orderBy: "startTime",
    });

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        events: [],
        error: error.error?.message || "Failed to list events",
      };
    }

    const data = await response.json();

    return {
      events: data.items || [],
    };
  } catch (error) {
    return {
      events: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert appointment to Google Calendar event format
 */
export function appointmentToCalendarEvent(appointment: {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  location?: string;
  videoCall?: boolean;
}): GoogleCalendarEvent {
  const { date, time, duration } = appointment;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const event: GoogleCalendarEvent = {
    summary: `${appointment.service} - ${appointment.clientName}`,
    description: appointment.notes || `Appointment with ${appointment.clientName}`,
    location: appointment.location,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Australia/Brisbane",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Australia/Brisbane",
    },
    attendees: [
      {
        email: appointment.clientEmail,
        displayName: appointment.clientName,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 1440 }, // 24 hours before
        { method: "popup", minutes: 60 }, // 1 hour before
      ],
    },
  };

  // Add Google Meet if video call requested
  if (appointment.videoCall) {
    event.conferenceData = {
      createRequest: {
        requestId: `appointment-${Date.now()}`,
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    };
  }

  return event;
}

/**
 * Check if tokens need refresh
 */
export function tokensNeedRefresh(expiresAt: number): boolean {
  // Refresh if less than 5 minutes remaining
  return Date.now() > expiresAt - 5 * 60 * 1000;
}
