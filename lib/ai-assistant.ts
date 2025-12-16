/**
 * AI Assistant using Claude API
 * Provides legal Q&A, document recommendations, and practice guidance
 */

import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// System prompt for legal assistant
const SYSTEM_PROMPT = `You are a helpful legal assistant for Hamilton Bailey Law, a law firm specialising in legal services for medical practitioners in Australia.

Your role is to:
1. Answer general questions about medical practice law in Australia
2. Help users understand what legal documents they might need
3. Explain common legal concepts in simple terms
4. Guide users to appropriate services or consultations

IMPORTANT GUIDELINES:
- You are NOT providing legal advice. Always clarify this when appropriate.
- For specific legal questions, recommend booking a consultation with a lawyer.
- Be helpful, professional, and empathetic.
- Focus on Australian law and healthcare regulations (AHPRA, Medicare, etc.)
- When unsure, say so and recommend speaking with a lawyer.
- Keep responses concise but informative.

AVAILABLE SERVICES (you can recommend these):
- Initial Consultation (free 10 minutes)
- Practice Setup & Compliance Review
- Tenant Doctor Agreements
- Employment Contracts
- AHPRA Compliance
- Partnership Agreements
- Practice Sale/Purchase
- Document Templates (DIY options)

AVAILABLE DOCUMENT TEMPLATES:
- Tenant Doctor Agreement ($299)
- Service Agreement - Practitioner ($249)
- Patient Consent Forms ($99)
- Privacy Policy for Medical Practices ($149)
- Employment Contract - Medical Staff ($199)
- Partnership Agreement - Medical Practice ($349)

When recommending documents, provide brief explanations of what each covers.`;

// Types
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestedActions?: {
    type: "book_consultation" | "view_document" | "contact" | "learn_more";
    label: string;
    url?: string;
    documentId?: string;
  }[];
  relatedDocuments?: {
    id: string;
    name: string;
    price: number;
    relevance: string;
  }[];
}

/**
 * Chat with the AI assistant
 */
export async function chatWithAssistant(
  messages: ChatMessage[],
  context?: {
    currentPage?: string;
    userType?: string;
    previousPurchases?: string[];
  }
): Promise<ChatResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      message: "I apologize, but I'm currently unavailable. Please contact us directly at enquiries@hamiltonbailey.com or call (08) 8212 8585.",
      suggestedActions: [
        { type: "contact", label: "Contact Us", url: "/contact" },
      ],
    };
  }

  try {
    // Build context-aware system prompt
    let enhancedSystemPrompt = SYSTEM_PROMPT;

    if (context) {
      enhancedSystemPrompt += `\n\nCONTEXT:`;
      if (context.currentPage) {
        enhancedSystemPrompt += `\n- User is currently viewing: ${context.currentPage}`;
      }
      if (context.userType) {
        enhancedSystemPrompt += `\n- User type: ${context.userType}`;
      }
      if (context.previousPurchases && context.previousPurchases.length > 0) {
        enhancedSystemPrompt += `\n- Previous purchases: ${context.previousPurchases.join(", ")}`;
      }
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Using Haiku for speed and cost efficiency
      max_tokens: 1024,
      system: enhancedSystemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // Parse response for suggested actions
    const suggestedActions = extractSuggestedActions(assistantMessage);
    const relatedDocuments = extractRelatedDocuments(assistantMessage);

    return {
      message: assistantMessage,
      suggestedActions,
      relatedDocuments,
    };
  } catch (error) {
    console.error("AI Assistant error:", error);
    return {
      message: "I apologize, but I'm having trouble responding right now. Please try again in a moment, or contact us directly for assistance.",
      suggestedActions: [
        { type: "contact", label: "Contact Us", url: "/contact" },
      ],
    };
  }
}

/**
 * Extract suggested actions from AI response
 */
