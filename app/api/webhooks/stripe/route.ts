import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  notifyPaymentReceived,
  notifyDocumentPurchased,
  notifyXPEarned,
  notifyAchievementUnlocked,
} from "@/lib/notifications/notification-triggers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Helper to get untyped access for new tables not yet in types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(supabase: SupabaseClient): any {
  return supabase;
}

// XP rewards for purchases
const PURCHASE_XP = {
  basePerDollar: 10, // 10 XP per dollar spent
  firstPurchaseBonus: 500, // First purchase bonus
  bundleMultiplier: 3, // 3x XP for bundles
  referralBonus: 100, // Bonus if referred
};

interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isBundle?: boolean;
}

/**
 * Award XP for a purchase
 */
async function awardPurchaseXP(
  supabase: SupabaseClient,
  email: string,
  amount: number,
  isFirstPurchase: boolean,
  hasBundle: boolean,
  sessionId: string
): Promise<number> {
  const db = getUntypedClient(supabase);

  // Calculate base XP (10 XP per dollar)
  let xpAmount = Math.round(amount * PURCHASE_XP.basePerDollar);

  // Apply bundle multiplier
  if (hasBundle) {
    xpAmount = Math.round(xpAmount * PURCHASE_XP.bundleMultiplier);
  }

  // Record base XP transaction
  await db.from("xp_transactions").insert({
    user_email: email,
    amount: xpAmount,
    source: "purchase",
    multiplier: hasBundle ? PURCHASE_XP.bundleMultiplier : 1.0,
    description: `Purchase XP (${hasBundle ? "3x bundle bonus" : "standard"})`,
    metadata: { session_id: sessionId, amount_spent: amount },
  });

  // First purchase bonus
  if (isFirstPurchase) {
    await db.from("xp_transactions").insert({
      user_email: email,
      amount: PURCHASE_XP.firstPurchaseBonus,
      source: "achievement",
      multiplier: 1.0,
      description: "First Purchase Bonus!",
      metadata: { achievement: "first_purchase", session_id: sessionId },
    });
    xpAmount += PURCHASE_XP.firstPurchaseBonus;
  }

  // Update user profile total XP
  const { data: profile } = await db
    .from("user_profiles")
    .select("id, total_xp")
    .eq("email", email)
    .single();

  if (profile) {
    await db
      .from("user_profiles")
      .update({ total_xp: (profile.total_xp || 0) + xpAmount })
      .eq("id", profile.id);
  } else {
    // Create profile if doesn't exist
    await db.from("user_profiles").insert({
      email,
      total_xp: xpAmount,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
    });
  }

  return xpAmount;
}

/**
 * Check if this is the user's first purchase
 */
async function isFirstPurchase(supabase: SupabaseClient, email: string): Promise<boolean> {
  const db = getUntypedClient(supabase);
  const { count } = await db
    .from("document_purchases")
    .select("*", { count: "exact", head: true })
    .eq("user_email", email)
    .eq("status", "completed");

  return (count || 0) === 0;
}

/**
 * Record purchase to database
 */
