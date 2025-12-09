import Link from "next/link";
import { Metadata } from "next";
import {
  KNOWLEDGE_BASE_CATEGORIES,
  getFeaturedArticles,
} from "@/lib/knowledge-base-data";
import {
  Stethoscope,
  Shield,
  Users,
  Building,
  FileText,
  Scale,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export const metadata: Metadata = {
  title: "Knowledge Base | Hamilton Bailey Legal",
  description:
    "Expert legal resources and guides for healthcare professionals. Find answers to common legal questions about medical practice, compliance, and healthcare law.",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Building: <Building className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
};

export default function KnowledgeBasePage() {
  const featuredArticles = getFeaturedArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Knowledge Base
            </h1>
            <p className="text-xl text-teal-100 mb-8">
              Expert legal resources and guides for healthcare professionals.
              Find answers to your legal questions.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <GlobalSearch variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse by Category
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {KNOWLEDGE_BASE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/knowledge-base/${category.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm border hover:shadow-md hover:border-teal-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-50 rounded-lg text-teal-600 group-hover:bg-teal-100 transition-colors">
                    {ICON_MAP[category.icon]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <span className="text-xs text-gray-400">
                      {category.articleCount} articles
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Articles
            </h2>
            <Link
              href="/knowledge-base/all"
              className="text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge-base/article/${article.slug}`}
                className="group"
              >
                <article className="bg-gray-50 rounded-xl p-6 hover:bg-teal-50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-medium text-amber-600 uppercase">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime} min read
                    </span>
                    <span>Updated {article.updatedAt}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-300 mb-8">
            Our team of healthcare law specialists is here to help with your
            specific legal questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
