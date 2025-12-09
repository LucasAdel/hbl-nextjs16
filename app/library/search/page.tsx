"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  Clock,
  Calendar,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Tag
} from "lucide-react";
import {
  libraryArticles,
  getAllCategories,
  getAllTags,
  getAllJurisdictions,
  getAllPracticeAreas,
  searchArticles
} from "@/lib/library/articles-data";
import {
  READING_TIME_RANGES,
  DATE_RANGES,
  SORT_OPTIONS,
  JURISDICTIONS,
  type ArticleCategory,
  type Jurisdiction,
  type PracticeArea,
  type ReadingTimeRange,
  type DateRange,
  type SortOption,
  type LibraryArticle
} from "@/lib/library/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial values from URL
  const initialQuery = searchParams.get("q") || "";
  const initialTag = searchParams.get("tag") || "";
  const initialCategory = searchParams.get("category") || "";

  // State
  const [query, setQuery] = useState(initialQuery || initialTag);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<ArticleCategory[]>(
    initialCategory ? [initialCategory as ArticleCategory] : []
  );
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Jurisdiction[]>([]);
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<PracticeArea[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [readingTimeRange, setReadingTimeRange] = useState<ReadingTimeRange>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  // Get filter options
  const categories = getAllCategories();
  const jurisdictions = JURISDICTIONS;
  const practiceAreas = getAllPracticeAreas();
  const allTags = getAllTags();

  // Filter articles
  const filteredArticles = useMemo(() => {
    let articles = libraryArticles.filter(a => a.status === "published");

    // Text search
    if (query) {
      const results = searchArticles(query);
      articles = results.map(r => r.article);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      articles = articles.filter(a => selectedCategories.includes(a.category));
    }

    // Jurisdiction filter
    if (selectedJurisdictions.length > 0) {
      articles = articles.filter(a =>
        a.jurisdiction.some(j => selectedJurisdictions.includes(j))
      );
    }

    // Practice area filter
    if (selectedPracticeAreas.length > 0) {
      articles = articles.filter(a =>
        a.practiceAreas.some(p => selectedPracticeAreas.includes(p))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      articles = articles.filter(a =>
        a.tags.some(t => selectedTags.includes(t))
      );
    }

    // Reading time filter
    if (readingTimeRange !== "all") {
      articles = articles.filter(a => {
        switch (readingTimeRange) {
          case "1-5": return a.readingTime >= 1 && a.readingTime <= 5;
          case "6-10": return a.readingTime >= 6 && a.readingTime <= 10;
          case "11-15": return a.readingTime >= 11 && a.readingTime <= 15;
          case "16+": return a.readingTime >= 16;
          default: return true;
        }
      });
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (dateRange) {
        case "last-month":
          cutoff = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "last-3-months":
          cutoff = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case "last-6-months":
          cutoff = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case "last-year":
          cutoff = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoff = new Date(0);
      }
      articles = articles.filter(a => new Date(a.publishDate) >= cutoff);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        break;
      case "oldest":
        articles.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
        break;
      case "title-asc":
        articles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        articles.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "reading-time-asc":
        articles.sort((a, b) => a.readingTime - b.readingTime);
        break;
      case "reading-time-desc":
        articles.sort((a, b) => b.readingTime - a.readingTime);
        break;
      case "popular":
        articles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      // relevance is default (already sorted by search)
    }

    return articles;
  }, [query, selectedCategories, selectedJurisdictions, selectedPracticeAreas, selectedTags, readingTimeRange, dateRange, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length) count += selectedCategories.length;
    if (selectedJurisdictions.length) count += selectedJurisdictions.length;
    if (selectedPracticeAreas.length) count += selectedPracticeAreas.length;
    if (selectedTags.length) count += selectedTags.length;
    if (readingTimeRange !== "all") count++;
    if (dateRange !== "all") count++;
    return count;
  }, [selectedCategories, selectedJurisdictions, selectedPracticeAreas, selectedTags, readingTimeRange, dateRange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedCategories([]);
    setSelectedJurisdictions([]);
    setSelectedPracticeAreas([]);
    setSelectedTags([]);
    setReadingTimeRange("all");
    setDateRange("all");
    setSortBy("relevance");
  }, []);

  // Toggle functions
  const toggleCategory = (cat: ArticleCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleJurisdiction = (jur: Jurisdiction) => {
    setSelectedJurisdictions(prev =>
      prev.includes(jur) ? prev.filter(j => j !== jur) : [...prev, jur]
    );
  };

  const togglePracticeArea = (pa: PracticeArea) => {
    setSelectedPracticeAreas(prev =>
      prev.includes(pa) ? prev.filter(p => p !== pa) : [...prev, pa]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Search Legal Resources
        </h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles, topics, or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tiffany-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-tiffany-100 dark:bg-tiffany-900/30 border-tiffany-300 dark:border-tiffany-600 text-tiffany-700 dark:text-tiffany-300"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-tiffany-600 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-tiffany-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-tiffany-600 hover:text-tiffany-700"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-tiffany-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Jurisdictions */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Jurisdictions
            </h4>
            <div className="flex flex-wrap gap-2">
              {jurisdictions.map((jur) => (
                <button
                  key={jur}
                  onClick={() => toggleJurisdiction(jur)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedJurisdictions.includes(jur)
                      ? "bg-tiffany-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {jur}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Practice Areas
            </h4>
            <div className="flex flex-wrap gap-2">
              {practiceAreas.map((pa) => (
                <button
                  key={pa}
                  onClick={() => togglePracticeArea(pa)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedPracticeAreas.includes(pa)
                      ? "bg-tiffany-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {pa}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Time & Date Range */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Reading Time
              </h4>
              <select
                value={readingTimeRange}
                onChange={(e) => setReadingTimeRange(e.target.value as ReadingTimeRange)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-tiffany-500"
              >
                {READING_TIME_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Date Published
              </h4>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-tiffany-500"
              >
                {DATE_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Popular Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1 ${
                    selectedTags.includes(tag)
                      ? "bg-tiffany-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""} found
        {query && ` for "${query}"`}
      </div>

      {/* Results Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <SearchResultCard key={article.id} article={article} query={query} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <Search className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No results found
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Try adjusting your search or filters
          </p>
          <button
            onClick={clearFilters}
            className="text-tiffany-600 hover:text-tiffany-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ article, query }: { article: LibraryArticle; query: string }) {
  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Link
      href={`/library/${article.slug}`}
      className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-lg hover:border-tiffany-400 dark:hover:border-tiffany-600 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="inline-block px-2 py-1 bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 rounded text-xs font-medium">
          {article.category}
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3 w-3" />
          {article.readingTime} min
        </div>
      </div>

      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors mb-2">
        {highlightText(article.title, query)}
      </h4>

      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
        {highlightText(article.description, query)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-tiffany-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-tiffany-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
