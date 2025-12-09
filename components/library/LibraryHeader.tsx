"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  Bookmark,
  TrendingUp,
  ExternalLink,
  Stethoscope,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useState } from "react";
import { useSubdomain } from "@/hooks/use-subdomain";

export function LibraryHeader() {
  const pathname = usePathname();
  const { isLibrary, getMainSiteUrl } = useSubdomain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // On subdomain, use root paths; on main domain, use /library prefix
  const getLibraryPath = (path: string) => {
    if (isLibrary) {
      return path.replace(/^\/library/, "") || "/";
    }
    return path;
  };

  const isActive = (path: string) => {
    const checkPath = isLibrary ? path.replace(/^\/library/, "") || "/" : path;
    const currentPath = isLibrary
      ? pathname?.replace(/^\/library/, "") || "/"
      : pathname;
    return currentPath === checkPath;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = getLibraryPath(`/library/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="site-header sticky top-0 z-50">
      {/* Enhanced header with gradient and glass morphism */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={getLibraryPath("/library")} className="flex items-center group">
                <div className="flex flex-col leading-tight">
                  <span className="text-lg sm:text-xl font-serif text-slate-900 dark:text-white group-hover:text-tiffany-600 dark:group-hover:text-tiffany-400 transition-colors">
                    Hamilton Bailey
                  </span>
                  <span className="text-xs sm:text-sm text-tiffany-600 dark:text-tiffany-400 font-medium whitespace-nowrap">
                    HBL Library • Knowledge Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                href={getLibraryPath("/library")}
                className="nav-link px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 hover:text-tiffany-700 dark:hover:text-tiffany-300 transition-all duration-200 text-sm font-medium"
              >
                Explore Articles
              </Link>
              <Link
                href={getLibraryPath("/library/practice-areas")}
                className="nav-link px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 hover:text-tiffany-700 dark:hover:text-tiffany-300 transition-all duration-200 text-sm font-medium"
              >
                Practice Areas
              </Link>
              <Link
                href={getLibraryPath("/library/categories")}
                className="nav-link px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20 hover:text-tiffany-700 dark:hover:text-tiffany-300 transition-all duration-200 text-sm font-medium"
              >
                Categories
              </Link>

              {/* Quick Search Bar */}
              <form onSubmit={handleSearch} className="relative ml-2">
                <input
                  type="text"
                  name="q"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-tiffany-500 focus:ring-0 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-tiffany-500 text-white rounded-r-lg hover:bg-tiffany-600 transition-colors focus:outline-none"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {isLibrary ? (
                <a
                  href={getMainSiteUrl()}
                  className="ml-2 bg-gradient-to-r from-tiffany-500 to-tiffany-600 hover:from-tiffany-600 hover:to-tiffany-700 text-white border border-tiffany-500 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 text-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  HBL Website
                </a>
              ) : (
                <Link
                  href="/"
                  className="ml-2 bg-gradient-to-r from-tiffany-500 to-tiffany-600 hover:from-tiffany-600 hover:to-tiffany-700 text-white border border-tiffany-500 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 text-sm flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Main Site
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 focus:outline-none p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-50 dark:bg-slate-800/50">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="flex">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-tiffany-500 focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-tiffany-500 text-white rounded-r-lg hover:bg-tiffany-600 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <Link
                href={getLibraryPath("/library")}
                className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-tiffany-600 dark:hover:text-tiffany-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Articles
              </Link>
              <Link
                href={getLibraryPath("/library/practice-areas")}
                className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-tiffany-600 dark:hover:text-tiffany-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Practice Areas
              </Link>
              <Link
                href={getLibraryPath("/library/categories")}
                className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-tiffany-600 dark:hover:text-tiffany-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href={getLibraryPath("/library/search")}
                className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-tiffany-600 dark:hover:text-tiffany-400 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Advanced Search
              </Link>
              {isLibrary ? (
                <a
                  href={getMainSiteUrl()}
                  className="block px-3 py-2 text-tiffany-600 dark:text-tiffany-400 font-medium"
                >
                  HBL Website
                </a>
              ) : (
                <Link
                  href="/"
                  className="block px-3 py-2 text-tiffany-600 dark:text-tiffany-400 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Main Site
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Secondary Navigation - Tab Bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-3 -mb-px scrollbar-hide">
            <NavLink
              href={getLibraryPath("/library")}
              icon={BookOpen}
              isActive={isActive("/library")}
            >
              All Articles
            </NavLink>
            <NavLink
              href={getLibraryPath("/library/featured")}
              icon={TrendingUp}
              isActive={isActive("/library/featured")}
            >
              Featured
            </NavLink>
            <NavLink
              href={getLibraryPath("/library/bookmarks")}
              icon={Bookmark}
              isActive={isActive("/library/bookmarks")}
            >
              Bookmarks
            </NavLink>
            <NavLink
              href={getLibraryPath("/library/categories")}
              icon={Filter}
              isActive={isActive("/library/categories")}
            >
              Categories
            </NavLink>
            <NavLink
              href={getLibraryPath("/library/practice-areas")}
              icon={Stethoscope}
              isActive={isActive("/library/practice-areas")}
            >
              Practice Areas
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
  isActive,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
        isActive
          ? "bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300 shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:text-tiffany-600 dark:hover:text-tiffany-400 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
