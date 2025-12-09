import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isLibrarySubdomain,
  stripLibraryPrefix,
  addLibraryPrefix,
  isLibraryPath,
} from "@/lib/subdomain";

// Routes that require authentication
const protectedRoutes = ["/admin", "/portal"];
// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // ============================================
  // Subdomain Routing: library.hamiltonbailey.com
  // ============================================

  // Check if this is a library subdomain request
  if (isLibrarySubdomain(hostname)) {
    // On library subdomain, rewrite paths to /library/*
    // e.g., library.hamiltonbailey.com/ -> /library
    // e.g., library.hamiltonbailey.com/search -> /library/search
    // e.g., library.hamiltonbailey.com/article-slug -> /library/article-slug

    // Don't rewrite if already targeting library path (shouldn't happen on subdomain)
    if (!isLibraryPath(pathname)) {
      const newPath = addLibraryPrefix(pathname);
      const url = request.nextUrl.clone();
      url.pathname = newPath;

      // Use rewrite to serve library content without changing URL
      return NextResponse.rewrite(url);
    }
  } else {
    // On main domain, redirect /library/* requests to library subdomain
    // This ensures library.hamiltonbailey.com is the canonical URL
    if (isLibraryPath(pathname) && process.env.ENABLE_LIBRARY_SUBDOMAIN_REDIRECT === "true") {
      const libraryPath = stripLibraryPrefix(pathname);
      const libraryUrl = new URL(
        libraryPath,
        process.env.NODE_ENV === "development"
          ? "http://library.localhost:3000"
          : "https://library.hamiltonbailey.com"
      );
      // Preserve query params
      libraryUrl.search = request.nextUrl.search;

      return NextResponse.redirect(libraryUrl, { status: 301 });
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

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
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

  // For admin routes, check if user has admin/staff role
  if (pathname.startsWith("/admin") && user) {
    const userRole = user.user_metadata?.role || "client";
    if (userRole !== "admin" && userRole !== "staff") {
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
