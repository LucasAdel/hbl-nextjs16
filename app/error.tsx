"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Phone } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-8"
        >
          <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error Message */}
        <h1 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Something Went Wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          We apologise for the inconvenience. An unexpected error has occurred.
          Our team has been notified and is working to resolve the issue.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
            <p className="text-sm font-mono text-red-800 dark:text-red-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            If the problem persists, please contact us:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="text-tiffany hover:text-tiffany-dark font-medium text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Contact Support
            </Link>
            <a
              href="tel:+61882312422"
              className="text-tiffany hover:text-tiffany-dark font-medium text-sm inline-flex items-center gap-1"
            >
              <Phone className="w-4 h-4" />
              (08) 8231 2422
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
