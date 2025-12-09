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
  topic: string;
  title: string;
  content: string;
  keywords: string[];
  confidence: number;
  usageCount: number;
  lastUsed?: string;
  status: "active" | "draft" | "archived";
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

type TabType = "overview" | "knowledge" | "conversations" | "analytics";

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
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeItem | null>(null);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "conversations", label: "Conversations", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
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
                <option value="compliance">Compliance</option>
                <option value="telehealth">Telehealth</option>
                <option value="employment">Employment</option>
                <option value="privacy">Privacy</option>
                <option value="practice">Practice</option>
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
              <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {/* Knowledge Items */}
            <div className="grid gap-4">
              {filteredKnowledge.map((item) => (
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
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400"
                          >
                            {keyword}
                          </span>
                        ))}
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
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
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
