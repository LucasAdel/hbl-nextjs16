import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Hamilton Bailey Legal",
  description: "Terms of Service for Hamilton Bailey Legal services and website usage.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By accessing and using Hamilton Bailey Legal&apos;s website and services,
                you accept and agree to be bound by these Terms of Service. If you do not
                agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Description of Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hamilton Bailey Legal provides legal consulting services for healthcare
                professionals in Australia. Our services include but are not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                <li>AHPRA compliance consulting</li>
                <li>Telehealth legal compliance</li>
                <li>Privacy and data protection guidance</li>
                <li>Employment law for medical practices</li>
                <li>Practice management legal support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Not Legal Advice
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Important:</strong> Information provided through our website,
                including by our AI assistant &quot;Bailey,&quot; is for general informational
                purposes only and does not constitute legal advice. For specific legal
                matters, please book a consultation with our qualified legal professionals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. User Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When you create an account with us, you must provide accurate and complete
                information. You are responsible for maintaining the security of your account
                and password. You agree to notify us immediately of any unauthorized access
                to your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All content on this website, including text, graphics, logos, and software,
                is the property of Hamilton Bailey Legal and is protected by Australian and
                international copyright laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                To the maximum extent permitted by law, Hamilton Bailey Legal shall not be
                liable for any indirect, incidental, special, consequential, or punitive
                damages resulting from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                These terms shall be governed by and construed in accordance with the laws
                of Queensland, Australia. Any disputes shall be subject to the exclusive
                jurisdiction of the courts of Queensland.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We reserve the right to modify these terms at any time. We will notify
                users of any material changes by posting the new terms on this page with
                an updated date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Email:</strong> hello@hamiltonbaileylegal.com.au<br />
                <strong>Phone:</strong> 1300 123 456
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
