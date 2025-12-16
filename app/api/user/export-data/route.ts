/**
 * User Data Export API (GDPR Right to Data Portability)
 *
 * Allows authenticated users to export all their personal data
 * in a machine-readable format (JSON).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.withRequest(requestId, "/api/user/export-data");

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn("Unauthorized data export attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    log.info("Starting user data export", { userId: user.id, email: user.email });

    const userEmail = user.email ?? "";

    // Step 1: Get user's chat conversations (has user_id column)
    const chatConversationsResult = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id);

    // Step 2: Get chat messages via conversation IDs (no direct user_id)
    const conversationIds = chatConversationsResult.data?.map((c) => c.id) || [];
    const chatMessagesResult = conversationIds.length > 0
      ? await supabase
          .from("chat_messages")
          .select("*")
          .in("conversation_id", conversationIds)
      : { data: [] };

    /**
     * Step 3: Get bookings and contact submissions by email
     *
     * Booking System: advanced_bookings (production system with payment integration)
     * See: /docs/BOOKING_SYSTEM_ARCHITECTURE.md
     */
    const [advancedBookingsResult, contactSubmissionsResult] = await Promise.all([
      supabase.from("advanced_bookings").select("*").eq("client_email", userEmail),
      supabase.from("contact_submissions").select("*").eq("email", userEmail),
    ]);

    // Note: bailey_conversations uses session_id (not user_id), so we skip it
    // Those conversations are tied to browser sessions, not authenticated users

    // Build comprehensive user data export
    const userData = {
      export_info: {
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        request_id: requestId,
      },
      user_profile: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        email_confirmed: user.email_confirmed_at,
      },
      chat_conversations: chatConversationsResult.data || [],
      chat_messages: chatMessagesResult.data || [],
      advanced_bookings: advancedBookingsResult.data || [],
      contact_submissions: contactSubmissionsResult.data || [],
      data_retention_policy: {
        conversations: "12 months for authenticated users, 30 days for anonymous",
        bookings: "7 years (Australian legal requirement)",
        contact_submissions: "24 months",
      },
    };

    log.info("User data export completed", {
      userId: user.id,
      chatConversationsCount: chatConversationsResult.data?.length || 0,
      chatMessagesCount: chatMessagesResult.data?.length || 0,
      advancedBookingsCount: advancedBookingsResult.data?.length || 0,
    });

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="my-data-${user.id.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.json"`,
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    log.error("Data export failed", error);
    return NextResponse.json(
      { error: "Failed to export data. Please try again later." },
      { status: 500 }
    );
  }
}
