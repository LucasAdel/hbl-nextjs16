import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isCodexSubdomain,
  stripCodexPrefix,
  addCodexPrefix,
  isCodexPath,
} from "@/lib/subdomain";

// Routes that require authentication
const protectedRoutes = ["/admin", "/portal"];
// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup", "/forgot-password"];
// Public routes that start with protected prefixes but should remain accessible
const publicExceptions = ["/admin-reset"];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // ============================================
  // Subdomain Routing: codex.hamiltonbailey.com
  // ============================================

  // Check if this is a codex subdomain request
  if (isCodexSubdomain(hostname)) {
    // On codex subdomain, rewrite paths to /codex/*
    // e.g., codex.hamiltonbailey.com/ -> /codex
    // e.g., codex.hamiltonbailey.com/search -> /codex/search
    // e.g., codex.hamiltonbailey.com/article-slug -> /codex/article-slug

    // Don't rewrite if already targeting codex path (shouldn't happen on subdomain)
    if (!isCodexPath(pathname)) {
      const newPath = addCodexPrefix(pathname);
      const url = request.nextUrl.clone();
      url.pathname = newPath;

      // Use rewrite to serve library content without changing URL
      return NextResponse.rewrite(url);
    }
  } else {
    // On main domain, redirect /codex/* requests to codex subdomain
    // This ensures codex.hamiltonbailey.com is the canonical URL
    if (isCodexPath(pathname) && process.env.ENABLE_CODEX_SUBDOMAIN_REDIRECT === "true") {
      const codexPath = stripCodexPrefix(pathname);
      const codexUrl = new URL(
        codexPath,
        process.env.NODE_ENV === "development"
          ? "http://codex.localhost:3000"
          : "https://codex.hamiltonbailey.com"
      );
      // Preserve query params
      codexUrl.search = request.nextUrl.search;

      return NextResponse.redirect(codexUrl, { status: 301 });
    }
  }

  // ============================================
  // Authentication Middleware
  // ============================================

  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if route is a public exception (accessible without auth even if it matches protected prefix)
  const isPublicException = publicExceptions.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is protected (but not a public exception)
  const isProtectedRoute = !isPublicException && protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If trying to access protected route without auth, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth routes while logged in, redirect to appropriate dashboard
  if (isAuthRoute && user) {
    // Check user role from metadata
    const userRole = user.user_metadata?.role || "client";
    const redirectTo = userRole === "admin" || userRole === "staff" ? "/admin" : "/portal";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // For admin routes, check if user has admin/staff role (skip for public exceptions)
  if (pathname.startsWith("/admin") && !isPublicException && user) {
    const userRole = user.user_metadata?.role || "client";
    if (userRole !== "admin" && userRole !== "staff" && userRole !== "super_admin") {
      // User is authenticated but not authorized for admin
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
