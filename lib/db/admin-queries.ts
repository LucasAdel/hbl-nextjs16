import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type AdvancedBookingStatus = Database["public"]["Enums"]["advanced_booking_status"];

export interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  documentSales: number;
  monthlyRevenue: number;
  revenueChange: number;
  activeClients: number;
  emailsQueued: number;
}

export interface RecentActivity {
  id: string;
  type: "booking" | "purchase" | "consultation" | "email" | "contact";
  description: string;
  time: string;
  status: "success" | "pending" | "warning";
}

export interface UpcomingBooking {
  id: string;
  client: string;
  email: string;
  type: string;
  time: string;
  status: "confirmed" | "pending" | "pending_payment" | "cancelled";
}

// Get today's date range in UTC
function getTodayRange() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  return { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString() };
}

// Get this month's date range
function getMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startOfMonth: startOfMonth.toISOString(), endOfMonth: endOfMonth.toISOString() };
}

// Get last month's date range
function getLastMonthRange() {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  return { startOfLastMonth: startOfLastMonth.toISOString(), endOfLastMonth: endOfLastMonth.toISOString() };
}

/**
 * Fetch dashboard statistics from Supabase
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { startOfDay, endOfDay } = getTodayRange();
  const { startOfMonth, endOfMonth } = getMonthRange();
  const { startOfLastMonth, endOfLastMonth } = getLastMonthRange();

  // Run all queries in parallel for better performance
  const [
    todayBookingsResult,
    pendingBookingsResult,
    monthlyBookingsResult,
    lastMonthBookingsResult,
    contactsResult,
    emailsQueuedResult,
  ] = await Promise.all([
    // Today's confirmed bookings
    supabase
      .from("advanced_bookings")
      .select("id", { count: "exact", head: true })
      .gte("start_time", startOfDay)
      .lt("start_time", endOfDay)
      .eq("status", "confirmed"),

    // Pending bookings
    supabase
      .from("advanced_bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "pending_payment"]),

    // This month's completed bookings with revenue
    supabase
      .from("advanced_bookings")
      .select("payment_amount")
      .gte("start_time", startOfMonth)
      .lte("start_time", endOfMonth)
      .eq("status", "completed")
      .not("payment_amount", "is", null),

    // Last month's completed bookings with revenue
    supabase
      .from("advanced_bookings")
      .select("payment_amount")
      .gte("start_time", startOfLastMonth)
      .lte("start_time", endOfLastMonth)
      .eq("status", "completed")
      .not("payment_amount", "is", null),

    // Active contacts/clients count
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),

    // Pending email sequences
    supabase
      .from("email_sequence_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  // Calculate monthly revenue
  const monthlyRevenue = monthlyBookingsResult.data?.reduce(
    (sum, booking) => sum + (booking.payment_amount || 0),
    0
  ) || 0;

  // Calculate last month revenue for comparison
  const lastMonthRevenue = lastMonthBookingsResult.data?.reduce(
    (sum, booking) => sum + (booking.payment_amount || 0),
    0
  ) || 0;

  // Calculate revenue change percentage
  let revenueChange = 0;
  if (lastMonthRevenue > 0) {
    revenueChange = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
  } else if (monthlyRevenue > 0) {
    revenueChange = 100; // 100% increase from 0
  }

  return {
    todayBookings: todayBookingsResult.count || 0,
    pendingBookings: pendingBookingsResult.count || 0,
    documentSales: 0, // Will need Stripe integration for actual document sales
    monthlyRevenue: monthlyRevenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    activeClients: contactsResult.count || 0,
    emailsQueued: emailsQueuedResult.count || 0,
  };
}

/**
 * Fetch recent activity for the dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const supabase = await createClient();
  const activities: RecentActivity[] = [];

  // Fetch recent bookings
  const { data: bookings } = await supabase
    .from("advanced_bookings")
    .select("id, client_name, event_type_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (bookings) {
    for (const booking of bookings) {
      activities.push({
        id: `booking-${booking.id}`,
        type: "booking",
        description: `${booking.event_type_name} booked by ${booking.client_name}`,
        time: formatRelativeTime(new Date(booking.created_at)),
        status: booking.status === "confirmed" || booking.status === "completed"
          ? "success"
          : booking.status === "cancelled"
          ? "warning"
          : "pending",
      });
    }
  }

  // Fetch recent contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (contacts) {
    for (const contact of contacts) {
      activities.push({
        id: `contact-${contact.id}`,
        type: "contact",
        description: `New contact from ${contact.first_name} ${contact.last_name}`,
        time: formatRelativeTime(new Date(contact.created_at)),
        status: contact.status === "responded" ? "success" : "pending",
      });
    }
  }

  // Fetch recent email sequence enrollments
  const { data: emails } = await supabase
    .from("email_sequence_enrollments")
    .select("id, email, sequence_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (emails) {
    for (const email of emails) {
      const sequenceNames: Record<string, string> = {
        welcome_series: "Welcome email sequence",
        post_consultation: "Post-consultation follow-up",
        post_purchase: "Post-purchase sequence",
        booking_reminder: "Booking reminder",
        re_engagement: "Re-engagement campaign",
        cart_abandonment: "Cart recovery",
      };
      activities.push({
        id: `email-${email.id}`,
        type: "email",
        description: `${sequenceNames[email.sequence_type] || email.sequence_type} started for ${email.email}`,
        time: formatRelativeTime(new Date(email.created_at)),
        status: email.status === "completed" ? "success" : email.status === "cancelled" ? "warning" : "pending",
      });
    }
  }

  // Sort all activities by time and return top N
  return activities
    .sort((a, b) => {
      // Simple sort - most recent first based on relative time words
      const timeOrder: Record<string, number> = {
        "just now": 1,
        "minute": 2,
        "minutes": 3,
        "hour": 4,
        "hours": 5,
        "day": 6,
        "days": 7,
        "week": 8,
      };
      const aOrder = Object.keys(timeOrder).find(key => a.time.includes(key)) || "week";
      const bOrder = Object.keys(timeOrder).find(key => b.time.includes(key)) || "week";
      return (timeOrder[aOrder] || 8) - (timeOrder[bOrder] || 8);
    })
    .slice(0, limit);
}

/**
 * Fetch upcoming bookings
 */
