/**
 * Supabase Conversation Service
 *
 * Provides persistence layer for Bailey AI chat conversations.
 * Handles logging, retrieval, analytics, and export of chat data.
 */

import { createServiceRoleClient } from "./server";

// Helper to get untyped table access (for tables not in generated types yet)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTable(supabase: ReturnType<typeof createServiceRoleClient>, name: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(name);
}

// Helper for RPC calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callRpc(supabase: ReturnType<typeof createServiceRoleClient>, name: string, params: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(name, params);
}

// ============================================
// TYPES
// ============================================

export interface DbConversation {
  id: string;
  session_id: string;
  user_id: string | null;
  user_email: string | null;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  xp_earned: number;
  lead_score: number;
  lead_category: "hot" | "warm" | "cold" | null;
  primary_intent: string | null;
  status: "active" | "completed" | "abandoned";
  satisfaction_rating: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DbChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent: string | null;
  knowledge_items_used: string[];
  xp_awarded: number;
  confidence_score: number | null;
  response_time_ms: number | null;
  source: string | null;
  model_used: string | null;
  actions: unknown[];
  show_disclaimer: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConversationWithMessages extends DbConversation {
  messages: DbChatMessage[];
}

export interface ConversationFilters {
  status?: "active" | "completed" | "abandoned";
  leadCategory?: "hot" | "warm" | "cold";
  dateFrom?: Date | string;
  dateTo?: Date | string;
  search?: string;
  intent?: string;
  userEmail?: string;
  minLeadScore?: number;
}

export interface ConversationAnalytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConv: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgLeadScore: number;
  avgXpEarned: number;
  topIntents: { intent: string; count: number }[];
}

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

/**
 * Get or create a conversation by session ID
 */
export async function getOrCreateConversation(
  sessionId: string,
  userId?: string,
  userEmail?: string
): Promise<string> {
  const supabase = createServiceRoleClient();

  const { data, error } = await callRpc(supabase, "get_or_create_conversation", {
    p_session_id: sessionId,
    p_user_id: userId || null,
    p_user_email: userEmail || null,
  });

  if (error) {
    console.error("Error getting/creating conversation:", error);
    // Fallback: try direct insert
    const { data: fallbackData, error: fallbackError } = await getTable(
      supabase,
      "chat_conversations"
    )
      .upsert(
        {
          session_id: sessionId,
          user_id: userId || null,
          user_email: userEmail || null,
        },
        { onConflict: "session_id" }
      )
      .select("id")
      .single();

    if (fallbackError) {
      console.error("Fallback error:", fallbackError);
      throw new Error("Failed to create conversation");
    }
    return fallbackData.id;
  }

  return data as string;
}

/**
 * Get a conversation by ID with all messages
 */
export async function getConversation(
  conversationId: string
): Promise<ConversationWithMessages | null> {
  const supabase = createServiceRoleClient();

  const { data: conv, error: convError } = await getTable(
    supabase,
    "chat_conversations"
  )
    .select("*")
    .eq("id", conversationId)
    .single();

  if (convError || !conv) {
    console.error("Error fetching conversation:", convError);
    return null;
  }

  const { data: messages, error: msgError } = await getTable(
    supabase,
    "chat_messages"
  )
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("Error fetching messages:", msgError);
    return null;
  }

  return {
    ...(conv as DbConversation),
    messages: (messages || []) as DbChatMessage[],
  };
}

/**
 * Get a conversation by session ID
 */
export async function getConversationBySessionId(
  sessionId: string
): Promise<DbConversation | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching conversation by session:", error);
    return null;
  }

  return data as DbConversation | null;
}

/**
 * List conversations with filters and pagination
 */
export async function getConversations(
  filters: ConversationFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ conversations: DbConversation[]; total: number; page: number; pageSize: number }> {
  const supabase = createServiceRoleClient();
  const offset = (page - 1) * pageSize;

  let query = getTable(supabase, "chat_conversations").select("*", {
    count: "exact",
  });

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.leadCategory) {
    query = query.eq("lead_category", filters.leadCategory);
  }
  if (filters.dateFrom) {
    const dateFromStr = filters.dateFrom instanceof Date
      ? filters.dateFrom.toISOString()
      : filters.dateFrom;
    query = query.gte("created_at", dateFromStr);
  }
  if (filters.dateTo) {
    const dateToStr = filters.dateTo instanceof Date
      ? filters.dateTo.toISOString()
      : filters.dateTo;
    query = query.lte("created_at", dateToStr);
  }
  if (filters.intent) {
    query = query.eq("primary_intent", filters.intent);
  }
  if (filters.userEmail) {
    query = query.eq("user_email", filters.userEmail);
  }
  if (filters.minLeadScore !== undefined) {
    query = query.gte("lead_score", filters.minLeadScore);
  }
  if (filters.search) {
    query = query.or(
      `user_email.ilike.%${filters.search}%,session_id.ilike.%${filters.search}%`
    );
  }

  // Order and paginate
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error listing conversations:", error);
    return { conversations: [], total: 0, page, pageSize };
  }

  return {
    conversations: (data || []) as DbConversation[],
    total: count || 0,
    page,
    pageSize,
  };
}

