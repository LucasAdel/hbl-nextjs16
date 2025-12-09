import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  KNOWLEDGE_BASE_CATEGORIES,
  getArticlesByCategory,
} from "@/lib/knowledge-base-data";
import { ArrowLeft, Clock, Tag } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return KNOWLEDGE_BASE_CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = KNOWLEDGE_BASE_CATEGORIES.find(
    (c) => c.slug === categorySlug
  );

  if (!category) {
    return {
      title: "Category Not Found | Hamilton Bailey Legal",
    };
  }

  return {
    title: `${category.name} | Knowledge Base | Hamilton Bailey Legal`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: categorySlug } = await params;
  const category = KNOWLEDGE_BASE_CATEGORIES.find(
    (c) => c.slug === categorySlug
  );

  if (!category) {
    notFound();
  }

  const articles = getArticlesByCategory(categorySlug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge Base
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category.name}
          </h1>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No articles in this category yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/knowledge-base/article/${article.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-sm border hover:shadow-md hover:border-teal-200 transition-all"
                >
                  <article>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-teal-600 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {article.readTime} min read
                      </span>

                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {article.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
