"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  FileText,
  Briefcase,
  BookOpen,
  Home,
  Phone,
  Calendar,
  User,
  ArrowRight,
  Clock,
  Command,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
  Loader2,
  Trash2,
  History,
} from "lucide-react";
import { services } from "@/lib/services-data";
import { allDocuments } from "@/lib/documents-data";
import { searchArticles } from "@/lib/knowledge-base-data";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "page" | "service" | "document" | "article" | "recent";
  url: string;
  icon: React.ReactNode;
}

// Static pages for search
const staticPages: SearchResult[] = [
  { id: "home", title: "Home", description: "Return to homepage", type: "page", url: "/", icon: <Home className="w-5 h-5" /> },
  { id: "about", title: "About Us", description: "Learn about Hamilton Bailey Law Firm", type: "page", url: "/about", icon: <User className="w-5 h-5" /> },
  { id: "services", title: "Services", description: "View all legal services", type: "page", url: "/services", icon: <Briefcase className="w-5 h-5" /> },
  { id: "contact", title: "Contact", description: "Get in touch with us", type: "page", url: "/contact", icon: <Phone className="w-5 h-5" /> },
  { id: "book", title: "Book Appointment", description: "Schedule a consultation", type: "page", url: "/book-appointment", icon: <Calendar className="w-5 h-5" /> },
  { id: "documents", title: "Document Store", description: "Browse legal documents", type: "page", url: "/documents", icon: <FileText className="w-5 h-5" /> },
  { id: "knowledge-base", title: "Knowledge Base", description: "Legal guides and resources", type: "page", url: "/knowledge-base", icon: <BookOpen className="w-5 h-5" /> },
  { id: "client-intake", title: "Client Intake", description: "New client registration", type: "page", url: "/client-intake", icon: <User className="w-5 h-5" /> },
  { id: "cart", title: "Shopping Cart", description: "View your cart", type: "page", url: "/cart", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "portal", title: "Client Portal", description: "Access your client portal", type: "page", url: "/portal", icon: <User className="w-5 h-5" /> },
  { id: "login", title: "Sign In", description: "Log in to your account", type: "page", url: "/login", icon: <User className="w-5 h-5" /> },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("hbl-recent-searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem("hbl-recent-searches");
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("hbl-recent-searches", JSON.stringify(updated));
  }, [recentSearches]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("hbl-recent-searches");
  }, []);

  // Debounced search with loading state
  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(false);
      }, 150); // Short delay for perceived performance
    } else {
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Search results computation
  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      // Show recent searches if available, otherwise popular pages
      if (recentSearches.length > 0) {
        const recentResults: SearchResult[] = recentSearches.map((search, idx) => ({
          id: `recent-${idx}`,
          title: search,
          description: "Recent search",
          type: "recent" as const,
          url: "#",
          icon: <History className="w-5 h-5 text-gray-400" />,
        }));
        return [...recentResults, ...staticPages.slice(0, 4)];
      }
      return staticPages.slice(0, 6);
    }

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search static pages
    staticPages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(lowerQuery) ||
        page.description.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push(page);
      }
    });

    // Search services
    services.forEach((service) => {
      if (
        service.title.toLowerCase().includes(lowerQuery) ||
        service.shortDescription.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `service-${service.id}`,
          title: service.title,
          description: service.shortDescription,
          type: "service",
          url: `/services/${service.id}`,
          icon: <Briefcase className="w-5 h-5 text-tiffany" />,
        });
      }
    });

    // Search documents
    allDocuments.forEach((doc) => {
      if (
        doc.name.toLowerCase().includes(lowerQuery) ||
        doc.description.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `doc-${doc.id}`,
          title: doc.name,
          description: doc.description,
          type: "document",
          url: `/documents/${doc.id}`,
          icon: <FileText className="w-5 h-5 text-amber-500" />,
        });
      }
    });

    // Search knowledge base articles
    const articles = searchArticles(query);
    articles.slice(0, 5).forEach((article) => {
      searchResults.push({
        id: `article-${article.id}`,
        title: article.title,
        description: article.excerpt,
        type: "article",
        url: `/knowledge-base/article/${article.slug}`,
        icon: <BookOpen className="w-5 h-5 text-purple-500" />,
      });
    });

    return searchResults.slice(0, 10);
  }, [query, recentSearches]);

  // Handle keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle recent search selection
  const handleRecentSearchClick = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    setSelectedIndex(0);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            const result = results[selectedIndex];
            if (result.type === "recent") {
              // If selecting a recent search, populate the query
              handleRecentSearchClick(result.title);
            } else {
              saveRecentSearch(query);
              router.push(result.url);
              setIsOpen(false);
            }
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [results, selectedIndex, query, router, saveRecentSearch, handleRecentSearchClick]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (result.type === "recent") {
      handleRecentSearchClick(result.title);
    } else {
      saveRecentSearch(query);
      router.push(result.url);
      setIsOpen(false);
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const typeLabels: Record<string, string> = {
    page: "Page",
    service: "Service",
    document: "Document",
    article: "Article",
    recent: "Recent",
  };

  const typeColors: Record<string, string> = {
    page: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    service: "bg-tiffany-lighter text-tiffany-dark",
    document: "bg-amber-100 text-amber-700",
    article: "bg-purple-100 text-purple-700",
    recent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const hasRecentSearches = recentSearches.length > 0 && !query.trim();

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, services, documents..."
            className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {results.length > 0 ? (
            <>
              {/* Recent Searches Header with Clear Button */}
              {hasRecentSearches && (
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSearchHistory();
                    }}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear History
                  </button>
                </div>
              )}

              {!hasRecentSearches && !query && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Links
                </div>
              )}

              {query && !isSearching && (
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Results for &ldquo;{query}&rdquo;
                </div>
              )}

              {query && isSearching && (
                <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Searching...
                </div>
              )}

              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    selectedIndex === index
                      ? "bg-tiffany-lighter/50 dark:bg-tiffany-dark/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeColors[result.type]}`}>
                        {typeLabels[result.type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {result.description}
                    </p>
                  </div>
                  {result.type === "recent" ? (
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords or browse our services
              </p>
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ChevronUp className="w-3 h-3" />
              <ChevronDown className="w-3 h-3" />
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              to select
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">ESC</span>
              to close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document root
  if (typeof window !== "undefined") {
    return createPortal(content, document.body);
  }

  return null;
}

export default CommandPalette;
