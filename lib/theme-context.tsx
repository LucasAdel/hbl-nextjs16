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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const initialTheme = savedTheme || "system";
    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for system theme changes
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
        value={{ theme: "system", resolvedTheme: "light", setTheme: () => {}, toggleTheme: () => {} }}
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
