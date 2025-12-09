/**
 * Notification Database Operations
 * Persistent notifications with read/unread state
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

// ============================================
// INTERFACES
// ============================================

export type NotificationType =
  | "booking"
  | "document"
  | "payment"
  | "message"
  | "system"
  | "achievement"
  | "xp"
  | "streak";

export interface Notification {
  id: string;
  user_id?: string;
  user_email: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
  deleted_at?: string;
}

export interface CreateNotificationInput {
  userEmail: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationQueryOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
  includeDeleted?: boolean;
  type?: NotificationType;
}

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .insert({
      user_id: input.userId,
      user_email: input.userEmail.toLowerCase(),
      type: input.type,
      title: input.title,
      message: input.message,
      action_url: input.actionUrl,
      metadata: input.metadata || {},
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }

  return data;
}

/**
 * Create multiple notifications at once
 */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<Notification[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const records = inputs.map(input => ({
    user_id: input.userId,
    user_email: input.userEmail.toLowerCase(),
    type: input.type,
    title: input.title,
    message: input.message,
    action_url: input.actionUrl,
    metadata: input.metadata || {},
    read: false,
  }));

  const { data, error } = await db
    .from("client_notifications")
    .insert(records)
    .select();

  if (error) {
    console.error("Error creating notifications:", error);
    return [];
  }

  return data || [];
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userEmail: string,
  options: NotificationQueryOptions = {}
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    includeDeleted = false,
    type,
  } = options;

  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Build query
  let query = db
    .from("client_notifications")
    .select("*", { count: "exact" })
    .eq("user_email", userEmail.toLowerCase());

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  if (type) {
    query = query.eq("type", type);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], total: 0, unreadCount: 0 };
  }

  // Get unread count separately
  const unreadCount = await getUnreadCount(userEmail);

  return {
    notifications: data || [],
    total: count || 0,
    unreadCount,
  };
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: string,
  userEmail: string
): Promise<Notification | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .select("*")
    .eq("id", notificationId)
    .eq("user_email", userEmail.toLowerCase())
    .single();

  if (error) {
    console.error("Error fetching notification:", error);
    return null;
  }

  return data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userEmail: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { count, error } = await db
    .from("client_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_email", userEmail.toLowerCase())
    .eq("read", false)
    .is("deleted_at", null);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Mark a single notification as read
 */
export async function markAsRead(
  notificationId: string,
  userEmail: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("client_notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_email", userEmail.toLowerCase());

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

/**
 * Mark multiple notifications as read
 */
export async function markMultipleAsRead(
  notificationIds: string[],
  userEmail: string
): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .in("id", notificationIds)
    .eq("user_email", userEmail.toLowerCase())
    .select();

  if (error) {
    console.error("Error marking notifications as read:", error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userEmail: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_email", userEmail.toLowerCase())
    .eq("read", false)
    .is("deleted_at", null)
    .select();

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return 0;
  }

  return data?.length || 0;
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userEmail: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("client_notifications")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_email", userEmail.toLowerCase());

  if (error) {
    console.error("Error deleting notification:", error);
    return false;
  }

  return true;
}

/**
 * Soft delete multiple notifications
 */
export async function deleteMultipleNotifications(
  notificationIds: string[],
  userEmail: string
): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .in("id", notificationIds)
    .eq("user_email", userEmail.toLowerCase())
    .select();

  if (error) {
    console.error("Error deleting notifications:", error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Permanently delete old notifications (cleanup job)
 */
export async function purgeOldNotifications(
  daysOld: number = 90
): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await db
    .from("client_notifications")
    .delete()
    .lt("created_at", cutoffDate.toISOString())
    .not("deleted_at", "is", null)
    .select();

  if (error) {
    console.error("Error purging old notifications:", error);
    return 0;
  }

  return data?.length || 0;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get notification counts by type
 */
export async function getNotificationCountsByType(
  userEmail: string
): Promise<Record<NotificationType, number>> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("client_notifications")
    .select("type")
    .eq("user_email", userEmail.toLowerCase())
    .is("deleted_at", null);

  if (error || !data) {
    console.error("Error fetching notification counts:", error);
    return {
      booking: 0,
      document: 0,
      payment: 0,
      message: 0,
      system: 0,
      achievement: 0,
      xp: 0,
      streak: 0,
    };
  }

  const counts: Record<NotificationType, number> = {
    booking: 0,
    document: 0,
    payment: 0,
    message: 0,
    system: 0,
    achievement: 0,
    xp: 0,
    streak: 0,
  };

  for (const row of data) {
    if (row.type in counts) {
      counts[row.type as NotificationType]++;
    }
  }

  return counts;
}

/**
 * Check if a similar notification was recently sent (deduplication)
 */
export async function wasRecentlySent(
  userEmail: string,
  type: NotificationType,
  title: string,
  withinMinutes: number = 5
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const cutoff = new Date();
  cutoff.setMinutes(cutoff.getMinutes() - withinMinutes);

  const { data, error } = await db
    .from("client_notifications")
    .select("id")
    .eq("user_email", userEmail.toLowerCase())
    .eq("type", type)
    .eq("title", title)
    .gte("created_at", cutoff.toISOString())
    .limit(1);

  if (error) {
    console.error("Error checking recent notifications:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}
