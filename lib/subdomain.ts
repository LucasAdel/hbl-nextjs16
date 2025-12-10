/**
 * Subdomain Detection and Routing Utilities
 * Handles codex.hamiltonbailey.com subdomain routing
 */

// Domain configuration
export const MAIN_DOMAIN = "hamiltonbailey.com";
export const CODEX_SUBDOMAIN = "codex";

// Full subdomain URLs
export const DOMAINS = {
  main: `https://${MAIN_DOMAIN}`,
  codex: `https://${CODEX_SUBDOMAIN}.${MAIN_DOMAIN}`,
} as const;

// Development domains (for local testing)
export const DEV_DOMAINS = {
  main: "localhost:3000",
  codex: "codex.localhost:3000",
} as const;

/**
 * Extract subdomain from hostname
 */
export function getSubdomain(hostname: string): string | null {
  // Handle localhost development
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check for codex.localhost:3000 pattern
    if (hostname.startsWith("codex.")) {
      return "codex";
    }
    return null;
  }

  // Handle production domains
  const parts = hostname.split(".");

  // For hamiltonbailey.com (2 parts), no subdomain
  if (parts.length <= 2) {
    return null;
  }

  // For codex.hamiltonbailey.com (3 parts), subdomain is first part
  if (parts.length === 3) {
    const subdomain = parts[0];
    // Ignore www as a subdomain
    if (subdomain === "www") {
      return null;
    }
    return subdomain;
  }

  // For more complex cases like codex.staging.hamiltonbailey.com
  return parts[0];
}

/**
 * Check if current request is for codex subdomain
 */
export function isCodexSubdomain(hostname: string): boolean {
  return getSubdomain(hostname) === CODEX_SUBDOMAIN;
}

/**
 * @deprecated Use isCodexSubdomain instead
 */
export const isLibrarySubdomain = isCodexSubdomain;

/**
 * Get the appropriate URL for a path based on subdomain context
 */
export function getUrl(path: string, forSubdomain: "main" | "codex" = "main"): string {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev
    ? forSubdomain === "codex"
      ? `http://${DEV_DOMAINS.codex}`
      : `http://${DEV_DOMAINS.main}`
    : DOMAINS[forSubdomain];

  return `${baseUrl}${path}`;
}

/**
 * Generate cross-subdomain link
 * Use this for links between main site and codex subdomain
 */
export function getCrossSubdomainUrl(
  path: string,
  targetSubdomain: "main" | "codex"
): string {
  return getUrl(path, targetSubdomain);
}

/**
 * Check if a path should be handled by codex subdomain
 */
export function isCodexPath(pathname: string): boolean {
  return pathname.startsWith("/codex");
}

/**
 * @deprecated Use isCodexPath instead
 */
export const isLibraryPath = isCodexPath;

/**
 * Strip /codex prefix from path (used when rewriting on subdomain)
 */
export function stripCodexPrefix(pathname: string): string {
  if (pathname.startsWith("/codex")) {
    const stripped = pathname.replace(/^\/codex/, "");
    return stripped || "/";
  }
  return pathname;
}

/**
 * @deprecated Use stripCodexPrefix instead
 */
export const stripLibraryPrefix = stripCodexPrefix;

/**
 * Add /codex prefix to path (used when accessing from main domain)
 */
export function addCodexPrefix(pathname: string): string {
  if (pathname.startsWith("/codex")) {
    return pathname;
  }
  return `/codex${pathname === "/" ? "" : pathname}`;
}

/**
 * @deprecated Use addCodexPrefix instead
 */
export const addLibraryPrefix = addCodexPrefix;