async function recordPurchase(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[]
): Promise<void> {
  const db = getUntypedClient(supabase);

  const email = session.customer_email || session.metadata?.customerEmail || "";
  const metadata = session.metadata || {};

  // Parse items from line items
  const items: PurchaseItem[] = lineItems.map((item) => ({
    id: item.price?.product?.toString() || item.id,
    name: item.description || "Document",
    price: (item.amount_total || 0) / 100, // Convert from cents
    quantity: item.quantity || 1,
    isBundle: item.description?.toLowerCase().includes("bundle"),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = (session.amount_total || 0) / 100;
  const gst = Math.round((total / 11) * 100) / 100; // Extract GST from total

  await db.from("document_purchases").insert({
    user_email: email,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent?.toString(),
    items: items,
    subtotal: Math.round(subtotal * 100), // Store in cents
    discount: 0,
    gst: Math.round(gst * 100),
    total: Math.round(total * 100),
    coupon_code: metadata.couponCode || null,
    status: "completed",
    metadata: {
      type: metadata.type,
      customer_name: metadata.customerName,
    },
  });
}

/**
 * Update referral status if purchase was from referred user
 */
async function checkReferralPurchase(supabase: SupabaseClient, email: string): Promise<void> {
  const db = getUntypedClient(supabase);

  // Check if user was referred and hasn't purchased before
  const { data: referral } = await db
    .from("referrals")
    .select("id, referrer_email, status")
    .eq("referred_email", email)
    .eq("status", "signed_up")
    .single();

  if (referral) {
    // Update referral to purchased
    await db
      .from("referrals")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
        purchase_xp_awarded: 500,
      })
      .eq("id", referral.id);

    // Award referrer XP
    await db.from("xp_transactions").insert({
      user_email: referral.referrer_email,
      amount: 500,
      source: "referral",
      multiplier: 1.0,
      description: "Referral made a purchase!",
      metadata: { referred_email: email },
    });

    // Update referrer's total XP
    const { data: referrerProfile } = await db
      .from("user_profiles")
      .select("id, total_xp")
      .eq("email", referral.referrer_email)
      .single();

    if (referrerProfile) {
      await db
        .from("user_profiles")
        .update({ total_xp: (referrerProfile.total_xp || 0) + 500 })
        .eq("id", referrerProfile.id);
    }
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const supabase = createServiceRoleClient();

  const email = session.customer_email || session.metadata?.customerEmail || "";
  const purchaseType = session.metadata?.type || "document";

  if (!email) {
    console.error("No customer email in session:", session.id);
    return;
  }

  // Only process document purchases
  if (purchaseType !== "document") {
    console.log("Skipping non-document purchase:", purchaseType);
    return;
  }

  // Get line items
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

  // Check if first purchase
  const firstPurchase = await isFirstPurchase(supabase, email);

  // Check for bundle in items
  const hasBundle = lineItems.data.some(
    (item) => item.description?.toLowerCase().includes("bundle")
  );

  // Record purchase
  await recordPurchase(supabase, session, lineItems.data);

  // Award XP
  const totalAmount = (session.amount_total || 0) / 100;
  const xpAwarded = await awardPurchaseXP(
    supabase,
    email,
    totalAmount,
    firstPurchase,
    hasBundle,
    session.id
  );

  // Check referral
  await checkReferralPurchase(supabase, email);

  // Send notifications
  const documentNames = lineItems.data.map(item => item.description || "Document");

  // Payment received notification
  await notifyPaymentReceived(email, {
    amount: Math.round(totalAmount * 100), // Convert to cents
    description: documentNames.length === 1 ? documentNames[0] : `${documentNames.length} documents`,
    paymentId: session.payment_intent?.toString() || session.id,
  });

  // Document purchased notification
  await notifyDocumentPurchased(email, {
    documentNames,
    total: totalAmount,
    purchaseId: session.id,
  });

  // XP earned notification (only for significant amounts)
  if (xpAwarded >= 50) {
    await notifyXPEarned(email, {
      amount: xpAwarded,
      source: "purchase",
      multiplier: hasBundle ? 3 : 1,
    });
  }

  // First purchase achievement notification
  if (firstPurchase) {
    await notifyAchievementUnlocked(email, {
      name: "First Purchase",
      description: "Welcome to the community! You made your first purchase.",
      xpReward: PURCHASE_XP.firstPurchaseBonus,
      badge: "first-purchase",
      achievementId: "first_purchase",
    });
  }

  console.log(`Purchase recorded: ${email}, $${totalAmount}, ${xpAwarded} XP`);
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const supabase = createServiceRoleClient();
  const db = getUntypedClient(supabase);

  const paymentIntent = charge.payment_intent?.toString();

  if (!paymentIntent) {
    console.error("No payment intent in refund:", charge.id);
    return;
  }

  // Update purchase status
  await db
    .from("document_purchases")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent", paymentIntent);

  console.log(`Purchase refunded: ${paymentIntent}`);
}

/**
 * Verify Stripe webhook signature
 */
function verifyWebhook(payload: string, signature: string): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // In development without webhook secret, parse directly
    if (process.env.NODE_ENV === "development") {
      console.warn("No STRIPE_WEBHOOK_SECRET set, skipping signature verification");
      return JSON.parse(payload) as Stripe.Event;
    }
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return null;
  }
}

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    // Verify webhook
    const event = verifyWebhook(payload, signature);

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    console.log(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "payment_intent.succeeded": {
        // Log for debugging, main processing is in checkout.session.completed
        console.log("Payment intent succeeded:", event.data.object.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
