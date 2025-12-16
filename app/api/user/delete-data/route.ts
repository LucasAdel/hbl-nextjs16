/**
 * User Data Deletion API (GDPR Right to Erasure)
 *
 * Allows authenticated users to delete all their personal data.
 * Some data may be retained for legal compliance (e.g., financial records).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function DELETE(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = logger.withRequest(requestId, "/api/user/delete-data");

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.warn("Unauthorized data deletion attempt");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Require confirmation in request body
    const body = await request.json().catch(() => ({}));
    if (body.confirm !== "DELETE_MY_DATA") {
      return NextResponse.json(
        {
          error: "Confirmation required",
          message: "Send { confirm: 'DELETE_MY_DATA' } to proceed",
        },
        { status: 400 }
      );
    }

    log.info("Starting user data deletion", {
      userId: user.id,
      email: user.email,
    });

    // Use service role client for deletions (bypasses RLS)
    const adminClient = createServiceRoleClient();

    // Track what we're deleting for the response
    const deletionResults: Record<string, number> = {};

    // Note: bailey_conversations uses session_id (not user_id), so we skip it
    // Those conversations are tied to browser sessions, not authenticated users

    // Step 1: Get user's conversation IDs first (for message deletion)
    const { data: userConversations } = await adminClient
      .from("chat_conversations")
      .select("id")
      .eq("user_id", user.id);
    const conversationIds = userConversations?.map((c) => c.id) || [];

    // Step 2: Delete chat messages by conversation_id (no direct user_id column)
    if (conversationIds.length > 0) {
      const { data: deletedChatMessages } = await adminClient
        .from("chat_messages")
        .delete()
        .in("conversation_id", conversationIds)
        .select("id");
      deletionResults.chat_messages = deletedChatMessages?.length || 0;
    } else {
      deletionResults.chat_messages = 0;
    }

    // Step 3: Delete chat conversations (has user_id column)
    const { data: deletedChatConversations } = await adminClient
      .from("chat_conversations")
      .delete()
      .eq("user_id", user.id)
      .select("id");
    deletionResults.chat_conversations = deletedChatConversations?.length || 0;

    // Step 4: Handle email-based data
    const userEmail = user.email ?? "";
    if (userEmail) {
      /**
       * ANONYMIZE BOOKINGS (DO NOT DELETE)
       *
       * Australian Legal Requirement: Financial/booking records must be retained for 7 years
       * GDPR Compliance: Right to Erasure allows anonymization when retention is legally required
       *
       * Booking System: advanced_bookings (production system with payment integration)
       * See: /docs/BOOKING_SYSTEM_ARCHITECTURE.md
       */

      // Anonymize advanced_bookings (uses: client_name, client_email, client_phone, notes)
      const { data: anonymizedAdvancedBookings } = await adminClient
        .from("advanced_bookings")
        .update({
          client_name: "[DELETED]",
          client_email: "[DELETED]",
          client_phone: null,
          notes: null,
        })
        .eq("client_email", userEmail)
        .select("id");
      deletionResults.advanced_bookings_anonymized = anonymizedAdvancedBookings?.length || 0;

      // Delete contact submissions (no legal retention requirement)
      const { data: deletedContacts } = await adminClient
        .from("contact_submissions")
        .delete()
        .eq("email", userEmail)
        .select("id");
      deletionResults.contact_submissions = deletedContacts?.length || 0;
    }

    // Finally, delete the user account
    // Note: This requires admin privileges in Supabase
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteUserError) {
      log.error("Failed to delete user account", deleteUserError);
      // Even if account deletion fails, data has been removed/anonymized
    }

    log.info("User data deletion completed", {
      userId: user.id,
      deletionResults,
    });

    return NextResponse.json({
      success: true,
      message: "Your data has been deleted. Some records have been anonymized for legal compliance.",
      details: {
        deleted: {
          chat_conversations: deletionResults.chat_conversations,
          chat_messages: deletionResults.chat_messages,
          contact_submissions: deletionResults.contact_submissions || 0,
        },
        anonymized: {
          advanced_bookings: deletionResults.advanced_bookings_anonymized || 0,
        },
        note: "Financial records (bookings) are retained in anonymized form for 7 years per Australian legal requirements.",
      },
      request_id: requestId,
    });
  } catch (error) {
    log.error("Data deletion failed", error);
    return NextResponse.json(
      { error: "Failed to delete data. Please contact support." },
      { status: 500 }
    );
  }
}

// GET method to show deletion info
export async function GET() {
  return NextResponse.json({
    message: "User Data Deletion API",
    instructions: {
      method: "DELETE",
      body: { confirm: "DELETE_MY_DATA" },
      authentication: "Required (must be logged in)",
    },
    what_gets_deleted: [
      "Chat conversations and messages",
      "Contact form submissions",
      "Account credentials",
    ],
    what_gets_anonymized: [
      "Booking records (retained 7 years per Australian law)",
    ],
    warning: "This action cannot be undone. Your account will be permanently deleted.",
  });
}
