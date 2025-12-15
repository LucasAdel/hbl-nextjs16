/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * Optimised for:
 * - Upstash Redis free tier (10,000 commands/day limit)
 * - Supabase free tier (connection limits)
 * - Minimal processing for static/prefetch requests
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { NextFetchEvent } from "next/server";
import {
    isCodexSubdomain,
    stripCodexPrefix,
    addCodexPrefix,
    isCodexPath,
} from "@/lib/subdomain";
import {
    checkRateLimitAsync,
    getClientIdentifier,
    RATE_LIMITS,
} from "@/lib/rate-limiter";
import {
    validateCSRFToken,
    isCSRFExempt,
} from "@/lib/csrf/csrf-protection";

// ============================================
// Configuration
// ============================================

// Routes that require authentication
const protectedRoutes = ["/admin", "/portal"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup", "/forgot-password"];

// Public routes that start with protected prefixes but should remain accessible
const publicExceptions = ["/admin-reset"];

// Public routes - skip expensive auth checks for unauthenticated users
const publicRoutes = [
    "/",
    "/about",
    "/contact",
    "/services",
    "/team",
    "/blog",
    "/codex",
    "/knowledge-base",
    "/resources",
    "/tools",
    "/pricing",
    "/book-appointment",
    "/tenant-doctor",
    "/privacy",
    "/terms",
    "/faq",
];

// API routes that need rate limiting (to conserve Upstash commands)
const rateLimitedApiRoutes = [
    "/api/contact",
    "/api/booking",
    "/api/newsletter",
    "/api/chat",
    "/api/client-portal",
    "/api/stripe",
    "/api/upload-documents",
];

// Paths to completely skip processing
const SKIP_PATHS = [
    "/_next",
    "/favicon",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest",
    "/images",
    "/fonts",
    "/icons",
    "/static",
    "/sw.js",
    "/workbox",
    "/.well-known",
    "/api/health", // Health checks should not be rate limited
];

// ============================================
// Helper Functions
// ============================================

/**
 * Check if request should skip all processing
 */
function shouldSkipProcessing(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;

    // Skip static assets and known paths
    if (SKIP_PATHS.some((path) => pathname.startsWith(path))) {
        return true;
    }

    // Skip RSC prefetch requests - they don't need auth or rate limiting
    const isRscPrefetch = request.nextUrl.searchParams.has("_rsc");
    if (isRscPrefetch) {
        return true;
    }

    // Skip Next.js router prefetch requests
    const isPrefetch =
        request.headers.get("next-router-prefetch") === "1" ||
        request.headers.get("purpose") === "prefetch";
    if (isPrefetch) {
        return true;
    }

    return false;
}

/**
 * Check if user has any Supabase auth cookies
 */
function hasAuthCookies(request: NextRequest): boolean {
    const cookies = request.cookies.getAll();
    return cookies.some(
        (cookie) =>
            cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );
}

/**
 * Check if route is public (doesn't require auth check for anonymous users)
 */
function isPublicRoute(pathname: string): boolean {
    return publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

/**
 * Check if API route needs rate limiting
 */
function needsRateLimiting(pathname: string): boolean {
    return rateLimitedApiRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get rate limit config for route
 */
function getRateLimitConfig(pathname: string) {
    if (pathname.startsWith("/api/contact")) return RATE_LIMITS.contact;
    if (pathname.startsWith("/api/booking")) return RATE_LIMITS.booking;
    if (pathname.startsWith("/api/newsletter")) return RATE_LIMITS.newsletter;
    if (pathname.startsWith("/api/chat")) return RATE_LIMITS.chat;
    if (pathname.startsWith("/api/client-portal")) return RATE_LIMITS.clientPortal;
    if (pathname.startsWith("/api/stripe")) return RATE_LIMITS.payment;
    if (pathname.startsWith("/api/upload-documents")) return RATE_LIMITS.upload;
    return RATE_LIMITS.general;
}

// ============================================
// Main Proxy Function
// ============================================

export async function proxy(request: NextRequest, event: NextFetchEvent) {
    const hostname = request.headers.get("host") || "";
    const pathname = request.nextUrl.pathname;

    // ============================================
    // Early Exit: Skip processing for static/prefetch
    // ============================================

    if (shouldSkipProcessing(request)) {
        return NextResponse.next();
    }

    // ============================================
    // Rate Limiting (only for specific API routes)
    // ============================================

    if (needsRateLimiting(pathname)) {
        const identifier = `${pathname.split("/")[2]}-${getClientIdentifier(request)}`;
        const config = getRateLimitConfig(pathname);

        const { allowed, remaining, resetIn } = await checkRateLimitAsync(
            identifier,
            config
        );

        if (!allowed) {
            return new NextResponse(
                JSON.stringify({
                    error: "Too many requests",
                    message: "Please wait before making another request",
                    retryAfter: Math.ceil(resetIn / 1000),
                }),
                {
                    status: 429,
                    headers: {
                        "Content-Type": "application/json",
                        "Retry-After": String(Math.ceil(resetIn / 1000)),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
                    },
                }
            );
        }
    }

    // ============================================
    // CSRF Protection (for API mutations)
    // ============================================

    const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
    const isApiRoute = pathname.startsWith("/api/");

    if (isMutation && isApiRoute && !isCSRFExempt(pathname)) {
        const isValid = await validateCSRFToken(request);
        if (!isValid) {
            return new NextResponse(
                JSON.stringify({
                    error: "Invalid or missing CSRF token",
                    message: "Please refresh the page and try again",
                }),
                {
                    status: 403,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }

    // ============================================
    // Subdomain Routing: codex.hamiltonbailey.com
    // ============================================

    if (isCodexSubdomain(hostname)) {
        if (!isCodexPath(pathname)) {
            const newPath = addCodexPrefix(pathname);
            const url = request.nextUrl.clone();
            url.pathname = newPath;
            return NextResponse.rewrite(url);
        }
    } else {
        if (
            isCodexPath(pathname) &&
            process.env.ENABLE_CODEX_SUBDOMAIN_REDIRECT === "true"
        ) {
            const codexPath = stripCodexPrefix(pathname);
            const codexUrl = new URL(
                codexPath,
                process.env.NODE_ENV === "development"
                    ? "http://codex.localhost:3000"
                    : "https://codex.hamiltonbailey.com"
            );
            codexUrl.search = request.nextUrl.search;
            return NextResponse.redirect(codexUrl, { status: 301 });
        }
    }

    // ============================================
    // Auth Optimization: Skip for public routes without cookies
    // ============================================

    const hasAuth = hasAuthCookies(request);
    const isPublic = isPublicRoute(pathname);
    const isProtectedRoute =
        !publicExceptions.some((route) => pathname.startsWith(route)) &&
        protectedRoutes.some((route) => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If public route and no auth cookies, skip expensive Supabase check
    if (isPublic && !hasAuth && !isProtectedRoute) {
        return NextResponse.next();
    }

    // If protected route and no auth cookies, redirect immediately (no Supabase call)
    if (isProtectedRoute && !hasAuth) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ============================================
    // Supabase Auth (only when necessary)
    // ============================================

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // If protected route and no user (cookie invalid/expired), redirect
    if (isProtectedRoute && !user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If auth route and logged in, redirect to dashboard
    if (isAuthRoute && user) {
        const userRole = user.user_metadata?.role || "client";
        const redirectTo =
            userRole === "admin" || userRole === "staff" ? "/admin" : "/portal";
        return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // For admin routes, check role
    if (
        pathname.startsWith("/admin") &&
        !publicExceptions.some((route) => pathname.startsWith(route)) &&
        user
    ) {
        const userRole = user.user_metadata?.role || "client";
        if (
            userRole !== "admin" &&
            userRole !== "staff" &&
            userRole !== "super_admin"
        ) {
            return NextResponse.redirect(new URL("/portal", request.url));
        }
    }

    return supabaseResponse;
}

// ============================================
// Matcher Configuration
// ============================================

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Static assets (images, fonts, etc.)
         *
         * Note: Additional filtering happens in shouldSkipProcessing()
         * for RSC prefetch and other dynamic checks
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
    ],
};
