import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  KNOWLEDGE_BASE_ARTICLES,
  KNOWLEDGE_BASE_CATEGORIES,
  getArticleBySlug,
} from "@/lib/knowledge-base-data";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return KNOWLEDGE_BASE_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | Hamilton Bailey Legal",
    };
  }

  return {
    title: `${article.title} | Knowledge Base | Hamilton Bailey Legal`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = KNOWLEDGE_BASE_CATEGORIES.find(
    (c) => c.id === article.category
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/knowledge-base/${category?.slug || ""}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {category?.name || "Knowledge Base"}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated {article.updatedAt}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border p-8 md:p-12">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-teal-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(article.content) }}
            />
          </div>

          {/* Share & Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl border">
            <div>
              <p className="font-medium text-gray-900">
                Found this article helpful?
              </p>
              <p className="text-sm text-gray-500">
                Share it with colleagues or save for later
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* CTA */}
          <div className="mt-8 p-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Need personalized advice?</h3>
            <p className="text-teal-100 mb-6">
              Our healthcare law specialists can help with your specific situation.
            </p>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Simple markdown to HTML formatter
function formatMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/g, "<p>")
    .replace(/$/g, "</p>");
}
