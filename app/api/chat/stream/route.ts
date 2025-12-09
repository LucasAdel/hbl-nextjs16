import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
  KNOWLEDGE_BASE,
} from "@/lib/chat/chat-knowledge-base";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import {
  getOrCreateConversation,
  addMessageToConversation,
  ChatMessage,
} from "@/lib/db/chat";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Enhanced system prompt for Bailey AI
const BAILEY_SYSTEM_PROMPT = `You are Bailey, the friendly AI assistant for Hamilton Bailey Law, a law firm specializing in legal services for healthcare practitioners in Australia.

## Your Personality
- Warm, professional, and empathetic
- Knowledgeable about healthcare law and AHPRA regulations
- Conversational but focused on providing value
- Always helpful and proactive in suggesting next steps

## Your Goals (in order of priority)
1. Build trust and rapport with potential clients
2. Understand their needs through natural conversation
3. Educate them about relevant legal requirements
4. Guide them toward appropriate products or consultations
5. Maximize engagement and conversions

## Key Guidelines
- NEVER provide specific legal advice - always recommend consultation for complex matters
- Be concise - aim for 2-3 paragraphs maximum unless more detail is explicitly requested
- Always include a clear call-to-action when appropriate
- Mention XP rewards when discussing products or actions to drive gamification engagement
- Use Australian English spellings and terminology

## Available Products & Bundles (mention these naturally when relevant)
- AHPRA Compliance Bundle ($599) - Advertising guidelines, templates, checklists - Earns 3x XP
- Telehealth Complete Bundle ($449) - Consent forms, privacy policies, patient sheets - Earns 3x XP
- Employment Contract Pack ($349) - Full-time, part-time, casual agreements
- Privacy Policy Bundle ($299) - Privacy policy, collection notices, breach response
- Patient Consent Forms Pack ($199) - Treatment, procedure, photography consent
- Locum Agreement Template ($149)
- New Practice Starter Kit ($999) - Complete bundle for new practices - BEST VALUE, 3x XP

## Contact Information
- Phone: (08) 8121 5167
- Email: admin@hamiltonbailey.com.au
- Website: hamiltonbailey.com.au

## Gamification System (mention to drive engagement)
- Users earn XP for interactions and purchases
- Higher XP unlocks discounts and exclusive content
- Bundles earn 3x XP compared to individual products
- Daily streaks multiply XP earned

## Conversation Style
- Start with understanding their situation before recommending
- Ask follow-up questions to better understand their needs
- Validate their concerns before offering solutions
- End messages with engagement prompts or next steps`;

// Encoder for streaming
const encoder = new TextEncoder();

