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
  BookOpen
} from "lucide-react";
import {
  libraryArticles,
  getAllCategories,
  getArticlesByCategory
} from "@/lib/library/articles-data";
import type { ArticleCategory, LibraryArticle } from "@/lib/library/types";

// Category icons and colors
const categoryConfig: Record<ArticleCategory, { icon: React.ElementType; color: string; description: string }> = {
  "Medical Practice Law": {
    icon: Briefcase,
    color: "bg-blue-500",
    description: "Legal frameworks for establishing and operating medical practices"
  },
  "Payroll Tax": {
    icon: DollarSign,
    color: "bg-green-500",
    description: "Payroll tax obligations, exemptions, and compliance for healthcare"
  },
  "AHPRA Compliance": {
    icon: Shield,
    color: "bg-purple-500",
    description: "Registration, standards, and regulatory compliance with AHPRA"
  },
  "Healthcare Compliance": {
    icon: AlertCircle,
    color: "bg-red-500",
    description: "General healthcare regulatory compliance and best practices"
  },
  "Employment Law": {
    icon: Users,
    color: "bg-orange-500",
    description: "Workplace relations, contracts, and employment obligations"
  },
  "Commercial Agreements": {
    icon: FileText,
    color: "bg-cyan-500",
    description: "Commercial contracts, partnerships, and business agreements"
  },
  "Intellectual Property": {
    icon: BookOpen,
    color: "bg-pink-500",
    description: "Patents, trademarks, and IP protection for healthcare innovations"
  },
  "Corporate Law": {
    icon: Building,
    color: "bg-indigo-500",
    description: "Corporate structures, governance, and business law"
  },
  "Property Law": {
    icon: Building,
    color: "bg-amber-500",
    description: "Property leases, acquisitions, and real estate for practices"
  },
  "Visa & Immigration": {
    icon: Plane,
    color: "bg-teal-500",
    description: "Visa requirements and immigration for healthcare professionals"
  },
  "Tax Compliance": {
    icon: DollarSign,
    color: "bg-emerald-500",
    description: "Tax obligations, deductions, and compliance for medical practices"
  },
  "Regulatory": {
    icon: Scale,
    color: "bg-slate-500",
    description: "Regulatory frameworks and compliance requirements"
  },
  "Business": {
    icon: Briefcase,
    color: "bg-violet-500",
    description: "General business guidance for healthcare professionals"
  }
};

function CategoriesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as ArticleCategory | null;

  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(initialCategory);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = getAllCategories();

  // Get article counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat] = getArticlesByCategory(cat).filter(a => a.status === "published").length;
    });
    return counts;
  }, [categories]);

  // Get articles for selected category
  const selectedArticles = useMemo(() => {
    if (!selectedCategory) return [];
    return getArticlesByCategory(selectedCategory).filter(a => a.status === "published");
  }, [selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Browse by Category
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {categories.length} categories, {libraryArticles.filter(a => a.status === "published").length} total articles
          </p>
        </div>

        {/* View Toggle */}
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

      {/* Categories Grid/List */}
      <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {categories.map((category) => {
          const config = categoryConfig[category] || {
            icon: FileText,
            color: "bg-slate-500",
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
                w-full text-left rounded-xl border transition-all duration-300
                ${isSelected
                  ? "bg-tiffany-50 dark:bg-tiffany-900/20 border-tiffany-300 dark:border-tiffany-600 ring-2 ring-tiffany-500/20 shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-tiffany-400 dark:hover:border-tiffany-600 hover:shadow-md"
                }
                ${viewMode === "grid" ? "p-6" : "p-4 flex items-center gap-4"}
              `}
            >
              <div className={`${config.color} rounded-lg p-3 w-fit text-white ${viewMode === "list" ? "shrink-0" : "mb-4"}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className={viewMode === "list" ? "flex-1 min-w-0" : ""}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`font-semibold text-slate-900 dark:text-white ${viewMode === "list" ? "truncate" : ""}`}>
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

                {viewMode === "grid" && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {config.description}
                  </p>
                )}
              </div>

              {viewMode === "list" && (
                <ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${isSelected ? "rotate-90 text-tiffany-600" : "text-slate-400"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Category Articles */}
      {selectedCategory && selectedArticles.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {(() => {
                const config = categoryConfig[selectedCategory];
                const Icon = config?.icon || FileText;
                return <Icon className="h-5 w-5 text-tiffany-600" />;
              })()}
              {selectedCategory}
              <span className="text-sm font-normal text-slate-500">
                ({selectedArticles.length} articles)
              </span>
            </h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear selection
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State for Selected Category */}
      {selectedCategory && selectedArticles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No articles in this category yet
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            Check back soon for new content
          </p>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: LibraryArticle }) {
  return (
    <Link
      href={`/library/${article.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-lg hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300"
    >
      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors line-clamp-2 mb-2">
        {article.title}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
        {article.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingTime} min read
        </span>
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-tiffany-600" />
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
