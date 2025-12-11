import type { Config, Context } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * Daily Availability Slot Generator
 *
 * Generates randomized booking availability slots for the next 14 days.
 * Creates artificial scarcity by limiting to max 3 slots per day with
 * weighted distribution (fewer early week, more mid-week).
 *
 * Business Rules:
 * - Max 3 slots per day
 * - Duration: 30, 45, or 60 minutes (random)
 * - Time window: 10:30am - 4:30pm weekdays only
 * - Weighted distribution:
 *   - Mon-Tue: 1-2 slots
 *   - Wed-Thu: 2-3 slots
 *   - Fri: 1-2 slots
 *
 * Schedule: Daily at midnight ACST (14:30 UTC)
 */

interface SlotData {
  slot_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
  blocked_by_calendar: boolean;
  blocked_by_booking: boolean;
  generation_method: string;
  slot_priority: number;
}

// Available durations in minutes
const DURATIONS = [30, 45, 60];

// Time slots in 30-min increments from 10:30am to 4:00pm (last slot can end at 4:30pm)
const TIME_SLOTS = [
  "10:30:00",
  "11:00:00",
  "11:30:00",
  "12:00:00",
  "12:30:00",
  "13:00:00",
  "13:30:00",
  "14:00:00",
  "14:30:00",
  "15:00:00",
  "15:30:00",
  "16:00:00",
];

// Day of week weights (0=Sun, 1=Mon, ..., 6=Sat)
const DAY_WEIGHTS: Record<number, { min: number; max: number }> = {
  1: { min: 1, max: 2 }, // Monday
  2: { min: 1, max: 2 }, // Tuesday
  3: { min: 2, max: 3 }, // Wednesday
  4: { min: 2, max: 3 }, // Thursday
  5: { min: 1, max: 2 }, // Friday
};

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}:00`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function generateSlotsForDate(date: Date): SlotData[] {
  const dayOfWeek = date.getDay();

  // Skip weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }

  const weights = DAY_WEIGHTS[dayOfWeek];
  if (!weights) return [];

  // Determine number of slots for this day (random within weighted range)
  const slotCount = getRandomInt(weights.min, weights.max);

  // Shuffle available time slots to randomize selection
  const shuffledTimes = shuffleArray(TIME_SLOTS);

  const slots: SlotData[] = [];
  const usedTimes: Set<string> = new Set();

  for (let i = 0; i < slotCount && shuffledTimes.length > 0; i++) {
    // Find a valid start time that doesn't conflict
    let startTime: string | null = null;
    let duration: number = 0;

    for (const candidateTime of shuffledTimes) {
      if (usedTimes.has(candidateTime)) continue;

      // Pick a random duration
      const candidateDuration = DURATIONS[getRandomInt(0, DURATIONS.length - 1)];
      const endTime = addMinutesToTime(candidateTime, candidateDuration);

      // Check if end time is within business hours (4:30pm = 16:30)
      if (timeToMinutes(endTime) > timeToMinutes("16:30:00")) {
        // Try shorter durations
        for (const shortDuration of [30, 45]) {
          const shortEnd = addMinutesToTime(candidateTime, shortDuration);
          if (timeToMinutes(shortEnd) <= timeToMinutes("16:30:00")) {
            startTime = candidateTime;
            duration = shortDuration;
            break;
          }
        }
      } else {
        startTime = candidateTime;
        duration = candidateDuration;
      }

      if (startTime) break;
    }

    if (!startTime || !duration) continue;

    const endTime = addMinutesToTime(startTime, duration);

    // Mark this time and overlapping times as used
    usedTimes.add(startTime);

    // Also mark times that would overlap with this slot
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    for (const time of TIME_SLOTS) {
      const timeMinutes = timeToMinutes(time);
      // If this time would start during our slot, mark it used
      if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
        usedTimes.add(time);
      }
    }

    const dateString = date.toISOString().split("T")[0];

    slots.push({
      slot_date: dateString,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      is_available: true,
      blocked_by_calendar: false,
      blocked_by_booking: false,
      generation_method: "random",
      slot_priority: getRandomInt(1, 100),
    });
  }

  return slots;
}

export default async function handler(request: Request, context: Context) {
  console.log("🎰 Generating randomized availability slots...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate slots for next 14 days
    const allSlots: SlotData[] = [];

    for (let i = 0; i < 14; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      const slotsForDay = generateSlotsForDate(targetDate);
      allSlots.push(...slotsForDay);
    }

    console.log(`Generated ${allSlots.length} slots for the next 14 days`);

    // Delete old slots (before today) that aren't linked to bookings
    const { data: deletedData, error: deleteError } = await supabase
      .from("availability_slots")
      .delete()
      .lt("slot_date", today.toISOString().split("T")[0])
      .is("booking_id", null)
      .select("id");

    if (deleteError) {
      console.error("Error cleaning up old slots:", deleteError);
    } else {
      console.log(`Cleaned up ${deletedData?.length || 0} old slots`);
    }

    // Delete existing future slots that will be regenerated (not blocked by booking)
    const { error: clearError } = await supabase
      .from("availability_slots")
      .delete()
      .gte("slot_date", today.toISOString().split("T")[0])
      .eq("blocked_by_booking", false);

    if (clearError) {
      console.error("Error clearing existing slots:", clearError);
      // Continue anyway - we'll upsert
    }

    // Insert new slots
    if (allSlots.length > 0) {
      const { error: insertError } = await supabase
        .from("availability_slots")
        .insert(allSlots);

      if (insertError) {
        console.error("Error inserting slots:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert slots", details: insertError.message }),
          { status: 500 }
        );
      }
    }

    // Count slots by day for logging
    const slotsByDay: Record<string, number> = {};
    for (const slot of allSlots) {
      slotsByDay[slot.slot_date] = (slotsByDay[slot.slot_date] || 0) + 1;
    }

    console.log("Slots per day:", slotsByDay);

    return new Response(
      JSON.stringify({
        success: true,
        totalSlots: allSlots.length,
        slotsByDay,
        message: `Generated ${allSlots.length} availability slots for the next 14 days`,
      })
    );
  } catch (error) {
    console.error("Slot generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate availability slots" }),
      { status: 500 }
    );
  }
}

// Netlify scheduled function configuration
// Runs daily at midnight ACST (Adelaide time)
// Midnight ACST = 14:30 UTC previous day
export const config: Config = {
  schedule: "30 14 * * *", // Daily at 14:30 UTC (midnight ACST)
};
