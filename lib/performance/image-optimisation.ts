/**
 * Image Optimisation Utilities
 *
 * Provides helpers for optimising images across the application
 * using Next.js Image component best practices
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

// Common image dimensions for different contexts
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  card: { width: 400, height: 300 },
  hero: { width: 1920, height: 1080 },
  avatar: { width: 80, height: 80 },
  logo: { width: 200, height: 60 },
  article: { width: 800, height: 450 },
  fullWidth: { width: 1200, height: 630 },
} as const;

// Responsive breakpoints for srcSet generation
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

// Generate responsive sizes attribute
export function generateSizes(config: {
  mobile?: string;
  tablet?: string;
  laptop?: string;
  desktop?: string;
  default?: string;
}): string {
  const parts: string[] = [];

  if (config.mobile) {
    parts.push(`(max-width: ${BREAKPOINTS.mobile}px) ${config.mobile}`);
  }
  if (config.tablet) {
    parts.push(`(max-width: ${BREAKPOINTS.tablet}px) ${config.tablet}`);
  }
  if (config.laptop) {
    parts.push(`(max-width: ${BREAKPOINTS.laptop}px) ${config.laptop}`);
  }
  if (config.desktop) {
    parts.push(`(max-width: ${BREAKPOINTS.desktop}px) ${config.desktop}`);
  }
  if (config.default) {
    parts.push(config.default);
  }

  return parts.join(", ");
}

// Generate blur placeholder data URL (1x1 pixel)
export function generateBlurPlaceholder(
  color: string = "#f3f4f6"
): string {
  // Simple base64 encoded 1x1 pixel image
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Common sizes configurations
export const SIZES_CONFIGS = {
  fullWidth: generateSizes({
    mobile: "100vw",
    tablet: "100vw",
    default: "100vw",
  }),
  halfWidth: generateSizes({
    mobile: "100vw",
    tablet: "50vw",
    default: "50vw",
  }),
  thirdWidth: generateSizes({
    mobile: "100vw",
    tablet: "50vw",
    laptop: "33vw",
    default: "33vw",
  }),
  card: generateSizes({
    mobile: "100vw",
    tablet: "50vw",
    laptop: "33vw",
    desktop: "25vw",
    default: "25vw",
  }),
  thumbnail: "150px",
  avatar: "80px",
};

// Quality settings for different image types
export const QUALITY_SETTINGS = {
  hero: 90, // High quality for hero images
  product: 85, // Good quality for product images
  thumbnail: 75, // Lower quality for thumbnails
  avatar: 80, // Medium quality for avatars
  background: 70, // Lower quality for background images
  default: 80,
} as const;

// Determine if image should be prioritised (above the fold)
export function shouldPrioritise(context: string): boolean {
  const priorityContexts = ["hero", "logo", "above-fold", "lcp"];
  return priorityContexts.includes(context.toLowerCase());
}

// Get optimal format hint for image loader
export function getOptimalFormat(): "webp" | "avif" {
  // Prefer AVIF for better compression, but WebP has wider support
  // Next.js Image component handles this automatically based on browser support
  return "webp";
}

// Calculate aspect ratio for responsive containers
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

// Lazy loading configuration
export interface LazyLoadConfig {
  rootMargin?: string;
  threshold?: number | number[];
}

export const DEFAULT_LAZY_CONFIG: LazyLoadConfig = {
  rootMargin: "200px 0px",
  threshold: 0.01,
};

// Image loading strategies
export type LoadingStrategy = "eager" | "lazy" | "progressive";

export function getLoadingStrategy(
  priority: boolean,
  isAboveFold: boolean
): LoadingStrategy {
  if (priority) return "eager";
  if (isAboveFold) return "eager";
  return "lazy";
}

// Preload hints for critical images
export function generatePreloadHint(src: string, type: string = "image/webp"): string {
  return `<link rel="preload" as="image" href="${src}" type="${type}" fetchpriority="high">`;
}

// CSS for image containers with aspect ratio
export function getAspectRatioStyles(
  width: number,
  height: number
): React.CSSProperties {
  return {
    position: "relative",
    aspectRatio: `${width} / ${height}`,
    width: "100%",
  };
}

// Image error fallback
export const FALLBACK_IMAGES = {
  avatar: "/images/default-avatar.svg",
  product: "/images/default-product.svg",
  article: "/images/default-article.svg",
  placeholder: "/images/placeholder.svg",
} as const;

// Performance monitoring helpers
export function measureImageLoadTime(
  imageSrc: string,
  callback: (duration: number) => void
): void {
  if (typeof window === "undefined") return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes(imageSrc)) {
        callback(entry.duration);
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });
}

// Check if native lazy loading is supported
export function supportsNativeLazyLoading(): boolean {
  if (typeof window === "undefined") return false;
  return "loading" in HTMLImageElement.prototype;
}

// Generate srcSet for responsive images
export function generateSrcSet(
  baseSrc: string,
  widths: number[]
): string {
  // This is a helper for custom image loaders
  // Next.js Image component generates srcSet automatically
  return widths
    .map((w) => {
      const url = new URL(baseSrc, "http://localhost");
      url.searchParams.set("w", w.toString());
      return `${url.pathname}${url.search} ${w}w`;
    })
    .join(", ");
}
