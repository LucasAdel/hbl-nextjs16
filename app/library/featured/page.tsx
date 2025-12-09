"use client";

import Link from "next/link";
import {
  Star,
  Clock,
  Calendar,
  ChevronRight,
  Award,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { getFeaturedArticles, libraryArticles } from "@/lib/library/articles-data";
import type { LibraryArticle } from "@/lib/library/types";

export default function FeaturedPage() {
  const featuredArticles = getFeaturedArticles(100); // Get all featured
  const topArticles = libraryArticles
    .filter(a => a.status === "published")
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm">
          <Star className="h-4 w-4 fill-current" />
          <span>Handpicked by our legal experts</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Featured Resources
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Our most valuable and frequently referenced legal guides for healthcare professionals.
        </p>
      </section>

      {/* Featured Hero Card */}
      {featuredArticles[0] && (
        <section>
          <FeaturedHeroCard article={featuredArticles[0]} />
        </section>
      )}

      {/* Featured Grid */}
      {featuredArticles.length > 1 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-tiffany-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Editor&apos;s Picks
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.slice(1).map((article) => (
              <FeaturedCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Most Popular Section */}
      {topArticles.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-tiffany-600" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Most Popular
            </h3>
          </div>

          <div className="space-y-4">
            {topArticles.map((article, index) => (
              <PopularArticleRow key={article.id} article={article} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-tiffany-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Stay Updated with New Resources
        </h3>
        <p className="text-tiffany-100 mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter and be the first to know when we publish new guides,
          updates to legislation, and important compliance information.
        </p>
        <Link
          href="/subscribe"
          className="inline-block px-6 py-3 bg-white text-tiffany-600 rounded-lg font-semibold hover:bg-tiffany-50 transition-colors"
        >
          Subscribe to Updates
        </Link>
      </section>
    </div>
  );
}

function FeaturedHeroCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group block relative bg-gradient-to-br from-tiffany-600 via-tiffany-700 to-teal-800 rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

      <div className="relative z-10 p-8 md:p-12 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            Featured Article
          </span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {article.category}
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold mb-4 group-hover:underline underline-offset-4">
          {article.title}
        </h2>

        <p className="text-lg text-tiffany-100 mb-6 max-w-2xl">
          {article.description}
        </p>

        <div className="flex flex-wrap items-center gap-6 text-tiffany-200 mb-6">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(article.publishDate).toLocaleDateString("en-AU", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            +{Math.round(article.readingTime * 10)} XP
          </span>
        </div>

        <div className="flex items-center gap-2 text-white font-semibold">
          Read Article
          <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-xl hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300"
    >
      {/* Featured Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
      </div>

      <div className="p-6 space-y-4">
        <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium">
          {article.category}
        </span>

        <h4 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2">
          {article.title}
        </h4>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {article.description}
        </p>
      </div>

      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            +{Math.round(article.readingTime * 10)} XP
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-tiffany-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

function PopularArticleRow({ article, rank }: { article: LibraryArticle; rank: number }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all"
    >
      {/* Rank */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0
        ${rank === 1 ? "bg-yellow-100 text-yellow-700" :
          rank === 2 ? "bg-slate-200 text-slate-600" :
          rank === 3 ? "bg-amber-100 text-amber-700" :
          "bg-slate-100 text-slate-500"}
      `}>
        {rank}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors truncate">
          {article.title}
        </h4>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>{article.category}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-slate-400 shrink-0 group-hover:text-tiffany-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
