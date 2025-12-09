"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  User,
  Calendar,
  Check,
  Copy,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { toast } from "sonner";

interface ResourcePageLayoutProps {
  title: string;
  subtitle?: string;
  category: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  readTime?: string;
  heroImage?: string;
  children: React.ReactNode;
  backLink?: string;
  backText?: string;
}

export function ResourcePageLayout({
  title,
  subtitle,
  category,
  author = "Lukasz Wyszynski",
  datePublished,
  dateModified,
  readTime = "5 min read",
  heroImage = "/images/healthcare-team.png",
  children,
  backLink = "/services",
  backText = "Back to Services",
}: ResourcePageLayoutProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Check if article is already saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedArticles = JSON.parse(
        localStorage.getItem("savedArticles") || "[]"
      );
      const isSavedArticle = savedArticles.some(
        (article: { url: string }) => article.url === window.location.href
      );
      setIsSaved(isSavedArticle);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedInUrl, "_blank", "width=600,height=500");
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `${title} - Essential guide for Australian medical practitioners by Hamilton Bailey Law`
    );
    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    window.open(twitterUrl, "_blank", "width=600,height=500");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, "_blank", "width=600,height=500");
  };

  const handleSaveForLater = () => {
    const articleData = {
      title,
      url: window.location.href,
      savedAt: new Date().toISOString(),
    };

    const savedArticles = JSON.parse(
      localStorage.getItem("savedArticles") || "[]"
    );
    const existingIndex = savedArticles.findIndex(
      (article: { url: string }) => article.url === articleData.url
    );

    if (existingIndex === -1) {
      savedArticles.push(articleData);
      localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
      setIsSaved(true);
      toast.success("Article saved for later reading");
    } else {
      savedArticles.splice(existingIndex, 1);
      localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
      setIsSaved(false);
      toast.info("Article removed from saved list");
    }
  };

  const relatedResources = [
    { href: "/resources/tenant-doctor", label: "Tenant Doctor" },
    { href: "/resources/payroll-tax", label: "Payroll Tax" },
    { href: "/resources/payroll-tax-requirements", label: "Payroll Tax Requirements" },
    { href: "/resources/ahpra-declarations", label: "AHPRA Annual Declarations" },
    { href: "/resources/pathology-audits", label: "Pathology Lease Audits" },
    { href: "/resources/copyright", label: "Copyright Caution" },
    { href: "/resources/corporate-commercial", label: "Corporate Commercial" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button Section */}
      <div className="bg-gray-50 border-b pt-28">
        <div className="container-custom py-4">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-tiffany hover:text-white hover:border-tiffany transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {backText}
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <div className="bg-gradient-to-br from-tiffany-lighter via-tiffany-light/30 to-tiffany/10">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-tiffany text-white px-3 py-1 rounded-full text-sm font-medium">
                {category}
              </span>
              <span className="text-gray-600 text-sm">Featured Resource</span>
            </div>

            <h1 className="font-blair text-4xl md:text-5xl text-gray-900 mb-6">
              {title}
            </h1>

            {subtitle && (
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{author}</span>
              </div>
              {dateModified && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {dateModified}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              <div className="relative group">
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <div className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Linkedin className="h-4 w-4" />
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Twitter className="h-4 w-4" />
                    Share on Twitter
                  </button>
                  <button
                    onClick={handleShareFacebook}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Facebook className="h-4 w-4" />
                    Share on Facebook
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveForLater}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                  isSaved
                    ? "bg-tiffany-lighter text-tiffany-dark border-tiffany"
                    : "text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Save for Later
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="lg:w-3/4">
              <article className="prose prose-lg max-w-none prose-headings:font-blair prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-tiffany-dark hover:prose-a:text-tiffany prose-strong:text-gray-900">
                {children}
              </article>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="bg-gray-50 p-6 rounded-xl sticky top-28">
                <h3 className="font-blair text-lg mb-4">Related Resources</h3>
                <div className="flex flex-col space-y-3">
                  {relatedResources.map((resource) => (
                    <Link
                      key={resource.href}
                      href={resource.href}
                      className="text-tiffany-dark hover:text-tiffany text-sm transition-colors"
                    >
                      {resource.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    href="/book-appointment"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors text-sm"
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
