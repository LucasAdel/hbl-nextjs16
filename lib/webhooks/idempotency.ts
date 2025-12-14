/**
 * Webhook Idempotency Utility
 *
 * Prevents duplicate processing of webhook events by tracking
 * processed event IDs in the database.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export type WebhookProvider = "stripe" | "resend" | "twilio" | "xero";

interface IdempotencyResult {
  isNew: boolean;
  previousStatus?: "processed" | "failed" | "skipped";
}

/**
 * Check if a webhook event has already been processed
 *
 * @param provider - The webhook provider (e.g., 'stripe', 'resend')
 * @param eventId - The unique event ID from the provider
 * @returns Object indicating if event is new or was previously processed
 *
 * @example
 * ```typescript
 * const { isNew } = await checkWebhookIdempotency('stripe', event.id);
 * if (!isNew) {
 *   console.log('Event already processed, skipping');
 *   return NextResponse.json({ received: true });
 * }
 * ```
 */
export async function checkWebhookIdempotency(
  provider: WebhookProvider,
  eventId: string
): Promise<IdempotencyResult> {
  const supabase = createServiceRoleClient();

  // Check if event already exists
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("status")
    .eq("provider", provider)
    .eq("event_id", eventId)
    .single();

  if (existing) {
    return {
      isNew: false,
      previousStatus: existing.status as "processed" | "failed" | "skipped",
    };
  }

  return { isNew: true };
}

/**
 * Mark a webhook event as processed
 *
 * @param provider - The webhook provider
 * @param eventId - The unique event ID
 * @param eventType - The type of event (e.g., 'checkout.session.completed')
 * @param status - Processing status
 * @param metadata - Optional metadata to store
 */
export async function markWebhookProcessed(
  provider: WebhookProvider,
  eventId: string,
  eventType: string,
  status: "processed" | "failed" | "skipped" = "processed",
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase.from("webhook_events").upsert(
    {
      provider,
      event_id: eventId,
      event_type: eventType,
      status,
      metadata: (metadata || {}) as unknown as Json,
      processed_at: new Date().toISOString(),
    },
    {
      onConflict: "provider,event_id",
    }
  );
}

/**
 * Wrapper for processing webhooks with idempotency
 *
 * @param provider - The webhook provider
 * @param eventId - The unique event ID
 * @param eventType - The type of event
 * @param processor - Async function to process the event
 * @returns Result indicating if event was processed or skipped
 *
 * @example
 * ```typescript
 * const result = await processWebhookIdempotent(
 *   'stripe',
 *   event.id,
 *   event.type,
 *   async () => {
 *     await handleCheckoutComplete(session);
 *   }
 * );
 * ```
 */
export async function processWebhookIdempotent(
  provider: WebhookProvider,
  eventId: string,
  eventType: string,
  processor: () => Promise<void>
): Promise<{ processed: boolean; status: "new" | "duplicate" | "failed" }> {
  // Check if already processed
  const { isNew, previousStatus } = await checkWebhookIdempotency(
    provider,
    eventId
  );

  if (!isNew) {
    console.log(
      `[Webhook] Duplicate ${provider} event ${eventId} (previously: ${previousStatus}), skipping`
    );
    return { processed: false, status: "duplicate" };
  }

  try {
    // Process the event
    await processor();

    // Mark as processed
    await markWebhookProcessed(provider, eventId, eventType, "processed");

    return { processed: true, status: "new" };
  } catch (error) {
    // Mark as failed for debugging but allow retry
    await markWebhookProcessed(provider, eventId, eventType, "failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Re-throw to let the webhook handler return appropriate status
    throw error;
  }
}
