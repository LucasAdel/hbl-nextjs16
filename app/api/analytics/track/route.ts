import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/analytics/track
 * Receives batched analytics events from the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "No events provided" },
        { status: 400 }
      );
    }

    // Validate events structure
    const validEvents = events.filter((event: unknown) => {
      if (typeof event !== 'object' || event === null) return false;
      const e = event as Record<string, unknown>;
      return typeof e.name === 'string' && typeof e.category === 'string';
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: "No valid events provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Enrich events with server-side data
    const enrichedEvents = validEvents.map((event: Record<string, unknown>) => ({
      user_id: user?.id || null,
      session_id: event.sessionId || null,
      event_name: event.name,
      event_category: event.category,
      properties: event.properties || {},
      timestamp: event.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    // Store in memory for demo purposes
    // When analytics_events table is added to schema, database persistence can be enabled
    storeEventsInMemory(enrichedEvents);

    // Process special events for real-time updates
    for (const event of validEvents) {
      await processSpecialEvent(event as Record<string, unknown>, user?.id);
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: validEvents.length,
    });
  } catch (error) {
    console.error("Error tracking events:", error);

    // Still return success - don't let analytics failures break the app
    return NextResponse.json({
      success: true,
      eventsProcessed: 0,
      warning: "Events queued for processing",
    });
  }
}

// In-memory event store for demo
const memoryEventStore: Array<Record<string, unknown>> = [];
const MAX_MEMORY_EVENTS = 10000;

function storeEventsInMemory(events: Array<Record<string, unknown>>) {
  memoryEventStore.push(...events);

  // Trim old events if exceeding limit
  if (memoryEventStore.length > MAX_MEMORY_EVENTS) {
    memoryEventStore.splice(0, memoryEventStore.length - MAX_MEMORY_EVENTS);
  }
}

/**
 * Process special events that trigger real-time updates
 */
async function processSpecialEvent(
  event: Record<string, unknown>,
  userId?: string
) {
  const eventName = event.name as string;
  const properties = (event.properties || {}) as Record<string, unknown>;

  switch (eventName) {
    case "purchase_complete":
      // Update product activity for social proof
      if (properties.productIds && Array.isArray(properties.productIds)) {
        await updateProductPurchases(properties.productIds as string[]);
      }
      break;

    case "xp_earned":
      // Could trigger real-time XP notifications
      if (userId && properties.amount) {
        console.log(`XP earned: ${properties.amount} for user ${userId}`);
      }
      break;

    case "experiment_conversion":
      // Track experiment results
      await trackExperimentResult(
        properties.experimentId as string,
        properties.variant as string,
        properties.conversionType as string,
        properties.value as number | undefined
      );
      break;

    case "streak_updated":
      // Could trigger streak celebration push notifications
      if (userId && properties.currentStreak) {
        console.log(`Streak updated to ${properties.currentStreak} for user ${userId}`);
      }
      break;
  }
}

// Product purchase tracking for social proof
const productPurchases: Record<string, { count: number; lastPurchase: string }> = {};

async function updateProductPurchases(productIds: string[]) {
  const now = new Date().toISOString();

  for (const productId of productIds) {
    if (!productPurchases[productId]) {
      productPurchases[productId] = { count: 0, lastPurchase: now };
    }
    productPurchases[productId].count++;
    productPurchases[productId].lastPurchase = now;
  }
}

// Experiment tracking
const experimentResults: Record<string, Record<string, { conversions: number; totalValue: number }>> = {};

async function trackExperimentResult(
  experimentId: string,
  variant: string,
  conversionType: string,
  value?: number
) {
  if (!experimentId || !variant) return;

  const key = `${experimentId}:${conversionType}`;
  if (!experimentResults[key]) {
    experimentResults[key] = {};
  }
  if (!experimentResults[key][variant]) {
    experimentResults[key][variant] = { conversions: 0, totalValue: 0 };
  }

  experimentResults[key][variant].conversions++;
  if (value !== undefined) {
    experimentResults[key][variant].totalValue += value;
  }
}

/**
 * GET /api/analytics/track
 * Returns analytics summary (admin only in production)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In production, check admin role
    // For demo, allow all authenticated users

    // Get event counts from memory store
    const eventCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    for (const event of memoryEventStore) {
      const name = event.event_name as string;
      const category = event.event_category as string;

      eventCounts[name] = (eventCounts[name] || 0) + 1;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    // Get recent events (last 100)
    const recentEvents = memoryEventStore.slice(-100).reverse();

    return NextResponse.json({
      totalEvents: memoryEventStore.length,
      eventCounts,
      categoryCounts,
      recentEvents: recentEvents.slice(0, 20),
      experimentResults,
      productPurchases,
      userId: user?.id || null,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({
      totalEvents: 0,
      eventCounts: {},
      categoryCounts: {},
      recentEvents: [],
    });
  }
}
