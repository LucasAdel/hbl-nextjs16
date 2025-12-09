"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  Home,
  Bookmark,
  TrendingUp,
  ExternalLink,
  Stethoscope,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useSubdomain } from "@/hooks/use-subdomain";

export function LibraryHeader() {
  const pathname = usePathname();
  const { isLibrary, getMainSiteUrl } = useSubdomain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // On subdomain, use root paths; on main domain, use /library prefix
  const getLibraryPath = (path: string) => {
    if (isLibrary) {
      // On subdomain, strip /library prefix
      return path.replace(/^\/library/, "") || "/";
    }
    return path;
  };

  const isActive = (path: string) => {
    const checkPath = isLibrary ? path.replace(/^\/library/, "") || "/" : path;
    const currentPath = isLibrary ? pathname?.replace(/^\/library/, "") || "/" : pathname;
    return currentPath === checkPath;
  };

  return (
    <>
      {/* Library Header */}
      <div className="bg-gradient-to-r from-tiffany-600 to-teal-700 dark:from-tiffany-700 dark:to-teal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 bg-white/10 rounded-xl">
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <Link
                    href={getLibraryPath("/library")}
                    className="hover:opacity-90 transition-opacity"
                  >
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      Legal Resource Library
                    </h1>
                  </Link>
                  <p className="text-tiffany-100 text-xs md:text-sm lg:text-base">
                    Expert legal guides for healthcare professionals
                  </p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={getLibraryPath("/library/search")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Link>
              <Link
                href={getLibraryPath("/library/practice-areas")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Stethoscope className="h-4 w-4" />
                <span>Practice Areas</span>
              </Link>
              {isLibrary && (
                <a
                  href={getMainSiteUrl()}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Main Site</span>
                </a>
              )}
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <nav className="mt-4 md:mt-6 flex items-center gap-2 text-sm text-tiffany-100">
            {isLibrary ? (
              <>
                <a
                  href={getMainSiteUrl()}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Hamilton Bailey
                </a>
                <span>/</span>
                <span className="text-white">Library</span>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <span>/</span>
                <span className="text-white">Library</span>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-2">
            <Link
              href={getLibraryPath("/library/search")}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link
              href={getLibraryPath("/library/practice-areas")}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Stethoscope className="h-4 w-4" />
              <span>Practice Areas</span>
            </Link>
            {isLibrary && (
              <a
                href={getMainSiteUrl()}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Main Site</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Secondary Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 shadow-sm sticky top-0 z-40">
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
    </>
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
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
        isActive
          ? "bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300"
          : "text-slate-600 dark:text-slate-400 hover:text-tiffany-600 dark:hover:text-tiffany-400 hover:bg-tiffany-50 dark:hover:bg-tiffany-900/20"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
