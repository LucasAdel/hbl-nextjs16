/**
 * Bailey AI Response Generator
 *
 * Unified response generation across multiple AI providers.
 * Falls back to knowledge base when AI is unavailable.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
  type KnowledgeItem,
} from "./knowledge-base";
import {
  INTAKE_ASSISTANT_PROMPT,
  INTAKE_ASSISTANT_PROMPT_SHORT,
  CONTACT_DETAILS,
  BOOKING_LINK,
} from "./system-prompt";
import { getActiveModelConfig, type BaileyAISettings } from "./ai-settings";
import { type AIModelConfig, isProviderConfigured } from "./ai-models";
import { logConversationExchange } from "@/lib/supabase/conversations";

// Lazy-loaded AI clients
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

// Response types
export interface GeneratedResponse {
  content: string;
  streaming: boolean;
  source: "ai" | "knowledge_base" | "fallback";
  modelUsed?: string;
  intent: string;
  confidence: number;
  knowledgeUsed: string[];
  xpAwarded: number;
  actions: ResponseAction[];
  showDisclaimer: boolean;
  isEmergency?: boolean;
  isLegalAdviceRefusal?: boolean;
  relatedProducts?: string[];
}

export interface ResponseAction {
  label: string;
  action: string;
  productId?: string;
  url?: string;
}

export interface StreamChunk {
  type: "start" | "delta" | "complete" | "error";
  content?: string;
  metadata?: Partial<GeneratedResponse>;
  error?: string;
}

// Safety checks
function isEmergency(message: string): boolean {
  const emergencyKeywords = [
    "being arrested", "in jail", "police at", "domestic violence",
    "being attacked", "emergency", "help me now", "911", "000",
    "immediate danger", "life threatening", "in danger",
  ];
  const lowerMessage = message.toLowerCase();
  return emergencyKeywords.some((keyword) => lowerMessage.includes(keyword));
}

function isAskingForLegalAdvice(message: string): boolean {
  const legalAdviceKeywords = [
    "should i sign", "should i file", "what should i do", "can i sue",
    "will i win", "do i have a case", "is it legal", "am i liable",
    "should i", "what do you advise", "what would you recommend doing",
    "is this allowed", "can they do this", "is this enforceable",
    "what are my rights", "how do i fight", "should i accept",
  ];
  const lowerMessage = message.toLowerCase();
  return legalAdviceKeywords.some((keyword) => lowerMessage.includes(keyword));
}

function isCalendarQuery(message: string): boolean {
  const calendarKeywords = [
    "appointment", "appointments", "booking", "bookings", "schedule",
    "available", "availability", "slot", "slots", "calendar",
    "when can", "free time", "consultation time", "meeting",
  ];
  const lowerMessage = message.toLowerCase();
  return calendarKeywords.some((keyword) => lowerMessage.includes(keyword));
}

// Response generators
function generateEmergencyResponse(): string {
  return `**Please call 000 immediately.** This is Australia's emergency services number.

We are a law firm, not an emergency service. Once you are safe, please contact us during business hours at ${CONTACT_DETAILS.phone}.

If you are in immediate danger, hang up and dial 000 now.`;
}

function generateLegalAdviceRefusal(): string {
  return `I cannot provide legal advice or predict outcomes. I can, however, set up a consultation with one of our expert solicitors to discuss your specific situation.

**Would you like to:**
• Book a consultation at ${BOOKING_LINK}
• Call us at ${CONTACT_DETAILS.phone}
• Email us at ${CONTACT_DETAILS.email}

Our solicitors can give you proper advice tailored to your circumstances.`;
}

function generateCalendarResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("my appointment") ||
    lowerMessage.includes("my booking") ||
    lowerMessage.includes("when is my") ||
    lowerMessage.includes("upcoming")
  ) {
    return `I can help you with appointments! However, to check your specific booking details, you would need to:

1. **Check your confirmation email** - We send details to the email you booked with
2. **Call our office** - ${CONTACT_DETAILS.phone}
3. **Email us** - ${CONTACT_DETAILS.email}

Would you like to book a new consultation instead?`;
  }

  if (
    lowerMessage.includes("available") ||
    lowerMessage.includes("availability") ||
    lowerMessage.includes("slot") ||
    lowerMessage.includes("when can i")
  ) {
    return `To check our current availability and book a consultation:

• **Online:** ${BOOKING_LINK}
• **Phone:** ${CONTACT_DETAILS.phone} (Mon-Fri 9AM-5PM Adelaide time)
• **Email:** ${CONTACT_DETAILS.email}

Consultations are typically 30 minutes for initial matters. Is there a specific topic you'd like to discuss?`;
  }

  if (lowerMessage.includes("book") || lowerMessage.includes("consultation")) {
    return `I'd be happy to help you book a consultation with Hamilton Bailey!

**Consultation Options:**
• Initial Consultation (30 mins)
• Urgent Legal Advice (30 mins)
• Document Review Session (60 mins)
• Strategy Planning Session (90 mins)

**How to Book:**
• **Online:** ${BOOKING_LINK}
• **Phone:** ${CONTACT_DETAILS.phone}
• **Email:** ${CONTACT_DETAILS.email}

Is there a particular legal matter you'd like to discuss? I can help you prepare.`;
  }

  return null;
}

function generateKnowledgeBasedResponse(
  message: string,
  relevantKnowledge: KnowledgeItem[],
  intent: string
): string {
  // If we have relevant knowledge with a response template, use it
  if (relevantKnowledge.length > 0) {
    const primary = relevantKnowledge[0];

    if (primary.responseTemplate) {
      let response = primary.responseTemplate;
      if (primary.requiresDisclaimer && primary.legalDisclaimer) {
        response += `\n\n*${primary.legalDisclaimer}*`;
      }
      return response;
    }

    return `${primary.summary}\n\n${primary.content.substring(0, 500)}${primary.content.length > 500 ? "..." : ""}\n\nWould you like more details on this topic, or would you prefer to speak with our team directly?`;
  }

  // Default fallback response based on intent
  switch (intent) {
    case "booking":
      return `I'd be happy to help you book a consultation!

**Contact us:**
• Phone: ${CONTACT_DETAILS.phone}
• Email: ${CONTACT_DETAILS.email}
• Book online: ${BOOKING_LINK}

Our consultations typically last 30 minutes. Is there a particular matter you'd like to address?`;

    case "pricing":
      return `Hamilton Bailey offers transparent, fixed-fee pricing for our legal services.

We provide written quotes after an initial assessment, with no hidden costs. Our fixed-fee approach gives you cost certainty.

Would you like to discuss pricing for a specific service?`;

    case "contact":
      return `You can reach Hamilton Bailey Law through:

**Adelaide Office**
${CONTACT_DETAILS.address}
Phone: ${CONTACT_DETAILS.phone}
Email: ${CONTACT_DETAILS.email}
Hours: Monday-Friday 9AM-5PM

**Dubai Office**
Level 17/38 Sheikh Zayed Road, Dubai, UAE

How can I help you further?`;

    default:
      return `Thank you for your question! While I don't have specific information on that topic, our team would be happy to help.

**Contact us:**
• Phone: ${CONTACT_DETAILS.phone}
• Email: ${CONTACT_DETAILS.email}
• Book: ${BOOKING_LINK}

Is there another topic I can help clarify?`;
  }
}

function generateActions(
  response: string,
  intent: string,
  knowledge: KnowledgeItem[]
): ResponseAction[] {
  const actions: ResponseAction[] = [];

  // Product-related actions
  if (knowledge.length > 0 && knowledge[0].relatedProducts?.length) {
    actions.push({
      label: "View Related Service",
      action: "product",
      productId: knowledge[0].relatedProducts[0],
    });
  }

  // Intent-based actions
  switch (intent) {
    case "booking":
      actions.push({ label: "Book Consultation", action: "book" });
      actions.push({ label: "Call Us", action: "call" });
      break;
    case "pricing":
      actions.push({ label: "Request Quote", action: "quote" });
      actions.push({ label: "View Services", action: "services" });
      break;
    case "tenant_doctor":
    case "payroll_tax":
    case "compliance":
      actions.push({ label: "Book Risk Assessment", action: "book" });
      actions.push({ label: "Learn More", action: "learn_more" });
      break;
    case "contact":
    case "urgent":
      actions.push({ label: "Call Now", action: "call" });
      actions.push({ label: "Email Us", action: "email" });
      break;
    default:
      if (response.toLowerCase().includes("consultation") || response.toLowerCase().includes("book")) {
        actions.push({ label: "Book Consultation", action: "book" });
      }
      if (response.toLowerCase().includes("contact") || response.toLowerCase().includes("call")) {
        actions.push({ label: "Contact Us", action: "contact" });
      }
  }

  // Default actions if none specified
  if (actions.length === 0) {
    actions.push({ label: "Ask Another Question", action: "continue" });
    actions.push({ label: "Contact Us", action: "contact" });
  }

  return actions.slice(0, 3);
}

/**
 * Log conversation exchange to database
 */
