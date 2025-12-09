"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: resetError } = await requestPasswordReset(email);

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {email}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Click the link in the email to reset your password. If you don&apos;t
              see the email, check your spam folder.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
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
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              Hamilton Bailey Legal
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Reset your password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your
            password.
          </p>

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
                Email address
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
                  placeholder="you@example.com"
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
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
