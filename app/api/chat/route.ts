import { NextRequest, NextResponse } from "next/server";
import {
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
} from "@/features/bailey-ai/lib/knowledge-base";
import { CHAT_XP_REWARDS } from "@/features/bailey-ai/types";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import {
  getOrCreateConversation,
  addMessageToConversation,
  getConversation,
  ChatMessage,
} from "@/lib/db/chat";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { checkAndAlertLead } from "@/features/bailey-ai/lib/lead-emailer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

/**
 * Log analytics for Bailey AI interactions
 */
async function logBaileyAnalytics(data: {
  conversationId?: string;
  sessionId: string;
  userMessage: string;
  baileyResponse: string;
  intentCategory?: string;
  knowledgeItemsUsed?: string[];
  confidenceScore?: number;
  responseTimeMs: number;
  converted?: boolean;
}) {
  try {
    const supabase = createServiceRoleClient();
    const db = getDb(supabase);

    await db.from("bailey_analytics").insert({
      conversation_id: data.conversationId,
      session_id: data.sessionId,
      user_message: data.userMessage,
      bailey_response: data.baileyResponse,
      intent_category: data.intentCategory,
      knowledge_items_used: data.knowledgeItemsUsed || [],
      confidence_score: data.confidenceScore,
      response_time_ms: data.responseTimeMs,
      converted: data.converted || false,
    });
  } catch (error) {
    console.error("Error logging analytics:", error);
  }
}

/**
 * POST /api/chat
 * Process a chat message and return AI response
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`chat-${clientId}`, {
    maxRequests: 30,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { message, sessionId, userId, userEmail } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const conversationKey = sessionId || `anon-${clientId}`;

    // Get or create conversation from database
    const conversation = await getOrCreateConversation(conversationKey, userEmail);

    // Store user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Detect intent
    const intent = detectIntent(message);

    // Check for contact info and send lead alert (non-blocking)
    checkAndAlertLead(
      message,
      conversation.id,
      conversationKey,
      conversation.messages || [],
      userEmail,
      intent
    ).catch((err) => console.error("Lead alert error:", err));

    // Check for objections
    const objection = handleObjection(message);
    if (objection.handled) {
      const xpAwarded = CHAT_XP_REWARDS.askQuestion;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: objection.response,
        timestamp: new Date().toISOString(),
      };

      // Save both messages to database
      await addMessageToConversation(conversationKey, userMessage, 0);
      await addMessageToConversation(conversationKey, assistantMessage, xpAwarded, "objection_handled");

      // Log analytics
      const responseTime = Date.now() - startTime;
      await logBaileyAnalytics({
        conversationId: conversation.id,
        sessionId: conversationKey,
        userMessage: message,
        baileyResponse: objection.response,
        intentCategory: "objection_handled",
        confidenceScore: 0.9,
        responseTimeMs: responseTime,
      });

      return NextResponse.json({
        success: true,
        response: objection.response,
        actions: [
          { label: "View Bundles", action: "bundles" },
          { label: "Book Consultation", action: "book" },
        ],
        showDisclaimer: false,
        confidence: 0.9,
        xpAwarded,
        intent: "objection_handled",
        totalXpEarned: conversation.xp_earned + xpAwarded,
      });
    }

    // Find relevant knowledge
    const relevant = findRelevantKnowledge(message);

    if (relevant.length === 0) {
      const fallbackResponse = "Thank you for your question. While I don't have specific information on that topic, our team would be happy to help.\n\nYou can:\n• Call us: (08) 8121 5167\n• Email: admin@hamiltonbailey.com.au\n• Book a consultation online\n\nIs there another topic I can assist with?";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
      };

      // Save both messages to database
      await addMessageToConversation(conversationKey, userMessage, 0, intent);
      await addMessageToConversation(conversationKey, assistantMessage, 0, intent);

      // Log analytics for fallback
      const responseTime = Date.now() - startTime;
      await logBaileyAnalytics({
        conversationId: conversation.id,
        sessionId: conversationKey,
        userMessage: message,
        baileyResponse: fallbackResponse,
        intentCategory: intent,
        confidenceScore: 0.3,
        responseTimeMs: responseTime,
      });

      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "View Products", action: "products" },
        ],
        showDisclaimer: true,
        confidence: 0.3,
        xpAwarded: 0,
        intent,
        totalXpEarned: conversation.xp_earned,
      });
    }

    const primary = relevant[0];
    const responseText = primary.responseTemplate || primary.summary;
    const xpAwarded = Math.round(primary.xpReward * (primary.confidenceLevel / 10));

    // Build actions
    const actions = [];
    if (primary.relatedProducts && primary.relatedProducts.length > 0) {
      actions.push({
        label: "View Product",
        action: "product",
        productId: primary.relatedProducts[0],
      });
      actions.push({
        label: "Add to Cart",
        action: "add_to_cart",
        productId: primary.relatedProducts[0],
      });
    }
    actions.push({ label: "Learn More", action: "learn_more" });

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: responseText,
      timestamp: new Date().toISOString(),
    };

    // Save both messages to database
    await addMessageToConversation(conversationKey, userMessage, 0, intent);
    await addMessageToConversation(conversationKey, assistantMessage, xpAwarded, intent);

    // Log analytics for knowledge-based response
    const responseTime = Date.now() - startTime;
    await logBaileyAnalytics({
      conversationId: conversation.id,
      sessionId: conversationKey,
      userMessage: message,
      baileyResponse: responseText,
      intentCategory: intent,
      knowledgeItemsUsed: [primary.title],
      confidenceScore: primary.confidenceLevel / 10,
      responseTimeMs: responseTime,
      converted: primary.relatedProducts && primary.relatedProducts.length > 0,
    });

    return NextResponse.json({
      success: true,
      response: responseText,
      actions,
      showDisclaimer: primary.requiresDisclaimer,
      confidence: primary.confidenceLevel / 10,
      xpAwarded,
      intent,
      relatedProducts: primary.relatedProducts,
      knowledgeUsed: [primary.title],
      totalXpEarned: conversation.xp_earned + xpAwarded,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 * Get conversation history
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID required" },
      { status: 400 }
    );
  }

  // Get conversation from database
  const conversation = await getConversation(sessionId);

  if (!conversation) {
    return NextResponse.json({
      success: true,
      messages: [],
      xpEarned: 0,
    });
  }

  return NextResponse.json({
    success: true,
    messages: conversation.messages,
    xpEarned: conversation.xp_earned,
    intent: conversation.intent,
    messageCount: conversation.message_count,
  });
}
