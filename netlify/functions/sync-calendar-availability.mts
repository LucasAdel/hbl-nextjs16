import type { Config, Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * Calendar Availability Sync Poller
 *
 * Polls Google Calendar every 10 minutes to sync availability slots.
 * When calendar events are found that conflict with slots, those slots
 * are blocked to prevent double-booking.
 *
 * Features:
 * - Fetches events from lw@hamiltonbailey.com calendar
 * - Blocks slots that conflict with calendar events
 * - Unblocks slots when calendar events are removed
 * - Tracks sync health and errors
 *
 * Schedule: Every 10 minutes
 */

const CALENDAR_EMAIL = "lw@hamiltonbailey.com";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

interface AvailabilitySlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  blocked_by_calendar: boolean;
  blocked_by_booking: boolean;
  google_event_id: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type SupabaseClientAny = any;

// Get stored tokens
async function getStoredTokens(
  supabase: SupabaseClientAny
): Promise<StoredTokens | null> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "google_calendar_tokens")
    .single();

  if (error || !data) return null;
  return data.value as StoredTokens;
}

// Update stored tokens
async function updateStoredTokens(
  supabase: SupabaseClientAny,
  tokens: Partial<StoredTokens>
): Promise<void> {
  const existingTokens = await getStoredTokens(supabase);
  await supabase.from("settings").upsert(
    {
      key: "google_calendar_tokens",
      value: { ...existingTokens, ...tokens, updated_at: new Date().toISOString() },
    },
    { onConflict: "key" }
  );
}

// Get valid access token (refresh if needed)
async function getValidAccessToken(
  supabase: SupabaseClientAny
): Promise<string | null> {
  const googleClientId = Netlify.env.get("NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  const googleClientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");

  const tokens = await getStoredTokens(supabase);
  if (!tokens) return null;

  // Check if expired (with 5 min buffer)
  if (tokens.expiry_date > Date.now() + 5 * 60 * 1000) {
    return tokens.access_token;
  }

  // Refresh token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: googleClientId!,
      client_secret: googleClientSecret!,
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    console.error("Failed to refresh token");
    return null;
  }

  const newTokens = await response.json();
  await updateStoredTokens(supabase, {
    access_token: newTokens.access_token,
    expiry_date: Date.now() + newTokens.expires_in * 1000,
  });

  return newTokens.access_token;
}

// List calendar events
async function listCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const timeMin = new Date(startDate);
  timeMin.setHours(0, 0, 0, 0);

  const timeMax = new Date(endDate);
  timeMax.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    timeZone: "Australia/Adelaide",
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  const events: CalendarEvent[] = [];

  for (const item of data.items || []) {
    if (item.status === "cancelled") continue;

    const isAllDay = !item.start?.dateTime;

    events.push({
      id: item.id,
      summary: item.summary || "Busy",
      start: isAllDay ? new Date(item.start.date) : new Date(item.start.dateTime),
      end: isAllDay ? new Date(item.end.date) : new Date(item.end.dateTime),
      isAllDay,
    });
  }

  return events;
}

// Check if slot conflicts with event
function hasConflict(
  slotDate: string,
  slotStartTime: string,
  slotEndTime: string,
  event: CalendarEvent
): boolean {
  // Build slot Date objects (assuming Adelaide timezone)
  const slotStart = new Date(`${slotDate}T${slotStartTime}+10:30`); // ACST offset
  const slotEnd = new Date(`${slotDate}T${slotEndTime}+10:30`);

  // Handle all-day events
  if (event.isAllDay) {
    const eventStartDate = event.start.toISOString().split("T")[0];
    const eventEndDate = event.end.toISOString().split("T")[0];
    return slotDate >= eventStartDate && slotDate < eventEndDate;
  }

  // Standard overlap: slotStart < eventEnd && slotEnd > eventStart
  return slotStart < event.end && slotEnd > event.start;
}

