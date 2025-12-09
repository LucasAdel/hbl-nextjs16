"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { AlertTriangle, CheckCircle, Calendar } from "lucide-react";

export default function AhpraDeclarationsPage() {
  return (
    <ResourcePageLayout
      title="AHPRA Annual Declarations"
      subtitle="Understanding Your Registration Renewal Obligations"
      category="Regulatory Compliance"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="8 min read"
    >
      <h2>AHPRA Registration and Annual Declarations</h2>
      <p>
        The Australian Health Practitioner Regulation Agency (AHPRA) requires
        all registered health practitioners to complete annual declarations as
        part of their registration renewal. Understanding these obligations is
        essential for maintaining your registration and avoiding compliance
        issues.
      </p>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 my-8 not-prose">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">
              Important Reminder
            </h4>
            <p className="text-amber-900">
              False or misleading declarations can result in disciplinary action,
              including conditions on your registration, suspension, or
              cancellation. Always ensure your declarations are accurate and
              complete.
            </p>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Key Declaration Requirements
      </h3>

      <ul className="mt-4 space-y-4">
        <li>
          <strong>Criminal History:</strong> You must declare any changes to
          your criminal history since your last renewal, including charges,
          findings of guilt, and any pending matters.
        </li>
        <li>
          <strong>Health Conditions:</strong> Any impairments that may affect
          your ability to practise safely must be declared.
        </li>
        <li>
          <strong>Professional Conduct:</strong> Notifications, complaints, or
          disciplinary proceedings in any jurisdiction must be disclosed.
        </li>
        <li>
          <strong>Professional Indemnity Insurance:</strong> Confirmation that
          appropriate insurance arrangements are in place.
        </li>
        <li>
          <strong>Continuing Professional Development:</strong> Declaration that
          CPD requirements have been met for your profession.
        </li>
      </ul>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Common Declaration Issues
      </h3>

      <div className="space-y-4 mt-4 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            1. Incomplete Disclosures
          </h4>
          <p className="text-gray-700">
            Failing to disclose all relevant matters, even those you believe are
            minor or occurred many years ago, can constitute a breach of your
            registration conditions.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            2. Misunderstanding Requirements
          </h4>
          <p className="text-gray-700">
            Some practitioners incorrectly believe that expunged records or
            matters from other jurisdictions do not need to be declared.
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">
            3. Timing Issues
          </h4>
          <p className="text-gray-700">
            Matters that arise after submission but before renewal is processed
            may need to be reported separately to AHPRA.
          </p>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Our AHPRA Support Services
      </h3>

      <ul className="mt-4 space-y-3">
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Pre-declaration review and advice</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Response to notifications and complaints</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Representation in disciplinary proceedings</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Appeals against registration decisions</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>Restoration of lapsed registration</span>
        </li>
      </ul>

      <div className="bg-tiffany-lighter/20 p-6 rounded-lg mt-8 not-prose">
        <div className="flex items-start gap-3">
          <Calendar className="h-6 w-6 text-tiffany flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-tiffany-dark mb-2">
              Renewal Period Approaching?
            </h4>
            <p className="text-gray-700">
              If you&apos;re unsure about what to declare or have concerns about
              your upcoming renewal, seek advice early. Our team can review your
              situation and provide guidance before you submit your declaration.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Need Help with Your AHPRA Matters?
        </h3>
        <p className="mb-6 text-gray-700">
          Our team has extensive experience assisting healthcare practitioners
          with AHPRA compliance, notifications, and disciplinary matters.
        </p>
        <Link
          href="/book-appointment"
          className="inline-flex items-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-colors"
        >
          Book a Consultation
        </Link>
      </div>
    </ResourcePageLayout>
  );
}
