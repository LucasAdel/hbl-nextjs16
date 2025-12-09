"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";

export default function CorporateCommercialPage() {
  return (
    <ResourcePageLayout
      title="Corporate Commercial"
      subtitle="Legal Solutions for Healthcare Businesses"
      category="Corporate Law"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="5 min read"
    >
      <h2>Corporate Commercial Legal Services</h2>
      <p>
        Hamilton Bailey provides specialised corporate and commercial legal
        services tailored to the unique needs of healthcare businesses and
        medical practices.
      </p>

      <div className="bg-tiffany-lighter/30 p-6 rounded-lg my-8 not-prose">
        <h3 className="font-blair mb-4 text-gray-900">
          Our Corporate Commercial Expertise
        </h3>
        <p className="mb-4 text-gray-700">Our services include:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Business structure establishment and advice</li>
          <li>Practice mergers and acquisitions</li>
          <li>Shareholder and partnership agreements</li>
          <li>Commercial contracts and service agreements</li>
          <li>Succession planning for medical practices</li>
          <li>Corporate governance and compliance</li>
          <li>Joint ventures and collaborative arrangements</li>
        </ul>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Structuring Healthcare Businesses
      </h3>

      <p>
        Choosing the right business structure is crucial for medical practices.
        We assist with:
      </p>

      <ul className="mt-4 space-y-3">
        <li>
          <strong>Sole Practitioner Structures:</strong> Simple setups for
          individual practitioners starting their practice.
        </li>
        <li>
          <strong>Partnership Agreements:</strong> Multi-practitioner
          arrangements with clear profit-sharing and liability provisions.
        </li>
        <li>
          <strong>Company Structures:</strong> Corporate entities offering
          liability protection and tax planning opportunities.
        </li>
        <li>
          <strong>Service Entity Models:</strong> Separating clinical and
          administrative functions for payroll tax compliance.
        </li>
      </ul>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Mergers & Acquisitions
      </h3>

      <p>
        Whether you&apos;re expanding your practice or planning an exit, we provide
        comprehensive M&A support:
      </p>

      <ul className="mt-4 space-y-3">
        <li>Due diligence and valuation assistance</li>
        <li>Negotiation of purchase/sale agreements</li>
        <li>Transition planning and staff considerations</li>
        <li>Post-acquisition integration support</li>
        <li>Patient record transfers and privacy compliance</li>
      </ul>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Corporate Commercial Services
        </h3>
        <p className="mb-6 text-gray-700">
          For expert guidance on corporate and commercial legal matters for your
          healthcare business, contact our specialised legal team.
        </p>
        <Link
          href="/book-appointment"
          className="inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          Request a Consultation
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
