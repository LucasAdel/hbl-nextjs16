import { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, AlertCircle, Copyright, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Licensing, Trademark & Copyright | Hamilton Bailey",
  description:
    "Copyright, trademark, and licensing information for Hamilton Bailey Law Firm's materials and services.",
};

export default function CopyrightPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-gray-900 dark:via-gray-900 dark:to-tiffany-dark/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10 dark:bg-tiffany/20">
              <Copyright className="h-4 w-4 mr-2 text-tiffany" />
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
              Licensing, Trademark &amp; Copyright
            </h1>
            <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Important Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-12">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-blair text-lg text-amber-800 dark:text-amber-200 mb-2">
                    Copyright Warning
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300">
                    All materials, templates, agreements, and content provided by Hamilton Bailey are
                    protected by copyright law. Unauthorized reproduction, modification, or distribution
                    is strictly prohibited.
                  </p>
                </div>
              </div>
            </div>

            {/* Registered Clients Notice */}
            <div className="bg-tiffany/5 dark:bg-tiffany/10 border border-tiffany/20 rounded-xl p-6 mb-12">
              <div className="flex items-start">
                <Lock className="h-6 w-6 text-tiffany mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-blair text-lg text-tiffany-dark dark:text-tiffany mb-2">
                    For Registered Clients
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Thank you for registering your data encrypted practice agreements with us. This is
                    designed to protect you and ensure your agreements can affordably be updated and
                    maintained to protect your practice.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              {/* Copyright Notice */}
              <div>
                <div className="flex items-center mb-4">
                  <Copyright className="h-6 w-6 text-tiffany mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Copyright Notice
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    All content, materials, documents, templates, agreements, and intellectual property
                    available through Hamilton Bailey&apos;s services are protected by Australian and
                    international copyright laws.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    © {new Date().getFullYear()} Hamilton Bailey Lawyers. All rights reserved.
                  </p>
                </div>
              </div>

              {/* Permitted Use */}
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-tiffany mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Permitted Use
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    The use of our agreements, including copying, modifying, or sharing, is permitted
                    only under our licensing terms and for registered clients in good standing.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Permitted uses include:</p>
                  <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                    <li>
                      Use of provided templates and agreements within your own practice as specified
                      in your service agreement
                    </li>
                    <li>
                      Making copies for internal use and record-keeping purposes
                    </li>
                    <li>
                      Sharing with your accountant or other professional advisors for compliance purposes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Prohibited Use */}
              <div>
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Prohibited Use
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    The following uses are strictly prohibited without express written permission:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                    <li>
                      Redistribution or resale of templates, agreements, or other materials
                    </li>
                    <li>
                      Creating derivative works based on our templates for commercial distribution
                    </li>
                    <li>
                      Sharing access credentials or documents with non-authorized parties
                    </li>
                    <li>
                      Using our materials to compete with Hamilton Bailey&apos;s services
                    </li>
                    <li>
                      Removing or altering copyright notices or attribution
                    </li>
                  </ul>
                </div>
              </div>

              {/* Trademark Notice */}
              <div>
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-tiffany mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Trademark Notice
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    &quot;Hamilton Bailey,&quot; the Hamilton Bailey logo, and other identifying marks
                    are trademarks or registered trademarks of Hamilton Bailey Lawyers.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    These trademarks may not be used in connection with any product or service that
                    is not provided by Hamilton Bailey, or in any manner that is likely to cause
                    confusion among customers or that disparages or discredits Hamilton Bailey.
                  </p>
                </div>
              </div>

              {/* Enforcement */}
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-tiffany mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Enforcement
                  </h2>
                </div>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400">
                    Hamilton Bailey actively protects its intellectual property rights. Violation of
                    these terms may result in:
                  </p>
                  <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                    <li>Immediate termination of your access to our services</li>
                    <li>Legal action for copyright or trademark infringement</li>
                    <li>Claims for damages including legal costs</li>
                  </ul>
                </div>
              </div>

              {/* Professional Standards */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  <strong>Professional Standards:</strong> Liability limited by a scheme approved
                  under Professional Standards Legislation.
                </p>
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-tiffany mr-3" />
                  <h2 className="font-blair text-2xl text-text-primary dark:text-white">
                    Questions?
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If you have questions about copyright, licensing, or permitted use of our materials,
                  please contact us.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-blair text-xl text-text-primary dark:text-white mb-6">
              Related Legal Pages
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/terms-of-service"
                className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-tiffany transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Terms of Service</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Website and service terms
                </p>
              </Link>
              <Link
                href="/privacy-policy"
                className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-tiffany transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy Policy</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  How we handle your data
                </p>
              </Link>
              <Link
                href="/disclaimer"
                className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-tiffany transition-colors"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Disclaimer</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Legal disclaimers and notices
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
