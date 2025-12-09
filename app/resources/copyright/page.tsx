"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";

export default function CopyrightPage() {
  return (
    <ResourcePageLayout
      title="Copyright Caution"
      subtitle="Protecting Intellectual Property in Healthcare"
      category="Intellectual Property"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="5 min read"
    >
      <h2>Copyright Protection in Healthcare</h2>
      <p>
        Hamilton Bailey provides specialised legal guidance on copyright
        protection for healthcare practitioners, medical practices, and
        healthcare organisations.
      </p>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Key Copyright Considerations for Medical Practitioners
      </h3>

      <ul className="mt-4 space-y-4">
        <li>
          <strong>Medical Publications:</strong> Protection of medical research
          papers, clinical guidelines, and educational materials created by
          practitioners.
        </li>
        <li>
          <strong>Website Content:</strong> Safeguarding original content on
          practice websites, blogs, and patient education materials.
        </li>
        <li>
          <strong>Digital Assets:</strong> Protection of custom software, apps,
          and digital tools developed for healthcare delivery.
        </li>
        <li>
          <strong>Visual Materials:</strong> Copyright considerations for
          medical illustrations, photographs, and educational videos.
        </li>
      </ul>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Our Copyright Services for Healthcare
      </h3>

      <ul className="mt-4 space-y-3">
        <li>Copyright registration and protection strategies</li>
        <li>Licence agreements for intellectual property</li>
        <li>Copyright infringement analysis and resolution</li>
        <li>Fair use guidance in medical education</li>
        <li>Content licencing strategies for medical publishers</li>
      </ul>

      <p className="mt-6">
        For detailed information about copyright considerations in healthcare,
        please contact our intellectual property specialists.
      </p>

      <div className="mt-10 p-6 bg-tiffany-lighter/20 rounded-lg border border-tiffany-lighter not-prose">
        <h4 className="text-lg font-blair text-tiffany-dark">
          Looking for Copyright Documentation?
        </h4>
        <p className="mt-2 text-gray-700">
          Browse our comprehensive collection of copyright-related legal
          documents tailored for healthcare professionals.
        </p>
        <Link
          href="/documents"
          className="mt-4 inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          View Legal Documents
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
