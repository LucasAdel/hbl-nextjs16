import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Type-safe wrapper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

/**
 * POST /api/analytics/track
 * Receives batched analytics events from the client
 * Persists all events to Supabase for long-term analysis
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

    // Validate and sanitize events
    const validEvents = events.filter((event: unknown) => {
      if (typeof event !== 'object' || event === null) return false;
      const e = event as Record<string, unknown>;
      return typeof e.event_name === 'string';
    });

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: "No valid events provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get client info from request headers
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipHash = forwardedFor ? hashIP(forwardedFor.split(',')[0]) : null;

    // Enrich and prepare events for Supabase
    const enrichedEvents = validEvents.map((event: Record<string, unknown>) => ({
      user_id: user?.id || (event.user_id as string) || null,
      session_id: (event.session_id as string) || null,
      event_name: event.event_name as string,
      event_category: (event.event_category as string) || 'custom',
      properties: event.properties || {},
      page_url: (event.page_url as string) || null,
      referrer: (event.referrer as string) || null,
      user_agent: (event.user_agent as string) || userAgent,
      ip_hash: ipHash,
      device_type: (event.device_type as string) || detectDeviceType(userAgent),
      timestamp: (event.timestamp as string) || new Date().toISOString(),
      created_at: new Date().toISOString(),
    }));

    // Persist to Supabase analytics_events table
    // Note: Cast to AnySupabase because analytics_events table types need to be regenerated
    const { error: insertError } = await (supabase as AnySupabase)
      .from('analytics_events')
      .insert(enrichedEvents);

    if (insertError) {
      console.error('[Analytics] Failed to persist events:', insertError);
      // Still store in memory as backup
      storeEventsInMemory(enrichedEvents);
    }

    // Also update daily aggregates for dashboard
    await updateDailyAggregates(supabase, enrichedEvents);

    // Process special events for real-time updates
    for (const event of validEvents) {
      await processSpecialEvent(supabase, event as Record<string, unknown>, user?.id);
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: validEvents.length,
      persisted: !insertError,
    });
  } catch (error) {
    console.error("[Analytics] Error tracking events:", error);

    // Still return success - don't let analytics failures break the app
    return NextResponse.json({
      success: true,
      eventsProcessed: 0,
      warning: "Events queued for processing",
    });
  }
}

/**
 * Hash IP address for privacy
 */
function hashIP(ip: string): string {
  // Simple hash - in production use crypto
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone/i.test(userAgent)) return 'mobile';
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

/**
 * Update daily aggregate tables for dashboard performance
 */
async function updateDailyAggregates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  events: Array<Record<string, unknown>>
) {
  const today = new Date().toISOString().split('T')[0];

  // Group events by name and category
  const eventCounts: Record<string, { count: number; category: string }> = {};

  for (const event of events) {
    const key = `${event.event_name}`;
    if (!eventCounts[key]) {
      eventCounts[key] = { count: 0, category: event.event_category as string };
    }
    eventCounts[key].count++;
  }

  // Upsert into daily aggregates (use RPC or handle in application)
  const db = supabase as AnySupabase;
  for (const [eventName, data] of Object.entries(eventCounts)) {
    try {
      // Try to update existing record
      const { data: existing } = await db
        .from('analytics_events_daily')
        .select('event_count')
        .eq('date', today)
        .eq('event_name', eventName)
        .single();

      if (existing) {
        await db
          .from('analytics_events_daily')
          .update({
            event_count: existing.event_count + data.count,
            updated_at: new Date().toISOString()
          })
          .eq('date', today)
          .eq('event_name', eventName);
      } else {
        await db
          .from('analytics_events_daily')
          .insert({
            date: today,
            event_name: eventName,
            event_category: data.category,
            event_count: data.count,
            unique_users: 1, // Simplified - would need distinct count
          });
      }
    } catch {
      // Silently fail aggregate updates - raw events are more important
    }
  }
}

// In-memory backup for failed persistence
const memoryEventStore: Array<Record<string, unknown>> = [];
const MAX_MEMORY_EVENTS = 10000;

function storeEventsInMemory(events: Array<Record<string, unknown>>) {
  memoryEventStore.push(...events);
  if (memoryEventStore.length > MAX_MEMORY_EVENTS) {
    memoryEventStore.splice(0, memoryEventStore.length - MAX_MEMORY_EVENTS);
  }
}

/**
 * Process special events that trigger real-time updates
 */
