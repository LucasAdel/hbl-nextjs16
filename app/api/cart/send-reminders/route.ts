import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Reminder intervals in hours
const REMINDER_INTERVALS = {
  1: 1,    // First reminder after 1 hour
  2: 24,   // Second reminder after 24 hours
  3: 72,   // Third reminder after 72 hours (3 days)
};

const MAX_REMINDERS = 3;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  stage?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job or authorized source
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all pending abandoned carts
    const { data: abandonedCarts, error: fetchError } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("status", "pending")
      .lt("reminder_count", MAX_REMINDERS);

    if (fetchError) {
      console.error("Error fetching abandoned carts:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch carts" },
        { status: 500 }
      );
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return NextResponse.json({ message: "No carts to process", sent: 0 });
    }

    let sentCount = 0;
    const now = new Date();

    for (const cart of abandonedCarts) {
      const nextReminderNumber = cart.reminder_count + 1;
      const hoursRequired = REMINDER_INTERVALS[nextReminderNumber as keyof typeof REMINDER_INTERVALS];

      if (!hoursRequired) continue;

      const lastActivity = new Date(cart.last_reminder_at || cart.created_at);
      const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastActivity >= hoursRequired) {
        // Parse cart items
        let items: CartItem[] = [];
        try {
          items = JSON.parse(cart.items);
        } catch {
          console.error("Failed to parse cart items for cart:", cart.id);
          continue;
        }

        // Send reminder email
        const emailSent = await sendReminderEmail(
          cart.email,
          items,
          cart.total_value,
          nextReminderNumber,
          cart.id
        );

        if (emailSent) {
          // Update reminder count and timestamp
          await supabase
            .from("abandoned_carts")
            .update({
              reminder_count: nextReminderNumber,
              last_reminder_at: now.toISOString(),
              status: nextReminderNumber >= MAX_REMINDERS ? "expired" : "pending",
            })
            .eq("id", cart.id);

          sentCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${abandonedCarts.length} carts, sent ${sentCount} reminders`,
      sent: sentCount,
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

async function sendReminderEmail(
  email: string,
  items: CartItem[],
  totalValue: number,
  reminderNumber: number,
  cartId: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return false;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au";
  const cartUrl = `${baseUrl}/documents?cart=restore&id=${cartId}`;

  // Different subject lines for each reminder
  const subjects: Record<number, string> = {
    1: "You left something behind - Complete your legal document purchase",
    2: "Still interested? Your legal documents are waiting",
    3: "Last chance: Your cart will expire soon",
  };

  // Different messages for each reminder
  const messages: Record<number, { heading: string; message: string }> = {
    1: {
      heading: "You Left Items in Your Cart",
      message: "We noticed you were browsing our legal documents. Your selected items are still waiting for you.",
    },
    2: {
      heading: "Your Legal Documents Are Still Available",
      message: "Just a friendly reminder that the professional legal documents you selected are ready for purchase. Don't miss out on protecting your practice.",
    },
    3: {
      heading: "Last Chance - Cart Expiring Soon",
      message: "This is your final reminder. Your cart will expire soon, and you'll need to re-select your documents. Complete your purchase now to secure these important legal protections.",
    },
  };

  const content = messages[reminderNumber];

  try {
    await resend.emails.send({
      from: "Hamilton Bailey Law <documents@hamiltonbaileylaw.com.au>",
      to: [email],
      subject: subjects[reminderNumber],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #40E0D0, #2AAFA2); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Hamilton Bailey Law</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Legal Services for Medical Practitioners</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px;">${content.heading}</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px;">
                ${content.message}
              </p>

              <!-- Cart Items -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px;">Your Cart Items:</h3>
                ${items.map(item => `
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <div>
                      <p style="color: #1f2937; margin: 0; font-weight: 500;">${item.name}</p>
                      ${item.stage ? `<p style="color: #6b7280; margin: 4px 0 0; font-size: 14px;">${item.stage}</p>` : ''}
                    </div>
                    <p style="color: #1f2937; margin: 0; font-weight: 600;">${formatCurrency(item.price)}</p>
                  </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding-top: 15px; margin-top: 5px;">
                  <p style="color: #1f2937; margin: 0; font-weight: 700; font-size: 18px;">Total</p>
                  <p style="color: #40E0D0; margin: 0; font-weight: 700; font-size: 18px;">${formatCurrency(totalValue)}</p>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${cartUrl}" style="display: inline-block; background: #40E0D0; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Complete Your Purchase
                </a>
              </div>

              ${reminderNumber === 3 ? `
                <p style="color: #ef4444; text-align: center; margin-top: 20px; font-size: 14px;">
                  ⚠️ Your cart will expire in 24 hours
                </p>
              ` : ''}

              <!-- Value Proposition -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px;">Why Choose Hamilton Bailey?</h3>
                <ul style="color: #4b5563; padding-left: 20px; line-height: 1.8;">
                  <li>14+ years specialising in medical practice law</li>
                  <li>340+ medical practices supported</li>
                  <li>Lawyer-drafted documents tailored for healthcare</li>
                  <li>Australian law compliant and regularly updated</li>
                </ul>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #1f2937; padding: 30px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 10px; font-size: 14px;">
                Hamilton Bailey Law | Level 1, 123 King William Street, Adelaide SA 5000
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a> from cart reminders
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending reminder email:", error);
    return false;
  }
}
