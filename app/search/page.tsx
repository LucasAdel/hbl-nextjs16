import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Search, FileText, BookOpen, Briefcase, ArrowLeft, Filter } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Search Results | Hamilton Bailey Law",
  description: "Search our legal documents, resources, and services for medical professionals in Australia.",
  robots: "noindex, follow", // Don't index search results pages
};

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "document" | "article" | "service" | "page";
  url: string;
  category?: string;
  price?: number;
}

async function searchContent(query: string): Promise<SearchResult[]> {
  // In production, this would call your search API
  // For now, simulate with static data
  if (!query || query.length < 2) return [];

  // Simulate search results
  const allContent: SearchResult[] = [
    {
      id: "1",
      title: "Medical Practice Setup Guide",
      description: "Comprehensive guide for setting up your medical practice in Australia, including AHPRA requirements and business structure options.",
      type: "document",
      url: "/documents/medical-practice-setup-guide",
      category: "Practice Setup",
      price: 299,
    },
    {
      id: "2",
      title: "AHPRA Compliance Checklist",
      description: "Essential compliance checklist for medical practitioners to meet AHPRA registration and regulatory requirements.",
      type: "document",
      url: "/documents/ahpra-compliance-checklist",
      category: "Compliance",
      price: 149,
    },
    {
      id: "3",
      title: "Employment Contract Template",
      description: "Professional employment contract template specifically designed for medical practice staff and healthcare workers.",
      type: "document",
      url: "/documents/employment-contract-template",
      category: "Employment",
      price: 199,
    },
    {
      id: "4",
      title: "Understanding Tenant Doctor Agreements",
      description: "Learn about the key considerations when entering into a tenant doctor agreement with a medical practice.",
      type: "article",
      url: "/resources/understanding-tenant-doctor-agreements",
      category: "Resources",
    },
    {
      id: "5",
      title: "Practice Setup Services",
      description: "Our comprehensive practice setup service helps medical professionals establish their practice efficiently.",
      type: "service",
      url: "/services/practice-setup",
      category: "Services",
    },
    {
      id: "6",
      title: "Regulatory Compliance Services",
      description: "Expert guidance on meeting AHPRA, Medicare, and other regulatory requirements for healthcare practices.",
      type: "service",
      url: "/services/regulatory-compliance",
      category: "Services",
    },
    {
      id: "7",
      title: "Privacy Policy Template",
      description: "GDPR and Australian Privacy Principles compliant privacy policy template for medical practices.",
      type: "document",
      url: "/documents/privacy-policy-template",
      category: "Compliance",
      price: 99,
    },
    {
      id: "8",
      title: "Service Agreement Template",
      description: "Professional service agreement template for contractor arrangements in medical practices.",
      type: "document",
      url: "/documents/service-agreement-template",
      category: "Employment",
      price: 179,
    },
  ];

  // Filter based on query
  const queryLower = query.toLowerCase();
  return allContent.filter(
    (item) =>
      item.title.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower) ||
      item.category?.toLowerCase().includes(queryLower)
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const typeIcons = {
    document: FileText,
    article: BookOpen,
    service: Briefcase,
    page: FileText,
  };

  const typeColors = {
    document: "text-tiffany bg-tiffany/10",
    article: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    service: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    page: "text-gray-600 bg-gray-100 dark:bg-gray-800",
  };

  const Icon = typeIcons[result.type];

  return (
    <Link
      href={result.url}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-tiffany dark:hover:border-tiffany transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${typeColors[result.type]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-tiffany transition-colors">
                {result.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {result.description}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {result.type}
                </span>
                {result.category && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {result.category}
                    </span>
                  </>
                )}
              </div>
            </div>
            {result.price && (
              <div className="text-lg font-bold text-tiffany-dark dark:text-tiffany whitespace-nowrap">
                ${result.price}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchContent(query);

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-16">
        <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Enter a search term
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Search for legal documents, articles, and services
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No results found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We couldn&apos;t find anything matching &quot;{query}&quot;
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>Try:</p>
          <ul className="list-disc list-inside">
            <li>Using different keywords</li>
            <li>Checking your spelling</li>
            <li>Using more general terms</li>
          </ul>
        </div>
      </div>
    );
  }

  // Group results by type
  const documents = results.filter((r) => r.type === "document");
  const articles = results.filter((r) => r.type === "article");
  const services = results.filter((r) => r.type === "service");
  const pages = results.filter((r) => r.type === "page");

  return (
    <div className="space-y-8">
      <p className="text-gray-600 dark:text-gray-400">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
      </p>

      {documents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-tiffany" />
            Legal Documents ({documents.length})
          </h2>
          <div className="space-y-4">
            {documents.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Services ({services.length})
          </h2>
          <div className="space-y-4">
            {services.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Articles & Resources ({articles.length})
          </h2>
          <div className="space-y-4">
            {articles.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}

      {pages.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pages ({pages.length})
          </h2>
          <div className="space-y-4">
            {pages.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const typeFilter = params.type || "all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs
            items={[{ label: "Search", href: "/search" }]}
            className="mb-4"
          />

          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Search Results
            </h1>
          </div>

          {/* Search Input */}
          <form action="/search" method="GET" className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search documents, articles, services..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tiffany text-gray-900 dark:text-white"
              autoFocus
            />
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=document`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === "document"
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Documents
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=article`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === "article"
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Articles
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=service`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === "service"
                  ? "bg-tiffany text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Services
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  );
}