function extractSuggestedActions(response: string): ChatResponse["suggestedActions"] {
  const actions: ChatResponse["suggestedActions"] = [];

  // Check for consultation mentions
  if (
    response.toLowerCase().includes("consultation") ||
    response.toLowerCase().includes("book") ||
    response.toLowerCase().includes("speak with")
  ) {
    actions.push({
      type: "book_consultation",
      label: "Book Consultation",
      url: "/book-appointment",
    });
  }

  // Check for document mentions
  const documentKeywords = [
    "tenant doctor",
    "service agreement",
    "employment contract",
    "privacy policy",
    "partnership agreement",
  ];

  for (const keyword of documentKeywords) {
    if (response.toLowerCase().includes(keyword)) {
      actions.push({
        type: "view_document",
        label: "View Documents",
        url: "/documents",
      });
      break;
    }
  }

  // Check for contact suggestions
  if (
    response.toLowerCase().includes("contact") ||
    response.toLowerCase().includes("call") ||
    response.toLowerCase().includes("email")
  ) {
    actions.push({
      type: "contact",
      label: "Contact Us",
      url: "/contact",
    });
  }

  return actions.length > 0 ? actions : undefined;
}

/**
 * Extract related documents from AI response
 */
function extractRelatedDocuments(response: string): ChatResponse["relatedDocuments"] {
  const documents: ChatResponse["relatedDocuments"] = [];

  const documentMap: Record<string, { name: string; price: number; id: string }> = {
    "tenant doctor": { name: "Tenant Doctor Agreement", price: 299, id: "tenant-doctor-agreement" },
    "service agreement": { name: "Service Agreement - Practitioner", price: 249, id: "service-agreement" },
    "consent form": { name: "Patient Consent Forms", price: 99, id: "consent-forms" },
    "privacy policy": { name: "Privacy Policy for Medical Practices", price: 149, id: "privacy-policy" },
    "employment contract": { name: "Employment Contract - Medical Staff", price: 199, id: "employment-contract" },
    "partnership agreement": { name: "Partnership Agreement", price: 349, id: "partnership-agreement" },
  };

  const lowerResponse = response.toLowerCase();

  for (const [keyword, doc] of Object.entries(documentMap)) {
    if (lowerResponse.includes(keyword)) {
      documents.push({
        id: doc.id,
        name: doc.name,
        price: doc.price,
        relevance: "Mentioned in response",
      });
    }
  }

  return documents.length > 0 ? documents : undefined;
}

/**
 * Get smart document recommendations based on user profile
 */
export async function getSmartRecommendations(
  userProfile: {
    practiceType?: string;
    practiceSize?: string;
    currentNeeds?: string[];
    previousPurchases?: string[];
    browsingHistory?: string[];
  }
): Promise<{
  recommendations: {
    id: string;
    name: string;
    price: number;
    reason: string;
    priority: "high" | "medium" | "low";
  }[];
}> {
  // Document catalog
  const allDocuments = [
    { id: "tenant-doctor-agreement", name: "Tenant Doctor Agreement", price: 299, category: "agreements", practiceTypes: ["gp", "specialist", "allied"] },
    { id: "service-agreement", name: "Service Agreement - Practitioner", price: 249, category: "agreements", practiceTypes: ["all"] },
    { id: "consent-forms", name: "Patient Consent Forms Bundle", price: 99, category: "compliance", practiceTypes: ["all"] },
    { id: "privacy-policy", name: "Privacy Policy for Medical Practices", price: 149, category: "compliance", practiceTypes: ["all"] },
    { id: "employment-contract", name: "Employment Contract - Medical Staff", price: 199, category: "employment", practiceTypes: ["all"] },
    { id: "partnership-agreement", name: "Partnership Agreement", price: 349, category: "business", practiceTypes: ["gp", "specialist"] },
    { id: "ahpra-compliance-checklist", name: "AHPRA Compliance Checklist", price: 79, category: "compliance", practiceTypes: ["all"] },
    { id: "contractor-agreement", name: "Independent Contractor Agreement", price: 249, category: "agreements", practiceTypes: ["all"] },
  ];

  const recommendations: {
    id: string;
    name: string;
    price: number;
    reason: string;
    priority: "high" | "medium" | "low";
  }[] = [];

  // Filter out already purchased
  const availableDocs = allDocuments.filter(
    (doc) => !userProfile.previousPurchases?.includes(doc.id)
  );

  // Score and prioritize documents
  for (const doc of availableDocs) {
    let score = 0;
    let reason = "";

    // Practice type matching
    if (
      doc.practiceTypes.includes("all") ||
      (userProfile.practiceType && doc.practiceTypes.includes(userProfile.practiceType))
    ) {
      score += 2;
    }

    // Current needs matching
    if (userProfile.currentNeeds) {
      if (
        userProfile.currentNeeds.includes("compliance") &&
        doc.category === "compliance"
      ) {
        score += 3;
        reason = "Matches your compliance needs";
      }
      if (
        userProfile.currentNeeds.includes("hiring") &&
        doc.category === "employment"
      ) {
        score += 3;
        reason = "Essential for hiring staff";
      }
      if (
        userProfile.currentNeeds.includes("tenant") &&
        doc.id.includes("tenant")
      ) {
        score += 4;
        reason = "Perfect for your tenant arrangement";
      }
    }

    // Browsing history boost
    if (userProfile.browsingHistory?.some((page) => page.includes(doc.id))) {
      score += 2;
      reason = reason || "Based on your browsing history";
    }

    // Essential documents boost
    if (["privacy-policy", "consent-forms"].includes(doc.id)) {
      score += 1;
      reason = reason || "Essential for all medical practices";
    }

    if (score > 0) {
      recommendations.push({
        id: doc.id,
        name: doc.name,
        price: doc.price,
        reason: reason || "Recommended for your practice",
        priority: score >= 4 ? "high" : score >= 2 ? "medium" : "low",
      });
    }
  }

  // Sort by priority and limit
  const sortedRecs = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  return { recommendations: sortedRecs };
}

