"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { CheckCircle, AlertCircle, FileCheck } from "lucide-react";

export default function PayrollTaxRequirementsPage() {
  return (
    <ResourcePageLayout
      title="Payroll Tax Requirements"
      subtitle="Detailed Compliance Checklist for Medical Practices"
      category="Taxation"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="8 min read"
    >
      <h2>Payroll Tax Compliance Requirements</h2>
      <p>
        This guide provides a detailed overview of payroll tax compliance
        requirements for medical practices, including registration obligations,
        reporting requirements, and documentation standards.
      </p>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Registration Requirements
      </h3>

      <p>
        Employers must register for payroll tax when their total Australian
        wages exceed the threshold for their state or territory. Registration
        should occur within 7 days of becoming liable.
      </p>

      <div className="bg-tiffany-lighter/20 p-6 rounded-lg mt-6 not-prose">
        <h4 className="font-semibold text-tiffany-dark mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Registration Checklist
        </h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>ABN and business registration details</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Contact details for principal place of business</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Details of any grouped entities</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Estimated monthly wages</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Date wages first exceeded threshold</span>
          </li>
        </ul>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        What Constitutes Wages?
      </h3>

      <p>
        &quot;Wages&quot; for payroll tax purposes includes more than just salary. The
        following payments are typically included:
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-6 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Included as Wages
          </h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Salaries and wages</li>
            <li>• Bonuses and commissions</li>
            <li>• Directors&apos; fees</li>
            <li>• Allowances</li>
            <li>• Superannuation contributions</li>
            <li>• Fringe benefits</li>
            <li>• Contractor payments (in some cases)</li>
            <li>• Employment termination payments</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Exempt Payments
          </h4>
          <ul className="space-y-2 text-gray-700">
            <li>• Genuine reimbursements</li>
            <li>• Some apprentice wages</li>
            <li>• Parental leave pay</li>
            <li>• Certain exempt allowances</li>
            <li>• Workers compensation wages (some states)</li>
          </ul>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Reporting Obligations
      </h3>

      <div className="space-y-4 mt-4 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Monthly Returns</h4>
          <p className="text-gray-700">
            Most employers lodge monthly returns, due by the 7th day of the
            following month. Some smaller employers may be eligible for annual
            lodgement.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Annual Reconciliation
          </h4>
          <p className="text-gray-700">
            An annual reconciliation is required, typically due by 21 July
            following the end of the financial year. This reconciles payments
            made throughout the year.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            Record Keeping
          </h4>
          <p className="text-gray-700">
            Records must be kept for at least 5 years, including payroll
            records, contractor agreements, and calculations supporting
            exemption claims.
          </p>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Contractor Payment Provisions
      </h3>

      <p>
        Payments to contractors may be subject to payroll tax under the
        &quot;relevant contracts&quot; provisions if:
      </p>

      <ul className="mt-4 space-y-3">
        <li>
          The contract is for labour (as opposed to a specified result)
        </li>
        <li>
          The contractor provides services to the public generally (not just the
          principal)
        </li>
        <li>
          The contractor is not providing services as part of a genuine
          independent business
        </li>
      </ul>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mt-6 not-prose">
        <h4 className="font-semibold text-amber-800 mb-2">Medical Practice Alert</h4>
        <p className="text-amber-900">
          Many medical practice arrangements have been challenged under these
          provisions. Ensure your contractor or tenant doctor arrangements are
          properly structured and documented.
        </p>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Need Help With Payroll Tax Compliance?
        </h3>
        <p className="mb-6 text-gray-700">
          Our team can assist with registration, compliance review, and
          restructuring arrangements to ensure you meet all payroll tax
          requirements.
        </p>
        <Link
          href="/book-appointment"
          className="inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          Get Expert Assistance
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
