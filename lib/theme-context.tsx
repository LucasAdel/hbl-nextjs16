"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "hbl-theme";
const ADMIN_DEFAULT_THEME_KEY = "hbl-admin-default-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference (only used if admin enables system preference)
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Get admin-configured default theme (defaults to light if not set)
  const getAdminDefaultTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    const adminDefault = localStorage.getItem(ADMIN_DEFAULT_THEME_KEY);
    // If admin has set a default, use it; otherwise always default to light
    if (adminDefault === "dark") return "dark";
    return "light";
  };

  // Resolve the actual theme to apply
  const resolveTheme = (theme: Theme): "light" | "dark" => {
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  };

  // Apply theme to document
  const applyTheme = (resolved: "light" | "dark") => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setResolvedTheme(resolved);
  };

  // Set theme and persist
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    const resolved = resolveTheme(newTheme);
    applyTheme(resolved);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // Initialize theme on mount - ALWAYS defaults to light unless user has explicitly chosen
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const adminDefault = getAdminDefaultTheme();

    let initialTheme: Theme;

    if (savedTheme) {
      // User has explicitly chosen a theme - respect their choice
      initialTheme = savedTheme;
    } else {
      // No user preference - use admin default (which defaults to light)
      initialTheme = adminDefault;
    }

    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for system theme changes (only matters if theme is set to "system")
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{ theme: "light", resolvedTheme: "light", setTheme: () => {}, toggleTheme: () => {} }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Admin function to set the default theme for all users
export function setAdminDefaultTheme(theme: "light" | "dark") {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_DEFAULT_THEME_KEY, theme);
  }
}

// Admin function to get the current default theme setting
export function getAdminDefaultThemeSetting(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const adminDefault = localStorage.getItem(ADMIN_DEFAULT_THEME_KEY);
  if (adminDefault === "dark") return "dark";
  return "light";
}
