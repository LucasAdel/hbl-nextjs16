import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, renderEmailTemplate } from "@/lib/email-service";
import {
  CartRecoveryEmail1,
  CartRecoveryEmail2,
  CartRecoveryEmail3,
} from "@/lib/email-templates";

/**
 * Cart Recovery Email API
 *
 * Cron-triggered endpoint that processes abandoned carts and sends recovery emails.
 * Uses a 3-email sequence at 1hr, 24hr, and 72hr intervals.
 *
 * Trigger: Netlify Scheduled Functions or external cron (every 15 min)
 */

// Email timing thresholds (in hours)
// Optimized for professional services - respects busy medical practitioner schedules
const EMAIL_THRESHOLDS = {
  first: 4, // 4 hours after abandonment - gives time to finish clinic/surgery
  second: 48, // 48 hours after abandonment - allows deliberation
  third: 168, // 7 days after abandonment - matches professional decision cycle
};

// Cart recovery discount code
const DISCOUNT_CODE = "COMEBACK10";
const DISCOUNT_PERCENT = 10;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCartRow {
  id: string;
  email: string;
  items: string | CartItem[]; // JSONB stored as string or already parsed
  total_value: number;
  session_id: string | null;
  status: "pending" | "recovered" | "expired" | "unsubscribed";
  reminder_count: number;
  last_reminder_at: string | null;
  created_at: string;
}

interface AbandonedCart {
  id: string;
  email: string;
  items: CartItem[];
  total_value: number;
  session_id: string | null;
  status: "pending" | "recovered" | "expired" | "unsubscribed";
  reminder_count: number;
  last_reminder_at: string | null;
  created_at: string;
}

interface ProcessResult {
  cartId: string;
  email: string;
  emailNumber: number;
  success: boolean;
  error?: string;
}

/**
 * POST /api/email/cart-recovery
 * Process abandoned carts and send recovery emails
 *
 * Headers:
 *   - x-cron-secret: Secret token to authorize cron requests (optional but recommended)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const cronSecret = request.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const now = new Date();
    const results: ProcessResult[] = [];

    // Get all pending abandoned carts that need processing
    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "pending")
      .lt("reminder_count", 3)
      .order("created_at", { ascending: true })
      .limit(50); // Process 50 at a time to avoid timeout

    if (error) {
      console.error("Error fetching abandoned carts:", error);
      return NextResponse.json(
        { error: "Failed to fetch abandoned carts" },
        { status: 500 }
      );
    }

    if (!carts || carts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No abandoned carts to process",
        processed: 0,
      });
    }

    // Process each cart - parse items if stored as string
    for (const row of carts as AbandonedCartRow[]) {
      const cart: AbandonedCart = {
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      };
      const result = await processCart(supabase, cart, now);
      if (result) {
        results.push(result);
      }
    }

    // Count successful sends
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} carts: ${successCount} emails sent, ${failCount} failed`,
      processed: results.length,
      sent: successCount,
      failed: failCount,
      details: results,
    });
  } catch (error) {
    console.error("Error processing cart recovery:", error);
    return NextResponse.json(
      { error: "Failed to process cart recovery" },
      { status: 500 }
    );
  }
}

/**
 * Process a single abandoned cart
 */
async function processCart(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cart: AbandonedCart,
  now: Date
): Promise<ProcessResult | null> {
  const cartAge = (now.getTime() - new Date(cart.created_at).getTime()) / (1000 * 60 * 60); // Hours
  const lastReminderAge = cart.last_reminder_at
    ? (now.getTime() - new Date(cart.last_reminder_at).getTime()) / (1000 * 60 * 60)
    : Infinity;

  // Determine which email to send based on reminder_count and time thresholds
  let emailNumber = 0;

  if (cart.reminder_count === 0 && cartAge >= EMAIL_THRESHOLDS.first) {
    emailNumber = 1;
  } else if (cart.reminder_count === 1 && cartAge >= EMAIL_THRESHOLDS.second) {
    emailNumber = 2;
  } else if (cart.reminder_count === 2 && cartAge >= EMAIL_THRESHOLDS.third) {
    emailNumber = 3;
  }

  // Skip if no email should be sent yet
  if (emailNumber === 0) {
    return null;
  }

  // Avoid sending too many emails too quickly (min 1 hour between emails)
  if (lastReminderAge < 1) {
    return null;
  }

  // Check if user has made a purchase (recovery condition)
  const { data: userActions } = await supabase
    .from("user_actions")
    .select("action")
    .eq("email", cart.email)
    .in("action", ["has_purchased", "cart_recovered"])
    .limit(1);

  if (userActions && userActions.length > 0) {
    // User has converted, mark cart as recovered
    await supabase
      .from("abandoned_carts")
      .update({ status: "recovered" })
      .eq("id", cart.id);

    return null;
  }

  // Check if user has unsubscribed
  const { data: unsubscribed } = await supabase
    .from("user_conditions")
    .select("condition")
    .eq("email", cart.email)
    .eq("condition", "unsubscribed")
    .limit(1);

  if (unsubscribed && unsubscribed.length > 0) {
    await supabase
      .from("abandoned_carts")
      .update({ status: "unsubscribed" })
      .eq("id", cart.id);

    return null;
  }

  // Send the appropriate email
  const result = await sendRecoveryEmail(cart, emailNumber);

  // Update cart record
  const updateData: {
    reminder_count: number;
    last_reminder_at: string;
    status?: "pending" | "recovered" | "expired" | "unsubscribed";
  } = {
    reminder_count: emailNumber,
    last_reminder_at: now.toISOString(),
  };

  // Mark as expired after 3rd email
  if (emailNumber === 3) {
    updateData.status = "expired";
  }

  await supabase
    .from("abandoned_carts")
    .update(updateData)
    .eq("id", cart.id);

  // Track email event if we have email sequence system
  if (result.success) {
    await supabase.from("user_actions").insert({
      email: cart.email,
      action: `cart_recovery_email_${emailNumber}_sent`,
      metadata: {
        cartId: cart.id,
        cartValue: cart.total_value,
        itemCount: cart.items.length,
      },
    });
  }

  return {
    cartId: cart.id,
    email: cart.email,
    emailNumber,
    success: result.success,
    error: result.error,
  };
}

