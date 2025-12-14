/**
 * Chat Persistence Service - Advanced User Preference Learning
 *
 * This service provides comprehensive conversation persistence, user preference
 * extraction via NLP, personalized greetings, and cross-session continuity.
 *
 * Features:
 * - Permanent localStorage + Supabase sync
 * - Advanced NLP user preference extraction
 * - Personalized greeting generation
 * - Conversation resumption
 * - Browser fingerprinting
 * - Sentiment analysis
 * - Lead scoring integration
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper to access tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ChatMessage {
  id?: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  confidenceScore?: number;
  knowledgeItemsUsed?: string[];
  intentDetected?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatConversation {
  id: string;
  userId?: string;
  sessionId: string;
  startedAt: Date;
  lastMessageAt: Date;
  status: "active" | "completed" | "abandoned";
  summary?: string;
  leadScore: number;
  leadCategory: "hot" | "warm" | "cold";
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  // Practice information
  practiceType:
    | "medical"
    | "dental"
    | "pharmacy"
    | "allied_health"
    | "veterinary"
    | "other"
    | null;
  businessSize: "solo" | "small" | "medium" | "large" | null;

  // Communication preferences
  communicationStyle: "urgent" | "detailed" | "concise" | "standard";
  urgencyLevel: "high" | "medium" | "low";

  // Topic interests (arrays)
  topicInterests: string[];
  preferredTimeSlots: string[];

  // Interaction data
  totalInteractions: number;
  lastInteraction: string | null;
  sentimentHistory: Array<{
    timestamp: string;
    sentiment: "positive" | "neutral" | "negative";
    messageLength: number;
  }>;

  // Behavioral patterns
  averageMessageLength: number;
  preferredResponseStyle: string | null;
  commonQuestionTypes: string[];

  // Engagement metrics
  sessionDuration: number;
  returnVisitor: boolean;
  conversionPotential: "high" | "medium" | "low" | "unknown";

  // Objections and concerns
  objectionsRaised: string[];
}

export interface ChatContext {
  userProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    practiceType?: string;
  };
  currentIntent?: string;
  questionsAnswered: number;
  visitCount: number;
  lastUpdated?: string;
  personalizedGreeting?: string;
  bookingProgress?: {
    serviceSelected?: string;
    dateSelected?: Date;
    timeSelected?: string;
  };
}

// ============================================================================
// PATTERN DEFINITIONS FOR NLP
// ============================================================================

const PRACTICE_TYPE_PATTERNS: Record<string, string[]> = {
  medical: [
    "medical practice",
    "gp",
    "doctor",
    "physician",
    "clinic",
    "general practice",
    "medical centre",
    "healthcare",
    "patient",
    "medical professional",
    "specialist",
    "surgeon",
    "psychiatrist",
    "radiologist",
    "pathologist",
    "cardiologist",
    "dermatologist",
    "pediatrician",
    "obstetrician",
    "oncologist",
  ],
  dental: [
    "dental",
    "dentist",
    "orthodontist",
    "oral",
    "teeth",
    "dental practice",
    "dental clinic",
    "dental surgery",
    "periodontal",
    "endodontic",
    "prosthodontist",
  ],
  pharmacy: [
    "pharmacy",
    "pharmacist",
    "chemist",
    "dispensary",
    "medication",
    "pharmaceutical",
    "prescriptions",
    "drugs",
    "medicines",
  ],
  allied_health: [
    "physiotherapy",
    "psychology",
    "occupational therapy",
    "speech therapy",
    "dietitian",
    "podiatry",
    "chiropractic",
    "osteopath",
    "naturopath",
    "exercise physiologist",
    "audiologist",
    "optometrist",
  ],
  veterinary: [
    "veterinary",
    "vet",
    "animal",
    "veterinarian",
    "pet",
    "livestock",
    "animal hospital",
  ],
};

const COMMUNICATION_STYLE_PATTERNS: Record<string, string[]> = {
  urgent: [
    "urgent",
    "asap",
    "quickly",
    "emergency",
    "immediate",
    "rush",
    "time sensitive",
    "deadline",
    "hurry",
    "fast track",
    "priority",
    "critical",
  ],
  detailed: [
    "detailed",
    "comprehensive",
    "thorough",
    "in-depth",
    "extensive",
    "complete",
    "full analysis",
    "breakdown",
    "explain everything",
    "all the details",
  ],
  concise: [
    "brief",
    "summary",
    "quick",
    "short",
    "simple",
    "straightforward",
    "bullet points",
    "key points",
    "main issues",
    "bottom line",
  ],
};

const TOPIC_INTEREST_PATTERNS: Record<string, string[]> = {
  compliance: [
    "compliance",
    "regulation",
    "ahpra",
    "medicare",
    "tga",
    "privacy act",
    "health insurance",
    "professional standards",
    "accreditation",
    "audit",
    "inspection",
    "certification",
    "licensing",
  ],
  contracts: [
    "contract",
    "agreement",
    "lease",
    "employment",
    "partnership",
    "service agreement",
    "supplier contract",
    "tenant doctor",
    "locum agreement",
    "associate agreement",
  ],
  employment_law: [
    "employment",
    "staff",
    "employee",
    "workplace",
    "termination",
    "dismissal",
    "discrimination",
    "harassment",
    "workers compensation",
    "fair work",
    "industrial relations",
    "hiring",
  ],
  commercial_law: [
    "business",
    "commercial",
    "corporation",
    "company",
    "pty ltd",
    "partnership",
    "joint venture",
    "merger",
    "acquisition",
    "intellectual property",
    "trademark",
    "copyright",
  ],
  property_law: [
    "property",
    "real estate",
    "purchase",
    "sale",
    "conveyancing",
    "title",
    "mortgage",
    "easement",
    "strata",
    "development",
    "leasing",
  ],
  payroll_tax: [
    "payroll tax",
    "state revenue",
    "tax audit",
    "contractor classification",
    "employment tax",
  ],
  pricing: [
    "price",
    "cost",
    "fee",
    "quote",
    "how much",
    "pricing",
    "budget",
    "affordable",
  ],
};

const TIME_SLOT_PATTERNS: Record<string, string[]> = {
  morning: [
    "morning",
    "am",
    "9am",
    "10am",
    "11am",
    "early",
    "before lunch",
    "first thing",
    "start of day",
  ],
  afternoon: [
    "afternoon",
    "pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "after lunch",
    "mid-day",
    "later in day",
  ],
  evening: ["evening", "5pm", "6pm", "after work", "end of day", "late"],
};

const OBJECTION_PATTERNS: Record<string, string[]> = {
  price_concern: [
    "expensive",
    "cost too much",
    "budget",
    "afford",
    "cheaper",
    "discount",
    "too pricey",
  ],
  time_constraint: [
    "too busy",
    "no time",
    "schedule",
    "hectic",
    "swamped",
    "overwhelmed",
  ],
  indecision: [
    "not sure",
    "maybe later",
    "thinking about it",
    "need to consider",
    "have to think",
    "uncertain",
  ],
  trust_concern: [
    "how do i know",
    "can i trust",
    "reviews",
    "references",
    "experience",
    "credentials",
  ],
};

const SENTIMENT_PATTERNS = {
  positive: [
    "good",
    "great",
    "excellent",
    "happy",
    "satisfied",
    "pleased",
    "thank you",
    "thanks",
    "helpful",
    "perfect",
    "wonderful",
    "appreciate",
    "love",
    "amazing",
  ],
  negative: [
    "bad",
    "terrible",
    "awful",
    "unhappy",
    "frustrated",
    "angry",
    "disappointed",
    "annoyed",
    "useless",
    "waste",
    "horrible",
    "hate",
  ],
};

// ============================================================================
// CHAT PERSISTENCE SERVICE CLASS
// ============================================================================

class ChatPersistenceService {
  private currentConversation: ChatConversation | null = null;
  private messageQueue: ChatMessage[] = [];
  private isProcessing = false;
  private supabase = createClient();

  // LocalStorage keys
  private readonly SESSION_KEY = "hbl_chat_session_permanent";
  private readonly CONTEXT_KEY = "hbl_chat_context_permanent";
  private readonly HISTORY_KEY = "hbl_chat_history_permanent";
  private readonly PREFERENCES_KEY = "hbl_user_preferences_permanent";
  private readonly PERSONALIZATION_KEY = "hbl_personalization_permanent";
  private readonly LAST_VISIT_KEY = "hbl_last_visit";

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeSession();
      // Process message queue every 2 seconds
      setInterval(() => this.processMessageQueue(), 2000);
      // Save to localStorage every 10 seconds
      setInterval(() => this.savePersistentData(), 10000);
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private async initializeSession(): Promise<void> {
    try {
      // Check for existing session
      const savedSession = localStorage.getItem(this.SESSION_KEY);

      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        this.currentConversation = {
          ...sessionData,
          startedAt: new Date(sessionData.startedAt),
          lastMessageAt: new Date(sessionData.lastMessageAt),
        };
        await this.loadConversationFromDatabase(sessionData.id);
        this.loadPersistentUserData();
        return;
      }

      // Create new session
      await this.createNewConversation();
    } catch (error) {
      console.error("Error initializing chat session:", error);
      this.loadPersistentUserData();
    }
  }

  // ==========================================================================
  // CONVERSATION MANAGEMENT
  // ==========================================================================

  async createNewConversation(): Promise<ChatConversation> {
    const sessionId = this.generateSessionId();
    const conversation: ChatConversation = {
      id: this.generateUUID(),
      sessionId,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      status: "active",
      leadScore: 0,
      leadCategory: "cold",
      metadata: {
        source: "web",
        device: this.getDeviceType(),
        referrer: typeof document !== "undefined" ? document.referrer : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
    };

    try {
      // Get current user if authenticated
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (user) {
        conversation.userId = user.id;
      }

      // Save to database
      const { error } = await getDb(this.supabase)
        .from("chat_conversations")
        .insert({
          id: conversation.id,
          user_id: conversation.userId,
          session_id: conversation.sessionId,
          started_at: conversation.startedAt.toISOString(),
          updated_at: conversation.lastMessageAt.toISOString(),
          status: conversation.status,
          lead_score: conversation.leadScore,
          lead_category: conversation.leadCategory,
          metadata: conversation.metadata,
        })
        .select()
        .single();

      if (error) {
        console.warn("Could not save to database, using local only:", error);
      }

      this.currentConversation = conversation;
      this.saveSessionToLocalStorage();
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      this.currentConversation = conversation;
      this.saveSessionToLocalStorage();
      return conversation;
    }
  }

  async saveMessage(
    role: "user" | "assistant",
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!this.currentConversation) {
      await this.createNewConversation();
    }

    const message: ChatMessage = {
      conversationId: this.currentConversation!.id,
      role,
      content,
      timestamp: new Date(),
      metadata,
    };

    // Add to queue for batch processing
    this.messageQueue.push(message);

    // Update last message time
    this.currentConversation!.lastMessageAt = new Date();
    this.saveSessionToLocalStorage();

    // Save message permanently to localStorage
    this.saveMessageToLocalStorage(message);

    // Extract and save user preferences from user messages
    if (role === "user") {
      this.extractAndSaveUserPreferences(message);
    }

    // Update context
    if (metadata) {
      this.updateContext({
        currentIntent: metadata.intent as string,
        questionsAnswered: (this.getContext().questionsAnswered || 0) + 1,
      });
    }
  }

  private async processMessageQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) return;

    this.isProcessing = true;
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    try {
      // Batch insert messages
      const { error } = await getDb(this.supabase).from("chat_messages").insert(
        messagesToProcess.map((msg) => ({
          conversation_id: msg.conversationId,
          role: msg.role,
          content: msg.content,
          created_at: msg.timestamp.toISOString(),
          confidence_score: msg.confidenceScore,
          knowledge_items_used: msg.knowledgeItemsUsed,
          intent: msg.intentDetected,
          metadata: msg.metadata,
        }))
      );

      if (error) {
        console.warn("Error saving messages to database:", error);
        // Re-add messages to queue on failure
        this.messageQueue.unshift(...messagesToProcess);
      }

      // Update conversation last message time
      if (this.currentConversation) {
        await getDb(this.supabase)
          .from("chat_conversations")
          .update({
            updated_at: new Date().toISOString(),
            lead_score: this.currentConversation.leadScore,
            lead_category: this.currentConversation.leadCategory,
          })
          .eq("id", this.currentConversation.id);
      }
    } catch (error) {
      console.error("Error processing message queue:", error);
      this.messageQueue.unshift(...messagesToProcess);
    } finally {
      this.isProcessing = false;
    }
  }

  async getConversationHistory(conversationId?: string): Promise<ChatMessage[]> {
    const targetId = conversationId || this.currentConversation?.id;
    if (!targetId) return [];

    try {
      const { data, error } = await getDb(this.supabase)
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", targetId)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        confidenceScore: msg.confidence_score,
        knowledgeItemsUsed: msg.knowledge_items_used,
        intentDetected: msg.intent_detected,
        metadata: msg.metadata,
      }));
    } catch (error) {
      console.error("Error loading conversation history:", error);
      // Fallback to localStorage
      return this.getLocalConversationHistory();
    }
  }

  async getUserConversations(
    userId: string,
    limit = 10
  ): Promise<ChatConversation[]> {
    try {
      const { data, error } = await getDb(this.supabase)
        .from("chat_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((conv: any) => ({
        id: conv.id,
        userId: conv.user_id,
        sessionId: conv.session_id,
        startedAt: new Date(conv.started_at),
        lastMessageAt: new Date(conv.updated_at),
        status: conv.status,
        summary: conv.summary,
        leadScore: conv.lead_score,
        leadCategory: conv.lead_category,
        metadata: conv.metadata,
      }));
    } catch (error) {
      console.error("Error loading user conversations:", error);
      return [];
    }
  }

  async resumeConversation(conversationId: string): Promise<boolean> {
    try {
      const { data, error } = await getDb(this.supabase)
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;

      this.currentConversation = {
        id: data.id,
        userId: data.user_id,
        sessionId: data.session_id,
        startedAt: new Date(data.started_at),
        lastMessageAt: new Date(data.updated_at),
        status: data.status,
        summary: data.summary,
        leadScore: data.lead_score,
        leadCategory: data.lead_category,
        metadata: data.metadata,
      };

      this.saveSessionToLocalStorage();
      return true;
    } catch (error) {
      console.error("Error resuming conversation:", error);
      return false;
    }
  }

  async endConversation(summary?: string): Promise<void> {
    if (!this.currentConversation) return;

    try {
      // Process any remaining messages
      await this.processMessageQueue();

      // Update conversation status
      await getDb(this.supabase)
        .from("chat_conversations")
        .update({
          status: "completed",
          summary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", this.currentConversation.id);

      // Save context for future reference
      const context = this.getContext();
      localStorage.setItem(
        `${this.CONTEXT_KEY}_${this.currentConversation.id}`,
        JSON.stringify(context)
      );

      this.currentConversation = null;
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  }

  // ==========================================================================
  // USER PREFERENCE EXTRACTION (NLP)
  // ==========================================================================

  private extractAndSaveUserPreferences(message: ChatMessage): void {
    try {
      const preferences = this.getUserPreferences();
      const content = message.content.toLowerCase();

      // Practice type detection
      for (const [type, patterns] of Object.entries(PRACTICE_TYPE_PATTERNS)) {
        if (this.matchesPatterns(content, patterns)) {
          preferences.practiceType = type as UserPreferences["practiceType"];
          break;
        }
      }

      // Communication style detection
      for (const [style, patterns] of Object.entries(
        COMMUNICATION_STYLE_PATTERNS
      )) {
        if (this.matchesPatterns(content, patterns)) {
          preferences.communicationStyle =
            style as UserPreferences["communicationStyle"];
          break;
        }
      }

      // Topic interest detection
      for (const [topic, patterns] of Object.entries(TOPIC_INTEREST_PATTERNS)) {
        if (this.matchesPatterns(content, patterns)) {
          if (!preferences.topicInterests.includes(topic)) {
            preferences.topicInterests.push(topic);
          }
        }
      }

      // Time slot preference detection
      for (const [slot, patterns] of Object.entries(TIME_SLOT_PATTERNS)) {
        if (this.matchesPatterns(content, patterns)) {
          if (!preferences.preferredTimeSlots.includes(slot)) {
            preferences.preferredTimeSlots.push(slot);
          }
        }
      }

      // Objection detection
      for (const [objection, patterns] of Object.entries(OBJECTION_PATTERNS)) {
        if (this.matchesPatterns(content, patterns)) {
          if (!preferences.objectionsRaised.includes(objection)) {
            preferences.objectionsRaised.push(objection);
          }
        }
      }

      // Urgency level detection
      if (
        this.matchesPatterns(content, [
          "emergency",
          "crisis",
          "lawsuit",
          "court date",
          "deadline tomorrow",
          "served papers",
          "investigation",
          "audit notice",
        ])
      ) {
        preferences.urgencyLevel = "high";
      } else if (
        this.matchesPatterns(content, [
          "soon",
          "few days",
          "this week",
          "next week",
          "planning",
        ])
      ) {
        preferences.urgencyLevel = "medium";
      }

      // Business size detection
      if (
        this.matchesPatterns(content, [
          "solo practice",
          "individual",
          "myself",
          "single doctor",
          "one person",
          "just me",
        ])
      ) {
        preferences.businessSize = "solo";
      } else if (
        this.matchesPatterns(content, [
          "small practice",
          "few doctors",
          "small team",
          "2-5 doctors",
          "couple of",
        ])
      ) {
        preferences.businessSize = "small";
      } else if (
        this.matchesPatterns(content, [
          "medium practice",
          "several doctors",
          "6-15",
          "moderate size",
        ])
      ) {
        preferences.businessSize = "medium";
      } else if (
        this.matchesPatterns(content, [
          "large practice",
          "medical centre",
          "hospital",
          "many doctors",
          "multiple locations",
        ])
      ) {
        preferences.businessSize = "large";
      }

      // Update interaction metadata
      preferences.lastInteraction = new Date().toISOString();
      preferences.totalInteractions = (preferences.totalInteractions || 0) + 1;

      // Track message sentiment
      const sentiment = this.analyzeSentiment(content);
      preferences.sentimentHistory.push({
        timestamp: new Date().toISOString(),
        sentiment,
        messageLength: content.length,
      });

      // Keep only last 50 sentiment readings
      if (preferences.sentimentHistory.length > 50) {
        preferences.sentimentHistory = preferences.sentimentHistory.slice(-50);
      }

      // Update average message length
      const totalLength = preferences.sentimentHistory.reduce(
        (sum, s) => sum + s.messageLength,
        0
      );
      preferences.averageMessageLength =
        totalLength / preferences.sentimentHistory.length;

      // Update conversion potential based on engagement
      this.updateConversionPotential(preferences);

      // Check if return visitor
      const lastVisit = localStorage.getItem(this.LAST_VISIT_KEY);
      if (lastVisit) {
        const daysSinceLastVisit =
          (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24);
        preferences.returnVisitor = daysSinceLastVisit > 0;
      }

      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));

      // Update lead score based on preferences
      this.updateLeadScore(preferences);
    } catch (error) {
      console.error("Error extracting user preferences:", error);
    }
  }

  private updateConversionPotential(preferences: UserPreferences): void {
    let score = 0;

    // High engagement signals
    if (preferences.totalInteractions >= 10) score += 2;
    else if (preferences.totalInteractions >= 5) score += 1;

    // Topic interest in high-value areas
    const highValueTopics = ["contracts", "compliance", "payroll_tax"];
    const hasHighValueInterest = preferences.topicInterests.some((t) =>
      highValueTopics.includes(t)
    );
    if (hasHighValueInterest) score += 2;

    // Urgency increases conversion potential
    if (preferences.urgencyLevel === "high") score += 2;
    else if (preferences.urgencyLevel === "medium") score += 1;

    // Positive sentiment
    const recentSentiments = preferences.sentimentHistory.slice(-5);
    const positiveCount = recentSentiments.filter(
      (s) => s.sentiment === "positive"
    ).length;
    if (positiveCount >= 3) score += 1;

    // Business size (larger = higher value)
    if (preferences.businessSize === "large") score += 2;
    else if (preferences.businessSize === "medium") score += 1;

    // Set conversion potential
    if (score >= 6) preferences.conversionPotential = "high";
    else if (score >= 3) preferences.conversionPotential = "medium";
    else preferences.conversionPotential = "low";
  }

  private updateLeadScore(preferences: UserPreferences): void {
    if (!this.currentConversation) return;

    let score = this.currentConversation.leadScore;

    // Increment based on engagement
    score += 2; // Base increment per message

    // Bonus for high-value signals
    if (preferences.urgencyLevel === "high") score += 5;
    if (preferences.topicInterests.includes("payroll_tax")) score += 3;
    if (preferences.topicInterests.includes("contracts")) score += 3;

    // Penalty for objections (but not too much - shows engagement)
    if (preferences.objectionsRaised.length > 0) score += 1;

    // Cap at 100
    score = Math.min(score, 100);

    // Update category
    let category: "hot" | "warm" | "cold" = "cold";
    if (score >= 70) category = "hot";
    else if (score >= 40) category = "warm";

    this.currentConversation.leadScore = score;
    this.currentConversation.leadCategory = category;
    this.saveSessionToLocalStorage();
  }

  // ==========================================================================
  // OBJECTION HANDLING
  // ==========================================================================

  detectObjection(
    message: string
  ): { type: string; response: string } | null {
    const content = message.toLowerCase();

    if (
      this.matchesPatterns(content, OBJECTION_PATTERNS.price_concern)
    ) {
      return {
        type: "price_concern",
        response: `I completely understand that legal fees are an important consideration. At Hamilton Bailey Legal, we believe in transparent pricing and value for money.\n\n**We offer:**\n• Fixed-fee arrangements for many services\n• Clear quotes before we begin any work\n• Flexible payment options\n• Free initial consultation to assess your needs\n\nInvesting in proper legal advice now can save significant costs and stress in the future. Would you like me to arrange a no-obligation consultation to discuss your specific needs and provide a transparent quote?`,
      };
    }

    if (
      this.matchesPatterns(content, OBJECTION_PATTERNS.time_constraint)
    ) {
      return {
        type: "time_constraint",
        response: `I appreciate how valuable your time is, especially when running a medical practice. That's exactly why we've designed our services to be as efficient and convenient as possible.\n\n**We offer:**\n• Video consultations to save travel time\n• Evening and weekend appointments\n• Quick turnaround on documents\n• Streamlined processes\n\nMany of our clients are surprised at how quickly we can resolve their legal matters. Would you prefer a quick 15-minute phone consultation to discuss your needs?`,
      };
    }

    if (
      this.matchesPatterns(content, OBJECTION_PATTERNS.indecision)
    ) {
      return {
        type: "indecision",
        response: `That's perfectly understandable - legal matters deserve careful consideration. While you're thinking it over, perhaps I can help by providing some relevant information?\n\nMany medical practitioners find it helpful to have an initial conversation just to understand their options, with no obligation to proceed. We often find that a brief chat can provide clarity and peace of mind.\n\nWould you like me to send you some information about common legal issues for medical practices, or would you prefer to schedule a brief, no-pressure conversation for when it suits you?`,
      };
    }

    if (
      this.matchesPatterns(content, OBJECTION_PATTERNS.trust_concern)
    ) {
      return {
        type: "trust_concern",
        response: `That's an excellent question - choosing the right legal partner is important.\n\n**About Hamilton Bailey Legal:**\n• Specialized in medical practice law\n• Serving healthcare professionals since establishment\n• Expert knowledge of AHPRA, Medicare, and payroll tax compliance\n• Strong track record with medical practices\n\n**Our Approach:**\n• Free initial consultation to ensure we're the right fit\n• Clear communication throughout\n• Fixed fees where possible - no surprises\n\nWould you like to speak with our team to see if we're the right fit for your needs?`,
      };
    }

    return null;
  }

  // ==========================================================================
  // CONTEXT AND PERSONALIZATION
  // ==========================================================================

  updateContext(updates: Partial<ChatContext>): void {
    const currentContext = this.getContext();
    const newContext = {
      ...currentContext,
      ...updates,
      lastUpdated: new Date().toISOString(),
      visitCount: (currentContext.visitCount || 0) + 1,
    };
    localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(newContext));
    this.savePersonalizationData(newContext);
  }

  getContext(): ChatContext {
    try {
      const saved = localStorage.getItem(this.CONTEXT_KEY);
      const baseContext = saved
        ? JSON.parse(saved)
        : { questionsAnswered: 0, visitCount: 1 };

      // Enhance with personalization
      return {
        ...baseContext,
        personalizedGreeting: this.generatePersonalizedGreeting(baseContext),
      };
    } catch {
      return { questionsAnswered: 0, visitCount: 1 };
    }
  }

  generatePersonalizedGreeting(context: ChatContext): string {
    const preferences = this.getUserPreferences();
    const visitCount = context.visitCount || 1;
    const hour = new Date().getHours();

    // Time-based greeting
    let timeGreeting = "Hello";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";

    if (visitCount === 1) {
      return `${timeGreeting}! Welcome to Hamilton Bailey Legal. I'm here to help you with medical practice law, compliance, and legal documents. How can I assist you today?`;
    } else if (visitCount <= 3) {
      if (preferences.practiceType) {
        return `${timeGreeting}! Welcome back. I see you're interested in ${preferences.practiceType} practice matters. What can I help you with today?`;
      }
      return `${timeGreeting}! Welcome back. How can I assist you today?`;
    } else if (visitCount <= 10) {
      const topics = preferences.topicInterests.slice(0, 2).join(" and ");
      if (topics) {
        return `${timeGreeting}! Great to see you again. Based on our previous conversations about ${topics}, what legal matter can I help you with today?`;
      }
      return `${timeGreeting}! Great to see you again. I'm here to help with your legal questions.`;
    } else {
      // Loyal visitor
      return `${timeGreeting}! It's wonderful to see you back. As always, I'm ready to assist with any legal questions about your ${preferences.practiceType || "medical"} practice.`;
    }
  }

  getUserPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem(this.PREFERENCES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Return defaults
    }

    return {
      practiceType: null,
      businessSize: null,
      communicationStyle: "standard",
      urgencyLevel: "low",
      topicInterests: [],
      preferredTimeSlots: [],
      totalInteractions: 0,
      lastInteraction: null,
      sentimentHistory: [],
      averageMessageLength: 0,
      preferredResponseStyle: null,
      commonQuestionTypes: [],
      sessionDuration: 0,
      returnVisitor: false,
      conversionPotential: "unknown",
      objectionsRaised: [],
    };
  }

  getCurrentConversation(): ChatConversation | null {
    return this.currentConversation;
  }

  // ==========================================================================
  // INTENT DETECTION
  // ==========================================================================

  detectIntent(message: string): string {
    const content = message.toLowerCase();

    if (
      this.matchesPatterns(content, [
        "book",
        "appointment",
        "consultation",
        "schedule",
        "meet",
      ])
    ) {
      return "booking";
    }
    if (
      this.matchesPatterns(content, [
        "price",
        "cost",
        "fee",
        "how much",
        "quote",
      ])
    ) {
      return "pricing";
    }
    if (
      this.matchesPatterns(content, ["document", "template", "contract", "form"])
    ) {
      return "documents";
    }
    if (
      this.matchesPatterns(content, [
        "medical",
        "healthcare",
        "practice",
        "doctor",
        "clinic",
      ])
    ) {
      return "medical_law";
    }
    if (
      this.matchesPatterns(content, [
        "commercial",
        "business",
        "contract",
        "company",
      ])
    ) {
      return "commercial_law";
    }
    if (
      this.matchesPatterns(content, [
        "compliance",
        "ahpra",
        "regulation",
        "audit",
      ])
    ) {
      return "compliance";
    }
    if (
      this.matchesPatterns(content, [
        "payroll tax",
        "state revenue",
        "contractor",
      ])
    ) {
      return "payroll_tax";
    }
    if (
      this.matchesPatterns(content, [
        "contact",
        "phone",
        "email",
        "location",
        "address",
      ])
    ) {
      return "contact";
    }
    if (
      this.matchesPatterns(content, ["hi", "hello", "hey", "good morning"])
    ) {
      return "greeting";
    }
    if (
      this.matchesPatterns(content, ["help", "assist", "support", "question"])
    ) {
      return "support";
    }

    return "general_inquiry";
  }

  generateConversationSummary(): string {
    if (!this.currentConversation) return "";

    const history = this.getLocalConversationHistory();
    const userMessages = history.filter((m) => m.role === "user");
    const topics = new Set<string>();

    userMessages.forEach((msg) => {
      const intent = this.detectIntent(msg.content);
      topics.add(intent);
    });

    const topicList = Array.from(topics).join(", ");
    const questionCount = userMessages.length;
    const preferences = this.getUserPreferences();

    return `Chat session with ${questionCount} questions about: ${topicList}. Practice type: ${preferences.practiceType || "unknown"}. Lead score: ${this.currentConversation.leadScore}, Category: ${this.currentConversation.leadCategory}`;
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  async logAnalytics(data: {
    userMessage: string;
    baileyResponse: string;
    knowledgeItemsUsed?: string[];
    confidenceScore?: number;
    responseTimeMs?: number;
    intentCategory?: string;
  }): Promise<void> {
    try {
      await getDb(this.supabase).from("bailey_analytics").insert({
        session_id: this.currentConversation?.sessionId || "unknown",
        conversation_id: this.currentConversation?.id,
        user_message: data.userMessage,
        bailey_response: data.baileyResponse,
        knowledge_items_used: data.knowledgeItemsUsed,
        confidence_score: data.confidenceScore,
        response_time_ms: data.responseTimeMs,
        page_url: typeof window !== "undefined" ? window.location.href : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        intent_category: data.intentCategory,
        lead_score_delta: 2, // Default increment
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private matchesPatterns(content: string, patterns: string[]): boolean {
    return patterns.some((pattern) => content.includes(pattern));
  }

  private analyzeSentiment(
    content: string
  ): "positive" | "neutral" | "negative" {
    const words = content.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (SENTIMENT_PATTERNS.positive.includes(word)) positiveCount++;
      if (SENTIMENT_PATTERNS.negative.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUUID(): string {
    // UUID v4 implementation that works in browser context
    // crypto.randomUUID() is not available on client-side
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getDeviceType(): string {
    if (typeof navigator === "undefined") return "unknown";
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    )
      return "mobile";
    return "desktop";
  }

  private saveSessionToLocalStorage(): void {
    if (this.currentConversation && typeof localStorage !== "undefined") {
      localStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(this.currentConversation)
      );
    }
  }

  private saveMessageToLocalStorage(message: ChatMessage): void {
    try {
      const existing = localStorage.getItem(this.HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];

      history.push({
        ...message,
        timestamp: message.timestamp.toISOString(),
      });

      // Keep only last 500 messages
      if (history.length > 500) {
        history.splice(0, history.length - 500);
      }

      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving message to localStorage:", error);
    }
  }

  private getLocalConversationHistory(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (!saved) return [];

      const history = JSON.parse(saved);
      return history.map((msg: ChatMessage & { timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch {
      return [];
    }
  }

  private async loadConversationFromDatabase(
    conversationId: string
  ): Promise<void> {
    try {
      const { data, error } = await getDb(this.supabase)
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error) throw error;

      this.currentConversation = {
        id: data.id,
        userId: data.user_id,
        sessionId: data.session_id,
        startedAt: new Date(data.started_at),
        lastMessageAt: new Date(data.updated_at),
        status: data.status,
        summary: data.summary,
        leadScore: data.lead_score || 0,
        leadCategory: data.lead_category || "cold",
        metadata: data.metadata,
      };
    } catch (error) {
      console.error("Error loading conversation from database:", error);
    }
  }

  private loadPersistentUserData(): void {
    try {
      const history = localStorage.getItem(this.HISTORY_KEY);
      if (history) {
        const messages = JSON.parse(history);
        console.log(
          `[ChatPersistence] Loaded ${messages.length} previous messages`
        );
      }

      const preferences = this.getUserPreferences();
      if (preferences.totalInteractions > 0) {
        console.log(
          `[ChatPersistence] Loaded preferences from ${preferences.totalInteractions} interactions`
        );
      }
    } catch (error) {
      console.error("Error loading persistent user data:", error);
    }
  }

  private savePersistentData(): void {
    try {
      this.saveSessionToLocalStorage();
      const context = this.getContext();
      localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(context));
      localStorage.setItem(this.LAST_VISIT_KEY, new Date().toISOString());
    } catch (error) {
      console.error("Error saving persistent data:", error);
    }
  }

  private savePersonalizationData(context: ChatContext): void {
    try {
      const personalization = {
        ...context,
        lastSaved: new Date().toISOString(),
        browserFingerprint: this.getBrowserFingerprint(),
      };
      localStorage.setItem(
        this.PERSONALIZATION_KEY,
        JSON.stringify(personalization)
      );
    } catch (error) {
      console.error("Error saving personalization data:", error);
    }
  }

  private getBrowserFingerprint(): string {
    if (typeof document === "undefined" || typeof navigator === "undefined") {
      return "server";
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillText("HBL Legal Browser Fingerprint", 2, 2);
      }

      return btoa(
        navigator.userAgent +
          navigator.language +
          screen.width +
          screen.height +
          new Date().getTimezoneOffset() +
          (canvas.toDataURL ? canvas.toDataURL() : "")
      ).substring(0, 20);
    } catch {
      return "unknown";
    }
  }

  // ==========================================================================
  // PUBLIC UTILITY METHODS
  // ==========================================================================

  getComprehensiveUserData(): {
    context: ChatContext;
    preferences: UserPreferences;
    conversationHistory: ChatMessage[];
    visitStats: {
      lastVisit: string | null;
      browserFingerprint: string;
    };
  } {
    return {
      context: this.getContext(),
      preferences: this.getUserPreferences(),
      conversationHistory: this.getLocalConversationHistory(),
      visitStats: {
        lastVisit: localStorage.getItem(this.LAST_VISIT_KEY),
        browserFingerprint: this.getBrowserFingerprint(),
      },
    };
  }

  clearAllPersistentData(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.CONTEXT_KEY);
    localStorage.removeItem(this.HISTORY_KEY);
    localStorage.removeItem(this.PREFERENCES_KEY);
    localStorage.removeItem(this.PERSONALIZATION_KEY);
    localStorage.removeItem(this.LAST_VISIT_KEY);
    this.currentConversation = null;
  }
}

// Export singleton instance
export const chatPersistenceService = new ChatPersistenceService();

// Export class for testing
export { ChatPersistenceService };