// Update sync state
async function updateSyncState(
  supabase: SupabaseClientAny,
  success: boolean,
  eventsCount: number,
  blockedCount: number,
  error?: string
): Promise<void> {
  const now = new Date();
  const nextSync = new Date(now.getTime() + 10 * 60 * 1000); // +10 minutes

  if (success) {
    await supabase
      .from("calendar_sync_state")
      .update({
        last_sync_at: now.toISOString(),
        next_sync_at: nextSync.toISOString(),
        events_synced_count: eventsCount,
        slots_blocked_count: blockedCount,
        is_healthy: true,
        consecutive_errors: 0,
        last_error: null,
        last_error_at: null,
      })
      .eq("calendar_email", CALENDAR_EMAIL);
  } else {
    // Increment error count
    const { data: current } = await supabase
      .from("calendar_sync_state")
      .select("consecutive_errors")
      .eq("calendar_email", CALENDAR_EMAIL)
      .single();

    const newErrorCount = (current?.consecutive_errors || 0) + 1;

    await supabase
      .from("calendar_sync_state")
      .update({
        last_sync_at: now.toISOString(),
        next_sync_at: nextSync.toISOString(),
        is_healthy: newErrorCount < 3,
        consecutive_errors: newErrorCount,
        last_error: error || "Unknown error",
        last_error_at: now.toISOString(),
      })
      .eq("calendar_email", CALENDAR_EMAIL);
  }
}

export default async (req: Request, context: Context) => {
  console.log("🔄 Syncing calendar availability...");

  // Use Netlify.env for environment variables
  const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get access token
    const accessToken = await getValidAccessToken(supabase);

    if (!accessToken) {
      console.log("No Google Calendar access token - skipping sync");
      await updateSyncState(supabase, false, 0, 0, "No access token");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Calendar not connected - no access token",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch calendar events for next 14 days
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 14);

    const events = await listCalendarEvents(accessToken, today, endDate);
    console.log(`Fetched ${events.length} calendar events`);

    // Fetch all availability slots (not blocked by booking)
    const { data: slots, error: slotsError } = await supabase
      .from("availability_slots")
      .select("id, slot_date, start_time, end_time, blocked_by_calendar, blocked_by_booking, google_event_id")
      .eq("blocked_by_booking", false)
      .gte("slot_date", today.toISOString().split("T")[0])
      .order("slot_date", { ascending: true });

    if (slotsError) {
      throw new Error(`Failed to fetch slots: ${slotsError.message}`);
    }

    let blockedCount = 0;
    let unblockedCount = 0;

    // Check each slot for conflicts
    for (const slot of slots || []) {
      let conflictingEvent: CalendarEvent | null = null;

      // Check against all events
      for (const event of events) {
        if (hasConflict(slot.slot_date, slot.start_time, slot.end_time, event)) {
          conflictingEvent = event;
          break;
        }
      }

      if (conflictingEvent && !slot.blocked_by_calendar) {
        // Block the slot
        await supabase
          .from("availability_slots")
          .update({
            blocked_by_calendar: true,
            is_available: false,
            google_event_id: conflictingEvent.id,
            google_event_summary: conflictingEvent.summary,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", slot.id);

        blockedCount++;
        console.log(`Blocked slot ${slot.slot_date} ${slot.start_time} - conflicts with "${conflictingEvent.summary}"`);
      } else if (!conflictingEvent && slot.blocked_by_calendar) {
        // Unblock the slot (calendar event was removed)
        await supabase
          .from("availability_slots")
          .update({
            blocked_by_calendar: false,
            is_available: true,
            google_event_id: null,
            google_event_summary: null,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", slot.id);

        unblockedCount++;
        console.log(`Unblocked slot ${slot.slot_date} ${slot.start_time} - calendar event removed`);
      } else {
        // Update sync timestamp only
        await supabase
          .from("availability_slots")
          .update({ last_synced_at: new Date().toISOString() })
          .eq("id", slot.id);
      }
    }

    // Update sync state
    await updateSyncState(supabase, true, events.length, blockedCount);

    console.log(`✅ Calendar sync complete: ${blockedCount} blocked, ${unblockedCount} unblocked`);

    return new Response(
      JSON.stringify({
        success: true,
        eventsFound: events.length,
        slotsProcessed: slots?.length || 0,
        blockedCount,
        unblockedCount,
        message: "Calendar sync completed successfully",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Calendar sync error:", errorMessage);

    await updateSyncState(supabase, false, 0, 0, errorMessage);

    return new Response(
      JSON.stringify({ error: "Calendar sync failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Netlify scheduled function configuration
// Runs every 10 minutes
export const config: Config = {
  schedule: "*/10 * * * *", // Every 10 minutes
};
