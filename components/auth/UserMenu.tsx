"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserMenuProps {
  variant?: "desktop" | "mobile";
  showDashboardLink?: boolean;
}

export function UserMenu({ variant = "desktop", showDashboardLink = true }: UserMenuProps) {
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-3 py-2"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="text-sm font-medium text-white bg-tiffany hover:bg-tiffany-dark px-4 py-2 rounded-lg transition-colors"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : user.email.split("@")[0];

  const initials = user.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ""}`
    : user.email.charAt(0).toUpperCase();

  const dashboardLink = user.role === "client" ? "/portal" : "/admin";
  const isAdmin = user.role === "admin" || user.role === "staff";

  if (variant === "mobile") {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-tiffany/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-tiffany">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        <div className="space-y-1">
          {showDashboardLink && (
            <Link
              href={dashboardLink}
              className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link
            href="/account/settings"
            className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Account Settings
          </Link>
          {isAdmin && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              User Management
            </Link>
          )}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-3 px-2 py-2 w-full text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-tiffany/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-tiffany">{initials}</span>
          </div>
        )}
        <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-tiffany/10 text-tiffany capitalize">
              {user.role}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {showDashboardLink && (
              <Link
                href={dashboardLink}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                User Management
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
