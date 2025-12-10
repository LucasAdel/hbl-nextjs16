"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Shield,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function AdminResetPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/admin-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to generate reset link");
        return;
      }

      setSuccess(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (resetLink) {
      await navigator.clipboard.writeText(resetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              Reset Link Generated
            </h2>

            {resetLink ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center text-sm">
                  Use the link below to reset your password. It expires in 24 hours.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4 break-all">
                  <code className="text-xs text-gray-700 dark:text-gray-300">
                    {resetLink}
                  </code>
                </div>

                <div className="flex gap-2 mb-6">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={resetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors text-sm font-medium text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Link
                  </a>
                </div>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
                If an admin account exists with this email, a password reset has been
                initiated. Check your email or contact support for the reset link.
              </p>
            )}

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              Hamilton Bailey Legal
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Admin Password Reset
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Security notice */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                Admin-Only Feature
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                This bypasses email rate limits. Only works for admin and staff accounts.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating reset link...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Generate Admin Reset Link
                </>
              )}
            </button>
          </form>

          {/* Standard reset link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Not an admin?{" "}
            <Link
              href="/forgot-password"
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Use standard password reset
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
