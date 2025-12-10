import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Hamilton Bailey Legal",
  description: "Privacy Policy for Hamilton Bailey Legal - how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hamilton Bailey Legal (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
                protecting your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our website or use
                our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Personal Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may collect personal information that you voluntarily provide, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Professional details (practice name, AHPRA registration)</li>
                <li>Account credentials</li>
                <li>Payment information (processed securely via Stripe)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and updates</li>
                <li>Respond to inquiries and offer customer support</li>
                <li>Improve our website and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. AI Assistant (Bailey) Data
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When you interact with our AI assistant Bailey:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Conversations may be logged to improve service quality</li>
                <li>We do not share your conversations with third parties</li>
                <li>You can request deletion of your conversation history</li>
                <li>Bailey does not retain personal information between sessions unless you have an account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Service providers (hosting, payment processing, analytics)</li>
                <li>Professional advisers (lawyers, accountants) when necessary</li>
                <li>Law enforcement when required by law</li>
                <li>Business partners with your consent</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We implement appropriate technical and organizational measures to protect
                your personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>SSL/TLS encryption for data in transit</li>
                <li>Encrypted database storage</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Under Australian Privacy Principles, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
                <li>Lodge a complaint with the OAIC</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use cookies and similar tracking technologies to enhance your experience.
                You can control cookies through your browser settings. Essential cookies are
                required for the website to function properly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our website may contain links to third-party services. We are not responsible
                for the privacy practices of these services. We encourage you to read their
                privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of
                any changes by posting the new policy on this page and updating the
                &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your
                privacy rights, please contact us:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Email:</strong> privacy@hamiltonbaileylegal.com.au<br />
                <strong>Phone:</strong> 1300 123 456<br />
                <strong>Address:</strong> Brisbane, Queensland, Australia
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
