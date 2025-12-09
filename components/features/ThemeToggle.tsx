"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "switch";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ variant = "icon", className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  // Simple icon toggle
  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedTheme === "dark" ? (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-5 w-5 text-yellow-500" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  }

  // Dropdown with all options
  if (variant === "dropdown") {
    const CurrentIcon = themes.find((t) => t.value === theme)?.icon || Monitor;
    const currentLabel = themes.find((t) => t.value === theme)?.label || "System";

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <CurrentIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          {showLabel && <span className="text-sm text-gray-700 dark:text-gray-300">{currentLabel}</span>}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setTheme(value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    theme === value
                      ? "bg-tiffany/10 text-tiffany"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {theme === value && (
                    <motion.div
                      layoutId="theme-indicator"
                      className="ml-auto w-2 h-2 bg-tiffany rounded-full"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Switch style toggle
  if (variant === "switch") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Sun className={`h-4 w-4 ${resolvedTheme === "light" ? "text-yellow-500" : "text-gray-400"}`} />
        <button
          onClick={toggleTheme}
          className="relative w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
          role="switch"
          aria-checked={resolvedTheme === "dark"}
          aria-label="Toggle dark mode"
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
            animate={{ x: resolvedTheme === "dark" ? 28 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <Moon className={`h-4 w-4 ${resolvedTheme === "dark" ? "text-blue-400" : "text-gray-400"}`} />
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
            {resolvedTheme === "dark" ? "Dark" : "Light"} Mode
          </span>
        )}
      </div>
    );
  }

  return null;
}

// Floating toggle button for easy access
export function FloatingThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
      onClick={toggleTheme}
      className="fixed bottom-[140px] right-6 z-40 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
          >
            <Sun className="h-5 w-5 text-yellow-500" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -90 }}
          >
            <Moon className="h-5 w-5 text-gray-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
