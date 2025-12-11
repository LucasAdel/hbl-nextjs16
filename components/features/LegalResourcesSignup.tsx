"use client";

import { useState } from "react";
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  FileText,
  ClipboardCheck,
  Building2,
  Sparkles,
} from "lucide-react";

interface LegalResourcesSignupProps {
  variant?: "default" | "compact" | "hero" | "sidebar";
  className?: string;
}

const RESOURCES = [
  {
    icon: ClipboardCheck,
    title: "Practice Compliance Checklist",
    description: "12-section checklist for regulatory compliance",
  },
  {
    icon: FileText,
    title: "Employment Contract Essentials",
    description: "Essential contract terms and Award coverage",
  },
  {
    icon: Building2,
    title: "Practice Structure Overview",
    description: "Business structures with tax comparisons",
  },
];

export function LegalResourcesSignup({
  variant = "default",
  className = "",
}: LegalResourcesSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
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
      const response = await fetch("/api/legal-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage("Check your inbox! Your resources are on their way.");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to submit. Please try again later.");
    }
  };

  // Compact variant - minimal inline form
  if (variant === "compact") {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-tiffany" />
          <span className="text-sm font-medium text-gray-700">Get 3 Free Legal Resources</span>
        </div>
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
          <p
            className={`text-sm mt-2 ${status === "error" ? "text-red-600" : "text-green-600"}`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  // Hero variant - large featured section
  if (variant === "hero") {
    return (
      <div
        className={`bg-gradient-to-br from-tiffany to-tiffany-dark rounded-2xl p-8 md:p-12 text-white ${className}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Free Legal Resources</span>
            </div>
            <h2 className="font-blair text-2xl md:text-3xl font-bold mb-4">
              Get Your Free Legal Templates
            </h2>
            <p className="text-white/90 max-w-lg mx-auto">
              Subscribe and receive our top 3 legal templates absolutely free — designed
              specifically for Australian medical practice owners.
            </p>
          </div>

          {/* Resource List */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {RESOURCES.map((resource) => (
              <div
                key={resource.title}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <resource.icon className="h-8 w-8 mx-auto mb-3 opacity-90" />
                <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                <p className="text-white/70 text-xs">{resource.description}</p>
              </div>
            ))}
          </div>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 bg-white/20 rounded-xl p-6">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-medium">{message}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
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
                    Sending...
                  </>
                ) : (
                  <>
                    Get Free Resources
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {status === "error" && <p className="text-red-200 text-sm mt-3 text-center">{message}</p>}

          <p className="text-white/70 text-sm mt-6 text-center">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    );
  }

  // Sidebar variant - vertical card for sidebars
  if (variant === "sidebar") {
    return (
      <div
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-tiffany/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-tiffany" />
          </div>
          <h3 className="font-blair text-lg font-bold text-gray-900 mb-2">
            Get Free Legal Resources
          </h3>
          <p className="text-sm text-gray-600">
            Subscribe and receive our top 3 legal templates for medical practices.
          </p>
        </div>

        {/* Resource Mini-List */}
        <div className="space-y-2 mb-5">
          {RESOURCES.map((resource) => (
            <div key={resource.title} className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-tiffany flex-shrink-0" />
              <span>{resource.title}</span>
            </div>
          ))}
        </div>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg p-4">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full px-4 py-3 bg-tiffany text-white rounded-lg font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Get Free Resources
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {status === "error" && <p className="text-red-600 text-sm mt-2 text-center">{message}</p>}

        <p className="text-gray-500 text-xs mt-4 text-center">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  // Default variant - standard card
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Left side - content */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-tiffany/10 text-tiffany rounded-full px-3 py-1 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Free Resources</span>
          </div>

          <h3 className="font-blair text-xl font-bold text-gray-900 mb-2">
            Get Free Legal Resources
          </h3>
          <p className="text-gray-600 mb-5">
            Subscribe and receive our top 3 legal templates absolutely free!
          </p>

          <div className="space-y-3 mb-6">
            {RESOURCES.map((resource) => (
              <div key={resource.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-tiffany/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <resource.icon className="h-4 w-4 text-tiffany" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{resource.title}</p>
                  <p className="text-gray-500 text-xs">{resource.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - form */}
        <div className="md:w-80">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center gap-3 bg-green-50 rounded-xl p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Success!</p>
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                    disabled={status === "loading"}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
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
                  className="w-full px-4 py-3 bg-tiffany text-white rounded-lg font-semibold hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Get Free Resources
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {status === "error" && (
                <p className="text-red-600 text-sm mt-2 text-center">{message}</p>
              )}

              <p className="text-gray-500 text-xs mt-3 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
