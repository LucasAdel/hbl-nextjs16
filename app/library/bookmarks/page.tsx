"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Clock,
  ChevronRight,
  Trash2,
  Search,
  FolderOpen,
  Plus,
  Calendar
} from "lucide-react";
import { getArticleBySlug } from "@/lib/library/articles-data";
import type { LibraryArticle } from "@/lib/library/types";

interface BookmarkedArticle {
  articleId: string;
  savedAt: string;
  notes?: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [articles, setArticles] = useState<LibraryArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("library-bookmarks");
      if (saved) {
        const parsed = JSON.parse(saved) as BookmarkedArticle[];
        setBookmarks(parsed);

        // Fetch article details
        const fetchedArticles = parsed
          .map((b) => getArticleBySlug(b.articleId))
          .filter((a): a is LibraryArticle => a !== undefined);
        setArticles(fetchedArticles);
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
    setIsLoading(false);
  }, []);

  // Remove bookmark
  const removeBookmark = (articleId: string) => {
    const updated = bookmarks.filter((b) => b.articleId !== articleId);
    setBookmarks(updated);
    localStorage.setItem("library-bookmarks", JSON.stringify(updated));
    setArticles(articles.filter((a) => a.slug !== articleId));
  };

  // Filter articles by search
  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-tiffany-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-tiffany-600" />
            Saved Articles
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {bookmarks.length} article{bookmarks.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {bookmarks.length > 0 && (
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tiffany-500"
            />
          </div>
        )}
      </div>

      {/* Bookmarks List */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const bookmark = bookmarks.find((b) => b.articleId === article.slug);
            return (
              <div
                key={article.id}
                className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/library/${article.slug}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium">
                        {article.category}
                      </span>
                      {bookmark?.savedAt && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Saved {new Date(bookmark.savedAt).toLocaleDateString("en-AU")}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors mb-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {article.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readingTime} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        Continue reading
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => removeBookmark(article.slug)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {bookmark?.notes && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                      Note: {bookmark.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : bookmarks.length > 0 && searchQuery ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <Search className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No matching bookmarks
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <FolderOpen className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
            No saved articles yet
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Save articles you want to read later by clicking the bookmark icon on any article.
          </p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tiffany-600 hover:bg-tiffany-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Browse Articles
          </Link>
        </div>
      )}

      {/* Tips Section */}
      {bookmarks.length > 0 && (
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Pro Tips
          </h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-tiffany-600">•</span>
              Click on any article to continue reading from where you left off
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiffany-600">•</span>
              Add notes to bookmarks by clicking the bookmark icon again on an article
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiffany-600">•</span>
              Your bookmarks are saved locally and persist between sessions
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