async function logExchange(
  userMessage: string,
  response: GeneratedResponse,
  responseTimeMs: number,
  options?: {
    sessionId?: string;
    userId?: string;
    userEmail?: string;
  }
): Promise<void> {
  // Only log if session ID is provided
  if (!options?.sessionId) return;

  try {
    await logConversationExchange({
      sessionId: options.sessionId,
      userId: options.userId,
      userEmail: options.userEmail,
      userMessage,
      assistantMessage: response.content,
      intent: response.intent,
      knowledgeItemsUsed: response.knowledgeUsed,
      xpAwarded: response.xpAwarded,
      confidenceScore: response.confidence,
      responseTimeMs,
      source: response.source,
      modelUsed: response.modelUsed || "knowledge-base",
      actions: response.actions,
      showDisclaimer: response.showDisclaimer,
    });
  } catch (error) {
    console.error("Failed to log conversation exchange:", error);
    // Don't throw - logging failure shouldn't break the chat
  }
}

/**
 * Generate a response using the configured AI model or knowledge base
 */
export async function generateResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = [],
  options?: {
    sessionId?: string;
    userId?: string;
    userEmail?: string;
  }
): Promise<GeneratedResponse> {
  const startTime = Date.now();

  // Get current settings and model config
  const { modelKey, config, settings } = await getActiveModelConfig();

  // Detect intent and find relevant knowledge
  const intent = detectIntent(message);
  const relevantKnowledge = findRelevantKnowledge(message);

  // Helper to create response and log
  const createAndLogResponse = async (response: GeneratedResponse): Promise<GeneratedResponse> => {
    const responseTimeMs = Date.now() - startTime;
    await logExchange(message, response, responseTimeMs, options);
    return response;
  };

  // SAFETY CHECK 1: Emergency
  if (settings.enableEmergencyCheck && isEmergency(message)) {
    return createAndLogResponse({
      content: generateEmergencyResponse(),
      streaming: false,
      source: "fallback",
      intent: "emergency",
      confidence: 1.0,
      knowledgeUsed: [],
      xpAwarded: 0,
      actions: [],
      showDisclaimer: false,
      isEmergency: true,
    });
  }

  // SAFETY CHECK 2: Legal advice request
  if (settings.enableLegalAdviceGuard && isAskingForLegalAdvice(message)) {
    return createAndLogResponse({
      content: generateLegalAdviceRefusal(),
      streaming: false,
      source: "fallback",
      intent: "legal_advice_refusal",
      confidence: 1.0,
      knowledgeUsed: [],
      xpAwarded: 5,
      actions: [
        { label: "Book Consultation", action: "book" },
        { label: "Call Us", action: "call" },
      ],
      showDisclaimer: false,
      isLegalAdviceRefusal: true,
    });
  }

  // SAFETY CHECK 3: Objection handling
  if (settings.enableObjectionHandling) {
    const objection = handleObjection(message);
    if (objection.handled) {
      return createAndLogResponse({
        content: objection.response,
        streaming: false,
        source: "fallback",
        intent: "objection_handled",
        confidence: 0.9,
        knowledgeUsed: [],
        xpAwarded: 5,
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "Learn More", action: "learn_more" },
        ],
        showDisclaimer: false,
      });
    }
  }

  // CALENDAR CHECK
  if (settings.enableCalendarIntegration && isCalendarQuery(message)) {
    const calendarResponse = generateCalendarResponse(message);
    if (calendarResponse) {
      return createAndLogResponse({
        content: calendarResponse,
        streaming: false,
        source: "knowledge_base",
        intent: "booking",
        confidence: 0.85,
        knowledgeUsed: [],
        xpAwarded: 10,
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "Call Us", action: "call" },
        ],
        showDisclaimer: false,
      });
    }
  }

  // If using "none" model or knowledge base only, use knowledge base directly
  if (config.provider === "none") {
    const response = generateKnowledgeBasedResponse(message, relevantKnowledge, intent);
    const xpAwarded = relevantKnowledge.length > 0
      ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
      : 5;

    return createAndLogResponse({
      content: response,
      streaming: false,
      source: "knowledge_base",
      modelUsed: "knowledge-base",
      intent,
      confidence: relevantKnowledge.length > 0 ? relevantKnowledge[0].confidenceLevel / 10 : 0.5,
      knowledgeUsed: relevantKnowledge.map((k) => k.title),
      xpAwarded,
      actions: generateActions(response, intent, relevantKnowledge),
      showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
    });
  }

  // Try to generate AI response
  try {
    const aiResponse = await generateAIResponse(
      message,
      conversationHistory,
      relevantKnowledge,
      config,
      settings
    );

    if (aiResponse) {
      const xpAwarded = relevantKnowledge.length > 0
        ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
        : 5;

      return createAndLogResponse({
        content: aiResponse,
        streaming: false,
        source: "ai",
        modelUsed: config.model,
        intent,
        confidence: relevantKnowledge.length > 0 ? relevantKnowledge[0].confidenceLevel / 10 : 0.7,
        knowledgeUsed: relevantKnowledge.map((k) => k.title),
        xpAwarded,
        actions: generateActions(aiResponse, intent, relevantKnowledge),
        showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
      });
    }
  } catch (error) {
    console.error("AI response generation failed:", error);
  }

  // Fallback to knowledge base
  const fallbackResponse = generateKnowledgeBasedResponse(message, relevantKnowledge, intent);
  const xpAwarded = relevantKnowledge.length > 0
    ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
    : 5;

  return createAndLogResponse({
    content: fallbackResponse,
    streaming: false,
    source: "knowledge_base",
    modelUsed: "knowledge-base",
    intent,
    confidence: relevantKnowledge.length > 0 ? relevantKnowledge[0].confidenceLevel / 10 : 0.5,
    knowledgeUsed: relevantKnowledge.map((k) => k.title),
    xpAwarded,
    actions: generateActions(fallbackResponse, intent, relevantKnowledge),
    showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
  });
}

