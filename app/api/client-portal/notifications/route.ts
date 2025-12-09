import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getNotifications,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  createNotification,
  NotificationType,
} from "@/lib/db/notifications";

// GET /api/client-portal/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type") as NotificationType | null;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query persistent notifications from database
    const result = await getNotifications(email, {
      limit,
      offset,
      unreadOnly,
      type: type || undefined,
    });

    return NextResponse.json({
      success: true,
      notifications: result.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.created_at,
        readAt: n.read_at,
        actionUrl: n.action_url,
        metadata: n.metadata,
      })),
      total: result.total,
      unreadCount: result.unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total,
      },
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/client-portal/notifications - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, notificationIds, markAll } = body;

    let updatedCount = 0;

    if (markAll) {
      // Mark all notifications as read
      updatedCount = await markAllAsRead(user.email);
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark multiple notifications as read
      updatedCount = await markMultipleAsRead(notificationIds, user.email);
    } else if (notificationId) {
      // Mark single notification as read
      const success = await markAsRead(notificationId, user.email);
      updatedCount = success ? 1 : 0;
    } else {
      return NextResponse.json(
        { error: "notificationId, notificationIds, or markAll required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/client-portal/notifications - Create a notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, actionUrl, metadata } = body;

    // Validate notification type
    const validTypes: NotificationType[] = [
      "booking",
      "document",
      "payment",
      "message",
      "system",
      "achievement",
      "xp",
      "streak",
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      userEmail: user.email,
      userId: user.id,
      type,
      title,
      message,
      actionUrl,
      metadata,
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.created_at,
        actionUrl: notification.action_url,
        metadata: notification.metadata,
      },
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/client-portal/notifications - Soft delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get("id");
    const notificationIds = searchParams.get("ids")?.split(",").filter(Boolean);

    let deletedCount = 0;

    if (notificationIds && notificationIds.length > 0) {
      // Delete multiple notifications
      deletedCount = await deleteMultipleNotifications(notificationIds, user.email);
    } else if (notificationId) {
      // Delete single notification
      const success = await deleteNotification(notificationId, user.email);
      deletedCount = success ? 1 : 0;
    } else {
      return NextResponse.json(
        { error: "id or ids query parameter required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