/**
 * POST /api/chat/stream
 * Stream a chat response using Claude API
 */
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`chat-stream-${clientId}`, {
    maxRequests: 20,
    windowMs: 60000,
  });

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const {
      message,
      sessionId,
      userId,
      userEmail,
      conversationHistory = [],
      userPreferences = {},
      leadScore = 0,
    } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const conversationKey = sessionId || `anon-${clientId}`;

    // Get or create conversation from database
    const conversation = await getOrCreateConversation(conversationKey, userEmail);

    // Detect intent and find relevant knowledge
    const intent = detectIntent(message);
    const relevantKnowledge = findRelevantKnowledge(message);

    // Check for objections first - these get quick responses
    const objection = handleObjection(message);
    if (objection.handled) {
      // For objections, return a direct response without streaming
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: objection.response,
        timestamp: new Date().toISOString(),
      };

      await addMessageToConversation(conversationKey, userMessage, 0);
      await addMessageToConversation(conversationKey, assistantMessage, 5, "objection_handled");

      return new Response(
        JSON.stringify({
          type: "complete",
          content: objection.response,
          intent: "objection_handled",
          xpAwarded: 5,
          confidence: 0.9,
          streaming: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build context for Claude
    let contextInfo = "";

    if (relevantKnowledge.length > 0) {
      contextInfo += "\n\n## Relevant Knowledge Base Information:\n";
      relevantKnowledge.forEach((item, index) => {
        contextInfo += `\n### ${index + 1}. ${item.title}\n`;
        contextInfo += `${item.content}\n`;
        if (item.relatedProducts && item.relatedProducts.length > 0) {
          contextInfo += `Related products: ${item.relatedProducts.join(", ")}\n`;
        }
      });
    }

    if (userPreferences && Object.keys(userPreferences).length > 0) {
      contextInfo += "\n\n## User Context:\n";
      if (userPreferences.practiceType) {
        contextInfo += `- Practice type: ${userPreferences.practiceType}\n`;
      }
      if (userPreferences.communicationStyle) {
        contextInfo += `- Prefers: ${userPreferences.communicationStyle} communication\n`;
      }
      if (userPreferences.urgencyLevel) {
        contextInfo += `- Urgency: ${userPreferences.urgencyLevel}\n`;
      }
    }

    if (leadScore > 0) {
      contextInfo += `\n\n## Lead Information:\n`;
      contextInfo += `- Lead score: ${leadScore}/100\n`;
      contextInfo += `- Category: ${leadScore >= 70 ? "HOT - prioritize conversion" : leadScore >= 40 ? "WARM - nurture relationship" : "COLD - focus on education"}\n`;
    }

    // Build conversation messages for Claude
    const claudeMessages: { role: "user" | "assistant"; content: string }[] = [];

    // Add conversation history (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg: { role: string; content: string }) => {
      claudeMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    });

    // Add current message with context
    claudeMessages.push({
      role: "user",
      content: message + (contextInfo ? `\n\n[SYSTEM CONTEXT - Use this to inform your response but don't mention it directly]${contextInfo}` : ""),
    });

    // Store user message
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    await addMessageToConversation(conversationKey, userMessage, 0, intent);

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        let hasError = false;

        try {
          // Call Claude API with streaming
          const streamResponse = await anthropic.messages.stream({
            model: "claude-3-haiku-20240307", // Fast model for chat
            max_tokens: 1024,
            system: BAILEY_SYSTEM_PROMPT,
            messages: claudeMessages,
          });

          // Send initial metadata
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "start",
            intent,
            confidence: relevantKnowledge.length > 0 ? relevantKnowledge[0].confidenceLevel / 10 : 0.5,
            knowledgeUsed: relevantKnowledge.map(k => k.title),
          })}\n\n`));

          // Stream the response
          for await (const event of streamResponse) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              const text = event.delta.text;
              fullResponse += text;

              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: "delta",
                content: text,
              })}\n\n`));
            }
          }

          // Calculate XP based on knowledge used and response quality
          let xpAwarded = 5; // Base XP for engagement
          if (relevantKnowledge.length > 0) {
            xpAwarded = Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10));
          }

          // Store assistant message
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };
          await addMessageToConversation(conversationKey, assistantMessage, xpAwarded, intent);

          // Determine suggested actions based on response and intent
          const actions = generateSuggestedActions(fullResponse, intent, relevantKnowledge);

          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "complete",
            xpAwarded,
            totalXpEarned: conversation.xp_earned + xpAwarded,
            actions,
            showDisclaimer: relevantKnowledge.some(k => k.requiresDisclaimer),
            relatedProducts: relevantKnowledge.flatMap(k => k.relatedProducts || []),
          })}\n\n`));

        } catch (error) {
          hasError = true;
          console.error("Streaming error:", error);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "error",
            message: "I apologize, but I'm having trouble responding. Please try again or contact us directly at (08) 8121 5167.",
          })}\n\n`));
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Generate suggested actions based on response content and intent
 */
function generateSuggestedActions(
  response: string,
  intent: string,
  knowledge: typeof KNOWLEDGE_BASE
): { label: string; action: string; productId?: string }[] {
  const actions: { label: string; action: string; productId?: string }[] = [];
  const lowerResponse = response.toLowerCase();

  // Product-related actions
  if (knowledge.length > 0 && knowledge[0].relatedProducts && knowledge[0].relatedProducts.length > 0) {
    actions.push({
      label: "View Product",
      action: "product",
      productId: knowledge[0].relatedProducts[0],
    });
    actions.push({
      label: "Add to Cart",
      action: "add_to_cart",
      productId: knowledge[0].relatedProducts[0],
    });
  }

  // Intent-based actions
  switch (intent) {
    case "booking":
      actions.push({ label: "Book Consultation", action: "book" });
      break;
    case "pricing":
      actions.push({ label: "View Bundles", action: "bundles" });
      actions.push({ label: "Compare Packages", action: "compare" });
      break;
    case "compliance":
    case "telehealth":
      actions.push({ label: "See Compliance Bundles", action: "compliance_bundles" });
      break;
    case "employment":
      actions.push({ label: "Employment Documents", action: "employment_docs" });
      break;
    case "contact":
      actions.push({ label: "Call Now", action: "call" });
      actions.push({ label: "Send Email", action: "email" });
      break;
    case "practice_setup":
      actions.push({ label: "New Practice Kit", action: "starter_kit" });
      break;
  }

  // Response content-based actions
  if (lowerResponse.includes("consultation") || lowerResponse.includes("speak with")) {
    if (!actions.some(a => a.action === "book")) {
      actions.push({ label: "Book Free Consultation", action: "book" });
    }
  }

  if (lowerResponse.includes("bundle") || lowerResponse.includes("package")) {
    if (!actions.some(a => a.action === "bundles")) {
      actions.push({ label: "View Bundles", action: "bundles" });
    }
  }

  // Always add a general action if no specific ones
  if (actions.length === 0) {
    actions.push({ label: "Learn More", action: "learn_more" });
    actions.push({ label: "View Products", action: "products" });
  }

  // Limit to 3 actions
  return actions.slice(0, 3);
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