/**
 * Get a single conversation with all its messages
 */
export async function getConversationWithMessages(
  conversationId: string
): Promise<ConversationWithMessages | null> {
  const supabase = createServiceRoleClient();

  const { data: conv, error } = await getTable(supabase, "chat_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error || !conv) {
    console.error("Error fetching conversation:", error);
    return null;
  }

  const messages = await getConversationMessages(conversationId);

  return {
    ...(conv as DbConversation),
    messages,
  };
}

/**
 * Update conversation metadata
 */
export async function updateConversation(
  conversationId: string,
  updates: Partial<
    Pick<
      DbConversation,
      | "status"
      | "satisfaction_rating"
      | "lead_score"
      | "lead_category"
      | "ended_at"
      | "metadata"
      | "user_email"
    >
  > | Record<string, unknown>
): Promise<DbConversation | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "chat_conversations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating conversation:", error);
    return null;
  }

  return data as DbConversation;
}

/**
 * Mark conversation as completed
 */
export async function completeConversation(
  sessionId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "chat_conversations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error completing conversation:", error);
    return false;
  }

  return true;
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
  conversationId: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { error } = await getTable(supabase, "chat_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }

  return true;
}

// ============================================
// MESSAGE LOGGING
// ============================================

/**
 * Log a chat message to an existing conversation
 */
