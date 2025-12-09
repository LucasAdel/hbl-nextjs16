"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Calendar,
  ChevronRight,
  Star,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  Tag,
  Users,
  FileText,
  Eye,
} from "lucide-react";
import {
  libraryArticles,
  getFeaturedArticles,
  getArticlesByCategory,
  getAllCategories,
  getAllTags,
} from "@/lib/library/articles-data";
import type { LibraryArticle, ArticleCategory } from "@/lib/library/types";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ArticleCategory | "all"
  >("all");

  const categories = getAllCategories();
  const popularTags = getAllTags().slice(0, 12);
  const featuredArticles = getFeaturedArticles(3);
  const publishedArticles = libraryArticles.filter(
    (a) => a.status === "published"
  );
  const recentArticles = publishedArticles.slice(0, 9);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedArticles.forEach((article) => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredArticles = useMemo(() => {
    let articles =
      selectedCategory === "all"
        ? publishedArticles
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

    return articles;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-0">
      {/* Hero Section with gradient */}
      <section className="bg-gradient-to-br from-tiffany-100 via-white to-tiffany-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm mb-6 animate-fade-in">
              <FileText className="w-4 h-4 text-tiffany-600 dark:text-tiffany-400 mr-2" />
              <span className="text-tiffany-700 dark:text-tiffany-300 font-medium text-sm">
                {publishedArticles.length} Expert Articles
              </span>
            </div>

            <h1 className="font-serif text-4xl lg:text-6xl text-slate-900 dark:text-white mb-6 animate-fade-in-up">
              Hamilton Bailey Legal Library
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto animate-fade-in-up">
              Your comprehensive resource for Australian healthcare law, medical
              practice compliance, and regulatory guidance.
            </p>

            {/* Main Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8 animate-fade-in-up">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, practice areas, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-14 py-4 text-lg border-2 border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-tiffany-500 focus:ring-0 focus:outline-none shadow-lg transition-all duration-200"
              />
              <Link
                href="/library/search"
                className="absolute right-2 top-2 bottom-2 px-6 bg-tiffany-500 text-white rounded-xl hover:bg-tiffany-600 transition-colors flex items-center font-medium"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Link>
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Popular searches:
              </span>
              {[
                "Medical Practice Law",
                "AHPRA Compliance",
                "Tenant Doctor",
                "Payroll Tax",
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-tiffany-700 dark:text-tiffany-300 border border-tiffany-200 dark:border-tiffany-800 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center animate-fade-in-up">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  {publishedArticles.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total Articles
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  {categories.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Categories
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  {popularTags.length}+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Practice Areas
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  5K+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Total Views
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 &&
        !searchQuery &&
        selectedCategory === "all" && (
          <section className="py-16 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-full mb-4">
                  <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 fill-yellow-400" />
                  <span className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm tracking-wide uppercase">
                    Featured Articles
                  </span>
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl text-slate-900 dark:text-white mb-4">
                  Must-Read Legal Guidance
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Our most important and comprehensive articles on critical
                  aspects of medical practice law.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {featuredArticles.map((article, index) => (
                  <FeaturedArticleCard
                    key={article.id}
                    article={article}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Categories and Practice Areas */}
      {!searchQuery && selectedCategory === "all" && (
        <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Categories */}
              <div>
                <h2 className="font-serif text-3xl text-slate-900 dark:text-white mb-8">
                  Browse by Category
                </h2>
                <div className="space-y-4">
                  {categories.slice(0, 6).map((category, index) => (
                    <Link
                      key={category}
                      href={`/library/categories?category=${encodeURIComponent(category)}`}
                      className="block p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-tiffany-400 dark:hover:border-tiffany-600 hover:shadow-md transition-all group animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors">
                            {category}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {categoryCounts[category] || 0} article
                            {(categoryCounts[category] || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-tiffany-100 dark:bg-tiffany-900/50 text-tiffany-700 dark:text-tiffany-300 px-3 py-1 rounded-full text-sm font-medium mr-3">
                            {categoryCounts[category] || 0}
                          </span>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-tiffany-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {categories.length > 6 && (
                  <div className="mt-6">
                    <Link
                      href="/library/categories"
                      className="inline-flex items-center text-tiffany-600 dark:text-tiffany-400 hover:text-tiffany-700 dark:hover:text-tiffany-300 font-medium"
                    >
                      View All Categories
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Popular Tags */}
              <div>
                <h2 className="font-serif text-3xl text-slate-900 dark:text-white mb-8">
                  Popular Topics
                </h2>
                <div className="flex flex-wrap gap-3">
                  {popularTags.map((tag, index) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:border-tiffany-400 dark:hover:border-tiffany-600 hover:text-tiffany-700 dark:hover:text-tiffany-400 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 transition-all text-sm font-medium animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <Tag className="inline w-3 h-3 mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/library/search"
                    className="btn-primary px-6 py-3 text-center rounded-lg font-semibold bg-tiffany-500 hover:bg-tiffany-600 text-white transition-colors flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Articles
                  </Link>
                  <Link
                    href="/library/practice-areas"
                    className="btn-secondary px-6 py-3 text-center rounded-lg font-semibold border-2 border-tiffany-500 text-tiffany-600 dark:text-tiffany-400 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 transition-colors flex items-center justify-center"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse by Topic
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles Grid */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl text-slate-900 dark:text-white mb-4">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory !== "all"
                    ? selectedCategory
                    : "Latest Articles"}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {searchQuery || selectedCategory !== "all"
                  ? `Found ${filteredArticles.length} articles`
                  : "Stay updated with our newest legal insights and analysis."}
              </p>
            </div>
            {!searchQuery && selectedCategory === "all" && (
              <div className="hidden lg:block">
                <Link
                  href="/library/search"
                  className="inline-flex items-center px-4 py-2 border-2 border-tiffany-500 text-tiffany-600 dark:text-tiffany-400 rounded-lg font-medium hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 transition-colors"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Advanced Search
                </Link>
              </div>
            )}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {(searchQuery || selectedCategory !== "all"
                ? filteredArticles
                : recentArticles
              ).map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 dark:text-slate-500 mb-4">
                Try adjusting your search terms or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-tiffany-600 dark:text-tiffany-400 hover:text-tiffany-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* View All Button */}
          {!searchQuery && selectedCategory === "all" && (
            <div className="text-center">
              <Link
                href="/library/search"
                className="inline-flex items-center px-8 py-4 bg-tiffany-500 text-white rounded-xl font-semibold hover:bg-tiffany-600 transition-all hover:shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                View All Articles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-tiffany-500 to-tiffany-600 dark:from-tiffany-600 dark:to-tiffany-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl text-white mb-6">
              Stay Updated with Legal Insights
            </h2>
            <p className="text-xl text-tiffany-100 mb-8">
              Get the latest articles and legal updates delivered to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white bg-white text-slate-900 placeholder-slate-400"
                required
              />
              <button
                type="submit"
                className="bg-white text-tiffany-600 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Subscribe
              </button>
            </form>

            <p className="text-sm text-tiffany-100 mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Need Personalised Legal Advice?
            </h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Our library provides general guidance, but every situation is
              unique. Book a consultation with our experts for tailored advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-tiffany-500 text-white rounded-lg font-semibold hover:bg-tiffany-600 transition-colors"
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
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedArticleCard({
  article,
  index,
}: {
  article: LibraryArticle;
  index: number;
}) {
  return (
    <article
      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Featured Badge */}
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-lg">
        <Star className="w-5 h-5 text-yellow-900 fill-yellow-900" />
      </div>

      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span className="bg-tiffany-100/50 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 px-3 py-1 rounded-full text-xs font-medium">
            {article.category}
          </span>
          <span className="mx-2">•</span>
          <span>
            {new Date(article.publishDate).toLocaleDateString("en-AU", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl lg:text-2xl mb-4 group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors leading-tight">
          <Link href={`/library/${article.slug}`}>{article.title}</Link>
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
          {article.description}
        </p>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {article.readingTime} min read
            </span>
          </div>
          <Link
            href={`/library/${article.slug}`}
            className="text-tiffany-600 dark:text-tiffany-400 hover:text-tiffany-700 font-medium transition-colors flex items-center"
          >
            Read more
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ArticleCard({
  article,
  index,
}: {
  article: LibraryArticle;
  index: number;
}) {
  // Calculate freshness
  const daysSincePublished = Math.floor(
    (Date.now() - new Date(article.publishDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const isRecent = daysSincePublished <= 30;

  return (
    <article
      className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Featured ribbon */}
      {article.featured && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-tiffany-500 to-tiffany-600 text-white shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-white" />
            Featured
          </span>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2">
          {/* Category badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300">
            {article.category}
          </span>

          {/* Recent badge */}
          {isRecent && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors duration-200 line-clamp-2">
          <Link href={`/library/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {article.description}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 hover:text-tiffany-700 dark:hover:text-tiffany-300 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Author and meta */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-tiffany-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {article.author?.name?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {article.author?.name || "Hamilton Bailey"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(article.publishDate).toLocaleDateString("en-AU", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                • {article.readingTime} min read
              </p>
            </div>
          </div>

          {/* Read more button */}
          <Link
            href={`/library/${article.slug}`}
            className="text-tiffany-600 dark:text-tiffany-400 hover:text-tiffany-700 font-medium text-sm flex items-center"
          >
            Read
            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
