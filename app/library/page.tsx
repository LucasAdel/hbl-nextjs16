"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  Calendar,
  ChevronRight,
  Star,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  Tag
} from "lucide-react";
import {
  libraryArticles,
  getFeaturedArticles,
  getArticlesByCategory,
  getAllCategories,
  getAllTags
} from "@/lib/library/articles-data";
import type { LibraryArticle, ArticleCategory } from "@/lib/library/types";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | "all">("all");

  const categories = getAllCategories();
  const popularTags = getAllTags().slice(0, 10);
  const featuredArticles = getFeaturedArticles(3);

  const filteredArticles = useMemo(() => {
    let articles = selectedCategory === "all"
      ? libraryArticles
      : getArticlesByCategory(selectedCategory as ArticleCategory);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return articles.filter(a => a.status === "published");
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Hero Search Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded-full text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Earn XP by reading articles!</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
          Find the Legal Resources You Need
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Browse our comprehensive library of expert legal guides, compliance resources,
          and practice management articles.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tiffany-500 focus:border-transparent shadow-sm"
            />
            <Link
              href="/library/search"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-tiffany-600 hover:bg-tiffany-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Advanced
            </Link>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 hover:text-tiffany-700 dark:hover:text-tiffany-300 rounded-full transition-colors"
            >
              <Tag className="inline h-3 w-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && !searchQuery && selectedCategory === "all" && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-tiffany-600" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Featured Articles
              </h3>
            </div>
            <Link
              href="/library/featured"
              className="text-sm text-tiffany-600 hover:text-tiffany-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter & Articles Grid */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-tiffany-600" />
            {selectedCategory === "all" ? "All Articles" : selectedCategory}
            <span className="text-sm font-normal text-slate-500">
              ({filteredArticles.length} articles)
            </span>
          </h3>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === "all"
                  ? "bg-tiffany-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All
            </button>
            {categories.slice(0, 5).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-tiffany-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
            {categories.length > 5 && (
              <Link
                href="/library/categories"
                className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full whitespace-nowrap transition-colors"
              >
                More...
              </Link>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No articles found
            </h4>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-tiffany-600 hover:text-tiffany-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-tiffany-600 to-teal-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Need Personalised Legal Advice?
        </h3>
        <p className="text-tiffany-100 mb-6 max-w-2xl mx-auto">
          Our library provides general guidance, but every situation is unique.
          Book a consultation with our experts for tailored advice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 bg-white text-tiffany-600 rounded-lg font-semibold hover:bg-tiffany-50 transition-colors"
          >
            Book a Consultation
          </Link>
          <Link
            href="/tools/compliance-quiz"
            className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            Take Compliance Quiz
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeaturedArticleCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group relative bg-gradient-to-br from-tiffany-600 to-teal-700 rounded-xl p-6 text-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
      <Star className="absolute top-4 right-4 h-5 w-5 text-yellow-300" />

      <div className="relative z-10 space-y-4">
        <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-medium">
          {article.category}
        </span>
        <h4 className="text-lg font-bold group-hover:underline line-clamp-2">
          {article.title}
        </h4>
        <p className="text-tiffany-100 text-sm line-clamp-2">
          {article.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-tiffany-200">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.publishDate).toLocaleDateString("en-AU", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-lg hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300"
    >
      {/* Article Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium">
            {article.category}
          </span>
          {article.featured && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>

        <h4 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2">
          {article.title}
        </h4>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
          {article.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="px-2 py-0.5 text-slate-400 text-xs">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Article Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.publishDate).toLocaleDateString("en-AU", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-tiffany-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
