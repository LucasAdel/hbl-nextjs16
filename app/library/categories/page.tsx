"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Grid3X3,
  List,
  Clock,
  ChevronRight,
  FileText,
  Briefcase,
  Scale,
  Shield,
  Building,
  Users,
  Plane,
  DollarSign,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  Filter,
  Sparkles
} from "lucide-react";
import {
  libraryArticles,
  getAllCategories,
  getArticlesByCategory
} from "@/lib/library/articles-data";
import type { ArticleCategory, LibraryArticle } from "@/lib/library/types";
import { useSubdomain } from "@/hooks/use-subdomain";

// Category icons and colors with enhanced styling
const categoryConfig: Record<ArticleCategory, {
  icon: React.ElementType;
  color: string;
  lightColor: string;
  textColor: string;
  description: string
}> = {
  "Medical Practice Law": {
    icon: Briefcase,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    description: "Legal frameworks for establishing and operating medical practices"
  },
  "Payroll Tax": {
    icon: DollarSign,
    color: "bg-green-500",
    lightColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    description: "Payroll tax obligations, exemptions, and compliance for healthcare"
  },
  "AHPRA Compliance": {
    icon: Shield,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    description: "Registration, standards, and regulatory compliance with AHPRA"
  },
  "Healthcare Compliance": {
    icon: AlertCircle,
    color: "bg-red-500",
    lightColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
    description: "General healthcare regulatory compliance and best practices"
  },
  "Employment Law": {
    icon: Users,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    description: "Workplace relations, contracts, and employment obligations"
  },
  "Commercial Agreements": {
    icon: FileText,
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 dark:bg-cyan-900/20",
    textColor: "text-cyan-600 dark:text-cyan-400",
    description: "Commercial contracts, partnerships, and business agreements"
  },
  "Intellectual Property": {
    icon: BookOpen,
    color: "bg-pink-500",
    lightColor: "bg-pink-50 dark:bg-pink-900/20",
    textColor: "text-pink-600 dark:text-pink-400",
    description: "Patents, trademarks, and IP protection for healthcare innovations"
  },
  "Corporate Law": {
    icon: Building,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50 dark:bg-indigo-900/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
    description: "Corporate structures, governance, and business law"
  },
  "Property Law": {
    icon: Building,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-600 dark:text-amber-400",
    description: "Property leases, acquisitions, and real estate for practices"
  },
  "Visa & Immigration": {
    icon: Plane,
    color: "bg-teal-500",
    lightColor: "bg-teal-50 dark:bg-teal-900/20",
    textColor: "text-teal-600 dark:text-teal-400",
    description: "Visa requirements and immigration for healthcare professionals"
  },
  "Tax Compliance": {
    icon: DollarSign,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    description: "Tax obligations, deductions, and compliance for medical practices"
  },
  "Regulatory": {
    icon: Scale,
    color: "bg-slate-500",
    lightColor: "bg-slate-50 dark:bg-slate-900/20",
    textColor: "text-slate-600 dark:text-slate-400",
    description: "Regulatory frameworks and compliance requirements"
  },
  "Business": {
    icon: Briefcase,
    color: "bg-violet-500",
    lightColor: "bg-violet-50 dark:bg-violet-900/20",
    textColor: "text-violet-600 dark:text-violet-400",
    description: "General business guidance for healthcare professionals"
  }
};

function CategoriesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as ArticleCategory | null;
  const { isLibrary, getMainSiteUrl } = useSubdomain();

  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(initialCategory);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = getAllCategories();
  const totalArticles = libraryArticles.filter(a => a.status === "published").length;

  // Get article counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat] = getArticlesByCategory(cat).filter(a => a.status === "published").length;
    });
    return counts;
  }, [categories]);

  // Sort categories by article count
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  }, [categories, categoryCounts]);

  // Featured categories (top 6) and others
  const featuredCategories = sortedCategories.slice(0, 6);
  const otherCategories = sortedCategories.slice(6);

  // Get articles for selected category
  const selectedArticles = useMemo(() => {
    if (!selectedCategory) return [];
    return getArticlesByCategory(selectedCategory).filter(a => a.status === "published");
  }, [selectedCategory]);

  // Get library path helper
  const getLibraryPath = (path: string) => {
    if (isLibrary) {
      return path.replace(/^\/library/, "") || "/";
    }
    return path;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tiffany-100 via-white to-tiffany-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border border-tiffany-200 dark:border-tiffany-800 mb-6 animate-fade-in-up">
              <Filter className="h-4 w-4 text-tiffany-600 dark:text-tiffany-400" />
              <span className="text-sm font-medium text-tiffany-700 dark:text-tiffany-300">
                Organized Knowledge
              </span>
            </div>

            <h1 className="font-serif text-4xl lg:text-6xl text-slate-900 dark:text-white mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Browse by Category
            </h1>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Explore our comprehensive legal resources organized by topic. Find expert guidance on medical practice law, compliance, and healthcare regulations.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  {categories.length}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  {totalArticles}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Expert Articles</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  14+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Years Experience</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-tiffany-600 dark:text-tiffany-400 mb-1">
                  100%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Australian Focus</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tiffany-100 dark:bg-tiffany-900/30 mb-4">
              <Star className="h-4 w-4 text-tiffany-600 dark:text-tiffany-400" />
              <span className="text-sm font-medium text-tiffany-700 dark:text-tiffany-300">Core Expertise</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl text-slate-900 dark:text-white mb-4">
              Our Primary Practice Areas
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive legal guidance in the categories most critical to medical practitioners and healthcare businesses.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-tiffany-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-tiffany-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Featured Categories Grid */}
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
            {featuredCategories.map((category, index) => {
              const config = categoryConfig[category] || {
                icon: FileText,
                color: "bg-slate-500",
                lightColor: "bg-slate-50 dark:bg-slate-900/20",
                textColor: "text-slate-600 dark:text-slate-400",
                description: "Articles about " + category
              };
              const Icon = config.icon;
              const isSelected = selectedCategory === category;
              const count = categoryCounts[category] || 0;
              const categoryArticles = getArticlesByCategory(category).filter(a => a.status === "published").slice(0, 3);

              if (viewMode === "list") {
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`
                      w-full text-left rounded-xl border transition-all duration-300 p-4 flex items-center gap-4
                      ${isSelected
                        ? "bg-tiffany-50 dark:bg-tiffany-900/20 border-tiffany-300 dark:border-tiffany-600 ring-2 ring-tiffany-500/20 shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-tiffany-400 dark:hover:border-tiffany-600 hover:shadow-md"
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`${config.lightColor} rounded-lg p-3 shrink-0`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {category}
                        </h3>
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-medium shrink-0
                          ${isSelected
                            ? "bg-tiffany-200 dark:bg-tiffany-800 text-tiffany-700 dark:text-tiffany-200"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }
                        `}>
                          {count} article{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${isSelected ? "rotate-90 text-tiffany-600" : "text-slate-400"}`} />
                  </button>
                );
              }

              return (
                <div
                  key={category}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`
                      w-full text-left rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                      ${isSelected
                        ? "bg-tiffany-50 dark:bg-tiffany-900/20 border-tiffany-300 dark:border-tiffany-600 ring-2 ring-tiffany-500/20 shadow-lg"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg hover:border-tiffany-400 dark:hover:border-tiffany-600"
                      }
                    `}
                  >
                    <div className="p-6">
                      {/* Icon and Header */}
                      <div className="flex items-center mb-6">
                        <div className={`w-12 h-12 ${config.lightColor} rounded-xl flex items-center justify-center mr-4`}>
                          <Icon className={`w-6 h-6 ${config.textColor}`} />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors">
                            {category}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{count} article{count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                        {config.description}
                      </p>

                      {/* Recent Articles */}
                      {categoryArticles.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Articles:</h4>
                          {categoryArticles.map(article => (
                            <div key={article.id} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-tiffany-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                {article.title}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.lightColor} ${config.textColor}`}>
                          {count} Articles
                        </span>
                        <span className="text-tiffany-600 dark:text-tiffany-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          Explore Category
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other Categories Section */}
      {otherCategories.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl text-slate-900 dark:text-white mb-4">
                Additional Categories
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Comprehensive coverage across all aspects of medical practice law.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherCategories.map((category, index) => {
                const config = categoryConfig[category] || {
                  icon: FileText,
                  color: "bg-slate-500",
                  lightColor: "bg-slate-50 dark:bg-slate-900/20",
                  textColor: "text-slate-600 dark:text-slate-400",
                  description: "Articles about " + category
                };
                const Icon = config.icon;
                const isSelected = selectedCategory === category;
                const count = categoryCounts[category] || 0;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`
                      block p-6 bg-white dark:bg-slate-800 rounded-xl border transition-all group animate-fade-in-up text-left
                      ${isSelected
                        ? "border-tiffany-400 dark:border-tiffany-600 shadow-lg ring-2 ring-tiffany-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-tiffany-400 dark:hover:border-tiffany-600 hover:shadow-md"
                      }
                    `}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${config.lightColor} p-2 rounded-lg`}>
                          <Icon className={`h-4 w-4 ${config.textColor}`} />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors">
                          {category}
                        </h3>
                      </div>
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-sm">
                        {count}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {config.description}
                    </p>
                    <div className="text-tiffany-600 dark:text-tiffany-400 text-sm font-medium flex items-center gap-1">
                      View Articles
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Selected Category Articles */}
      {selectedCategory && selectedArticles.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = categoryConfig[selectedCategory];
                  const Icon = config?.icon || FileText;
                  return (
                    <div className={`${config?.lightColor || "bg-slate-100"} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${config?.textColor || "text-slate-600"}`} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-2xl font-serif text-slate-900 dark:text-white">
                    {selectedCategory}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {selectedArticles.length} article{selectedArticles.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear selection
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} getLibraryPath={getLibraryPath} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State for Selected Category */}
      {selectedCategory && selectedArticles.length === 0 && (
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No articles in this category yet
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Check back soon for new content
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-tiffany-600 dark:text-tiffany-400 font-medium hover:underline"
              >
                Browse other categories
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA Section */}
      <section className="py-16 bg-gradient-to-br from-tiffany-500 to-tiffany-600 dark:from-tiffany-600 dark:to-tiffany-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Expert Legal Guidance</span>
            </div>

            <h2 className="font-serif text-3xl lg:text-4xl text-white mb-6">
              Need Personalized Legal Advice?
            </h2>
            <p className="text-xl text-tiffany-100 mb-8">
              Our experienced team provides tailored legal solutions for medical practitioners and healthcare businesses across Australia.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href={isLibrary ? "https://hamiltonbailey.com/contact" : "/contact"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-tiffany-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                <Mail className="w-5 h-5" />
                Contact Our Team
              </a>
              <a
                href={isLibrary ? "https://hamiltonbailey.com/book-appointment" : "/book-appointment"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-tiffany-700 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-tiffany-800 transition-colors w-full sm:w-auto justify-center"
              >
                <Calendar className="w-5 h-5" />
                Book Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function ArticleCard({
  article,
  index,
  getLibraryPath
}: {
  article: LibraryArticle;
  index: number;
  getLibraryPath: (path: string) => string;
}) {
  const isNew = article.publishDate &&
    new Date(article.publishDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <Link
      href={getLibraryPath(`/library/${article.slug}`)}
      className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        {isNew && (
          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
            New
          </span>
        )}
        {article.featured && (
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3" />
            Featured
          </span>
        )}
      </div>

      <h4 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2 mb-3">
        {article.title}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
        {article.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {article.readingTime} min read
        </span>
        <span className="flex items-center gap-1 text-tiffany-600 dark:text-tiffany-400 font-medium group-hover:gap-2 transition-all">
          Read More
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tiffany-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading categories...</p>
        </div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
