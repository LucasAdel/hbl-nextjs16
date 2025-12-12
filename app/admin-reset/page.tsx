"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

/**
 * Admin Reset Page - DISABLED
 *
 * This page has been disabled for security reasons.
 * The previous implementation had a critical vulnerability where
 * password reset links were returned directly to unauthenticated users.
 */
export default function AdminResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to forgot password
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Feature Disabled
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            This admin reset feature has been disabled for security reasons.
          </p>

          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
              To reset an admin password:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Use the standard password reset (sends email)</li>
              <li>Contact the system administrator</li>
              <li>Use Supabase Dashboard directly</li>
            </ul>
          </div>

          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
          >
            Use Standard Password Reset
          </Link>
        </div>
      </div>
    </div>
  );
}
