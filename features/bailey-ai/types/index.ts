/**
 * Bailey AI Type Definitions
 * Centralized types for the AI chat assistant system
 */

// ============================================
// Knowledge Base Types
// ============================================

export interface KnowledgeItem {
  id: string;
  category: string;
  subcategory: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  intentPatterns: string[];
  responseTemplate: string;
  requiresDisclaimer: boolean;
  legalDisclaimer: string;
  adviceLevel: "general" | "educational" | "specific";
  confidenceLevel: number;
  relatedProducts?: string[];
  xpReward: number;
  metadata?: Record<string, unknown>;
}

// ============================================
// Chat Message Types
// ============================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatMessageWithMeta extends ChatMessage {
  confidence?: number;
  knowledgeUsed?: string[];
  actions?: ActionButton[];
  disclaimer?: boolean;
}

export interface ActionButton {
  label: string;
  action: string;
  url?: string;
  productId?: string;
  data?: unknown;
}

// ============================================
// Conversation Types
// ============================================

export interface ChatConversation {
  id: string;
  sessionId: string;
  userId?: string;
  userEmail?: string;
  messages: ChatMessage[];
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  xpEarned: number;
  leadScore: number;
  leadCategory: "hot" | "warm" | "cold";
  intent?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationSummary {
  id: string;
  preview: string;
  messageCount: number;
  startedAt: string;
  intent?: string;
}

// ============================================
// User Preferences Types
// ============================================

export interface UserPreferences {
  practiceType?: string;
  businessSize?: string;
  communicationStyle?: "formal" | "casual";
  urgencyLevel?: "low" | "medium" | "high";
  interests?: string[];
  sentiment?: "positive" | "neutral" | "negative";
}

export interface UserContext {
  visitorId: string;
  sessionId: string;
  preferences: UserPreferences;
  conversationHistory: ChatMessage[];
  leadScore: number;
  leadCategory: "hot" | "warm" | "cold";
  personalizedGreeting?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ChatAPIResponse {
  success: boolean;
  response: string;
  actions?: ActionButton[];
  showDisclaimer?: boolean;
  confidence?: number;
  xpAwarded?: number;
  intent?: string;
  relatedProducts?: string[];
  knowledgeUsed?: string[];
  totalXpEarned?: number;
}

export interface StreamEventStart {
  type: "start";
  intent: string;
  confidence: number;
  knowledgeUsed: string[];
}

export interface StreamEventDelta {
  type: "delta";
  content: string;
}

export interface StreamEventComplete {
  type: "complete";
  xpAwarded: number;
  totalXpEarned: number;
  actions: ActionButton[];
  showDisclaimer: boolean;
  relatedProducts?: string[];
}

export interface StreamEventError {
  type: "error";
  message: string;
}

export type StreamEvent = StreamEventStart | StreamEventDelta | StreamEventComplete | StreamEventError;

// ============================================
// Calendar Types
// ============================================

export interface ConsultationType {
  duration: number;
  description: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface ChatAnalytics {
  conversationId?: string;
  sessionId: string;
  userMessage: string;
  baileyResponse: string;
  intentCategory?: string;
  knowledgeItemsUsed?: string[];
  confidenceScore?: number;
  responseTimeMs: number;
  converted?: boolean;
}

// ============================================
// XP Rewards Configuration
// ============================================

export const CHAT_XP_REWARDS = {
  askQuestion: 5,
  viewProduct: 10,
  requestCallback: 25,
  bookConsultation: 50,
  completeSurvey: 30,
} as const;

export type XPRewardType = keyof typeof CHAT_XP_REWARDS;
