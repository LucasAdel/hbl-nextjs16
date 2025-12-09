// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Only send errors from production
  enabled: process.env.NODE_ENV === "production",

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["error"],
    }),
  ],

  // Filter and enrich server errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Add additional context for API errors
    if (error instanceof Error) {
      event.tags = event.tags || {};

      // Categorize errors
      const message = error.message.toLowerCase();
      if (message.includes("stripe")) {
        event.tags.category = "payment";
      } else if (message.includes("supabase") || message.includes("database")) {
        event.tags.category = "database";
      } else if (message.includes("auth")) {
        event.tags.category = "authentication";
      } else if (message.includes("email") || message.includes("resend")) {
        event.tags.category = "email";
      }
    }

    return event;
  },
});
