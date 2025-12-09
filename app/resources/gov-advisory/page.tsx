"use client";

import React from "react";
import Link from "next/link";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { Building2, Users, FileText, Scale } from "lucide-react";

export default function GovAdvisoryPage() {
  return (
    <ResourcePageLayout
      title="Government Advisory"
      subtitle="Navigating Government Interactions in Healthcare"
      category="Government Relations"
      author="Hamilton Bailey Law"
      dateModified="December 2025"
      readTime="6 min read"
    >
      <h2>Government Advisory Services for Healthcare</h2>
      <p>
        Hamilton Bailey provides strategic guidance to healthcare organisations
        on government relations, policy submissions, and regulatory engagement.
        Understanding how to effectively engage with government is essential for
        healthcare providers navigating complex regulatory environments.
      </p>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Our Government Advisory Services
      </h3>

      <div className="space-y-4 mt-4 not-prose">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Building2 className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Regulatory Engagement
              </h4>
              <p className="text-gray-700">
                Assistance with engaging regulatory bodies including the
                Department of Health, TGA, AHPRA, and state health departments.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Policy Submissions
              </h4>
              <p className="text-gray-700">
                Drafting and reviewing submissions to government inquiries,
                consultations, and policy development processes.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Users className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Stakeholder Management
              </h4>
              <p className="text-gray-700">
                Strategic advice on engaging with multiple government
                stakeholders and coordinating across jurisdictions.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Scale className="h-6 w-6 text-tiffany flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Compliance Navigation
              </h4>
              <p className="text-gray-700">
                Guidance on meeting regulatory requirements and responding to
                compliance audits and investigations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        Key Government Bodies in Healthcare
      </h3>

      <ul className="mt-4 space-y-3">
        <li>
          <strong>Department of Health and Aged Care:</strong> National policy,
          Medicare, PBS, and health program administration.
        </li>
        <li>
          <strong>AHPRA & National Boards:</strong> Health practitioner
          registration and professional standards.
        </li>
        <li>
          <strong>Therapeutic Goods Administration (TGA):</strong> Regulation of
          medical devices, medicines, and biologicals.
        </li>
        <li>
          <strong>State Health Departments:</strong> State-specific health
          regulations, licensing, and funding.
        </li>
        <li>
          <strong>Private Health Insurance Ombudsman:</strong> Oversight of
          private health insurance arrangements.
        </li>
      </ul>

      <h3 className="mt-8 text-xl font-blair text-tiffany-dark">
        When to Seek Government Advisory Support
      </h3>

      <ul className="mt-4 space-y-3">
        <li>
          Responding to government consultations or legislative changes
        </li>
        <li>
          Navigating regulatory approval processes for new services or products
        </li>
        <li>
          Addressing compliance investigations or audits
        </li>
        <li>
          Seeking government funding or program participation
        </li>
        <li>
          Understanding the impact of policy changes on your practice
        </li>
      </ul>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg not-prose">
        <h3 className="text-xl font-blair mb-4 text-gray-900">
          Need Government Advisory Assistance?
        </h3>
        <p className="mb-6 text-gray-700">
          Our team can assist with regulatory engagement, policy submissions,
          and navigating complex government interactions in the healthcare
          sector.
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
