import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, UserCheck, FileText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Hamilton Bailey Law Firm's privacy policy. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <Shield className="h-4 w-4 mr-2 text-tiffany" />
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Privacy Policy
            </h1>
            <p className="font-montserrat text-lg text-text-secondary">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Quick Summary */}
            <div className="bg-tiffany/10 border border-tiffany/20 rounded-xl p-6 mb-12">
              <h2 className="font-blair text-xl text-tiffany-dark mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Privacy at a Glance
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-tiffany mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Secure Storage</p>
                    <p className="text-sm text-gray-600">Your data is encrypted and securely stored</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <UserCheck className="h-5 w-5 text-tiffany mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Your Control</p>
                    <p className="text-sm text-gray-600">Access, correct, or delete your information</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-tiffany mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Legal Compliance</p>
                    <p className="text-sm text-gray-600">We comply with Australian privacy laws</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Hamilton Bailey Law Firm (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy
                  and personal information. This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our website, services, or interact with us.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We are bound by the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth)
                  and any applicable State or Territory privacy legislation.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">2. Information We Collect</h2>
                <h3 className="font-blair text-xl text-gray-800 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">We may collect the following types of personal information:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Name, address, email address, and phone number</li>
                  <li>Professional information (medical practice details, registration numbers)</li>
                  <li>Financial information (for billing purposes)</li>
                  <li>Information about your legal matter</li>
                  <li>Communications between you and our firm</li>
                  <li>Website usage data and analytics</li>
                </ul>

                <h3 className="font-blair text-xl text-gray-800 mb-3 mt-6">2.2 How We Collect Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">We collect personal information through:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Direct interactions (consultations, forms, emails, phone calls)</li>
                  <li>Our website and online portals</li>
                  <li>Third parties (referral sources, other professionals)</li>
                  <li>Publicly available sources</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">We use your personal information to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide legal services and advice</li>
                  <li>Communicate with you about your matter</li>
                  <li>Process payments and manage billing</li>
                  <li>Comply with our legal and regulatory obligations</li>
                  <li>Improve our services and website</li>
                  <li>Send relevant updates and information (with your consent)</li>
                  <li>Conduct conflict checks</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">4. Legal Professional Privilege</h2>
                <p className="text-gray-600 leading-relaxed">
                  Communications between you and our lawyers for the purpose of seeking or providing legal
                  advice are protected by legal professional privilege. We will not disclose privileged
                  information without your consent, except where required by law or court order.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">5. Disclosure of Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">We may disclose your personal information to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Courts, tribunals, and regulatory bodies (as required for your matter)</li>
                  <li>Other parties involved in your legal matter (with your consent)</li>
                  <li>Our professional advisers and service providers</li>
                  <li>Government authorities (where required by law)</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">6. Data Security</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We take reasonable steps to protect your personal information from misuse, interference,
                  loss, and unauthorised access, modification, or disclosure. Our security measures include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Encrypted data storage and transmission</li>
                  <li>Secure access controls and authentication</li>
                  <li>Regular security assessments and updates</li>
                  <li>Staff training on privacy and security</li>
                  <li>Physical security measures for our premises</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">7. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">Under Australian privacy law, you have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Access your personal information held by us</li>
                  <li>Request correction of inaccurate or incomplete information</li>
                  <li>Request deletion of your information (subject to legal requirements)</li>
                  <li>Opt out of marketing communications</li>
                  <li>Make a privacy complaint</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  To exercise these rights, please contact our Privacy Officer using the details below.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">8. Cookies and Website Analytics</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our website uses first-party cookies and similar technologies to improve your browsing experience,
                  analyse website traffic, and understand where our visitors come from. You can control
                  cookies through your browser settings.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  <strong>First-Party Analytics:</strong> We use our own self-hosted analytics system. Your usage data
                  is stored securely in our own database and is never shared with third-party analytics providers.
                  We collect anonymous usage data including pages visited, session duration, device type, and general
                  location (country/city level only). We do not store IP addresses or any personally identifiable
                  information in our analytics data.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  <strong>Session Cookies:</strong> We use session cookies to track your browsing session for analytics
                  purposes. These cookies expire when you close your browser and are not used to identify you personally.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">9. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain personal information for as long as necessary to fulfil the purposes for which
                  it was collected, including to satisfy any legal, accounting, or reporting requirements.
                  For legal files, we typically retain records for a minimum of 7 years after the matter
                  is closed, or longer where required by law or professional obligations.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes will be posted on this
                  page with an updated revision date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or wish to make a privacy complaint,
                  please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 mb-2">
                    <strong>Privacy Officer</strong>
                  </p>
                  <p className="text-gray-600">
                    Hamilton Bailey Law Firm
                    <br />
                    147 Pirie Street
                    <br />
                    Adelaide, South Australia 5000
                  </p>
                  <p className="text-gray-600 mt-4">
                    <strong>Phone:</strong> +61 8 5122 0056
                  </p>
                </div>
              </section>
            </div>

            {/* Related Links */}
            <div className="border-t border-gray-200 pt-8 mt-12">
              <h3 className="font-blair text-xl text-gray-800 mb-4">Related Pages</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                  Terms of Service
                </Link>
                <Link
                  href="/disclaimer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                  Disclaimer
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-600" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
