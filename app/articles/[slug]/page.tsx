import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getArticleBySlug,
  getRelatedArticles,
  getAllArticleSlugs,
  categoryLabels,
} from "@/lib/articles-data";
import {
  ChevronRight,
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  ArrowRight,
  Share2,
  BookOpen,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: `${article.title} | Hamilton Bailey Law Firm`,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(slug);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-gray-500 hover:text-tiffany dark:text-gray-400"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href="/articles"
                className="text-gray-500 hover:text-tiffany dark:text-gray-400"
              >
                Articles
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {article.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-gray-900 dark:via-gray-900 dark:to-tiffany-dark/10 pt-12 pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-tiffany hover:text-tiffany-dark mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                href={`/articles?category=${article.category}`}
                className="px-3 py-1 bg-tiffany/10 dark:bg-tiffany/20 text-tiffany text-sm font-medium rounded-full hover:bg-tiffany/20 transition-colors"
              >
                {categoryLabels[article.category]}
              </Link>
              {article.featured && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-blair text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary dark:text-white mb-6">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-tiffany" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {article.author.name}
                  </p>
                  <p className="text-xs">{article.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.publishedAt).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </div>
              <button className="flex items-center gap-1 hover:text-tiffany transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-12 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-blair prose-headings:text-text-primary dark:prose-headings:text-white prose-a:text-tiffany hover:prose-a:text-tiffany-dark prose-li:marker:text-tiffany">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-tiffany" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {article.author.name}
                  </h3>
                  <p className="text-sm text-tiffany mb-2">
                    {article.author.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Expert in healthcare law with over a decade of experience
                    helping medical practitioners navigate complex legal issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-blair text-2xl font-bold text-text-primary dark:text-white mb-8 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-tiffany" />
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="group bg-white dark:bg-gray-900 rounded-xl p-5 hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <span className="inline-block px-2 py-0.5 bg-tiffany/10 dark:bg-tiffany/20 text-tiffany text-xs font-medium rounded-full mb-3">
                      {categoryLabels[related.category]}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-tiffany transition-colors line-clamp-2 mb-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {related.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-tiffany text-sm font-medium group-hover:gap-2 transition-all">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-tiffany-dark">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-blair text-3xl font-bold text-white mb-4">
              Need Legal Advice?
            </h2>
            <p className="text-white/90 mb-8">
              Our team of healthcare law specialists is here to help with your
              specific legal needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-appointment"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-tiffany-dark font-semibold rounded-xl hover:bg-white/90 transition-colors"
              >
                Book Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
