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
import { ParallaxTOC } from "@/components/codex/ParallaxTOC";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/codex" className="hover:text-tiffany-600 transition-colors flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </Link>
        <span className="text-slate-300">/</span>
        <Link
          href={`/codex/categories?category=${encodeURIComponent(article.category)}`}
          className="hover:text-tiffany-600 transition-colors"
        >
          {article.category}
        </Link>
      </nav>

      <div className="grid lg:grid-cols-4 gap-10 scale-80 origin-top-left">
        {/* Main Content */}
        <article className="lg:col-span-3 space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            {/* Category & XP Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1.5 bg-tiffany-50 text-tiffany-700 border border-tiffany-200 rounded-full text-sm font-medium">
                {article.category}
              </span>
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                +{Math.round(article.readingTime * 10)} XP
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                article.difficulty === "beginner"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : article.difficulty === "intermediate"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : article.difficulty === "advanced"
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
              {article.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 py-6 border-y border-slate-200">
              {article.showAuthor && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-tiffany-100 to-tiffany-50 rounded-full flex items-center justify-center border border-tiffany-200">
                    <User className="h-5 w-5 text-tiffany-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      {article.author.name}
                    </p>
                    <p className="text-xs text-slate-500">{article.author.role}</p>
                  </div>
                </div>
              )}

              {article.showPublishDate && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {new Date(article.publishDate).toLocaleDateString("en-AU", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}

              {article.showReadingTime && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {article.readingTime} min read
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {article.jurisdiction.join(", ")}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/codex/search?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-tiffany-50 hover:text-tiffany-700 hover:border-tiffany-200 rounded-full text-sm transition-all flex items-center gap-1.5"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-tiffany-600 hover:prose-a:text-tiffany-700 prose-strong:text-slate-800 prose-li:text-slate-700">
            <ArticleContent content={article.content} />
          </div>

          {/* Article Footer */}
          <footer className="pt-10 border-t border-slate-200 space-y-8">
            {/* Actions */}
            <ArticleActions article={article} />

            {/* Author Bio */}
            {article.showAuthor && article.author.bio && (
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-tiffany-100 to-tiffany-50 rounded-full flex items-center justify-center shrink-0 border border-tiffany-200">
                    <User className="h-8 w-8 text-tiffany-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {article.author.name}
                    </h4>
                    <p className="text-sm text-tiffany-600 mb-2">
                      {article.author.role}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Citations */}
            {article.legalCitations && article.legalCitations.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-tiffany-600" />
                  Legal Citations
                </h4>
                <ul className="space-y-2">
                  {article.legalCitations.map((citation, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">{citation.case}</span>
                      {" "}({citation.court}, {citation.year})
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-tiffany-600 hover:text-tiffany-700 hover:underline"
                        >
                          View →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legislation */}
            {article.legislation && article.legislation.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-tiffany-600" />
                  Relevant Legislation
                </h4>
                <ul className="space-y-2">
                  {article.legislation.map((leg, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">{leg.title}</span>
                      {" "}({leg.jurisdiction}, {leg.year})
                      {leg.url && (
                        <a
                          href={leg.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-tiffany-600 hover:text-tiffany-700 hover:underline"
                        >
                          View →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </footer>
        </article>

        {/* Sidebar with Parallax TOC */}
        {article.showTableOfContents && (
          <ParallaxTOC content={article.content} />
        )}
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mt-16 pt-10 border-t border-slate-200">
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
