"use client";

import { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "default" | "compact" | "hero";
  className?: string;
}

export function NewsletterSignup({ variant = "default", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Welcome! Check your inbox for a confirmation email.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  if (variant === "compact") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
              disabled={status === "loading" || status === "success"}
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="px-4 py-2.5 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </form>
        {message && (
          <p className={`text-sm mt-2 ${status === "error" ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`bg-gradient-to-br from-tiffany to-tiffany-dark rounded-2xl p-8 md:p-12 text-white ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Stay Updated</span>
          </div>
          <h3 className="font-blair text-2xl md:text-3xl font-bold mb-4">
            Get Legal Insights Delivered
          </h3>
          <p className="text-white/90 mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter for the latest legal updates, industry news, and exclusive insights for Australian healthcare professionals.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 bg-white/20 rounded-xl p-6">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-medium">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                  disabled={status === "loading"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-200 text-sm mt-3">{message}</p>
          )}

          <p className="text-white/70 text-sm mt-6">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail className="h-6 w-6 text-tiffany" />
        </div>
        <div className="flex-1">
          <h3 className="font-blair text-lg font-bold text-gray-900 mb-1">
            Subscribe to Our Newsletter
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get the latest legal updates and insights delivered to your inbox.
          </p>

          {status === "success" ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                  disabled={status === "loading"}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-5 py-2.5 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Footer newsletter variant
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    // Reset status after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div>
      <h4 className="font-blair font-semibold text-white mb-4">Newsletter</h4>
      <p className="text-white/70 text-sm mb-4">
        Stay updated with the latest legal insights and news.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-tiffany"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="px-4 py-2 bg-tiffany text-white rounded-lg font-medium hover:bg-tiffany-dark transition-colors disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </form>
      {status === "success" && (
        <p className="text-green-400 text-xs mt-2">Subscribed successfully!</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2">Failed to subscribe. Try again.</p>
      )}
    </div>
  );
}
