import { NextRequest, NextResponse } from "next/server";
import {
  getConversationWithMessages,
  updateConversation,
  deleteConversation,
} from "@/lib/supabase/conversations";
import { requireAdminAuth } from "@/lib/auth/admin-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/conversations/[id]
 * Get conversation details with all messages
 * SECURITY: Requires admin authentication
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  // SECURITY: Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const conversation = await getConversationWithMessages(id);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/conversations/[id]
 * Update conversation metadata (lead score, status, satisfaction)
 * SECURITY: Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  // SECURITY: Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, leadScore, leadCategory, satisfactionRating, metadata } = body;

    // Build updates object
    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!["active", "completed", "abandoned"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = status;
      if (status === "completed") {
        updates.ended_at = new Date().toISOString();
      }
    }

    if (leadScore !== undefined) {
      if (typeof leadScore !== "number" || leadScore < 0 || leadScore > 100) {
        return NextResponse.json(
          { success: false, error: "Lead score must be between 0 and 100" },
          { status: 400 }
        );
      }
      updates.lead_score = leadScore;
    }

    if (leadCategory !== undefined) {
      if (!["hot", "warm", "cold", null].includes(leadCategory)) {
        return NextResponse.json(
          { success: false, error: "Invalid lead category" },
          { status: 400 }
        );
      }
      updates.lead_category = leadCategory;
    }

    if (satisfactionRating !== undefined) {
      if (
        satisfactionRating !== null &&
        (typeof satisfactionRating !== "number" ||
          satisfactionRating < 1 ||
          satisfactionRating > 5)
      ) {
        return NextResponse.json(
          { success: false, error: "Satisfaction rating must be between 1 and 5" },
          { status: 400 }
        );
      }
      updates.satisfaction_rating = satisfactionRating;
    }

    if (metadata !== undefined) {
      updates.metadata = metadata;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const success = await updateConversation(id, updates);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to update conversation" },
        { status: 500 }
      );
    }

    // Fetch updated conversation
    const updated = await getConversationWithMessages(id);

    return NextResponse.json({
      success: true,
      conversation: updated,
      message: "Conversation updated successfully",
    });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/conversations/[id]
 * Delete a conversation and all its messages
 * SECURITY: Requires admin authentication
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  // SECURITY: Verify admin authentication
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteConversation(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
