import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertTestSlots() {
  console.log("Inserting test availability slots...");

  // Get current date
  const today = new Date();
  const slots = [];

  // Generate slots for the next 14 days (skip weekends)
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = date.toISOString().split("T")[0];

    // Add 2-3 slots per day with varying times
    const possibleSlots = [
      { start: "10:30:00", end: "11:00:00", duration: 30, priority: 50 },
      { start: "11:00:00", end: "11:45:00", duration: 45, priority: 60 },
      { start: "13:00:00", end: "13:30:00", duration: 30, priority: 40 },
      { start: "14:00:00", end: "15:00:00", duration: 60, priority: 75 },
      { start: "15:00:00", end: "16:00:00", duration: 60, priority: 80 },
      { start: "15:30:00", end: "16:30:00", duration: 60, priority: 85 },
    ];

    // Pick 2-3 random slots for this day
    const shuffled = possibleSlots.sort(() => Math.random() - 0.5);
    const numSlots = Math.floor(Math.random() * 2) + 2; // 2-3 slots

    for (let j = 0; j < numSlots && j < shuffled.length; j++) {
      const slot = shuffled[j];
      slots.push({
        slot_date: dateStr,
        start_time: slot.start,
        end_time: slot.end,
        duration_minutes: slot.duration,
        is_available: true,
        blocked_by_calendar: false,
        blocked_by_booking: false,
        generation_method: "manual",
        slot_priority: slot.priority,
      });
    }
  }

  console.log(`Inserting ${slots.length} slots...`);

  // Insert slots
  const { data, error } = await supabase
    .from("availability_slots")
    .insert(slots)
    .select();

  if (error) {
    console.error("Error inserting slots:", error);
    process.exit(1);
  }

  console.log(`Successfully inserted ${data?.length || 0} slots`);

  // Verify by fetching
  const { data: checkData, error: checkError } = await supabase
    .from("availability_slots")
    .select("slot_date, start_time, end_time")
    .eq("is_available", true)
    .order("slot_date", { ascending: true })
    .limit(20);

  if (checkError) {
    console.error("Error verifying slots:", checkError);
  } else {
    console.log("\nInserted slots preview:");
    checkData?.forEach((slot) => {
      console.log(`  ${slot.slot_date} ${slot.start_time} - ${slot.end_time}`);
    });
  }
}

insertTestSlots();
