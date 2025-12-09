"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { AlertTriangle, DollarSign, Shield, FileText } from "lucide-react";

export default function PayrollTaxPage() {
  return (
    <ResourcePageLayout
      title="Payroll Tax for Medical Practices"
      subtitle="Understanding Your Obligations and Compliance Requirements"
      category="Taxation"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="10 min read"
    >
      <h2>Payroll Tax Compliance for Healthcare</h2>
      <p>
        Payroll tax is a state-based tax levied on wages paid by employers. For
        medical practices, determining payroll tax liability can be complex due
        to the various engagement models used for medical practitioners,
        including tenant doctor arrangements, contractor agreements, and
        employment.
      </p>

      <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 not-prose">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-2">
              Increased Audit Activity
            </h4>
            <p className="text-red-900">
              State Revenue Offices have significantly increased their audit
              focus on medical practices. Recent cases have resulted in
              assessments exceeding $250,000 plus penalties and interest.
            </p>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Key Compliance Factors
      </h3>

      <div className="space-y-4 mt-4 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <DollarSign className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Relevant Contracts
              </h4>
              <p className="text-gray-700">
                Payments under employment-like contracts may attract payroll
                tax. The substance of the relationship, not just its label,
                determines liability.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Contractor Provisions
              </h4>
              <p className="text-gray-700">
                Many state payroll tax laws extend to payments for services
                performed under contractor arrangements, particularly where
                there is a significant degree of control or integration.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Grouping Provisions
              </h4>
              <p className="text-gray-700">
                Related entities may be grouped for payroll tax purposes,
                potentially affecting threshold calculations and liability.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        State-by-State Thresholds (2024-25)
      </h3>

      <div className="overflow-x-auto mt-4 not-prose">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                State/Territory
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                Monthly Threshold
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                Annual Threshold
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                Rate
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr>
              <td className="border border-gray-200 px-4 py-3">NSW</td>
              <td className="border border-gray-200 px-4 py-3">$120,833</td>
              <td className="border border-gray-200 px-4 py-3">$1,450,000</td>
              <td className="border border-gray-200 px-4 py-3">5.45%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3">VIC</td>
              <td className="border border-gray-200 px-4 py-3">$83,333</td>
              <td className="border border-gray-200 px-4 py-3">$1,000,000</td>
              <td className="border border-gray-200 px-4 py-3">4.85%-6.3%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3">QLD</td>
              <td className="border border-gray-200 px-4 py-3">$130,000</td>
              <td className="border border-gray-200 px-4 py-3">$1,560,000</td>
              <td className="border border-gray-200 px-4 py-3">4.75%-4.95%</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-3">WA</td>
              <td className="border border-gray-200 px-4 py-3">$100,000</td>
              <td className="border border-gray-200 px-4 py-3">$1,200,000</td>
              <td className="border border-gray-200 px-4 py-3">5.0%-6.5%</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-3">SA</td>
              <td className="border border-gray-200 px-4 py-3">$166,667</td>
              <td className="border border-gray-200 px-4 py-3">$2,000,000</td>
              <td className="border border-gray-200 px-4 py-3">0%-4.95%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Note: Thresholds and rates may change. Always verify current figures
        with your state revenue office.
      </p>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Reducing Payroll Tax Risk
      </h3>

      <ul className="mt-4 space-y-3">
        <li>
          <strong>Structure Review:</strong> Ensure your practice structure
          genuinely reflects independent contractor or tenant doctor
          relationships.
        </li>
        <li>
          <strong>Documentation:</strong> Maintain clear, comprehensive
          agreements that reflect the true nature of the relationship.
        </li>
        <li>
          <strong>Operational Consistency:</strong> Ensure day-to-day operations
          align with contractual arrangements.
        </li>
        <li>
          <strong>Regular Review:</strong> Periodically review arrangements to
          ensure ongoing compliance with evolving legislation and case law.
        </li>
        <li>
          <strong>Professional Advice:</strong> Seek specialist legal and
          accounting advice before establishing or modifying arrangements.
        </li>
      </ul>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Concerned About Payroll Tax Compliance?
        </h3>
        <p className="mb-6 text-gray-700">
          Our team can review your current arrangements and provide guidance on
          structuring your practice to minimise payroll tax risk while
          maintaining compliance.
        </p>
        <Link
          href="/book-appointment"
          className="inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          Schedule a Review
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
