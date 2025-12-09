/**
 * Chat Conversation Storage
 * Persists chat conversations to Supabase
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  session_id: string;
  user_email?: string;
  messages: ChatMessage[];
  xp_earned: number;
  intent?: string;
  message_count: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create conversation by session ID
 */
export async function getOrCreateConversation(
  sessionId: string,
  userEmail?: string
): Promise<ChatConversation> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Try to get existing conversation
  const { data: existing } = await db
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (existing) {
    return existing;
  }

  // Create new conversation
  const { data: created, error } = await db
    .from("chat_conversations")
    .insert({
      session_id: sessionId,
      user_email: userEmail,
      messages: [],
      xp_earned: 0,
      message_count: 0,
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

  return created;
}

/**
 * Add message to conversation
 */
export async function addMessageToConversation(
  sessionId: string,
  message: ChatMessage,
  xpAwarded: number = 0,
  intent?: string
): Promise<boolean> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get current conversation
  const conversation = await getOrCreateConversation(sessionId);

  // Update with new message
  const updatedMessages = [...conversation.messages, message];

  const { error } = await db
    .from("chat_conversations")
    .update({
      messages: updatedMessages,
      xp_earned: conversation.xp_earned + xpAwarded,
      intent: intent || conversation.intent,
      message_count: updatedMessages.length,
      last_message_at: message.timestamp,
    })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error adding message:", error);
    return false;
  }

  return true;
}

/**
 * Get conversation by session ID
 */
export async function getConversation(sessionId: string): Promise<ChatConversation | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Get conversation history for a user
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

  return data || [];
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
