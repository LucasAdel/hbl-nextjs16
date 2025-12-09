"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { AlertTriangle, FileSearch, Shield, Building } from "lucide-react";

export default function PathologyAuditsPage() {
  return (
    <ResourcePageLayout
      title="Pathology Lease Audits"
      subtitle="Understanding and Navigating Compliance Requirements"
      category="Property & Leasing"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="7 min read"
    >
      <h2>Pathology Collection Centre Lease Compliance</h2>
      <p>
        Pathology collection centre leases are subject to strict regulatory
        oversight under the Health Insurance Act 1973. Non-compliance can result
        in significant penalties and disqualification from Medicare billing.
        Understanding audit processes and compliance requirements is essential
        for medical practices hosting pathology collection facilities.
      </p>

      <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 not-prose">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-2">
              Regulatory Focus Area
            </h4>
            <p className="text-red-900">
              The Department of Health actively audits pathology lease
              arrangements. Non-compliant leases can trigger Medicare compliance
              investigations and significant financial penalties.
            </p>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Key Compliance Requirements
      </h3>

      <div className="space-y-4 mt-4 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Building className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Market Rent Requirement
              </h4>
              <p className="text-gray-700">
                Rent must be determined on an arm&apos;s length basis and reflect
                market value for comparable premises. Below-market rent
                arrangements may constitute prohibited benefits.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <FileSearch className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Valuation Evidence
              </h4>
              <p className="text-gray-700">
                Independent valuations are typically required to demonstrate
                market rent compliance. Valuations should be conducted by
                qualified valuers and refreshed periodically.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Prohibited Practices
              </h4>
              <p className="text-gray-700">
                Leases cannot include provisions that tie rent to pathology
                referral volumes or provide incentives for referrals. Such
                arrangements violate the &quot;prohibited practices&quot; provisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Audit Process Overview
      </h3>

      <ol className="mt-4 space-y-4">
        <li>
          <strong>1. Notification:</strong> The Department of Health issues a
          formal notification requesting documentation relating to pathology
          lease arrangements.
        </li>
        <li>
          <strong>2. Documentation Review:</strong> Lease agreements, valuations,
          and supporting documentation are examined for compliance.
        </li>
        <li>
          <strong>3. Interview/Clarification:</strong> Parties may be asked to
          provide clarification or attend interviews about the arrangements.
        </li>
        <li>
          <strong>4. Findings:</strong> The Department issues findings and, if
          non-compliance is identified, may impose penalties or refer matters
          for prosecution.
        </li>
      </ol>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Documentation Best Practices
      </h3>

      <ul className="mt-4 space-y-3">
        <li>
          Maintain current independent valuations (refresh every 2-3 years)
        </li>
        <li>
          Keep copies of all lease agreements and variations
        </li>
        <li>
          Document the basis for any rent adjustments
        </li>
        <li>
          Retain evidence of how market rent was determined
        </li>
        <li>
          Maintain records of any discussions or negotiations with pathology
          providers
        </li>
      </ul>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Common Compliance Issues
      </h3>

      <div className="bg-amber-50 p-6 rounded-lg mt-4 not-prose">
        <ul className="space-y-3 text-amber-900">
          <li>
            <strong>Outdated valuations:</strong> Using valuations that are
            several years old may not reflect current market conditions.
          </li>
          <li>
            <strong>Informal arrangements:</strong> Verbal or undocumented
            agreements that cannot be independently verified.
          </li>
          <li>
            <strong>Bundled services:</strong> Including additional services or
            benefits in the lease without separate market-rate pricing.
          </li>
          <li>
            <strong>Related party transactions:</strong> Leases between related
            parties require additional scrutiny to demonstrate arm&apos;s length
            terms.
          </li>
        </ul>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Facing an Audit or Need Compliance Review?
        </h3>
        <p className="mb-6 text-gray-700">
          Our team can assist with pathology lease compliance reviews, audit
          response preparation, and restructuring arrangements to ensure
          ongoing compliance.
        </p>
        <Link
          href="/book-appointment"
          className="inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          Request Compliance Review
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
