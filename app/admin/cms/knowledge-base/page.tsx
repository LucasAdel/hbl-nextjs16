"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronRight,
  FolderOpen,
  FileText,
  GripVertical,
  ExternalLink,
  Copy,
  Archive,
} from "lucide-react";

type KBArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  status: "published" | "draft" | "archived";
  views: number;
  helpful: number;
  updatedAt: string;
};

type KBCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount: number;
  icon: string;
};

const categories: KBCategory[] = [
  {
    id: "1",
    name: "Getting Started",
    slug: "getting-started",
    description: "Essential guides for new clients",
    articleCount: 5,
    icon: "🚀",
  },
  {
    id: "2",
    name: "Medical Practice Setup",
    slug: "practice-setup",
    description: "Setting up your medical practice",
    articleCount: 8,
    icon: "🏥",
  },
  {
    id: "3",
    name: "Compliance & Regulations",
    slug: "compliance",
    description: "AHPRA, Medicare, and regulatory compliance",
    articleCount: 12,
    icon: "📋",
  },
  {
    id: "4",
    name: "Employment & HR",
    slug: "employment",
    description: "Staff contracts, awards, and workplace relations",
    articleCount: 6,
    icon: "👥",
  },
  {
    id: "5",
    name: "Property & Leasing",
    slug: "property",
    description: "Commercial leases and property matters",
    articleCount: 4,
    icon: "🏢",
  },
  {
    id: "6",
    name: "Buying & Selling",
    slug: "transactions",
    description: "Practice sales, acquisitions, and due diligence",
    articleCount: 7,
    icon: "💼",
  },
];

const articles: KBArticle[] = [
  {
    id: "1",
    title: "How to Register with AHPRA",
    slug: "ahpra-registration",
    category: "Compliance & Regulations",
    excerpt: "Step-by-step guide to AHPRA registration for medical practitioners",
    status: "published",
    views: 1250,
    helpful: 45,
    updatedAt: "2025-01-15",
  },
  {
    id: "2",
    title: "Understanding Medical Practice Structures",
    slug: "practice-structures",
    category: "Medical Practice Setup",
    excerpt: "Compare sole trader, partnership, and company structures",
    status: "published",
    views: 980,
    helpful: 38,
    updatedAt: "2025-01-10",
  },
  {
    id: "3",
    title: "Employment Contract Essentials",
    slug: "employment-contracts",
    category: "Employment & HR",
    excerpt: "Key clauses every medical employment contract should include",
    status: "published",
    views: 756,
    helpful: 32,
    updatedAt: "2025-01-08",
  },
  {
    id: "4",
    title: "Tenant Doctor Agreement Guide",
    slug: "tenant-agreements",
    category: "Property & Leasing",
    excerpt: "Everything you need to know about tenant doctor arrangements",
    status: "draft",
    views: 0,
    helpful: 0,
    updatedAt: "2025-01-20",
  },
  {
    id: "5",
    title: "Medicare Billing Compliance",
    slug: "medicare-compliance",
    category: "Compliance & Regulations",
    excerpt: "Avoid common Medicare billing pitfalls and ensure compliance",
    status: "published",
    views: 1456,
    helpful: 52,
    updatedAt: "2025-01-12",
  },
];

const statusColors = {
  published: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  draft: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  archived: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-400",
  },
};

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"categories" | "articles">("categories");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const stats = {
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    helpfulVotes: articles.reduce((sum, a) => sum + a.helpful, 0),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/admin/cms"
              className="hover:text-teal-600 dark:hover:text-teal-400"
            >
              CMS
            </Link>
            <span>/</span>
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Knowledge Base
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage help articles and documentation
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/cms/knowledge-base/categories/new"
            className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FolderOpen className="h-5 w-5 mr-2" />
            New Category
          </Link>
          <Link
            href="/admin/cms/knowledge-base/new"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Article
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Articles
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalArticles}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Helpful Votes
          </p>
          <p className="text-2xl font-bold text-teal-600">
            {stats.helpfulVotes}
          </p>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("categories")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "categories"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode("articles")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "articles"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              All Articles
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {viewMode === "categories" ? (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-teal-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{category.icon}</div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {category.articleCount} articles
                </span>
                <Link
                  href={`/admin/cms/knowledge-base?category=${category.slug}`}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setViewMode("articles");
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
                >
                  View
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Articles Table */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Article
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Views
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Helpful
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Updated
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {article.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[article.status].bg} ${statusColors[article.status].text}`}
                      >
                        {article.status.charAt(0).toUpperCase() +
                          article.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {article.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {article.helpful}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(article.updatedAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/knowledge-base/${article.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/cms/knowledge-base/${article.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === article.id ? null : article.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openMenu === article.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Copy className="h-4 w-4" />
                                Copy URL
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                <Archive className="h-4 w-4" />
                                Archive
                              </button>
                              <hr className="my-1 border-gray-200 dark:border-gray-700" />
                              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No articles found
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