/**
 * Generate AI response based on provider
 */
async function generateAIResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  relevantKnowledge: KnowledgeItem[],
  config: AIModelConfig,
  settings: BaileyAISettings
): Promise<string | null> {
  // Build context from knowledge base
  let contextInfo = "";
  if (settings.enableKnowledgeBase && relevantKnowledge.length > 0) {
    contextInfo = "\n\n## Relevant Knowledge Base Information:\n";
    relevantKnowledge.forEach((item, index) => {
      contextInfo += `\n### ${index + 1}. ${item.title}\n`;
      contextInfo += `${item.content}\n`;
      if (item.responseTemplate) {
        contextInfo += `\nSuggested response approach: ${item.responseTemplate.substring(0, 300)}...\n`;
      }
    });
  }

  const systemPrompt = settings.systemPromptVersion === "full"
    ? INTAKE_ASSISTANT_PROMPT
    : INTAKE_ASSISTANT_PROMPT_SHORT;

  const fullSystemPrompt = systemPrompt + (contextInfo ? `\n\n${contextInfo}` : "");

  switch (config.provider) {
    case "openai":
      return await generateOpenAIResponse(
        message,
        conversationHistory,
        fullSystemPrompt,
        config,
        settings
      );

    case "anthropic":
      return await generateAnthropicResponse(
        message,
        conversationHistory,
        fullSystemPrompt,
        config,
        settings
      );

    case "google":
      return await generateGoogleResponse(
        message,
        conversationHistory,
        fullSystemPrompt,
        config,
        settings
      );

    default:
      return null;
  }
}