export async function getUpcomingBookings(limit: number = 5): Promise<UpcomingBooking[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: bookings, error } = await supabase
    .from("advanced_bookings")
    .select("id, client_name, client_email, event_type_name, start_time, status")
    .gte("start_time", now)
    .in("status", ["confirmed", "pending", "pending_payment"])
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error || !bookings) {
    return [];
  }

  return bookings.map((booking) => ({
    id: booking.id,
    client: booking.client_name,
    email: booking.client_email,
    type: booking.event_type_name,
    time: formatBookingTime(new Date(booking.start_time)),
    status: booking.status as UpcomingBooking["status"],
  }));
}

/**
 * Get leads/contacts with filtering
 */
export async function getLeads(options: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const { status, limit = 50, offset = 0 } = options;

  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    query = query.eq("status", status as "new" | "contacted" | "responded" | "closed");
  }

  const { data, count, error } = await query;

  return {
    leads: data || [],
    total: count || 0,
    error,
  };
}

/**
 * Get appointments with filtering
 */
export async function getAppointments(options: {
  status?: string;
  dateRange?: { start: string; end: string };
  limit?: number;
  offset?: number;
} = {}) {
  const supabase = await createClient();
  const { status, dateRange, limit = 50, offset = 0 } = options;

  let query = supabase
    .from("advanced_bookings")
    .select("*", { count: "exact" })
    .order("start_time", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    query = query.eq("status", status as "pending" | "confirmed" | "cancelled" | "completed" | "pending_payment");
  }

  if (dateRange) {
    query = query
      .gte("start_time", dateRange.start)
      .lte("start_time", dateRange.end);
  }

  const { data, count, error } = await query;

  return {
    appointments: data || [],
    total: count || 0,
    error,
  };
}

/**
 * Update lead status
 */
export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contacts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: AdvancedBookingStatus
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("advanced_bookings")
    .update({ status: status as AdvancedBookingStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

// Helper: Format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Helper: Format booking time
function formatBookingTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  return `${date.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })}, ${timeStr}`;
}
