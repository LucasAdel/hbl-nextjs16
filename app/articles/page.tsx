import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import {
  articles,
  getFeaturedArticles,
  categoryLabels,
  type ArticleCategory,
} from "@/lib/articles-data";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Legal insights and guidance for Australian medical practitioners. Stay informed about regulatory changes, compliance requirements, and practice management best practices.",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const featuredArticles = getFeaturedArticles();

  const filteredArticles = category
    ? articles.filter((a) => a.category === category)
    : articles;

  const categories = Object.entries(categoryLabels) as [
    ArticleCategory,
    string
  ][];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-gray-900 dark:via-gray-900 dark:to-tiffany-dark/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-tiffany/3 dark:bg-tiffany/5" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10 dark:bg-tiffany/20">
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal Insights
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
              Articles & Legal Updates
            </h1>
            <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 max-w-2xl mx-auto">
              Expert guidance and insights on legal matters affecting Australian
              medical practitioners and healthcare businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/articles"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Articles
            </Link>
            {categories.map(([key, label]) => (
              <Link
                key={key}
                href={`/articles?category=${key}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === key
                    ? "bg-tiffany text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {!category && featuredArticles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <h2 className="font-blair text-2xl font-bold text-text-primary dark:text-white mb-8">
              Featured Articles
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredArticles.slice(0, 2).map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-tiffany/10 dark:bg-tiffany/20 text-tiffany text-sm font-medium rounded-full">
                        {categoryLabels[article.category]}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-tiffany transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(article.publishedAt).toLocaleDateString(
                            "en-AU",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.readTime} min read
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-tiffany font-medium group-hover:gap-2 transition-all">
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-blair text-2xl font-bold text-text-primary dark:text-white">
              {category ? categoryLabels[category as ArticleCategory] : "All Articles"}
            </h2>
            <span className="text-gray-500 dark:text-gray-400">
              {filteredArticles.length} article
              {filteredArticles.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-tiffany/10 dark:bg-tiffany/20 text-tiffany text-xs font-medium rounded-full">
                        {categoryLabels[article.category]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-tiffany transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.publishedAt).toLocaleDateString(
                          "en-AU",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime} min
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No articles found in this category.
              </p>
              <Link
                href="/articles"
                className="text-tiffany font-medium hover:underline"
              >
                View all articles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-tiffany-dark">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-blair text-3xl font-bold text-white mb-4">
              Stay Informed
            </h2>
            <p className="text-white/90 mb-8">
              Subscribe to our newsletter for the latest legal updates and
              insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-tiffany-dark font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
