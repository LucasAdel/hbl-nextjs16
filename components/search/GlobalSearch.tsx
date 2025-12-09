"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, ArrowRight, Clock, Loader2 } from "lucide-react";
import { searchArticles, KnowledgeBaseArticle } from "@/lib/knowledge-base-data";

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  variant?: "hero" | "navbar" | "inline";
}

export function GlobalSearch({
  placeholder = "Search articles, guides, and resources...",
  className = "",
  variant = "inline",
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KnowledgeBaseArticle[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const searchResults = searchArticles(query);
      setResults(searchResults.slice(0, 5));
      setIsOpen(true);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            router.push(`/knowledge-base/article/${results[selectedIndex].slug}`);
            handleClose();
          }
          break;
        case "Escape":
          handleClose();
          break;
      }
    },
    [isOpen, results, selectedIndex, router]
  );

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const baseInputClasses = {
    hero: "w-full pl-12 pr-10 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white",
    navbar: "w-48 md:w-64 pl-9 pr-8 py-2 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-100",
    inline: "w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${
            variant === "navbar" ? "w-4 h-4 left-3" : "w-5 h-5"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={baseInputClasses[variant]}
          aria-label="Search"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <button
            onClick={handleClose}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${
              variant === "navbar" ? "right-2" : ""
            }`}
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          role="listbox"
        >
          {results.length > 0 ? (
            <>
              <ul className="py-2">
                {results.map((article, index) => (
                  <li key={article.id}>
                    <button
                      onClick={() => {
                        router.push(`/knowledge-base/article/${article.slug}`);
                        handleClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                        selectedIndex === index
                          ? "bg-teal-50"
                          : "hover:bg-gray-50"
                      }`}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <FileText className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {article.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime} min read</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 bg-gray-50 border-t">
                <button
                  onClick={() => {
                    router.push(`/knowledge-base?q=${encodeURIComponent(query)}`);
                    handleClose();
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different keywords or browse our categories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
