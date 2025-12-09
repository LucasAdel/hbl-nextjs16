"use client";

import Link from "next/link";
import {
  FileText,
  FolderOpen,
  BookOpen,
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const contentTypes = [
  {
    title: "Articles",
    description: "Manage blog posts and legal articles",
    icon: FileText,
    href: "/admin/cms/articles",
    count: 6,
    draft: 2,
    color: "blue",
  },
  {
    title: "Documents",
    description: "Manage downloadable legal documents",
    icon: FolderOpen,
    href: "/admin/cms/documents",
    count: 12,
    draft: 1,
    color: "green",
  },
  {
    title: "Knowledge Base",
    description: "Manage knowledge base articles",
    icon: BookOpen,
    href: "/admin/cms/knowledge-base",
    count: 8,
    draft: 0,
    color: "purple",
  },
  {
    title: "Media Library",
    description: "Manage images and media files",
    icon: Image,
    href: "/admin/cms/media",
    count: 45,
    draft: 0,
    color: "orange",
  },
];

const recentActivity = [
  {
    type: "article",
    title: "Understanding Tenant Doctor Agreements",
    action: "Updated",
    time: "2 hours ago",
    user: "Sarah Mitchell",
  },
  {
    type: "document",
    title: "Employment Contract Template",
    action: "Published",
    time: "5 hours ago",
    user: "James Wong",
  },
  {
    type: "article",
    title: "AHPRA Compliance Guide",
    action: "Created",
    time: "1 day ago",
    user: "Michelle Chen",
  },
  {
    type: "knowledge-base",
    title: "Medical Practice Setup Guide",
    action: "Updated",
    time: "2 days ago",
    user: "James Wong",
  },
];

const quickStats = [
  { label: "Total Content", value: "71", change: "+12%", icon: FileText },
  { label: "Published", value: "65", change: "+8%", icon: Eye },
  { label: "Drafts", value: "3", change: "-2", icon: Edit },
  { label: "This Month", value: "8", change: "+5", icon: Calendar },
];

export default function CMSDashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage website content
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/cms/articles/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Article
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-1 ${stat.change.startsWith("+") ? "text-green-600" : "text-gray-500"}`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Types Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Content Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentTypes.map((type) => (
            <Link
              key={type.title}
              href={type.href}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  type.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : type.color === "green"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : type.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                }`}
              >
                <type.icon
                  className={`h-6 w-6 ${
                    type.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : type.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : type.color === "purple"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-orange-600 dark:text-orange-400"
                  }`}
                />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {type.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {type.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {type.count} items
                </span>
                {type.draft > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs">
                    {type.draft} drafts
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="p-4 flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.action === "Published"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : activity.action === "Created"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-yellow-100 dark:bg-yellow-900/30"
                  }`}
                >
                  {activity.action === "Published" ? (
                    <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : activity.action === "Created" ? (
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.action} by {activity.user}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/cms/activity"
              className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium inline-flex items-center gap-1"
            >
              View all activity
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <Link
              href="/admin/cms/articles/new"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Create New Article
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Write a new blog post or legal article
                </p>
              </div>
            </Link>
            <Link
              href="/admin/cms/documents/new"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Upload Document
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new downloadable document
                </p>
              </div>
            </Link>
            <Link
              href="/admin/cms/knowledge-base/new"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Knowledge Base Entry
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create a new knowledge base article
                </p>
              </div>
            </Link>
            <Link
              href="/admin/cms/media"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Upload Media
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add images or files to the library
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
