"use client";

import { useEffect } from "react";

/**
 * CodexThemeForcer
 *
 * Forces light mode for all Codex pages regardless of user's global theme preference
 * or system color scheme setting.
 *
 * Tailwind CSS v4 uses prefers-color-scheme media query by default for dark: variants.
 * This component forces light mode by setting color-scheme: light and adding a
 * data attribute that can be used for CSS overrides.
 */
export function CodexThemeForcer() {
  useEffect(() => {
    const root = document.documentElement;

    // Store original values
    const originalColorScheme = root.style.colorScheme;
    const wasDark = root.classList.contains("dark");

    // Force light mode
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
    root.setAttribute("data-force-light", "true");

    // Cleanup: restore original state when navigating away from Codex
    return () => {
      root.classList.remove("light");
      root.removeAttribute("data-force-light");
      root.style.colorScheme = originalColorScheme;
      if (wasDark) {
        root.classList.add("dark");
      }
    };
  }, []);

  // This component renders nothing - it only manages theme
  return null;
}
