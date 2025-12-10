/**
 * Chat Conversation Storage
 * Persists chat conversations to Supabase using normalized tables
 *
 * Uses:
 * - chat_conversations table for session metadata
 * - chat_messages table for individual messages (normalized)
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  logConversationExchange,
  getConversationBySessionId,
  type DbConversation,
} from "@/lib/supabase/conversations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  intent?: string;
  knowledgeUsed?: string[];
  xpAwarded?: number;
  confidence?: number;
  source?: string;
  modelUsed?: string;
}

export interface ChatConversation {
  id: string;
  session_id: string;
  user_email?: string;
  messages: ChatMessage[];
  xp_earned: number;
  intent?: string;
  message_count: number;
  lead_score?: number;
  lead_category?: "hot" | "warm" | "cold" | null;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create conversation by session ID
 * Uses the new normalized tables (chat_conversations + chat_messages)
 */
export async function getOrCreateConversation(
  sessionId: string,
  userEmail?: string
): Promise<ChatConversation> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Try to get existing conversation from new table
  const existing = await getConversationBySessionId(sessionId);

  if (existing) {
    // Fetch messages from chat_messages table
    const { data: messages } = await db
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", existing.id)
      .order("created_at", { ascending: true });

    return {
      id: existing.id,
      session_id: existing.session_id,
      user_email: existing.user_email || undefined,
      messages: (messages || []).map((m: {
        role: string;
        content: string;
        created_at: string;
        intent?: string;
        knowledge_items_used?: string[];
        xp_awarded?: number;
        confidence_score?: number;
        source?: string;
        model_used?: string;
      }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.created_at,
        intent: m.intent,
        knowledgeUsed: m.knowledge_items_used,
        xpAwarded: m.xp_awarded,
        confidence: m.confidence_score,
        source: m.source,
        modelUsed: m.model_used,
      })),
      xp_earned: existing.xp_earned,
      intent: existing.primary_intent || undefined,
      message_count: existing.message_count,
      lead_score: existing.lead_score,
      lead_category: existing.lead_category,
      created_at: existing.created_at,
      updated_at: existing.updated_at,
    };
  }

  // Create new conversation
  const { data: created, error } = await db
    .from("chat_conversations")
    .insert({
      session_id: sessionId,
      user_email: userEmail,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    // Return a temporary conversation object
    return {
      id: "",
      session_id: sessionId,
      user_email: userEmail,
      messages: [],
      xp_earned: 0,
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: created.id,
    session_id: created.session_id,
    user_email: created.user_email,
    messages: [],
    xp_earned: 0,
    message_count: 0,
    lead_score: 0,
    lead_category: null,
    created_at: created.created_at,
    updated_at: created.updated_at,
  };
}

/**
 * Add message to conversation
 * Uses the new normalized chat_messages table
 */
export async function addMessageToConversation(
  sessionId: string,
  message: ChatMessage,
  xpAwarded: number = 0,
  intent?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get or create conversation
  const conversation = await getOrCreateConversation(sessionId);

  if (!conversation.id) {
    console.error("Failed to get conversation ID");
    return false;
  }

  // Insert message into chat_messages table
  const { error: msgError } = await db
    .from("chat_messages")
    .insert({
      conversation_id: conversation.id,
      role: message.role,
      content: message.content,
      intent: intent || message.intent,
      knowledge_items_used: message.knowledgeUsed || [],
      xp_awarded: xpAwarded || message.xpAwarded || 0,
      confidence_score: message.confidence,
      source: message.source,
      model_used: message.modelUsed,
    });

  if (msgError) {
    console.error("Error adding message:", msgError);
    return false;
  }

  // Note: conversation stats are automatically updated via database trigger
  return true;
}

/**
 * Get conversation by session ID
 * Returns conversation with messages from normalized tables
 */
export async function getConversation(sessionId: string): Promise<ChatConversation | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data: conv, error } = await db
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error || !conv) {
    return null;
  }

  // Fetch messages from chat_messages table
  const { data: messages } = await db
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  return {
    id: conv.id,
    session_id: conv.session_id,
    user_email: conv.user_email || undefined,
    messages: (messages || []).map((m: {
      role: string;
      content: string;
      created_at: string;
      intent?: string;
      knowledge_items_used?: string[];
      xp_awarded?: number;
      confidence_score?: number;
      source?: string;
      model_used?: string;
    }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      timestamp: m.created_at,
      intent: m.intent,
      knowledgeUsed: m.knowledge_items_used,
      xpAwarded: m.xp_awarded,
      confidence: m.confidence_score,
      source: m.source,
      modelUsed: m.model_used,
    })),
    xp_earned: conv.xp_earned,
    intent: conv.primary_intent || undefined,
    message_count: conv.message_count,
    lead_score: conv.lead_score,
    lead_category: conv.lead_category,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
  };
}

/**
 * Get conversation history for a user
 * Returns conversations with summary data (without full message history)
 */
export async function getUserConversations(
  email: string,
  limit: number = 10
): Promise<ChatConversation[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("chat_conversations")
    .select("*")
    .eq("user_email", email)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  // Map to ChatConversation format (without loading all messages for performance)
  return (data || []).map((conv: {
    id: string;
    session_id: string;
    user_email: string | null;
    xp_earned: number;
    primary_intent: string | null;
    message_count: number;
    lead_score: number;
    lead_category: "hot" | "warm" | "cold" | null;
    created_at: string;
    updated_at: string;
  }) => ({
    id: conv.id,
    session_id: conv.session_id,
    user_email: conv.user_email || undefined,
    messages: [], // Not loaded for performance - use getConversation for full history
    xp_earned: conv.xp_earned,
    intent: conv.primary_intent || undefined,
    message_count: conv.message_count,
    lead_score: conv.lead_score,
    lead_category: conv.lead_category,
    created_at: conv.created_at,
    updated_at: conv.updated_at,
  }));
}

/**
 * Link anonymous conversation to user after login
 */
export async function linkConversationToUser(
  sessionId: string,
  email: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { error } = await db
    .from("chat_conversations")
    .update({ user_email: email })
    .eq("session_id", sessionId)
    .is("user_email", null);

  if (error) {
    console.error("Error linking conversation:", error);
    return false;
  }

  return true;
}

/**
 * Get total XP earned from chat for a user
 */
export async function getUserChatXP(email: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("chat_conversations")
    .select("xp_earned")
    .eq("user_email", email);

  if (error || !data) {
    return 0;
  }

  return data.reduce((sum: number, c: { xp_earned: number }) => sum + c.xp_earned, 0);
}
