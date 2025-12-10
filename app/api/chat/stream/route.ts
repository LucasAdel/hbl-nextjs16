import { NextRequest } from "next/server";
import {
  generateResponse,
  generateStreamingResponse,
  getBaileyAISettings,
  type StreamChunk,
} from "@/features/bailey-ai/lib";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import {
  getOrCreateConversation,
  addMessageToConversation,
  ChatMessage,
} from "@/lib/db/chat";

// Encoder for streaming
const encoder = new TextEncoder();

/**
 * POST /api/chat/stream
 * Stream a chat response using configurable AI model with knowledge base fallback
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
      userEmail,
      conversationHistory = [],
    } = body;

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    // Get settings to check if streaming is enabled
    const settings = await getBaileyAISettings();

    // If streaming is disabled or the model doesn't support it, use non-streaming
    if (!settings.enableStreaming) {
      const response = await generateResponse(message, conversationHistory);

      await addMessageToConversation(conversationKey, userMessage, 0, response.intent);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      await addMessageToConversation(conversationKey, assistantMessage, response.xpAwarded, response.intent);

      return new Response(
        JSON.stringify({
          type: "complete",
          content: response.content,
          intent: response.intent,
          xpAwarded: response.xpAwarded,
          confidence: response.confidence,
          streaming: false,
          actions: response.actions,
          showDisclaimer: response.showDisclaimer,
          knowledgeUsed: response.knowledgeUsed,
          modelUsed: response.modelUsed,
          source: response.source,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        let metadata: Partial<StreamChunk["metadata"]> = {};

        try {
          // Save user message first
          await addMessageToConversation(conversationKey, userMessage, 0);

          // Generate streaming response
          const generator = generateStreamingResponse(message, conversationHistory);

          for await (const chunk of generator) {
            switch (chunk.type) {
              case "start":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "start",
                  intent: chunk.metadata?.intent,
                  confidence: chunk.metadata?.confidence,
                  knowledgeUsed: chunk.metadata?.knowledgeUsed,
                })}\n\n`));
                break;

              case "delta":
                fullResponse += chunk.content || "";
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "delta",
                  content: chunk.content,
                })}\n\n`));
                break;

              case "complete":
                metadata = chunk.metadata || {};
                break;

              case "error":
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: "error",
                  message: chunk.error,
                })}\n\n`));
                break;
            }
          }

          // Save assistant message
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };
          await addMessageToConversation(
            conversationKey,
            assistantMessage,
            metadata.xpAwarded || 5,
            metadata.intent || "general"
          );

          // Send completion event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "complete",
            xpAwarded: metadata.xpAwarded || 5,
            totalXpEarned: conversation.xp_earned + (metadata.xpAwarded || 5),
            actions: metadata.actions || [],
            showDisclaimer: metadata.showDisclaimer || false,
            source: metadata.source || "knowledge_base",
            modelUsed: metadata.modelUsed,
            relatedProducts: metadata.relatedProducts || [],
          })}\n\n`));

        } catch (error) {
          console.error("Streaming error:", error);

          // On error, fall back to non-streaming response
          try {
            const fallbackResponse = await generateResponse(message, conversationHistory);

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "delta",
              content: fallbackResponse.content,
            })}\n\n`));

            fullResponse = fallbackResponse.content;

            // Save fallback response
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: fullResponse,
              timestamp: new Date().toISOString(),
            };
            await addMessageToConversation(
              conversationKey,
              assistantMessage,
              fallbackResponse.xpAwarded,
              fallbackResponse.intent
            );

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "complete",
              xpAwarded: fallbackResponse.xpAwarded,
              totalXpEarned: conversation.xp_earned + fallbackResponse.xpAwarded,
              actions: fallbackResponse.actions,
              showDisclaimer: fallbackResponse.showDisclaimer,
              source: fallbackResponse.source,
            })}\n\n`));

          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "An error occurred. Please try again or contact us directly.",
            })}\n\n`));
          }
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