/**
 * FAQ Knowledge Base for quick responses
 */
export const FAQ_KNOWLEDGE_BASE = [
  {
    question: "What is a Tenant Doctor Agreement?",
    answer: "A Tenant Doctor Agreement is a contract between a medical practice (landlord) and a doctor (tenant) who operates within the practice. It covers terms like rent, consulting room usage, shared services, billing arrangements, and responsibilities. This is essential when doctors work as independent contractors within an existing practice.",
    keywords: ["tenant doctor", "agreement", "contract", "consulting room"],
  },
  {
    question: "Do I need AHPRA registration to practice?",
    answer: "Yes, all medical practitioners in Australia must be registered with AHPRA (Australian Health Practitioner Regulation Agency) to practice legally. This includes doctors, nurses, pharmacists, and other health professionals. AHPRA also sets standards for conduct and professional development.",
    keywords: ["ahpra", "registration", "practice", "regulation"],
  },
  {
    question: "What documents do I need to start a medical practice?",
    answer: "Starting a medical practice typically requires: business registration documents, professional indemnity insurance, AHPRA registration, privacy policies, patient consent forms, employment contracts for staff, and depending on your setup, lease agreements or tenant doctor agreements. We can help you ensure you have all required documentation.",
    keywords: ["start practice", "documents", "new practice", "setup"],
  },
  {
    question: "How much does a consultation cost?",
    answer: "Consultation fees vary based on the complexity of your matter. Initial consultations start from $320 for 30 minutes, and standard consultations range from $330-$550 per hour. We always provide a cost estimate before proceeding with any work.",
    keywords: ["cost", "fee", "consultation", "price", "charge"],
  },
  {
    question: "Can I use template documents for my practice?",
    answer: "Yes, well-drafted template documents can save time and money. Our templates are specifically designed for Australian medical practices and comply with current regulations. However, for complex arrangements or unique situations, we recommend having a lawyer review or customize the documents for your specific needs.",
    keywords: ["template", "document", "diy", "self-service"],
  },
];

/**
 * Find relevant FAQ answers
 */
export function findRelevantFAQs(query: string): typeof FAQ_KNOWLEDGE_BASE {
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);

  return FAQ_KNOWLEDGE_BASE.filter((faq) => {
    const keywordMatches = faq.keywords.some(
      (keyword) =>
        queryLower.includes(keyword) ||
        words.some((word) => keyword.includes(word) && word.length > 3)
    );
    return keywordMatches;
  }).slice(0, 3);
}
