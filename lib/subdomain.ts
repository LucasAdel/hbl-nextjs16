/**
 * Subdomain Detection and Routing Utilities
 * Handles library.hamiltonbailey.com subdomain routing
 */

// Domain configuration
export const MAIN_DOMAIN = "hamiltonbailey.com";
export const LIBRARY_SUBDOMAIN = "library";

// Full subdomain URLs
export const DOMAINS = {
  main: `https://${MAIN_DOMAIN}`,
  library: `https://${LIBRARY_SUBDOMAIN}.${MAIN_DOMAIN}`,
} as const;

// Development domains (for local testing)
export const DEV_DOMAINS = {
  main: "localhost:3000",
  library: "library.localhost:3000",
} as const;

/**
 * Extract subdomain from hostname
 */
export function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check for library.localhost:3000 pattern
    if (hostname.startsWith("library.")) {
      return "library";
    }
    return null;
  }

  // Handle production domains
  const parts = hostname.split(".");

  // For hamiltonbailey.com (2 parts), no subdomain
  if (parts.length <= 2) {
    return null;
  }

  // For library.hamiltonbailey.com (3 parts), subdomain is first part
  if (parts.length === 3) {
    const subdomain = parts[0];
    // Ignore www as a subdomain
    if (subdomain === "www") {
      return null;
    }
    return subdomain;
  }

  // For more complex cases like library.staging.hamiltonbailey.com
  return parts[0];
}

/**
 * Check if current request is for library subdomain
 */
export function isLibrarySubdomain(hostname: string): boolean {
  return getSubdomain(hostname) === LIBRARY_SUBDOMAIN;
}

/**
 * Get the appropriate URL for a path based on subdomain context
 */
export function getUrl(path: string, forSubdomain: "main" | "library" = "main"): string {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev
    ? forSubdomain === "library"
      ? `http://${DEV_DOMAINS.library}`
      : `http://${DEV_DOMAINS.main}`
    : DOMAINS[forSubdomain];

  return `${baseUrl}${path}`;
}

/**
 * Generate cross-subdomain link
 * Use this for links between main site and library subdomain
 */
export function getCrossSubdomainUrl(
  path: string,
  targetSubdomain: "main" | "library"
): string {
  return getUrl(path, targetSubdomain);
}

/**
 * Check if a path should be handled by library subdomain
 */
export function isLibraryPath(pathname: string): boolean {
  return pathname.startsWith("/library");
}

/**
 * Strip /library prefix from path (used when rewriting on subdomain)
 */
export function stripLibraryPrefix(pathname: string): string {
  if (pathname.startsWith("/library")) {
    const stripped = pathname.replace(/^\/library/, "");
    return stripped || "/";
  }
  return pathname;
}

/**
 * Add /library prefix to path (used when accessing from main domain)
 */
export function addLibraryPrefix(pathname: string): string {
  if (pathname.startsWith("/library")) {
    return pathname;
  }
  return `/library${pathname === "/" ? "" : pathname}`;
}