export async function logChatMessage(data: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: string;
  knowledgeItemsUsed?: string[];
  xpAwarded?: number;
  confidenceScore?: number;
  responseTimeMs?: number;
  source?: string;
  modelUsed?: string;
  actions?: unknown[];
  showDisclaimer?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<DbChatMessage | null> {
  const supabase = createServiceRoleClient();

  const { data: message, error } = await getTable(supabase, "chat_messages")
    .insert({
      conversation_id: data.conversationId,
      role: data.role,
      content: data.content,
      intent: data.intent || null,
      knowledge_items_used: data.knowledgeItemsUsed || [],
      xp_awarded: data.xpAwarded || 0,
      confidence_score: data.confidenceScore || null,
      response_time_ms: data.responseTimeMs || null,
      source: data.source || null,
      model_used: data.modelUsed || null,
      actions: data.actions || [],
      show_disclaimer: data.showDisclaimer || false,
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error logging chat message:", error);
    return null;
  }

  return message as DbChatMessage;
}

/**
 * Log both user and assistant messages in one call
 */
export async function logConversationExchange(data: {
  sessionId: string;
  userId?: string;
  userEmail?: string;
  userMessage: string;
  assistantMessage: string;
  intent?: string;
  knowledgeItemsUsed?: string[];
  xpAwarded?: number;
  confidenceScore?: number;
  responseTimeMs?: number;
  source?: string;
  modelUsed?: string;
  actions?: unknown[];
  showDisclaimer?: boolean;
}): Promise<{ conversationId: string; userMessageId: string; assistantMessageId: string } | null> {
  try {
    // Get or create conversation
    const conversationId = await getOrCreateConversation(
      data.sessionId,
      data.userId,
      data.userEmail
    );

    // Log user message
    const userMsg = await logChatMessage({
      conversationId,
      role: "user",
      content: data.userMessage,
      intent: data.intent,
    });

    // Log assistant message
    const assistantMsg = await logChatMessage({
      conversationId,
      role: "assistant",
      content: data.assistantMessage,
      intent: data.intent,
      knowledgeItemsUsed: data.knowledgeItemsUsed,
      xpAwarded: data.xpAwarded,
      confidenceScore: data.confidenceScore,
      responseTimeMs: data.responseTimeMs,
      source: data.source,
      modelUsed: data.modelUsed,
      actions: data.actions,
      showDisclaimer: data.showDisclaimer,
    });

    if (!userMsg || !assistantMsg) {
      return null;
    }

    return {
      conversationId,
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
    };
  } catch (error) {
    console.error("Error logging conversation exchange:", error);
    return null;
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit?: number
): Promise<DbChatMessage[]> {
  const supabase = createServiceRoleClient();

  let query = getTable(supabase, "chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return (data || []) as DbChatMessage[];
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get conversation analytics for a date range
 */
export async function getConversationAnalytics(
  dateFrom?: string,
  dateTo?: string
): Promise<ConversationAnalytics> {
  const supabase = createServiceRoleClient();

  const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = dateTo || new Date().toISOString();

  // Try RPC function first
  const { data, error } = await callRpc(supabase, "get_conversation_analytics", {
    p_date_from: from,
    p_date_to: to,
  });

  if (!error && data && data.length > 0) {
    const result = data[0];
    return {
      totalConversations: result.total_conversations || 0,
      totalMessages: result.total_messages || 0,
      avgMessagesPerConv: result.avg_messages_per_conv || 0,
      hotLeads: result.hot_leads || 0,
      warmLeads: result.warm_leads || 0,
      coldLeads: result.cold_leads || 0,
      avgLeadScore: result.avg_lead_score || 0,
      avgXpEarned: result.avg_xp_earned || 0,
      topIntents: result.top_intents || [],
    };
  }

  // Fallback to manual queries
  const { count: totalConv } = await getTable(supabase, "chat_conversations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  const { count: totalMsg } = await getTable(supabase, "chat_messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to);

  const { count: hot } = await getTable(supabase, "chat_conversations")
    .select("*", { count: "exact", head: true })
    .eq("lead_category", "hot")
    .gte("created_at", from)
    .lte("created_at", to);

  const { count: warm } = await getTable(supabase, "chat_conversations")
    .select("*", { count: "exact", head: true })
    .eq("lead_category", "warm")
    .gte("created_at", from)
    .lte("created_at", to);

  const { count: cold } = await getTable(supabase, "chat_conversations")
    .select("*", { count: "exact", head: true })
    .eq("lead_category", "cold")
    .gte("created_at", from)
    .lte("created_at", to);

  return {
    totalConversations: totalConv || 0,
    totalMessages: totalMsg || 0,
    avgMessagesPerConv: totalConv ? Math.round((totalMsg || 0) / totalConv) : 0,
    hotLeads: hot || 0,
    warmLeads: warm || 0,
    coldLeads: cold || 0,
    avgLeadScore: 0,
    avgXpEarned: 0,
    topIntents: [],
  };
}

/**
 * Get recent hot leads for follow-up
 */
export async function getHotLeads(
  limit: number = 10
): Promise<DbConversation[]> {
  const supabase = createServiceRoleClient();

  const { data, error } = await getTable(supabase, "chat_conversations")
    .select("*")
    .eq("lead_category", "hot")
    .order("lead_score", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching hot leads:", error);
    return [];
  }

  return (data || []) as DbConversation[];
}

// ============================================
// EXPORT
// ============================================

/**
 * Export conversations as JSON or CSV
 */
export async function exportConversations(
  filters: ConversationFilters = {},
  format: "json" | "csv" = "json",
  includeMessages: boolean = true
): Promise<string> {
  const supabase = createServiceRoleClient();

  let query = getTable(supabase, "chat_conversations").select("*");

  // Apply filters
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.leadCategory) query = query.eq("lead_category", filters.leadCategory);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);
  if (filters.intent) query = query.eq("primary_intent", filters.intent);

  query = query.order("created_at", { ascending: false });

  const { data: conversations, error } = await query;

  if (error) {
    console.error("Error exporting conversations:", error);
    return format === "json" ? "[]" : "";
  }

  const convs = (conversations || []) as DbConversation[];

  // Fetch messages if requested
  let conversationsWithMessages: ConversationWithMessages[] = [];
  if (includeMessages) {
    for (const conv of convs) {
      const messages = await getConversationMessages(conv.id);
      conversationsWithMessages.push({ ...conv, messages });
    }
  } else {
    conversationsWithMessages = convs.map((c) => ({ ...c, messages: [] }));
  }

  if (format === "json") {
    return JSON.stringify(conversationsWithMessages, null, 2);
  }

  // CSV format
  const headers = [
    "session_id",
    "user_email",
    "lead_category",
    "lead_score",
    "message_count",
    "xp_earned",
    "primary_intent",
    "status",
    "satisfaction_rating",
    "created_at",
  ];

  const rows = conversationsWithMessages.map((c) =>
    [
      c.session_id,
      c.user_email || "",
      c.lead_category || "",
      c.lead_score,
      c.message_count,
      c.xp_earned,
      c.primary_intent || "",
      c.status,
      c.satisfaction_rating || "",
      c.created_at,
    ].join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}
