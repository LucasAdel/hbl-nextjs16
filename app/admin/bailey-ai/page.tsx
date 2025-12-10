"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  BarChart3,
  MessageSquare,
  BookOpen,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Zap,
  Target,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface KnowledgeItem {
  id: string;
  category: string;
  subcategory?: string;
  topic: string;
  title: string;
  content: string;
  summary?: string;
  keywords: string[];
  intentPatterns?: string[];
  responseTemplate?: string;
  confidence: number;
  usageCount: number;
  lastUsed?: string;
  status: "active" | "draft" | "archived";
  source?: "static" | "database";
  isEditable?: boolean;
  requiresDisclaimer?: boolean;
  legalDisclaimer?: string;
  adviceLevel?: string;
  relatedProducts?: string[];
  xpReward?: number;
}

interface ConversationSummary {
  id: string;
  sessionId: string;
  userEmail?: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  leadScore: number;
  leadCategory: "hot" | "warm" | "cold";
  status: "active" | "completed" | "abandoned";
  primaryIntent?: string;
  summary?: string;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  knowledge_items_used?: string[];
  xp_awarded?: number;
  confidence_score?: number;
  response_time_ms?: number;
  created_at: string;
}

interface ConversationDetail extends ConversationSummary {
  messages: ConversationMessage[];
  xpEarned?: number;
  satisfactionRating?: number;
}

interface KnowledgeGap {
  id: string;
  query: string;
  detected_intent?: string;
  suggested_category?: string;
  frequency: number;
  priority: "high" | "medium" | "low";
  status: "open" | "addressed" | "dismissed";
  addressed_by_item_id?: string;
  created_at: string;
  updated_at: string;
}

interface DraftKnowledgeItem {
  category: string;
  subcategory?: string;
  topic: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  intentPatterns: string[];
  responseTemplate?: string;
  requiresDisclaimer: boolean;
  legalDisclaimer?: string;
  adviceLevel: string;
  relatedProducts?: string[];
  xpReward: number;
  confidence: number;
  rationale?: string;
  gapId?: string;
}

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  avgLeadScore: number;
  conversionRate: number;
  satisfactionScore: number;
  topIntents: { intent: string; count: number }[];
  topKnowledge: { title: string; count: number }[];
  leadDistribution: { category: string; count: number; percentage: number }[];
  dailyStats: { date: string; conversations: number; messages: number }[];
}

type TabType = "overview" | "knowledge" | "gaps" | "conversations" | "analytics" | "settings";

interface AIModelOption {
  key: string;
  provider: "openai" | "anthropic" | "google" | "none";
  displayName: string;
  description: string;
  available: boolean;
}

interface AISettings {
  activeModel: string;
  enableStreaming: boolean;
  enableKnowledgeBase: boolean;
  maxResponseLength: number;
  temperature: number;
  systemPromptVersion: "full" | "short";
  enableEmergencyCheck: boolean;
  enableLegalAdviceGuard: boolean;
  enableObjectionHandling: boolean;
  enableCalendarIntegration: boolean;
}

// Sample data - in production this would come from API
const sampleKnowledge: KnowledgeItem[] = [
  {
    id: "1",
    category: "compliance",
    topic: "AHPRA Advertising",
    title: "AHPRA Advertising Guidelines",
    content: "AHPRA has strict guidelines on healthcare advertising...",
    keywords: ["ahpra", "advertising", "marketing", "compliance"],
    confidence: 9,
    usageCount: 156,
    lastUsed: "2025-12-08T10:30:00Z",
    status: "active",
  },
  {
    id: "2",
    category: "telehealth",
    topic: "Consent Requirements",
    title: "Telehealth Consent Requirements",
    content: "Telehealth consultations require specific informed consent...",
    keywords: ["telehealth", "consent", "virtual", "remote"],
    confidence: 9,
    usageCount: 134,
    lastUsed: "2025-12-08T09:15:00Z",
    status: "active",
  },
  {
    id: "3",
    category: "employment",
    topic: "Staff Contracts",
    title: "Employment Contracts for Medical Practices",
    content: "Medical practices have unique employment needs...",
    keywords: ["employment", "contract", "staff", "hiring"],
    confidence: 8,
    usageCount: 98,
    lastUsed: "2025-12-07T16:45:00Z",
    status: "active",
  },
  {
    id: "4",
    category: "privacy",
    topic: "Privacy Policies",
    title: "Healthcare Privacy Policies",
    content: "Healthcare practices must have comprehensive privacy policies...",
    keywords: ["privacy", "policy", "data", "APPs"],
    confidence: 9,
    usageCount: 87,
    lastUsed: "2025-12-08T08:00:00Z",
    status: "active",
  },
  {
    id: "5",
    category: "practice",
    topic: "New Practice Setup",
    title: "Setting Up a New Medical Practice",
    content: "Starting a medical practice requires numerous legal documents...",
    keywords: ["new practice", "starting", "setup", "opening"],
    confidence: 10,
    usageCount: 203,
    lastUsed: "2025-12-08T11:00:00Z",
    status: "active",
  },
];

const sampleConversations: ConversationSummary[] = [
  {
    id: "conv-1",
    sessionId: "sess-abc123",
    userEmail: "dr.smith@example.com",
    startedAt: "2025-12-08T10:30:00Z",
    lastMessageAt: "2025-12-08T10:45:00Z",
    messageCount: 8,
    leadScore: 78,
    leadCategory: "hot",
    status: "completed",
    primaryIntent: "practice_setup",
    summary: "New GP looking to set up practice, interested in starter kit",
  },
  {
    id: "conv-2",
    sessionId: "sess-def456",
    startedAt: "2025-12-08T09:15:00Z",
    lastMessageAt: "2025-12-08T09:35:00Z",
    messageCount: 12,
    leadScore: 62,
    leadCategory: "warm",
    status: "active",
    primaryIntent: "compliance",
    summary: "Questions about AHPRA advertising compliance",
  },
  {
    id: "conv-3",
    sessionId: "sess-ghi789",
    userEmail: "reception@clinic.com.au",
    startedAt: "2025-12-08T08:00:00Z",
    lastMessageAt: "2025-12-08T08:10:00Z",
    messageCount: 4,
    leadScore: 35,
    leadCategory: "cold",
    status: "abandoned",
    primaryIntent: "pricing",
    summary: "Price inquiry, no engagement",
  },
  {
    id: "conv-4",
    sessionId: "sess-jkl012",
    startedAt: "2025-12-07T16:45:00Z",
    lastMessageAt: "2025-12-07T17:15:00Z",
    messageCount: 15,
    leadScore: 85,
    leadCategory: "hot",
    status: "completed",
    primaryIntent: "employment",
    summary: "Practice owner hiring first staff, purchased employment pack",
  },
];

