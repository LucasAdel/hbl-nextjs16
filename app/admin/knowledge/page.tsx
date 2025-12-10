"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  BarChart3,
  MessageSquare,
  Lightbulb,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  ArrowUpRight,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react";
import {
  knowledgeManager,
  getKnowledgeAnalytics,
  getAllKnowledgeItems,
  getKnowledgeGaps,
  type KnowledgeAnalytics,
  type KnowledgeGap,
} from "@/lib/chat/knowledge-manager";
import { type KnowledgeItem } from "@/features/bailey-ai/lib/knowledge-base";

type KnowledgeItemWithStats = KnowledgeItem & {
  stats: {
    itemId: string;
    hitCount: number;
    lastUsed: Date;
    averageConfidence: number;
    userSatisfactionScore: number;
    feedbackCount: number;
  };
};

export default function KnowledgeAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "gaps" | "add">("overview");
  const [analytics, setAnalytics] = useState<KnowledgeAnalytics | null>(null);
  const [items, setItems] = useState<KnowledgeItemWithStats[]>([]);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    try {
      setAnalytics(getKnowledgeAnalytics());
      setItems(getAllKnowledgeItems());
      setGaps(getKnowledgeGaps());
    } catch (error) {
      console.error("Error loading knowledge data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map((item) => item.category))];

  const exportKnowledgeBase = () => {
    const data = knowledgeManager.exportKnowledgeBase();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `knowledge-base-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-tiffany/10 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-tiffany" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Knowledge Manager
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage, improve, and monitor the AI assistant knowledge base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 text-gray-500 hover:text-tiffany rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Refresh data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={exportKnowledgeBase}
                className="p-2 text-gray-500 hover:text-tiffany rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Export knowledge base"
              >
                <Download className="h-5 w-5" />
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Back to Admin
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "items", label: "Knowledge Items", icon: Brain },
              { id: "gaps", label: "Knowledge Gaps", icon: AlertTriangle },
              { id: "add", label: "Add New", icon: Plus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-tiffany text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-custom py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tiffany"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && analytics && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Brain}
                    label="Total Knowledge Items"
                    value={items.length.toString()}
                    trend={`${categories.length} categories`}
                    color="tiffany"
                  />
                  <StatCard
                    icon={Target}
                    label="Match Rate"
                    value={`${analytics.matchRate.toFixed(1)}%`}
                    trend={`${analytics.matchedQueries}/${analytics.totalQueries} queries`}
                    color={analytics.matchRate >= 70 ? "green" : "amber"}
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="Knowledge Gaps"
                    value={gaps.filter((g) => g.priority === "high").length.toString()}
                    trend={`${gaps.length} total gaps identified`}
                    color={gaps.filter((g) => g.priority === "high").length > 0 ? "red" : "green"}
                  />
                  <StatCard
                    icon={Zap}
                    label="Total Queries"
                    value={analytics.totalQueries.toString()}
                    trend="All time interactions"
                    color="purple"
                  />
                </div>

                {/* Improvement Suggestions */}
                {analytics.improvementSuggestions.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                        Improvement Suggestions
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {analytics.improvementSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                          <ArrowUpRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Top Categories */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-tiffany" />
                      Top Categories
                    </h3>
                    <div className="space-y-3">
                      {analytics.topCategories.map((cat, index) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-tiffany/10 text-tiffany text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                              {cat.category.replace(/-/g, " ")}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {cat.count} hits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Items */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-tiffany" />
                      Most Used Items
                    </h3>
                    <div className="space-y-3">
                      {analytics.topItems.slice(0, 5).map((item, index) => (
                        <div key={item.itemId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-tiffany/10 text-tiffany text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[200px]">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {item.count} hits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Gaps */}
                {analytics.recentGaps.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Recent Knowledge Gaps (High Priority)
                      </h3>
                      <button
                        onClick={() => setActiveTab("gaps")}
                        className="text-sm text-tiffany hover:underline flex items-center gap-1"
                      >
                        View all gaps
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {analytics.recentGaps.slice(0, 5).map((gap, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <div>
                            <p className="text-gray-700 dark:text-gray-300">{gap.query}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {gap.detectedIntent} • {gap.suggestedCategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                gap.priority === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : gap.priority === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {gap.frequency}x asked
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items Tab */}
            {activeTab === "items" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search knowledge items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent appearance-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Hits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Confidence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {item.summary}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-tiffany/10 text-tiffany capitalize">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {item.stats.hitCount}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-tiffany rounded-full"
                                    style={{ width: `${item.confidenceLevel * 10}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.confidenceLevel}/10
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {item.stats.hitCount > 0 ? (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-gray-400 text-sm">
                                  <Clock className="h-4 w-4" />
                                  Unused
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Showing {filteredItems.length} of {items.length} items
                </p>
              </div>
            )}

            {/* Gaps Tab */}
            {activeTab === "gaps" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {gaps.length === 0 ? (
                    <div className="p-12 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Knowledge Gaps Detected
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        The AI is handling all queries effectively. Keep monitoring for new gaps.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {gaps.map((gap, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                                    gap.priority === "high"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : gap.priority === "medium"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                  }`}
                                >
                                  {gap.priority.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Asked {gap.frequency} time{gap.frequency !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                &ldquo;{gap.query}&rdquo;
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>Intent: {gap.detectedIntent}</span>
                                <span>Suggested category: {gap.suggestedCategory}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveTab("add")}
                              className="px-4 py-2 bg-tiffany text-white text-sm font-medium rounded-lg hover:bg-tiffany-dark transition-colors flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Create Item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add Tab */}
            {activeTab === "add" && <AddKnowledgeItemForm categories={categories} />}
          </>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  color: "tiffany" | "green" | "amber" | "red" | "purple";
}) {
  const colorClasses = {
    tiffany: "bg-tiffany/10 text-tiffany",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{trend}</p>
    </div>
  );
}

// Add Knowledge Item Form Component
function AddKnowledgeItemForm({ categories }: { categories: string[] }) {
  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    topic: "",
    title: "",
    content: "",
    summary: "",
    keywords: "",
    intentPatterns: "",
    requiresDisclaimer: false,
    legalDisclaimer: "",
    adviceLevel: "general" as "general" | "educational" | "specific",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validate
    const validationErrors: string[] = [];
    if (!formData.title || formData.title.length < 5) {
      validationErrors.push("Title must be at least 5 characters");
    }
    if (!formData.content || formData.content.length < 50) {
      validationErrors.push("Content must be at least 50 characters");
    }
    if (!formData.summary || formData.summary.length < 20) {
      validationErrors.push("Summary must be at least 20 characters");
    }
    if (!formData.keywords || formData.keywords.split(",").filter((k) => k.trim()).length < 3) {
      validationErrors.push("At least 3 keywords are required (comma-separated)");
    }
    if (formData.requiresDisclaimer && !formData.legalDisclaimer) {
      validationErrors.push("Legal disclaimer is required when disclaimer is enabled");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Generate code
    const id = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const keywords = formData.keywords.split(",").map((k) => k.trim().toLowerCase());
    const intentPatterns = formData.intentPatterns.split(",").map((p) => p.trim().toLowerCase());

    const code = `  // NEW ITEM - ${formData.title}
  {
    id: "${id}",
    category: "${formData.category}",
    subcategory: "${formData.subcategory}",
    topic: "${formData.topic.toLowerCase()}",
    title: "${formData.title}",
    content: \`${formData.content.replace(/`/g, "\\`")}\`,
    summary: "${formData.summary}",
    keywords: ${JSON.stringify(keywords)},
    intentPatterns: ${JSON.stringify(intentPatterns)},
    responseTemplate: \`**${formData.title}**\\n\\n${formData.content.replace(/`/g, "\\`")}\\n\\nWould you like more information or to schedule a consultation?\`,
    requiresDisclaimer: ${formData.requiresDisclaimer},
    legalDisclaimer: "${formData.legalDisclaimer || ""}",
    adviceLevel: "${formData.adviceLevel}",
    confidenceLevel: 10,
    relatedProducts: [],
    xpReward: ${formData.adviceLevel === "specific" ? 30 : formData.adviceLevel === "educational" ? 20 : 15},
    metadata: {}
  },`;

    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Plus className="h-5 w-5 text-tiffany" />
          Add New Knowledge Item
        </h3>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-400">Validation Errors</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
                <option value="new">+ New Category</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="e.g., payroll-tax"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Medicare Billing Compliance"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., medicare billing"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content (Detailed)
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              placeholder="Full detailed content about this topic..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Summary (Brief)
            </label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="One-line summary of this knowledge item"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="medicare, billing, compliance, audit"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intent Patterns (comma-separated)
            </label>
            <input
              type="text"
              value={formData.intentPatterns}
              onChange={(e) => setFormData({ ...formData, intentPatterns: e.target.value })}
              placeholder="medicare billing, billing audit, compliance check"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Advice Level
              </label>
              <select
                value={formData.adviceLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adviceLevel: e.target.value as "general" | "educational" | "specific",
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="educational">Educational</option>
                <option value="specific">Specific</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresDisclaimer}
                  onChange={(e) => setFormData({ ...formData, requiresDisclaimer: e.target.checked })}
                  className="w-4 h-4 text-tiffany focus:ring-tiffany border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Requires Disclaimer</span>
              </label>
            </div>
          </div>

          {formData.requiresDisclaimer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Legal Disclaimer
              </label>
              <input
                type="text"
                value={formData.legalDisclaimer}
                onChange={(e) => setFormData({ ...formData, legalDisclaimer: e.target.value })}
                placeholder="Professional advice should be obtained..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-tiffany focus:border-transparent"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="h-5 w-5" />
            Generate Knowledge Item Code
          </button>
        </form>
      </div>

      {/* Generated Code */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-tiffany" />
            Generated Code
          </h3>
          {generatedCode && (
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-sm font-medium text-tiffany hover:bg-tiffany/10 rounded-lg transition-colors"
            >
              Copy to Clipboard
            </button>
          )}
        </div>

        {generatedCode ? (
          <>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedCode}</code>
            </pre>
            <div className="mt-4 p-4 bg-tiffany/10 rounded-lg">
              <h4 className="font-medium text-tiffany mb-2">Next Steps:</h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                <li>Copy the generated code above</li>
                <li>
                  Open <code className="text-tiffany">lib/chat/chat-knowledge-base.ts</code>
                </li>
                <li>
                  Paste the code inside the <code className="text-tiffany">KNOWLEDGE_BASE</code> array
                </li>
                <li>Update the comment at the top with the new count</li>
                <li>
                  Run <code className="text-tiffany">npm run build</code> to verify
                </li>
              </ol>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            Fill out the form and click &ldquo;Generate&rdquo; to see the code here
          </div>
        )}
      </div>
    </div>
  );
}
