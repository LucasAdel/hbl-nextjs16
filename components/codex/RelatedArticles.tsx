"use client";

import Link from "next/link";
import { Clock, ChevronRight, ArrowRight } from "lucide-react";
import type { LibraryArticle } from "@/lib/codex/types";

interface RelatedArticlesProps {
  articles: LibraryArticle[];
  title?: string;
}

export function RelatedArticles({ articles, title = "Related Articles" }: RelatedArticlesProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        <Link
          href="/codex"
          className="text-sm text-tiffany-600 hover:text-tiffany-700 font-medium flex items-center gap-1"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/codex/${article.slug}`}
            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-tiffany-300 dark:hover:border-tiffany-600 transition-all duration-300"
          >
            <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium mb-3">
              {article.category}
            </span>

            <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h4>

            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
              {article.description}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min read
              </span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