const sampleAnalytics: AnalyticsData = {
  totalConversations: 847,
  totalMessages: 4523,
  avgResponseTime: 1.2,
  avgLeadScore: 52,
  conversionRate: 23.4,
  satisfactionScore: 4.6,
  topIntents: [
    { intent: "compliance", count: 234 },
    { intent: "pricing", count: 198 },
    { intent: "practice_setup", count: 156 },
    { intent: "telehealth", count: 123 },
    { intent: "employment", count: 98 },
  ],
  topKnowledge: [
    { title: "Setting Up a New Medical Practice", count: 203 },
    { title: "AHPRA Advertising Guidelines", count: 156 },
    { title: "Telehealth Consent Requirements", count: 134 },
    { title: "Employment Contracts", count: 98 },
    { title: "Privacy Policies", count: 87 },
  ],
  leadDistribution: [
    { category: "Hot", count: 127, percentage: 15 },
    { category: "Warm", count: 339, percentage: 40 },
    { category: "Cold", count: 381, percentage: 45 },
  ],
  dailyStats: [
    { date: "Dec 2", conversations: 28, messages: 142 },
    { date: "Dec 3", conversations: 35, messages: 189 },
    { date: "Dec 4", conversations: 42, messages: 215 },
    { date: "Dec 5", conversations: 38, messages: 198 },
    { date: "Dec 6", conversations: 45, messages: 234 },
    { date: "Dec 7", conversations: 52, messages: 278 },
    { date: "Dec 8", conversations: 48, messages: 256 },
  ],
};