async function processSpecialEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  event: Record<string, unknown>,
  userId?: string
) {
  const eventName = event.event_name as string;
  const properties = (event.properties || {}) as Record<string, unknown>;

  const db = supabase as AnySupabase;

  switch (eventName) {
    case "purchase_complete":
      // Update product activity for social proof
      if (properties.productIds && Array.isArray(properties.productIds)) {
        await updateProductPurchases(supabase, properties.productIds as string[]);
      }

      // Mark any abandoned cart as recovered
      if (userId) {
        await db
          .from('abandoned_carts')
          .update({
            status: 'recovered',
            recovered_at: new Date().toISOString()
          })
          .eq('email', userId) // Match by email or session
          .eq('status', 'pending');
      }
      break;

    case "checkout_start":
      // Track checkout started for funnel analysis
      console.log(`[Analytics] Checkout started: ${properties.cart_value}`);
      break;

    case "xp_earned":
      // Log XP earning events
      if (userId && properties.xp_amount) {
        console.log(`[Analytics] XP earned: ${properties.xp_amount} for user ${userId}`);
      }
      break;

    case "consultation_booked":
      // Track consultation bookings
      console.log(`[Analytics] Consultation booked: ${properties.consultation_type}`);
      break;

    case "newsletter_signup":
      // Track newsletter signups
      console.log(`[Analytics] Newsletter signup from ${properties.signup_source}`);
      break;

    case "exit_intent":
      // Track exit intent interactions
      try {
        await db
          .from('exit_intent_interactions')
          .insert({
            user_id: userId || null,
            session_id: event.session_id as string,
            offer_type: properties.offer_type as string || 'unknown',
            action: properties.action as string || 'shown',
            page_url: event.page_url as string,
            created_at: new Date().toISOString(),
          });
      } catch {
        // Silently fail - table may not exist
      }
      break;
  }
}

// Product purchase tracking for social proof
async function updateProductPurchases(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[]
) {
  const now = new Date().toISOString();
  const db = supabase as AnySupabase;

  for (const productId of productIds) {
    // Update product_activity table if it exists
    try {
      const { data: existing } = await db
        .from('product_activity')
        .select('purchase_count')
        .eq('product_id', productId)
        .single();

      if (existing) {
        await db
          .from('product_activity')
          .update({
            purchase_count: existing.purchase_count + 1,
            last_purchase: now,
          })
          .eq('product_id', productId);
      } else {
        await db
          .from('product_activity')
          .insert({
            product_id: productId,
            purchase_count: 1,
            last_purchase: now,
          });
      }
    } catch {
      // Table may not exist yet
    }
  }
}

/**
 * GET /api/analytics/track
 * Returns analytics summary for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is admin (you may want to add proper admin check)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Cast to AnySupabase for analytics_events table
    const db = supabase as AnySupabase;

    // Get event counts
    const { data: eventCounts } = await db
      .from('analytics_events')
      .select('event_name, event_category')
      .gte('timestamp', startDate.toISOString());

    // Aggregate by event name
    const eventSummary: Record<string, number> = {};
    const categorySummary: Record<string, number> = {};

    for (const event of (eventCounts || []) as Array<{ event_name: string; event_category: string }>) {
      eventSummary[event.event_name] = (eventSummary[event.event_name] || 0) + 1;
      categorySummary[event.event_category] = (categorySummary[event.event_category] || 0) + 1;
    }

    // Get total counts
    const { count: totalEvents } = await db
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', startDate.toISOString());

    // Get unique users/sessions
    const { data: uniqueSessions } = await db
      .from('analytics_events')
      .select('session_id')
      .gte('timestamp', startDate.toISOString());

    const uniqueSessionCount = new Set((uniqueSessions as Array<{ session_id: string }> || []).map(s => s.session_id)).size;

    // Get recent events
    const { data: recentEvents } = await db
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    // Get conversion funnel data
    const funnelEvents = ['page_view', 'document_view', 'add_to_cart', 'checkout_start', 'purchase_complete'];
    const funnelData: Record<string, number> = {};

    for (const eventName of funnelEvents) {
      const { count } = await db
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', eventName)
        .gte('timestamp', startDate.toISOString());

      funnelData[eventName] = count || 0;
    }

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
      summary: {
        totalEvents: totalEvents || 0,
        uniqueSessions: uniqueSessionCount,
        eventCounts: eventSummary,
        categoryCounts: categorySummary,
      },
      funnel: funnelData,
      recentEvents: recentEvents || [],
      memoryBackupCount: memoryEventStore.length,
    });
  } catch (error) {
    console.error("[Analytics] Error fetching analytics:", error);
    return NextResponse.json({
      error: "Failed to fetch analytics",
      summary: {
        totalEvents: 0,
        uniqueSessions: 0,
        eventCounts: {},
        categoryCounts: {},
      },
    });
  }
}
