import { NextRequest, NextResponse } from "next/server";
import { chatWithAssistant, ChatMessage } from "@/lib/ai-assistant";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { trackError } from "@/lib/error-tracking";

// Rate limit config for AI chat: 10 requests per minute
const AI_CHAT_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000,
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientId = getClientIdentifier(request);

  // Rate limiting
  const rateLimit = checkRateLimit(`ai-chat-${clientId}`, AI_CHAT_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before sending another message." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { messages, context } = body as {
      messages: ChatMessage[];
      context?: {
        currentPage?: string;
        userType?: string;
        previousPurchases?: string[];
      };
    };

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content || !["user", "assistant"].includes(msg.role)) {
        return NextResponse.json(
          { error: "Invalid message format" },
          { status: 400 }
        );
      }
      // Limit message length
      if (msg.content.length > 2000) {
        return NextResponse.json(
          { error: "Message too long. Maximum 2000 characters." },
          { status: 400 }
        );
      }
    }

    // Limit conversation length
    if (messages.length > 20) {
      return NextResponse.json(
        { error: "Conversation too long. Please start a new chat." },
        { status: 400 }
      );
    }

    // Get AI response
    const response = await chatWithAssistant(messages, context);

    // Log slow responses (5+ seconds)
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      console.warn(`Slow AI response: ${duration}ms for ${messages.length} messages`);
    }

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    trackError(
      error instanceof Error ? error : new Error(String(error)),
      { route: "/api/ai/chat", action: "chat_response" }
    );

    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your message. Please try again." },
      { status: 500 }
    );
  }
}
