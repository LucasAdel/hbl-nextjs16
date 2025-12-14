import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Redirects for old/short URLs
  async redirects() {
    return [
      {
        source: "/book",
        destination: "/book-appointment",
        permanent: true,
      },
    ];
  },

  // Security headers and subdomain routing
  async headers() {
    // Content Security Policy - prevents XSS and data injection attacks
    const cspDirectives = [
      "default-src 'self'",
      // Scripts: self, inline for Next.js, and trusted CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://api.mapbox.com",
      // Styles: self, inline for dynamic styles, Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
      // Images: self, data URIs, and trusted sources
      "img-src 'self' data: blob: https: http:",
      // Fonts: self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Connect: API endpoints and services
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.mapbox.com https://events.mapbox.com https://*.posthog.com https://*.sentry.io https://www.google-analytics.com https://api.resend.com",
      // Frames: Stripe for payment forms
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      // Workers: self for service workers
      "worker-src 'self' blob:",
      // Objects: none (no plugins)
      "object-src 'none'",
      // Base URI: self only
      "base-uri 'self'",
      // Form actions: self only
      "form-action 'self'",
      // Frame ancestors: none (prevents clickjacking)
      "frame-ancestors 'none'",
      // Upgrade insecure requests in production
      ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    // Security headers to apply to all routes
    const securityHeaders = [
      // Content Security Policy
      { key: "Content-Security-Policy", value: cspDirectives },
      // Prevent clickjacking attacks
      { key: "X-Frame-Options", value: "DENY" },
      // Prevent MIME type sniffing
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Enable XSS filter (legacy browsers)
      { key: "X-XSS-Protection", value: "1; mode=block" },
      // Control referrer information
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Permissions policy - disable dangerous features
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      // Strict Transport Security (HSTS) - enforce HTTPS
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
    ];

    return [
      // Apply security headers to all routes
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Apply CORS headers for library subdomain
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production"
              ? "https://codex.hamiltonbailey.com"
              : "http://codex.localhost:3000",
          },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },

  // Image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hamiltonbailey.com",
      },
      {
        protocol: "https",
        hostname: "codex.hamiltonbailey.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG || "hbl-q0",
  project: process.env.SENTRY_PROJECT || "hbl-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  automaticVercelMonitors: true,
};

// Wrap with Sentry only if DSN is configured
const configWithSentry =
  process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;

export default configWithSentry;