export default function BaileyAIManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [knowledge, setKnowledge] = useState(sampleKnowledge);
  const [conversations, setConversations] = useState(sampleConversations);
  const [analytics, setAnalytics] = useState(sampleAnalytics);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeItem | null>(null);
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [knowledgeCategories, setKnowledgeCategories] = useState<string[]>([]);
  const [isSavingKnowledge, setIsSavingKnowledge] = useState(false);
  const [knowledgeMessage, setKnowledgeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gaps State
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  const [gapsPriorityFilter, setGapsPriorityFilter] = useState<string>("all");
  const [selectedGap, setSelectedGap] = useState<KnowledgeGap | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<DraftKnowledgeItem | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [showDraftReviewModal, setShowDraftReviewModal] = useState(false);
  const [gapsMessage, setGapsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "gaps", label: "Knowledge Gaps", icon: AlertCircle },
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "AI Settings", icon: Settings },
  ];

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({
    activeModel: "none",
    enableStreaming: true,
    enableKnowledgeBase: true,
    maxResponseLength: 500,
    temperature: 0.7,
    systemPromptVersion: "short",
    enableEmergencyCheck: true,
    enableLegalAdviceGuard: true,
    enableObjectionHandling: true,
    enableCalendarIntegration: true,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Available AI Models
  const aiModels: AIModelOption[] = [
    {
      key: "none",
      provider: "none",
      displayName: "Knowledge Base Only",
      description: "Use only the internal knowledge base. No AI model required. Zero API costs.",
      available: true,
    },
    {
      key: "gpt-4o-mini",
      provider: "openai",
      displayName: "GPT-4o Mini (OpenAI)",
      description: "Fast, cost-effective model. Best for simple queries. ~$0.15/1M tokens.",
      available: true, // Will check API key on load
    },
    {
      key: "gpt-4o",
      provider: "openai",
      displayName: "GPT-4o (OpenAI)",
      description: "Most capable OpenAI model. Better reasoning. ~$5/1M tokens.",
      available: true,
    },
    {
      key: "claude-3-haiku",
      provider: "anthropic",
      displayName: "Claude 3 Haiku (Anthropic)",
      description: "Fast and efficient. Great balance of speed and quality. ~$0.25/1M tokens.",
      available: true,
    },
    {
      key: "claude-3-sonnet",
      provider: "anthropic",
      displayName: "Claude 3 Sonnet (Anthropic)",
      description: "Balanced model. Better for nuanced responses. ~$3/1M tokens.",
      available: true,
    },
    {
      key: "gemini-1.5-flash",
      provider: "google",
      displayName: "Gemini 1.5 Flash (Google)",
      description: "Fast Google model. Good for quick responses. ~$0.075/1M tokens.",
      available: true,
    },
    {
      key: "gemini-1.5-pro",
      provider: "google",
      displayName: "Gemini 1.5 Pro (Google)",
      description: "Most capable Google model. Excellent for complex queries. ~$1.25/1M tokens.",
      available: true,
    },
  ];

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/bailey-ai/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            setAiSettings(data.settings);
          }
        }
      } catch (error) {
        console.error("Failed to load AI settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Load conversations and analytics from API
  useEffect(() => {
    const loadConversationsAndAnalytics = async () => {
      try {
        // Fetch conversations
        const convResponse = await fetch("/api/admin/conversations?pageSize=50");
        if (convResponse.ok) {
          const convData = await convResponse.json();
          if (convData.success && convData.conversations) {
            const mappedConversations: ConversationSummary[] = convData.conversations.map((c: {
              id: string;
              session_id: string;
              user_email?: string;
              created_at: string;
              updated_at: string;
              message_count: number;
              lead_score: number;
              lead_category: "hot" | "warm" | "cold" | null;
              status: string;
              primary_intent?: string;
            }) => ({
              id: c.id,
              sessionId: c.session_id,
              userEmail: c.user_email,
              startedAt: c.created_at,
              lastMessageAt: c.updated_at,
              messageCount: c.message_count,
              leadScore: c.lead_score || 0,
              leadCategory: c.lead_category || "cold",
              status: c.status || "active",
              primaryIntent: c.primary_intent,
            }));
            if (mappedConversations.length > 0) {
              setConversations(mappedConversations);
            }
          }
        }

        // Fetch analytics
        const analyticsResponse = await fetch("/api/admin/conversations?analytics=true");
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData.success && analyticsData.analytics) {
            const a = analyticsData.analytics;
            setAnalytics(prev => ({
              ...prev,
              totalConversations: a.totalConversations || prev.totalConversations,
              totalMessages: a.totalMessages || prev.totalMessages,
              avgLeadScore: a.avgLeadScore || prev.avgLeadScore,
              leadDistribution: [
                { category: "Hot", count: a.hotLeads || 0, percentage: a.totalConversations ? Math.round((a.hotLeads || 0) / a.totalConversations * 100) : 0 },
                { category: "Warm", count: a.warmLeads || 0, percentage: a.totalConversations ? Math.round((a.warmLeads || 0) / a.totalConversations * 100) : 0 },
                { category: "Cold", count: a.coldLeads || 0, percentage: a.totalConversations ? Math.round((a.coldLeads || 0) / a.totalConversations * 100) : 0 },
              ],
              topIntents: a.topIntents || prev.topIntents,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load conversations and analytics:", error);
      }
    };
    loadConversationsAndAnalytics();
  }, []);

  // Fetch conversation details when a conversation is selected
  useEffect(() => {
    const loadConversationDetail = async () => {
      if (!selectedConversation) {
        setConversationDetail(null);
        return;
      }

      setIsLoadingConversation(true);
      try {
        const response = await fetch(`/api/admin/conversations/${selectedConversation.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.conversation) {
            const c = data.conversation;
            setConversationDetail({
              id: c.id,
              sessionId: c.session_id,
              userEmail: c.user_email,
              startedAt: c.created_at || c.started_at,
              lastMessageAt: c.updated_at || c.ended_at,
              messageCount: c.message_count,
              leadScore: c.lead_score || 0,
              leadCategory: c.lead_category || "cold",
              status: c.status || "active",
              primaryIntent: c.primary_intent,
              xpEarned: c.xp_earned,
              satisfactionRating: c.satisfaction_rating,
              messages: (c.messages || []).map((m: {
                id: string;
                role: "user" | "assistant";
                content: string;
                intent?: string;
                knowledge_items_used?: string[];
                xp_awarded?: number;
                confidence_score?: number;
                response_time_ms?: number;
                created_at: string;
              }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                intent: m.intent,
                knowledge_items_used: m.knowledge_items_used,
                xp_awarded: m.xp_awarded,
                confidence_score: m.confidence_score,
                response_time_ms: m.response_time_ms,
                created_at: m.created_at,
              })),
            });
          }
        }
      } catch (error) {
        console.error("Failed to load conversation details:", error);
      } finally {
        setIsLoadingConversation(false);
      }
    };
    loadConversationDetail();
  }, [selectedConversation]);

  // Load knowledge items from API
  useEffect(() => {
    const loadKnowledgeItems = async () => {
      setIsLoadingKnowledge(true);
      try {
        const response = await fetch("/api/admin/knowledge-base");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const items: KnowledgeItem[] = data.data.items.map((item: {
              id: string;
              category: string;
              subcategory?: string;
              topic?: string;
              title: string;
              content: string;
              summary?: string;
              keywords?: string[];
              intentPatterns?: string[];
              responseTemplate?: string;
              confidenceLevel?: number;
              confidence?: number;
              usageCount?: number;
              lastUsed?: string;
              isActive?: boolean;
              source: "static" | "database";
              isEditable?: boolean;
              requiresDisclaimer?: boolean;
              legalDisclaimer?: string;
              adviceLevel?: string;
              relatedProducts?: string[];
              xpReward?: number;
            }) => ({
              id: item.id,
              category: item.category,
              subcategory: item.subcategory,
              topic: item.topic || item.category,
              title: item.title,
              content: item.content,
              summary: item.summary,
              keywords: item.keywords || [],
              intentPatterns: item.intentPatterns,
              responseTemplate: item.responseTemplate,
              confidence: item.confidenceLevel || item.confidence || 7,
              usageCount: item.usageCount || 0,
              lastUsed: item.lastUsed,
              status: item.isActive === false ? "archived" : "active",
              source: item.source,
              isEditable: item.isEditable,
              requiresDisclaimer: item.requiresDisclaimer,
              legalDisclaimer: item.legalDisclaimer,
              adviceLevel: item.adviceLevel,
              relatedProducts: item.relatedProducts,
              xpReward: item.xpReward,
            }));
            setKnowledge(items);
            if (data.data.categories) {
              setKnowledgeCategories(data.data.categories);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load knowledge items:", error);
      } finally {
        setIsLoadingKnowledge(false);
      }
    };
    loadKnowledgeItems();
  }, []);

  // Handle saving knowledge item
  const handleSaveKnowledgeItem = async (item: Partial<KnowledgeItem>) => {
    setIsSavingKnowledge(true);
    setKnowledgeMessage(null);

    try {
      const isUpdate = editingKnowledge && editingKnowledge.source === "database";
      const action = isUpdate ? "update" : "create";

      const response = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: isUpdate ? editingKnowledge.id : undefined,
          item: {
            category: item.category,
            subcategory: item.subcategory,
            topic: item.topic,
            title: item.title,
            content: item.content,
            summary: item.summary,
            keywords: item.keywords,
            intentPatterns: item.intentPatterns,
            responseTemplate: item.responseTemplate,
            confidenceLevel: item.confidence,
            requiresDisclaimer: item.requiresDisclaimer,
            legalDisclaimer: item.legalDisclaimer,
            adviceLevel: item.adviceLevel,
            relatedProducts: item.relatedProducts,
            xpReward: item.xpReward,
          },
          updates: isUpdate ? {
            category: item.category,
            subcategory: item.subcategory,
            topic: item.topic,
            title: item.title,
            content: item.content,
            summary: item.summary,
            keywords: item.keywords,
            intent_patterns: item.intentPatterns,
            response_template: item.responseTemplate,
            confidence_level: item.confidence,
            requires_disclaimer: item.requiresDisclaimer,
            legal_disclaimer: item.legalDisclaimer,
            advice_level: item.adviceLevel,
            related_products: item.relatedProducts,
            xp_reward: item.xpReward,
          } : undefined,
        }),
      });

      if (response.ok) {
        setKnowledgeMessage({ type: "success", text: isUpdate ? "Item updated successfully!" : "Item created successfully!" });
        setShowKnowledgeEditor(false);
        setEditingKnowledge(null);
        // Refresh knowledge items
        const refreshResponse = await fetch("/api/admin/knowledge-base");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.success && data.data) {
            const items: KnowledgeItem[] = data.data.items.map((i: {
              id: string;
              category: string;
              subcategory?: string;
              topic?: string;
              title: string;
              content: string;
              summary?: string;
              keywords?: string[];
              confidenceLevel?: number;
              confidence?: number;
              usageCount?: number;
              lastUsed?: string;
              isActive?: boolean;
              source: "static" | "database";
              isEditable?: boolean;
            }) => ({
              id: i.id,
              category: i.category,
              subcategory: i.subcategory,
              topic: i.topic || i.category,
              title: i.title,
              content: i.content,
              summary: i.summary,
              keywords: i.keywords || [],
              confidence: i.confidenceLevel || i.confidence || 7,
              usageCount: i.usageCount || 0,
              status: i.isActive === false ? "archived" : "active",
              source: i.source,
              isEditable: i.isEditable,
            }));
            setKnowledge(items);
          }
        }
      } else {
        const data = await response.json();
        setKnowledgeMessage({ type: "error", text: data.error || "Failed to save item" });
      }
    } catch (error) {
      setKnowledgeMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  // Handle deleting knowledge item
  const handleDeleteKnowledge = async (item: KnowledgeItem) => {
    if (!item.isEditable || item.source === "static") {
      setKnowledgeMessage({ type: "error", text: "Static knowledge items cannot be deleted." });
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: item.id }),
      });

      if (response.ok) {
        setKnowledgeMessage({ type: "success", text: "Item deleted successfully!" });
        setKnowledge(prev => prev.filter(k => k.id !== item.id));
      } else {
        const data = await response.json();
        setKnowledgeMessage({ type: "error", text: data.error || "Failed to delete item" });
      }
    } catch (error) {
      setKnowledgeMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  // Load knowledge gaps
  useEffect(() => {
    const loadGaps = async () => {
      if (activeTab !== "gaps") return;

      setIsLoadingGaps(true);
      try {
        const params = new URLSearchParams({ action: "gaps", pageSize: "100" });
        if (gapsPriorityFilter !== "all") {
          params.append("priority", gapsPriorityFilter);
        }

        const response = await fetch(`/api/admin/knowledge-base?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.gaps) {
            setGaps(data.data.gaps);
          }
        }
      } catch (error) {
        console.error("Failed to load gaps:", error);
        setGapsMessage({ type: "error", text: "Failed to load knowledge gaps" });
      } finally {
        setIsLoadingGaps(false);
      }
    };
    loadGaps();
  }, [activeTab, gapsPriorityFilter]);

  // Handle generating AI draft from gap
  const handleGenerateDraft = async (gap: KnowledgeGap) => {
    setSelectedGap(gap);
    setIsGeneratingDraft(true);
    setGapsMessage(null);

    try {
      const response = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-draft",
          gapId: gap.id,
          gapQuery: gap.query,
          gapIntent: gap.detected_intent,
          frequency: gap.frequency,
          suggestedCategory: gap.suggested_category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.draft) {
          setGeneratedDraft({
            ...data.data.draft,
            gapId: gap.id,
            rationale: data.data.rationale,
            confidence: 7,
            xpReward: 10,
          });
          setShowDraftReviewModal(true);
        }
      } else {
        const data = await response.json();
        setGapsMessage({ type: "error", text: data.error || "Failed to generate draft" });
      }
    } catch (error) {
      setGapsMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Handle dismissing a gap
  const handleDismissGap = async (gap: KnowledgeGap) => {
    if (!confirm(`Dismiss this gap?\n\n"${gap.query}"\n\nThis marks it as not needing knowledge content.`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss-gap", gapId: gap.id }),
      });

      if (response.ok) {
        setGapsMessage({ type: "success", text: "Gap dismissed successfully" });
        setGaps(prev => prev.filter(g => g.id !== gap.id));
      } else {
        const data = await response.json();
        setGapsMessage({ type: "error", text: data.error || "Failed to dismiss gap" });
      }
    } catch (error) {
      setGapsMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  // Handle creating knowledge item from draft
  const handleCreateFromDraft = async (draft: DraftKnowledgeItem) => {
    setIsSavingKnowledge(true);

    try {
      const response = await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          gapId: draft.gapId,
          item: {
            category: draft.category,
            subcategory: draft.subcategory,
            topic: draft.topic,
            title: draft.title,
            content: draft.content,
            summary: draft.summary,
            keywords: draft.keywords,
            intentPatterns: draft.intentPatterns,
            responseTemplate: draft.responseTemplate,
            confidenceLevel: draft.confidence,
            requiresDisclaimer: draft.requiresDisclaimer,
            legalDisclaimer: draft.legalDisclaimer,
            adviceLevel: draft.adviceLevel,
            relatedProducts: draft.relatedProducts,
            xpReward: draft.xpReward,
          },
        }),
      });

      if (response.ok) {
        setGapsMessage({ type: "success", text: "Knowledge item created and gap addressed!" });
        setShowDraftReviewModal(false);
        setGeneratedDraft(null);
        setSelectedGap(null);
        // Remove addressed gap from list
        if (draft.gapId) {
          setGaps(prev => prev.filter(g => g.id !== draft.gapId));
        }
        // Switch to knowledge tab to see the new item
        setActiveTab("knowledge");
        // Refresh knowledge items
        const refreshResponse = await fetch("/api/admin/knowledge-base");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (data.success && data.data) {
            const items: KnowledgeItem[] = data.data.items.map((i: {
              id: string;
              category: string;
              subcategory?: string;
              topic?: string;
              title: string;
              content: string;
              summary?: string;
              keywords?: string[];
              confidenceLevel?: number;
              confidence?: number;
              usageCount?: number;
              isActive?: boolean;
              source: "static" | "database";
              isEditable?: boolean;
            }) => ({
              id: i.id,
              category: i.category,
              subcategory: i.subcategory,
              topic: i.topic || i.category,
              title: i.title,
              content: i.content,
              summary: i.summary,
              keywords: i.keywords || [],
              confidence: i.confidenceLevel || i.confidence || 7,
              usageCount: i.usageCount || 0,
              status: i.isActive === false ? "archived" : "active",
              source: i.source,
              isEditable: i.isEditable,
            }));
            setKnowledge(items);
          }
        }
      } else {
        const data = await response.json();
        setGapsMessage({ type: "error", text: data.error || "Failed to create knowledge item" });
      }
    } catch (error) {
      setGapsMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSavingKnowledge(false);
    }
  };

  // Filter gaps by priority
  const filteredGaps = gaps.filter(gap => {
    if (gapsPriorityFilter === "all") return true;
    return gap.priority === gapsPriorityFilter;
  });

  // Get priority badge styling
  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  // Save settings handler
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsMessage(null);

    try {
      const response = await fetch("/api/bailey-ai/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });

      if (response.ok) {
        setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        const data = await response.json();
        setSettingsMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (error) {
      setSettingsMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch conversations
      const convResponse = await fetch("/api/admin/conversations?pageSize=50");
      if (convResponse.ok) {
        const convData = await convResponse.json();
        if (convData.success && convData.conversations) {
          const mappedConversations: ConversationSummary[] = convData.conversations.map((c: {
            id: string;
            session_id: string;
            user_email?: string;
            created_at: string;
            updated_at: string;
            message_count: number;
            lead_score: number;
            lead_category: "hot" | "warm" | "cold" | null;
            status: string;
            primary_intent?: string;
          }) => ({
            id: c.id,
            sessionId: c.session_id,
            userEmail: c.user_email,
            startedAt: c.created_at,
            lastMessageAt: c.updated_at,
            messageCount: c.message_count,
            leadScore: c.lead_score || 0,
            leadCategory: c.lead_category || "cold",
            status: c.status || "active",
            primaryIntent: c.primary_intent,
          }));
          if (mappedConversations.length > 0) {
            setConversations(mappedConversations);
          }
        }
      }

      // Fetch analytics
      const analyticsResponse = await fetch("/api/admin/conversations?analytics=true");
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success && analyticsData.analytics) {
          const a = analyticsData.analytics;
          setAnalytics(prev => ({
            ...prev,
            totalConversations: a.totalConversations || prev.totalConversations,
            totalMessages: a.totalMessages || prev.totalMessages,
            avgLeadScore: a.avgLeadScore || prev.avgLeadScore,
            leadDistribution: [
              { category: "Hot", count: a.hotLeads || 0, percentage: a.totalConversations ? Math.round((a.hotLeads || 0) / a.totalConversations * 100) : 0 },
              { category: "Warm", count: a.warmLeads || 0, percentage: a.totalConversations ? Math.round((a.warmLeads || 0) / a.totalConversations * 100) : 0 },
              { category: "Cold", count: a.coldLeads || 0, percentage: a.totalConversations ? Math.round((a.coldLeads || 0) / a.totalConversations * 100) : 0 },
            ],
            topIntents: a.topIntents || prev.topIntents,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLeadCategoryIcon = (category: "hot" | "warm" | "cold") => {
    switch (category) {
      case "hot":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "warm":
        return <ThermometerSun className="h-4 w-4 text-amber-500" />;
      case "cold":
        return <Snowflake className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      abandoned: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
      draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const filteredKnowledge = knowledge.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      (conv.userEmail?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (conv.summary?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      conv.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bailey AI Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage knowledge base, conversations, and analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 border-b border-gray-200 dark:border-gray-700 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Conversations"
                value={analytics.totalConversations.toLocaleString()}
                change="+12.5%"
                trend="up"
                icon={MessageSquare}
              />
              <StatCard
                title="Avg Response Time"
                value={`${analytics.avgResponseTime}s`}
                change="-0.3s"
                trend="up"
                icon={Clock}
              />
              <StatCard
                title="Conversion Rate"
                value={`${analytics.conversionRate}%`}
                change="+2.3%"
                trend="up"
                icon={Target}
              />
              <StatCard
                title="Avg Lead Score"
                value={analytics.avgLeadScore.toString()}
                change="+5 pts"
                trend="up"
                icon={Zap}
              />
            </div>

            {/* Lead Distribution & Top Intents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Lead Distribution
                </h3>
                <div className="space-y-4">
                  {analytics.leadDistribution.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {item.category === "Hot" && <Flame className="h-4 w-4 text-red-500" />}
                          {item.category === "Warm" && <ThermometerSun className="h-4 w-4 text-amber-500" />}
                          {item.category === "Cold" && <Snowflake className="h-4 w-4 text-blue-500" />}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            item.category === "Hot" && "bg-red-500",
                            item.category === "Warm" && "bg-amber-500",
                            item.category === "Cold" && "bg-blue-500"
                          )}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Intents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Intents
                </h3>
                <div className="space-y-3">
                  {analytics.topIntents.map((item, index) => (
                    <div key={item.intent} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-xs font-bold text-teal-600 dark:text-teal-400">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {item.intent.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{item.count} queries</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Conversations
                </h3>
                <button
                  onClick={() => setActiveTab("conversations")}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Messages
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Intent
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {conversations.slice(0, 4).map((conv) => (
                      <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {conv.sessionId.slice(0, 12)}...
                            </p>
                            {conv.userEmail && (
                              <p className="text-xs text-gray-500">{conv.userEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getLeadCategoryIcon(conv.leadCategory)}
                            <span className="text-sm font-medium">{conv.leadScore}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {conv.messageCount}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {conv.primaryIntent?.replace("_", " ") || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(conv.status))}>
                            {conv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(conv.lastMessageAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            {/* Success/Error Message */}
            {knowledgeMessage && (
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  knowledgeMessage.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {knowledgeMessage.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                {knowledgeMessage.text}
                <button
                  onClick={() => setKnowledgeMessage(null)}
                  className="ml-auto text-current opacity-70 hover:opacity-100"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Categories</option>
                {knowledgeCategories.length > 0 ? (
                  knowledgeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))
                ) : (
                  <>
                    <option value="compliance">Compliance</option>
                    <option value="telehealth">Telehealth</option>
                    <option value="employment">Employment</option>
                    <option value="privacy">Privacy</option>
                    <option value="practice">Practice</option>
                  </>
                )}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <button
                onClick={() => {
                  setEditingKnowledge(null);
                  setShowKnowledgeEditor(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {/* Knowledge Items */}
            <div className="grid gap-4">
              {isLoadingKnowledge ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-teal-500 animate-spin" />
                  <span className="ml-3 text-gray-500">Loading knowledge items...</span>
                </div>
              ) : filteredKnowledge.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No knowledge items found.</p>
                  <button
                    onClick={() => {
                      setEditingKnowledge(null);
                      setShowKnowledgeEditor(true);
                    }}
                    className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                filteredKnowledge.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(item.status))}>
                            {item.status}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{item.category}</span>
                          <span className="text-xs text-gray-500">Confidence: {item.confidence}/10</span>
                          {item.source && (
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              item.source === "static"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            )}>
                              {item.source === "static" ? "Built-in" : "Custom"}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {item.summary || item.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.keywords.slice(0, 5).map((keyword) => (
                            <span
                              key={keyword}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                            >
                              {keyword}
                            </span>
                          ))}
                          {item.keywords.length > 5 && (
                            <span className="px-2 py-1 text-xs text-gray-400">
                              +{item.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.usageCount} uses
                          </p>
                          {item.lastUsed && (
                            <p className="text-xs text-gray-500">
                              Last: {formatDate(item.lastUsed)}
                            </p>
                          )}
                          {item.xpReward && (
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                              +{item.xpReward} XP
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setEditingKnowledge(item);
                            setShowKnowledgeEditor(true);
                          }}
                          disabled={!item.isEditable}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            item.isEditable
                              ? "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          )}
                          title={item.isEditable ? "Edit item" : "Built-in items cannot be edited"}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteKnowledge(item)}
                          disabled={!item.isEditable}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            item.isEditable
                              ? "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          )}
                          title={item.isEditable ? "Delete item" : "Built-in items cannot be deleted"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Knowledge Gaps Tab */}
        {activeTab === "gaps" && (
          <div className="space-y-6">
            {/* Success/Error Message */}
            {gapsMessage && (
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  gapsMessage.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {gapsMessage.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                {gapsMessage.text}
                <button
                  onClick={() => setGapsMessage(null)}
                  className="ml-auto text-current opacity-70 hover:opacity-100"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Header and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Knowledge Gaps
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Queries that couldn&apos;t be answered - create knowledge items to fill the gaps
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={gapsPriorityFilter}
                  onChange={(e) => setGapsPriorityFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">🔥 High Priority</option>
                  <option value="medium">⚠️ Medium Priority</option>
                  <option value="low">ℹ️ Low Priority</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-medium">
                    {filteredGaps.length} gaps
                  </span>
                </div>
              </div>
            </div>

            {/* Priority Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <Flame className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                      {gaps.filter(g => g.priority === "high").length}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-500">High Priority</p>
                  </div>
                </div>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Asked 5+ times - urgent attention needed
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {gaps.filter(g => g.priority === "medium").length}
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-500">Medium Priority</p>
                  </div>
                </div>
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
                  Asked 3-4 times - should address soon
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {gaps.filter(g => g.priority === "low").length}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-500">Low Priority</p>
                  </div>
                </div>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                  Asked 1-2 times - review when time permits
                </p>
              </div>
            </div>

            {/* Gaps List */}
            <div className="space-y-4">
              {isLoadingGaps ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-teal-500 animate-spin" />
                  <span className="ml-3 text-gray-500">Loading knowledge gaps...</span>
                </div>
              ) : filteredGaps.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    No Knowledge Gaps!
                  </h3>
                  <p className="text-gray-500">
                    {gapsPriorityFilter === "all"
                      ? "Your knowledge base is covering all common queries."
                      : `No ${gapsPriorityFilter} priority gaps at the moment.`}
                  </p>
                </div>
              ) : (
                filteredGaps.map((gap) => (
                  <div
                    key={gap.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1", getPriorityBadge(gap.priority))}>
                            {getPriorityIcon(gap.priority)}
                            {gap.priority.charAt(0).toUpperCase() + gap.priority.slice(1)} Priority
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                            Asked {gap.frequency}x
                          </span>
                          {gap.detected_intent && (
                            <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 rounded text-xs text-teal-600 dark:text-teal-400">
                              Intent: {gap.detected_intent}
                            </span>
                          )}
                        </div>

                        <blockquote className="text-lg text-gray-900 dark:text-white border-l-4 border-teal-500 pl-4 mb-3 italic">
                          &quot;{gap.query}&quot;
                        </blockquote>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {gap.suggested_category && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              Suggested: {gap.suggested_category}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            First asked: {formatDate(gap.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleGenerateDraft(gap)}
                          disabled={isGeneratingDraft}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            isGeneratingDraft
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                          )}
                        >
                          {isGeneratingDraft && selectedGap?.id === gap.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4" />
                              Generate Draft
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDismissGap(gap)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === "conversations" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            {/* Conversations Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Score
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intent
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredConversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {conv.sessionId}
                          </p>
                          {conv.userEmail && (
                            <p className="text-xs text-gray-500">{conv.userEmail}</p>
                          )}
                          <p className="text-xs text-gray-400">{formatDate(conv.startedAt)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getLeadCategoryIcon(conv.leadCategory)}
                          <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {conv.leadScore}
                            </span>
                            <span className="text-xs text-gray-500 ml-1 capitalize">
                              ({conv.leadCategory})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {conv.messageCount}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {conv.primaryIntent?.replace("_", " ") || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {conv.summary || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(conv.status))}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => setSelectedConversation(conv)}
                          className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Messages"
                value={analytics.totalMessages.toLocaleString()}
                change="+18.2%"
                trend="up"
                icon={MessageSquare}
              />
              <StatCard
                title="Satisfaction Score"
                value={`${analytics.satisfactionScore}/5`}
                change="+0.2"
                trend="up"
                icon={Zap}
              />
              <StatCard
                title="Hot Leads"
                value={analytics.leadDistribution[0].count.toString()}
                change="+23"
                trend="up"
                icon={Flame}
              />
              <StatCard
                title="Active Users"
                value="234"
                change="+15%"
                trend="up"
                icon={Users}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Activity (Last 7 Days)
                </h3>
                <div className="space-y-3">
                  {analytics.dailyStats.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-gray-500">{day.date}</span>
                      <div className="flex-1">
                        <div className="flex gap-1 h-8">
                          <div
                            className="bg-teal-500 rounded"
                            style={{ width: `${(day.conversations / 60) * 100}%` }}
                            title={`${day.conversations} conversations`}
                          />
                          <div
                            className="bg-teal-200 dark:bg-teal-700 rounded"
                            style={{ width: `${(day.messages / 300) * 100}%` }}
                            title={`${day.messages} messages`}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {day.conversations}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">conv</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded" />
                    <span className="text-xs text-gray-500">Conversations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-200 dark:bg-teal-700 rounded" />
                    <span className="text-xs text-gray-500">Messages</span>
                  </div>
                </div>
              </div>

              {/* Top Knowledge Items */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Used Knowledge Items
                </h3>
                <div className="space-y-4">
                  {analytics.topKnowledge.map((item, index) => {
                    const maxCount = analytics.topKnowledge[0].count;
                    return (
                      <div key={item.title}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-xs font-bold text-teal-600 dark:text-teal-400">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.count}
                          </span>
                        </div>
                        <div className="ml-8 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">92%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">5%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Escalated to Human</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">3%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unanswered</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Settings Message */}
            {settingsMessage && (
              <div
                className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  settingsMessage.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {settingsMessage.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                {settingsMessage.text}
              </div>
            )}

            {/* AI Model Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Model Selection
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose which AI model powers Bailey. Start with &quot;Knowledge Base Only&quot; to test your knowledge base without API costs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map((model) => (
                  <button
                    key={model.key}
                    onClick={() => setAiSettings({ ...aiSettings, activeModel: model.key })}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      aiSettings.activeModel === model.key
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {model.displayName}
                      </span>
                      {aiSettings.activeModel === model.key && (
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {model.description}
                    </p>
                    <div className="mt-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          model.provider === "none"
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            : model.provider === "openai"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : model.provider === "anthropic"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        )}
                      >
                        {model.provider === "none" ? "No API Required" : model.provider.toUpperCase()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Response Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Response Settings
              </h3>

              <div className="space-y-6">
                {/* Max Response Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Response Length: {aiSettings.maxResponseLength} tokens
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={aiSettings.maxResponseLength}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, maxResponseLength: parseInt(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Concise (100)</span>
                    <span>Detailed (2000)</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature: {aiSettings.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) =>
                      setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                  </div>
                </div>

                {/* System Prompt Version */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    System Prompt Version
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="promptVersion"
                        checked={aiSettings.systemPromptVersion === "short"}
                        onChange={() =>
                          setAiSettings({ ...aiSettings, systemPromptVersion: "short" })
                        }
                        className="text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Short (Token Efficient)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="promptVersion"
                        checked={aiSettings.systemPromptVersion === "full"}
                        onChange={() =>
                          setAiSettings({ ...aiSettings, systemPromptVersion: "full" })
                        }
                        className="text-teal-500 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Full (More Context)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Safety Features
              </h3>

              <div className="space-y-4">
                <ToggleSetting
                  label="Emergency Detection"
                  description="Detect emergency situations and provide 000 hotline"
                  checked={aiSettings.enableEmergencyCheck}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableEmergencyCheck: checked })
                  }
                />
                <ToggleSetting
                  label="Legal Advice Guard"
                  description="Refuse to provide specific legal advice"
                  checked={aiSettings.enableLegalAdviceGuard}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableLegalAdviceGuard: checked })
                  }
                />
                <ToggleSetting
                  label="Objection Handling"
                  description="Handle common objections with prepared responses"
                  checked={aiSettings.enableObjectionHandling}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableObjectionHandling: checked })
                  }
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h3>

              <div className="space-y-4">
                <ToggleSetting
                  label="Enable Streaming"
                  description="Stream responses in real-time (faster perceived response)"
                  checked={aiSettings.enableStreaming}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableStreaming: checked })
                  }
                />
                <ToggleSetting
                  label="Knowledge Base Enhancement"
                  description="Inject relevant knowledge base content into AI context"
                  checked={aiSettings.enableKnowledgeBase}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableKnowledgeBase: checked })
                  }
                />
                <ToggleSetting
                  label="Calendar Integration"
                  description="Answer appointment and booking queries"
                  checked={aiSettings.enableCalendarIntegration}
                  onChange={(checked) =>
                    setAiSettings({ ...aiSettings, enableCalendarIntegration: checked })
                  }
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Viewer Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setSelectedConversation(null)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                    <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Conversation Details
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Session: {selectedConversation.sessionId.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Conversation Info */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getLeadCategoryIcon(conversationDetail?.leadCategory || selectedConversation.leadCategory)}
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {conversationDetail?.leadScore || selectedConversation.leadScore}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        ({conversationDetail?.leadCategory || selectedConversation.leadCategory})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                    <span className={cn(
                      "inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadge(conversationDetail?.status || selectedConversation.status)
                    )}>
                      {conversationDetail?.status || selectedConversation.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Messages</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {conversationDetail?.messageCount || selectedConversation.messageCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP Earned</p>
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1">
                      +{conversationDetail?.xpEarned || 0} XP
                    </p>
                  </div>
                </div>
                {(conversationDetail?.userEmail || selectedConversation.userEmail) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {conversationDetail?.userEmail || selectedConversation.userEmail}
                    </p>
                  </div>
                )}
                {(conversationDetail?.primaryIntent || selectedConversation.primaryIntent) && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">Primary Intent:</span>{" "}
                    <span className="capitalize">{(conversationDetail?.primaryIntent || selectedConversation.primaryIntent)?.replace("_", " ")}</span>
                  </p>
                )}
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isLoadingConversation ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-teal-500 animate-spin" />
                    <span className="ml-3 text-gray-500">Loading messages...</span>
                  </div>
                ) : conversationDetail?.messages && conversationDetail.messages.length > 0 ? (
                  conversationDetail.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-teal-600 text-white rounded-br-sm"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={cn(
                          "flex flex-wrap items-center gap-2 mt-2 text-xs",
                          message.role === "user" ? "text-teal-100" : "text-gray-500 dark:text-gray-400"
                        )}>
                          <span>{formatDate(message.created_at)}</span>
                          {message.role === "assistant" && (
                            <>
                              {message.xp_awarded && message.xp_awarded > 0 && (
                                <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                                  <Zap className="h-3 w-3" />
                                  +{message.xp_awarded} XP
                                </span>
                              )}
                              {message.confidence_score && (
                                <span className="text-gray-400">
                                  Confidence: {Math.round(message.confidence_score * 100)}%
                                </span>
                              )}
                              {message.response_time_ms && (
                                <span className="text-gray-400">
                                  {message.response_time_ms}ms
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {message.role === "assistant" && message.knowledge_items_used && message.knowledge_items_used.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.knowledge_items_used.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded text-xs"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        {message.intent && message.role === "user" && (
                          <div className="mt-2">
                            <span className="px-2 py-0.5 bg-white/20 rounded text-xs capitalize">
                              Intent: {message.intent.replace("_", " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages found for this conversation.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Started: {formatDate(conversationDetail?.startedAt || selectedConversation.startedAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Editor Modal */}
      {showKnowledgeEditor && (
        <KnowledgeEditorModal
          item={editingKnowledge}
          categories={knowledgeCategories.length > 0 ? knowledgeCategories : ["compliance", "telehealth", "employment", "privacy", "practice", "general"]}
          onSave={handleSaveKnowledgeItem}
          onClose={() => {
            setShowKnowledgeEditor(false);
            setEditingKnowledge(null);
          }}
          isSaving={isSavingKnowledge}
        />
      )}

      {/* Draft Review Modal */}
      {showDraftReviewModal && generatedDraft && selectedGap && (
        <DraftReviewModal
          draft={generatedDraft}
          gap={selectedGap}
          onAccept={handleCreateFromDraft}
          onEdit={(editedDraft) => {
            setGeneratedDraft(editedDraft);
          }}
          onReject={() => {
            setShowDraftReviewModal(false);
            setGeneratedDraft(null);
            setSelectedGap(null);
          }}
          onClose={() => {
            setShowDraftReviewModal(false);
            setGeneratedDraft(null);
            setSelectedGap(null);
          }}
          isCreating={isSavingKnowledge}
        />
      )}
    </div>
  );
}

// Knowledge Editor Modal Component
function KnowledgeEditorModal({
  item,
  categories,
  onSave,
  onClose,
  isSaving,
}: {
  item: KnowledgeItem | null;
  categories: string[];
  onSave: (item: Partial<KnowledgeItem>) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<KnowledgeItem>>({
    category: item?.category || categories[0] || "general",
    subcategory: item?.subcategory || "",
    topic: item?.topic || "",
    title: item?.title || "",
    content: item?.content || "",
    summary: item?.summary || "",
    keywords: item?.keywords || [],
    intentPatterns: item?.intentPatterns || [],
    responseTemplate: item?.responseTemplate || "",
    confidence: item?.confidence || 7,
    requiresDisclaimer: item?.requiresDisclaimer || false,
    legalDisclaimer: item?.legalDisclaimer || "",
    adviceLevel: item?.adviceLevel || "general",
    xpReward: item?.xpReward || 10,
  });
  const [keywordInput, setKeywordInput] = useState("");
  const [intentInput, setIntentInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim().toLowerCase()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || [],
    }));
  };

  const handleAddIntent = () => {
    if (intentInput.trim() && !formData.intentPatterns?.includes(intentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        intentPatterns: [...(prev.intentPatterns || []), intentInput.trim()],
      }));
      setIntentInput("");
    }
  };

  const handleRemoveIntent = (intent: string) => {
    setFormData(prev => ({
      ...prev,
      intentPatterns: prev.intentPatterns?.filter(i => i !== intent) || [],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {item ? "Edit Knowledge Item" : "Add New Knowledge Item"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item ? "Update existing knowledge base entry" : "Create a new knowledge base entry"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., AHPRA Advertising Guidelines"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Marketing"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Advertising Rules"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Brief summary shown in search results..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Detailed knowledge content..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.content?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Add keyword..."
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-3 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords?.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intent Patterns
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={intentInput}
                      onChange={(e) => setIntentInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIntent())}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder='e.g., "how do I advertise"'
                    />
                    <button
                      type="button"
                      onClick={handleAddIntent}
                      className="px-3 py-2 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.intentPatterns?.map(intent => (
                      <span
                        key={intent}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-sm text-blue-700 dark:text-blue-300"
                      >
                        {intent}
                        <button
                          type="button"
                          onClick={() => handleRemoveIntent(intent)}
                          className="text-blue-400 hover:text-red-500"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Response Template
                  </label>
                  <textarea
                    value={formData.responseTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, responseTemplate: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Template for AI responses..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confidence Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.confidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseInt(e.target.value) || 7 }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.xpReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 10 }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="requiresDisclaimer"
                    checked={formData.requiresDisclaimer}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresDisclaimer: e.target.checked }))}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="requiresDisclaimer" className="text-sm text-amber-700 dark:text-amber-400">
                    Requires legal disclaimer
                  </label>
                </div>

                {formData.requiresDisclaimer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Legal Disclaimer
                    </label>
                    <textarea
                      value={formData.legalDisclaimer}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalDisclaimer: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="This is general information only..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(formData)}
                disabled={isSaving || !formData.title || !formData.content}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {item ? "Update Item" : "Create Item"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-teal-500" : "bg-gray-200 dark:bg-gray-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          trend === "up" ? "text-green-600" : "text-red-600"
        )}>
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}

// Draft Review Modal Component
function DraftReviewModal({
  draft,
  gap,
  onAccept,
  onEdit,
  onReject,
  onClose,
  isCreating,
}: {
  draft: DraftKnowledgeItem;
  gap: KnowledgeGap;
  onAccept: (draft: DraftKnowledgeItem) => void;
  onEdit: (draft: DraftKnowledgeItem) => void;
  onReject: () => void;
  onClose: () => void;
  isCreating: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<DraftKnowledgeItem>(draft);
  const [keywordInput, setKeywordInput] = useState("");
  const [intentInput, setIntentInput] = useState("");

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim().toLowerCase()],
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleAddIntent = () => {
    if (intentInput.trim() && !formData.intentPatterns.includes(intentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        intentPatterns: [...prev.intentPatterns, intentInput.trim()],
      }));
      setIntentInput("");
    }
  };

  const handleRemoveIntent = (intent: string) => {
    setFormData(prev => ({
      ...prev,
      intentPatterns: prev.intentPatterns.filter(i => i !== intent),
    }));
  };

  const handleSaveEdits = () => {
    onEdit(formData);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI-Generated Draft
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Review, edit, and publish to fill the knowledge gap
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Original Gap Context */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Original Query (asked {gap.frequency} times)
                  </p>
                  <blockquote className="text-amber-700 dark:text-amber-200 italic">
                    &quot;{gap.query}&quot;
                  </blockquote>
                  {gap.detected_intent && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      Detected intent: {gap.detected_intent}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Draft Confidence */}
            {formData.rationale && (
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800 dark:text-teal-300 mb-1">
                      AI Rationale (Confidence: {formData.confidence}/10)
                    </p>
                    <p className="text-teal-700 dark:text-teal-200 text-sm">
                      {formData.rationale}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Draft Content */}
            {editMode ? (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Category & Topic */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="compliance">Compliance</option>
                      <option value="telehealth">Telehealth</option>
                      <option value="employment">Employment</option>
                      <option value="privacy">Privacy</option>
                      <option value="practice">Practice</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Response Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Response Template
                  </label>
                  <textarea
                    value={formData.responseTemplate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, responseTemplate: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Conversational response template for Bailey AI..."
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Keywords
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Add keyword..."
                    />
                    <button
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm flex items-center gap-1"
                      >
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Intent Patterns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Intent Patterns
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={intentInput}
                      onChange={(e) => setIntentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIntent())}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Add intent pattern..."
                    />
                    <button
                      onClick={handleAddIntent}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.intentPatterns.map((intent) => (
                      <span
                        key={intent}
                        className="px-2 py-1 bg-teal-50 dark:bg-teal-900/30 rounded text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1"
                      >
                        {intent}
                        <button
                          onClick={() => handleRemoveIntent(intent)}
                          className="text-teal-400 hover:text-red-500"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={formData.xpReward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 10 }))}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Advice Level
                    </label>
                    <select
                      value={formData.adviceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, adviceLevel: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="general">General</option>
                      <option value="educational">Educational</option>
                      <option value="specific">Specific</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresDisclaimer}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiresDisclaimer: e.target.checked }))}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      Requires Disclaimer
                    </label>
                  </div>
                </div>

                {/* Legal Disclaimer */}
                {formData.requiresDisclaimer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Legal Disclaimer
                    </label>
                    <textarea
                      value={formData.legalDisclaimer || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalDisclaimer: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Legal disclaimer to show with responses..."
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Read-only View */
              <div className="space-y-6">
                {/* Title & Category */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {formData.category} {formData.subcategory && `/ ${formData.subcategory}`}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {formData.title}
                      </h3>
                      {formData.topic && (
                        <p className="text-sm text-gray-500 mt-1">Topic: {formData.topic}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 rounded-full text-xs font-medium text-teal-700 dark:text-teal-400">
                        +{formData.xpReward} XP
                      </span>
                      {formData.requiresDisclaimer && (
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400">
                          Disclaimer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</p>
                    <p className="text-gray-600 dark:text-gray-400">{formData.summary}</p>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {formData.content}
                      </p>
                    </div>
                  </div>

                  {/* Response Template */}
                  {formData.responseTemplate && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Template</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 text-sm italic whitespace-pre-wrap">
                          {formData.responseTemplate}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Intent Patterns */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Intent Patterns</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.intentPatterns.map((intent) => (
                        <span
                          key={intent}
                          className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded text-xs text-teal-700 dark:text-teal-400"
                        >
                          {intent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Reject Draft
            </button>

            <div className="flex items-center gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Save Edits
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Draft
                  </button>
                  <button
                    onClick={() => onAccept(formData)}
                    disabled={isCreating}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
                      isCreating
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                    )}
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Accept & Publish
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
