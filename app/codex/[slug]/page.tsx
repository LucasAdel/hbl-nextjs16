import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  Clock,
  Calendar,
  User,
  ChevronLeft,
  Share2,
  Bookmark,
  Printer,
  MessageCircle,
  ThumbsUp,
  ArrowRight,
  Tag,
  MapPin,
  BookOpen,
  CheckCircle,
  Sparkles
} from "lucide-react";
import {
  libraryArticles,
  getArticleBySlug,
  getRelatedArticles,
  getArticlesByCategory
} from "@/lib/codex/articles-data";
import type { LibraryArticle } from "@/lib/codex/types";
import { ArticleContent } from "@/components/codex/ArticleContent";
import { TableOfContents } from "@/components/codex/TableOfContents";
import { ArticleActions } from "@/components/codex/ArticleActions";
import { RelatedArticles } from "@/components/codex/RelatedArticles";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return libraryArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishDate,
      modifiedTime: article.lastModified,
      authors: [article.author.name],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.id, 3);
  const categoryArticles = getArticlesByCategory(article.category)
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/codex" className="hover:text-tiffany-600 transition-colors flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <span>/</span>
        <Link
          href={`/codex/categories?category=${encodeURIComponent(article.category)}`}
          className="hover:text-tiffany-600 transition-colors"
        >
          {article.category}
        </Link>
      </nav>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-3 space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            {/* Category & XP Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded-full text-sm font-medium">
                {article.category}
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                +{Math.round(article.readingTime * 10)} XP
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                article.difficulty === "beginner"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : article.difficulty === "intermediate"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : article.difficulty === "advanced"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}>
                {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              {article.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-700">
              {article.showAuthor && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-tiffany-100 dark:bg-tiffany-900/30 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-tiffany-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {article.author.name}
                    </p>
                    <p className="text-xs">{article.author.role}</p>
                  </div>
                </div>
              )}

              {article.showPublishDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(article.publishDate).toLocaleDateString("en-AU", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}

              {article.showReadingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {article.readingTime} min read
                </div>
              )}

              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {article.jurisdiction.join(", ")}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/codex/search?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 hover:text-tiffany-700 dark:hover:text-tiffany-300 rounded-full text-sm transition-colors flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <ArticleContent content={article.content} />
          </div>

          {/* Article Footer */}
          <footer className="pt-8 border-t border-slate-200 dark:border-slate-700 space-y-8">
            {/* Actions */}
            <ArticleActions article={article} />

            {/* Author Bio */}
            {article.showAuthor && article.author.bio && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-tiffany-100 dark:bg-tiffany-900/30 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-tiffany-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {article.author.name}
                    </h4>
                    <p className="text-sm text-tiffany-600 dark:text-tiffany-400 mb-2">
                      {article.author.role}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Citations */}
            {article.legalCitations && article.legalCitations.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-tiffany-600" />
                  Legal Citations
                </h4>
                <ul className="space-y-2">
                  {article.legalCitations.map((citation, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{citation.case}</span>
                      {" "}({citation.court}, {citation.year})
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-tiffany-600 hover:text-tiffany-700"
                        >
                          View
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legislation */}
            {article.legislation && article.legislation.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-tiffany-600" />
                  Relevant Legislation
                </h4>
                <ul className="space-y-2">
                  {article.legislation.map((leg, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{leg.title}</span>
                      {" "}({leg.jurisdiction}, {leg.year})
                      {leg.url && (
                        <a
                          href={leg.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-tiffany-600 hover:text-tiffany-700"
                        >
                          View
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </footer>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Table of Contents */}
          {article.showTableOfContents && (
            <div className="sticky top-24">
              <TableOfContents content={article.content} />
            </div>
          )}

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h4 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 text-slate-700 dark:text-slate-300 hover:text-tiffany-700 dark:hover:text-tiffany-300 rounded-lg text-sm transition-colors">
                <Bookmark className="h-4 w-4" />
                Save to Bookmarks
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 text-slate-700 dark:text-slate-300 hover:text-tiffany-700 dark:hover:text-tiffany-300 rounded-lg text-sm transition-colors">
                <Share2 className="h-4 w-4" />
                Share Article
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-tiffany-100 dark:hover:bg-tiffany-900/30 text-slate-700 dark:text-slate-300 hover:text-tiffany-700 dark:hover:text-tiffany-300 rounded-lg text-sm transition-colors">
                <Printer className="h-4 w-4" />
                Print Article
              </button>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-gradient-to-br from-tiffany-600 to-teal-700 rounded-xl p-6 text-white">
            <h4 className="font-semibold mb-2">Need Personal Advice?</h4>
            <p className="text-sm text-tiffany-100 mb-4">
              Our experts can help with your specific situation.
            </p>
            <Link
              href="/contact"
              className="block w-full text-center px-4 py-2 bg-white text-tiffany-600 rounded-lg text-sm font-medium hover:bg-tiffany-50 transition-colors"
            >
              Book Consultation
            </Link>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <RelatedArticles articles={relatedArticles} title="Related Articles" />
        </section>
      )}

      {/* More in Category */}
      {categoryArticles.length > 0 && (
        <section className="mt-12">
          <RelatedArticles
            articles={categoryArticles}
            title={`More in ${article.category}`}
          />
        </section>
      )}
    </div>
  );
}