async function generateOpenAIResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string,
  config: AIModelConfig,
  settings: BaileyAISettings
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  // Add conversation history (last 10 messages)
  conversationHistory.slice(-10).forEach((msg) => {
    messages.push({ role: msg.role, content: msg.content });
  });

  // Add current message
  messages.push({ role: "user", content: message });

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: settings.maxResponseLength || config.maxTokens,
    temperature: settings.temperature || config.temperature,
    messages,
  });

  return response.choices[0]?.message?.content || null;
}

async function generateAnthropicResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string,
  config: AIModelConfig,
  settings: BaileyAISettings
): Promise<string | null> {
  const client = getAnthropicClient();
  if (!client) return null;

  const messages: { role: "user" | "assistant"; content: string }[] = [];

  // Add conversation history (last 10 messages)
  conversationHistory.slice(-10).forEach((msg) => {
    messages.push({ role: msg.role, content: msg.content });
  });

  // Add current message
  messages.push({ role: "user", content: message });

  const response = await client.messages.create({
    model: config.model,
    max_tokens: settings.maxResponseLength || config.maxTokens,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : null;
}

async function generateGoogleResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string,
  config: AIModelConfig,
  settings: BaileyAISettings
): Promise<string | null> {
  // Google Generative AI using REST API
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  // Build contents array for Gemini
  const contents: { role: string; parts: { text: string }[] }[] = [];

  // Add conversation history
  conversationHistory.slice(-10).forEach((msg) => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  });

  // Add current message with system prompt context
  contents.push({
    role: "user",
    parts: [{ text: `${systemPrompt}\n\nUser message: ${message}` }],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: settings.maxResponseLength || config.maxTokens,
          temperature: settings.temperature || config.temperature,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Google AI API error:", await response.text());
    return null;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

/**
 * Generate streaming response (for supported providers)
 */
export async function* generateStreamingResponse(
  message: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = [],
  options?: {
    sessionId?: string;
    userId?: string;
    userEmail?: string;
  }
): AsyncGenerator<StreamChunk> {
  const startTime = Date.now();
  const { modelKey, config, settings } = await getActiveModelConfig();

  // Detect intent and find relevant knowledge
  const intent = detectIntent(message);
  const relevantKnowledge = findRelevantKnowledge(message);

  // Helper to log streaming response
  const logStreamingResponse = async (content: string, metadata: Partial<GeneratedResponse>) => {
    if (!options?.sessionId) return;
    const responseTimeMs = Date.now() - startTime;
    try {
      await logConversationExchange({
        sessionId: options.sessionId,
        userId: options.userId,
        userEmail: options.userEmail,
        userMessage: message,
        assistantMessage: content,
        intent: metadata.intent || intent,
        knowledgeItemsUsed: metadata.knowledgeUsed || relevantKnowledge.map((k) => k.title),
        xpAwarded: metadata.xpAwarded || 0,
        confidenceScore: metadata.confidence,
        responseTimeMs,
        source: metadata.source,
        modelUsed: metadata.modelUsed || "knowledge-base",
        actions: metadata.actions as unknown[],
        showDisclaimer: metadata.showDisclaimer,
      });
    } catch (error) {
      console.error("Failed to log streaming conversation:", error);
    }
  };

  // Yield start event
  yield {
    type: "start",
    metadata: {
      intent,
      confidence: relevantKnowledge.length > 0 ? relevantKnowledge[0].confidenceLevel / 10 : 0.5,
      knowledgeUsed: relevantKnowledge.map((k) => k.title),
    },
  };

  // Safety checks (non-streaming responses)
  if (settings.enableEmergencyCheck && isEmergency(message)) {
    const response = generateEmergencyResponse();
    yield { type: "delta", content: response };
    const metadata = {
      content: response,
      source: "fallback" as const,
      isEmergency: true,
      xpAwarded: 0,
      actions: [],
      showDisclaimer: false,
    };
    yield { type: "complete", metadata };
    await logStreamingResponse(response, metadata);
    return;
  }

  if (settings.enableLegalAdviceGuard && isAskingForLegalAdvice(message)) {
    const response = generateLegalAdviceRefusal();
    yield { type: "delta", content: response };
    const metadata = {
      content: response,
      source: "fallback" as const,
      isLegalAdviceRefusal: true,
      xpAwarded: 5,
      actions: [
        { label: "Book Consultation", action: "book" },
        { label: "Call Us", action: "call" },
      ],
      showDisclaimer: false,
    };
    yield { type: "complete", metadata };
    await logStreamingResponse(response, metadata);
    return;
  }

  if (settings.enableObjectionHandling) {
    const objection = handleObjection(message);
    if (objection.handled) {
      yield { type: "delta", content: objection.response };
      const metadata = {
        content: objection.response,
        source: "fallback" as const,
        xpAwarded: 5,
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "Learn More", action: "learn_more" },
        ],
        showDisclaimer: false,
      };
      yield { type: "complete", metadata };
      await logStreamingResponse(objection.response, metadata);
      return;
    }
  }

  if (settings.enableCalendarIntegration && isCalendarQuery(message)) {
    const calendarResponse = generateCalendarResponse(message);
    if (calendarResponse) {
      yield { type: "delta", content: calendarResponse };
      const metadata = {
        content: calendarResponse,
        source: "knowledge_base" as const,
        xpAwarded: 10,
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "Call Us", action: "call" },
        ],
        showDisclaimer: false,
      };
      yield { type: "complete", metadata };
      await logStreamingResponse(calendarResponse, metadata);
      return;
    }
  }

  // If no AI model, use knowledge base
  if (config.provider === "none" || !config.supportsStreaming) {
    const response = generateKnowledgeBasedResponse(message, relevantKnowledge, intent);
    yield { type: "delta", content: response };

    const xpAwarded = relevantKnowledge.length > 0
      ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
      : 5;

    const metadata = {
      content: response,
      source: "knowledge_base" as const,
      modelUsed: "knowledge-base",
      xpAwarded,
      actions: generateActions(response, intent, relevantKnowledge),
      showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
    };
    yield { type: "complete", metadata };
    await logStreamingResponse(response, metadata);
    return;
  }

  // Try streaming with AI model
  try {
    let fullContent = "";

    if (config.provider === "openai") {
      const client = getOpenAIClient();
      if (client) {
        // Build context
        let contextInfo = "";
        if (settings.enableKnowledgeBase && relevantKnowledge.length > 0) {
          contextInfo = "\n\n## Relevant Knowledge Base Information:\n";
          relevantKnowledge.forEach((item, index) => {
            contextInfo += `\n### ${index + 1}. ${item.title}\n`;
            contextInfo += `${item.content}\n`;
          });
        }

        const systemPrompt = (settings.systemPromptVersion === "full"
          ? INTAKE_ASSISTANT_PROMPT
          : INTAKE_ASSISTANT_PROMPT_SHORT) + (contextInfo ? `\n\n${contextInfo}` : "");

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
        ];

        conversationHistory.slice(-10).forEach((msg) => {
          messages.push({ role: msg.role, content: msg.content });
        });
        messages.push({ role: "user", content: message });

        const stream = await client.chat.completions.create({
          model: config.model,
          max_tokens: settings.maxResponseLength || config.maxTokens,
          temperature: settings.temperature || config.temperature,
          messages,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullContent += content;
            yield { type: "delta", content };
          }
        }
      }
    }

    // If we got content, complete successfully
    if (fullContent) {
      const xpAwarded = relevantKnowledge.length > 0
        ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
        : 5;

      const metadata = {
        content: fullContent,
        source: "ai" as const,
        modelUsed: config.model,
        xpAwarded,
        actions: generateActions(fullContent, intent, relevantKnowledge),
        showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
      };
      yield { type: "complete", metadata };
      await logStreamingResponse(fullContent, metadata);
      return;
    }
  } catch (error) {
    console.error("Streaming error:", error);
  }

  // Fallback to knowledge base
  const fallbackResponse = generateKnowledgeBasedResponse(message, relevantKnowledge, intent);
  yield { type: "delta", content: fallbackResponse };

  const xpAwarded = relevantKnowledge.length > 0
    ? Math.round(relevantKnowledge[0].xpReward * (relevantKnowledge[0].confidenceLevel / 10))
    : 5;

  const metadata = {
    content: fallbackResponse,
    source: "knowledge_base" as const,
    modelUsed: "knowledge-base",
    xpAwarded,
    actions: generateActions(fallbackResponse, intent, relevantKnowledge),
    showDisclaimer: relevantKnowledge.some((k) => k.requiresDisclaimer),
  };
  yield { type: "complete", metadata };
  await logStreamingResponse(fallbackResponse, metadata);
}