/**
 * Send a cart recovery email
 */
async function sendRecoveryEmail(
  cart: AbandonedCart,
  emailNumber: number
): Promise<{ success: boolean; error?: string }> {
  const recoveryUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://hamiltonbailey.com"}/cart?recover=${cart.session_id || cart.id}`;

  const commonProps = {
    cartItems: cart.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    cartTotal: cart.total_value,
    recoveryUrl,
  };

  let html: string;
  let subject: string;

  switch (emailNumber) {
    case 1:
      html = await renderEmailTemplate(
        CartRecoveryEmail1({
          ...commonProps,
          customerName: undefined, // Will use "there" as fallback
        })
      );
      subject = "You Left Something Behind - Your Cart is Waiting";
      break;

    case 2:
      html = await renderEmailTemplate(
        CartRecoveryEmail2({
          ...commonProps,
          customerName: undefined,
          testimonial: {
            quote: "The employment contract templates saved me hours of legal fees and gave me peace of mind knowing everything was covered.",
            author: "Dr. Sarah M.",
            role: "General Practitioner, Adelaide",
          },
        })
      );
      subject = "Still Thinking It Over? Here's Why 700+ Doctors Trust Us";
      break;

    case 3:
      html = await renderEmailTemplate(
        CartRecoveryEmail3({
          ...commonProps,
          customerName: undefined,
          discountCode: DISCOUNT_CODE,
          discountPercent: DISCOUNT_PERCENT,
          expiresIn: "48 hours",
        })
      );
      subject = `Last Chance: ${DISCOUNT_PERCENT}% Off Your Cart - Expires in 48 Hours!`;
      break;

    default:
      return { success: false, error: "Invalid email number" };
  }

  try {
    const result = await sendEmail({
      to: cart.email,
      subject,
      html,
    });

    return { success: result.success, error: result.error };
  } catch (error) {
    console.error(`Error sending cart recovery email ${emailNumber}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/email/cart-recovery
 * Get cart recovery stats and pending carts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Get stats
    if (action === "stats") {
      const [pending, recovered, expired, total] = await Promise.all([
        supabase
          .from("abandoned_carts")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("abandoned_carts")
          .select("id", { count: "exact", head: true })
          .eq("status", "recovered"),
        supabase
          .from("abandoned_carts")
          .select("id", { count: "exact", head: true })
          .eq("status", "expired"),
        supabase
          .from("abandoned_carts")
          .select("id", { count: "exact", head: true }),
      ]);

      const pendingCount = pending.count || 0;
      const recoveredCount = recovered.count || 0;
      const expiredCount = expired.count || 0;
      const totalCount = total.count || 0;

      // Calculate recovery rate
      const completedCount = recoveredCount + expiredCount;
      const recoveryRate = completedCount > 0
        ? Math.round((recoveredCount / completedCount) * 100)
        : 0;

      return NextResponse.json({
        success: true,
        stats: {
          pending: pendingCount,
          recovered: recoveredCount,
          expired: expiredCount,
          total: totalCount,
          recoveryRate: `${recoveryRate}%`,
        },
      });
    }

    // Get pending carts
    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch abandoned carts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pending: carts?.length || 0,
      carts: carts || [],
    });
  } catch (error) {
    console.error("Error fetching cart recovery data:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart recovery data" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/cart-recovery
 * Mark a cart as recovered (when user completes purchase)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, cartId, reason } = body;

    if (!email && !cartId) {
      return NextResponse.json(
        { error: "Email or cart ID is required" },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase
      .from("abandoned_carts")
      .update({ status: reason === "unsubscribe" ? "unsubscribed" : "recovered" });

    if (cartId) {
      query = query.eq("id", cartId);
    } else if (email) {
      query = query.eq("email", email).eq("status", "pending");
    }

    const { error } = await query;

    if (error) {
      console.error("Error marking cart as recovered:", error);
      return NextResponse.json(
        { error: "Failed to update cart status" },
        { status: 500 }
      );
    }

    // Track the recovery action
    if (email) {
      await supabase.from("user_actions").insert({
        email,
        action: reason === "unsubscribe" ? "cart_recovery_unsubscribed" : "cart_recovered",
        metadata: { cartId, reason },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cart marked as " + (reason === "unsubscribe" ? "unsubscribed" : "recovered"),
    });
  } catch (error) {
    console.error("Error processing cart recovery:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
