/**
 * Bundle Optimisation Utilities
 *
 * Provides helpers for reducing bundle size and improving load times
 */

// Dynamic import wrapper with loading states
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    onLoad?: () => void;
    onError?: (error: Error) => void;
    timeout?: number;
  }
): Promise<T | null> {
  try {
    const timeoutMs = options?.timeout || 10000;

    const modulePromise = importFn();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Module load timeout")), timeoutMs)
    );

    const module = await Promise.race([modulePromise, timeoutPromise]);
    options?.onLoad?.();
    return module.default;
  } catch (error) {
    options?.onError?.(error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

// Prefetch module on user intent (hover, focus)
export function prefetchModule(
  importFn: () => Promise<unknown>
): void {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

  schedule(() => {
    importFn().catch(() => {
      // Silently fail prefetch
    });
  });
}

// Critical CSS inline helper
export function getCriticalCSS(componentName: string): string | null {
  // In production, this would be generated during build
  // Here we provide common critical styles
  const criticalStyles: Record<string, string> = {
    layout: `
      *, *::before, *::after { box-sizing: border-box; }
      html { -webkit-text-size-adjust: 100%; }
      body { margin: 0; font-family: system-ui, sans-serif; }
    `,
    hero: `
      .hero { min-height: 100vh; display: flex; align-items: center; }
    `,
  };

  return criticalStyles[componentName] || null;
}

// Font loading optimisation
export interface FontConfig {
  family: string;
  weights: number[];
  display: "auto" | "block" | "swap" | "fallback" | "optional";
  preload?: boolean;
}

export function generateFontPreloadLinks(fonts: FontConfig[]): string {
  return fonts
    .filter((f) => f.preload)
    .map(
      (font) =>
        `<link rel="preload" as="font" href="/fonts/${font.family.toLowerCase()}.woff2" type="font/woff2" crossorigin="anonymous">`
    )
    .join("\n");
}

// Script loading strategies
export type ScriptStrategy = "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker";

export interface ScriptConfig {
  src: string;
  strategy: ScriptStrategy;
  async?: boolean;
  defer?: boolean;
}

export function getScriptAttributes(config: ScriptConfig): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {
    src: config.src,
  };

  switch (config.strategy) {
    case "beforeInteractive":
      // Critical scripts, load synchronously
      break;
    case "afterInteractive":
      attrs.defer = true;
      break;
    case "lazyOnload":
      attrs.async = true;
      attrs["data-lazy"] = true;
      break;
    case "worker":
      attrs["data-worker"] = true;
      break;
  }

  return attrs;
}

// Code splitting recommendations
export const SPLIT_RECOMMENDATIONS = {
  // Components that should be dynamically imported
  heavyComponents: [
    "Recharts", // Charts library
    "ReactMarkdown", // Markdown rendering
    "DatePicker", // Date picker
    "RichTextEditor", // Text editors
    "PDFViewer", // PDF rendering
    "MapComponent", // Maps
    "VideoPlayer", // Video players
  ],

  // Routes that benefit from prefetching
  prefetchRoutes: [
    "/services",
    "/resources",
    "/contact",
    "/documents",
  ],

  // Vendor chunks to separate
  vendorChunks: {
    react: ["react", "react-dom"],
    ui: ["framer-motion", "lucide-react"],
    forms: ["react-hook-form", "zod"],
    data: ["@supabase/supabase-js", "@tanstack/react-query"],
  },
};

// Tree shaking helpers
export function createNamedExport<T>(value: T, name: string): { [key: string]: T } {
  return { [name]: value };
}

// Module resolution helpers
export const MODULE_ALIASES = {
  "@/components": "src/components",
  "@/lib": "src/lib",
  "@/hooks": "src/hooks",
  "@/utils": "src/utils",
};

// Bundle analysis helpers
export interface BundleStats {
  name: string;
  size: number;
  gzipSize: number;
  parseTime?: number;
}

export function formatBundleSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Performance budget thresholds
export const PERFORMANCE_BUDGET = {
  // JavaScript budget (gzipped)
  js: {
    initial: 100 * 1024, // 100KB initial bundle
    total: 300 * 1024, // 300KB total JS
    perRoute: 50 * 1024, // 50KB per route chunk
  },
  // CSS budget (gzipped)
  css: {
    initial: 30 * 1024, // 30KB initial CSS
    total: 100 * 1024, // 100KB total CSS
  },
  // Image budget (per image)
  images: {
    hero: 200 * 1024, // 200KB hero images
    thumbnail: 30 * 1024, // 30KB thumbnails
    avatar: 10 * 1024, // 10KB avatars
  },
  // Core Web Vitals targets
  webVitals: {
    lcp: 2500, // 2.5s Largest Contentful Paint
    fid: 100, // 100ms First Input Delay
    cls: 0.1, // 0.1 Cumulative Layout Shift
    inp: 200, // 200ms Interaction to Next Paint
    ttfb: 800, // 800ms Time to First Byte
  },
};

// Check if bundle is within budget
export function checkBudget(
  type: keyof typeof PERFORMANCE_BUDGET,
  key: string,
  size: number
): { pass: boolean; budget: number; actual: number; overBy?: number } {
  const budget = (PERFORMANCE_BUDGET[type] as Record<string, number>)[key];

  if (!budget) {
    return { pass: true, budget: 0, actual: size };
  }

  const pass = size <= budget;
  return {
    pass,
    budget,
    actual: size,
    ...(pass ? {} : { overBy: size - budget }),
  };
}

// Lazy hydration helper for below-fold content
export function shouldHydrateLazily(elementId: string): boolean {
  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) return true; // Default to lazy if element not found

  const rect = element.getBoundingClientRect();
  return rect.top > window.innerHeight; // Below the fold
}

// Resource hints generator
export function generateResourceHints(config: {
  preconnect?: string[];
  dnsPrefetch?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
}): string {
  const hints: string[] = [];

  config.preconnect?.forEach((url) => {
    hints.push(`<link rel="preconnect" href="${url}">`);
    hints.push(`<link rel="preconnect" href="${url}" crossorigin>`);
  });

  config.dnsPrefetch?.forEach((url) => {
    hints.push(`<link rel="dns-prefetch" href="${url}">`);
  });

  config.prefetch?.forEach((url) => {
    hints.push(`<link rel="prefetch" href="${url}">`);
  });

  config.preload?.forEach((resource) => {
    const typeAttr = resource.type ? ` type="${resource.type}"` : "";
    hints.push(
      `<link rel="preload" href="${resource.href}" as="${resource.as}"${typeAttr}>`
    );
  });

  return hints.join("\n");
}

// Common resource hints for this project
export const DEFAULT_RESOURCE_HINTS = generateResourceHints({
  preconnect: [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ],
  dnsPrefetch: [
    "https://api.stripe.com",
  ],
});
