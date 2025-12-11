"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Command, ShoppingCart } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCartStore } from "@/lib/stores/cart-store";

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [cartMounted, setCartMounted] = useState(false);
  const pathname = usePathname();
  const { openCart, getTotalItems } = useCartStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Navigation items
  const navItems = [
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Documents", path: "/documents" },
    { name: "Codex", path: "/codex" },
    { name: "Immigration", path: "/healthcare-visa-guide" },
    { name: "Client Intake", path: "/client-intake" },
    { name: "Contact", path: "/contact" },
  ];

  // Check if we should hide navigation (portal and codex have their own navigation)
  const shouldHideNav = pathname?.startsWith("/portal") || pathname?.startsWith("/codex");

  useEffect(() => {
    // Check scroll position on mount and add scroll listener
    const checkScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll);

    // Handle escape key to close mobile menu
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        mobileButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    // Cleanup listeners
    return () => {
      window.removeEventListener("scroll", checkScroll);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setFocusIndex(-1);
  }, [pathname]);

  // Hydration check for cart (prevents SSR mismatch)
  useEffect(() => {
    setCartMounted(true);
  }, []);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (!mobileMenuRef.current) return;

      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleTabKey);

    // Focus first item when menu opens
    if (mobileMenuRef.current) {
      const firstFocusable = mobileMenuRef.current.querySelector("a, button") as HTMLElement;
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 100);
      }
    }

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = (index + 1) % navItems.length;
      setFocusIndex(newIndex);
      navItemRefs.current[newIndex]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = (index - 1 + navItems.length) % navItems.length;
      setFocusIndex(newIndex);
      navItemRefs.current[newIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusIndex(0);
      navItemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIndex = navItems.length - 1;
      setFocusIndex(lastIndex);
      navItemRefs.current[lastIndex]?.focus();
    }
  };

  // Hide navigation on portal and codex routes (they have their own navigation)
  // This check is placed after all hooks to comply with React's rules of hooks
  if (shouldHideNav) {
    return null;
  }

  const navigationClasses = `
    fixed top-0 left-0 right-0 z-[200] transition-all duration-300
    ${isScrolled || isOpen ? "bg-white/95 backdrop-blur-lg shadow-xl py-3 border-b border-white/20" : "bg-transparent py-5"}
  `;

  return (
    <nav className={navigationClasses} role="navigation" aria-label="Main navigation">
      <div className="container-custom flex items-center justify-between">
        <Link
          href="/"
          className="text-xl md:text-2xl logo-metallic font-bold whitespace-nowrap mr-6 md:mr-8 lg:mr-12"
          onClick={() => {
            if (pathname === "/") {
              setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
            }
          }}
          aria-label="Hamilton Bailey Law Firm - Home"
        >
          Hamilton Bailey
        </Link>

        <div
          ref={menuRef}
          className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-8 flex-1 justify-end"
          aria-label="Navigation menu"
        >
          {navItems.map((item, index) => (
            <Link
              ref={(el) => { navItemRefs.current[index] = el; }}
              key={item.name}
              href={item.path}
              className={`font-medium transition-all duration-300 hover:text-tiffany hover:transform hover:scale-105 flex items-center ${
                item.name === "Client Intake" ? "text-sm" : ""
              } ${
                pathname === item.path
                  ? "text-tiffany-dark border-b-2 border-tiffany-dark pb-1"
                  : "text-foreground"
              }`}
              tabIndex={0}
              aria-current={pathname === item.path ? "page" : undefined}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          ))}

          {/* Search Button */}
          <button
            onClick={() => {
              // Trigger Cmd+K event
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium bg-white rounded border border-gray-300">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>

          {/* Cart Button */}
          {cartMounted && getTotalItems() > 0 && (
            <button
              onClick={openCart}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Open cart with ${getTotalItems()} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {getTotalItems() > 99 ? "99+" : getTotalItems()}
              </span>
            </button>
          )}

          {/* User Menu / Auth Buttons */}
          <UserMenu />

          <Link
            href="/book-appointment"
            className="bg-gradient-to-r from-tiffany to-tiffany-dark hover:from-tiffany-dark hover:to-tiffany
                     text-white font-semibold px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-xl text-xs md:text-sm transition-all duration-300
                     transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-tiffany-lighter whitespace-nowrap"
          >
            Book Appointment
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile Search Button */}
          <button
            onClick={() => {
              const event = new KeyboardEvent("keydown", {
                key: "k",
                metaKey: true,
                bubbles: true,
              });
              document.dispatchEvent(event);
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Mobile Cart Button */}
          {cartMounted && getTotalItems() > 0 && (
            <button
              onClick={openCart}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={`Open cart with ${getTotalItems()} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {getTotalItems() > 9 ? "9+" : getTotalItems()}
              </span>
            </button>
          )}

          <button
            ref={mobileButtonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none focus:ring-2 focus:ring-tiffany p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            data-testid="mobile-menu-button"
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="absolute top-full left-0 right-0 bg-white border-t shadow-lg py-4 px-6 flex flex-col space-y-4 md:hidden z-[190]"
            aria-label="Mobile navigation menu"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`transition-colors hover:text-tiffany flex items-center ${
                  pathname === item.path ? "text-tiffany-dark" : "text-foreground"
                }`}
                onClick={() => setIsOpen(false)}
                aria-current={pathname === item.path ? "page" : undefined}
              >
                <span>{item.name}</span>
              </Link>
            ))}
            <Link
              href="/book-appointment"
              className="bg-tiffany hover:bg-tiffany-dark text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors self-start mt-2 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              Book Appointment
            </Link>

            {/* Mobile User Menu */}
            <UserMenu variant="mobile" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
