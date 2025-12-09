"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { updatePassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) =>
    req.test(formData.password)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!isPasswordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await updatePassword(formData.password);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
              Password updated!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been successfully reset. You can now sign in with
              your new password.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              Hamilton Bailey Legal
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Set your new password
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Enter your new password below. Make sure it meets all the requirements.
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs ${
                        req.test(formData.password)
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {req.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                />
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    Passwords do not match
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
