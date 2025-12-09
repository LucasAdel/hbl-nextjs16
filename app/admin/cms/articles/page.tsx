"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  Clock,
  Tag,
  ChevronDown,
  ExternalLink,
  Copy,
  Archive,
} from "lucide-react";
import {
  articles as articlesData,
  categoryLabels,
  type Article,
  type ArticleCategory,
} from "@/lib/articles-data";

type ArticleStatus = "published" | "draft" | "archived";

const statusColors: Record<ArticleStatus, { bg: string; text: string }> = {
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

// Extend articles with status for CMS
const articlesWithStatus = articlesData.map((article) => ({
  ...article,
  status: "published" as ArticleStatus,
  views: Math.floor(Math.random() * 5000) + 500,
}));

export default function CMSArticlesPage() {
  const [articles, setArticles] = useState(articlesWithStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | "all">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">(
    "all"
  );
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map((a) => a.id));
    }
  };

  const handleSelectArticle = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
    setOpenMenu(null);
  };

  const handleStatusChange = (id: string, newStatus: ArticleStatus) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setOpenMenu(null);
  };

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    archived: articles.filter((a) => a.status === "archived").length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
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
            <span>Articles</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage blog posts and legal articles
          </p>
        </div>
        <Link
          href="/admin/cms/articles/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Views
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as ArticleCategory | "all")
              }
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ArticleStatus | "all")
              }
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArticles.length > 0 && (
          <div className="px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <span className="text-sm text-teal-700 dark:text-teal-400">
              {selectedArticles.length} selected
            </span>
            <button className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400">
              Publish All
            </button>
            <button className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400">
              Archive All
            </button>
            <button className="text-sm text-red-600 hover:text-red-700">
              Delete All
            </button>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="w-12 py-3 px-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedArticles.length === filteredArticles.length &&
                      filteredArticles.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
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
                  Author
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Views
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
                    <input
                      type="checkbox"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleSelectArticle(article.id)}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {article.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {article.excerpt}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {article.readTime} min read
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {categoryLabels[article.category]}
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
                      {article.author.name}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedAt)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {article.views.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                        title="View"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/cms/articles/${article.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit"
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
                            <button
                              onClick={() => navigator.clipboard.writeText(`/articles/${article.slug}`)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Copy URL
                            </button>
                            {article.status !== "published" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(article.id, "published")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Publish
                              </button>
                            )}
                            {article.status === "published" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(article.id, "draft")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Unpublish
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleStatusChange(article.id, "archived")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                            >
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No articles found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
