"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const supabase = createClient();

      // Check for error in URL params
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setStatus("error");
        setMessage(errorDescription);
        return;
      }

      // Check for token hash (from email confirmation link)
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (tokenHash && type === "email") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            setStatus("error");
            setMessage(error.message);
          } else {
            setStatus("success");
            setMessage("Your email has been verified successfully!");
          }
        } catch (err) {
          setStatus("error");
          setMessage("Failed to verify email. The link may have expired.");
        }
      } else {
        // No token, just show pending state (user landed here without clicking email link)
        setStatus("pending");
        setMessage("Please check your email and click the verification link.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  const resendVerification = async () => {
    setStatus("loading");
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        setStatus("error");
        setMessage(error.message);
      } else {
        setStatus("pending");
        setMessage("Verification email sent! Please check your inbox.");
      }
    } else {
      setStatus("error");
      setMessage("Unable to resend verification. Please try logging in again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              Hamilton Bailey Legal
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={resendVerification}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Resend Verification Email
                </button>
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === "pending" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={resendVerification}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Resend Verification Email
                </button>
                <Link
                  href="/login"
                  className="block w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          Having trouble?{" "}
          <Link href="/contact" className="underline hover:text-gray-700 dark:hover:text-gray-300">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
