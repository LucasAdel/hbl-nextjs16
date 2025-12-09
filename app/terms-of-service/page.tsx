import { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions for using Hamilton Bailey Law Firm's website and services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <Scale className="h-4 w-4 mr-2 text-tiffany" />
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Terms of Service
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
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-blair text-lg text-amber-800 mb-2">Important Notice</h3>
                  <p className="text-amber-700">
                    By using our website or engaging our services, you agree to these Terms of Service.
                    Please read them carefully. If you do not agree with any part of these terms, please
                    do not use our website or services.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">1. About These Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your use of the Hamilton Bailey Law Firm
                  website (www.hamiltonbailey.com) and the legal services we provide. These Terms
                  constitute a legally binding agreement between you and Hamilton Bailey Law Firm.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We may update these Terms from time to time. Continued use of our website or services
                  after any changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">2. Our Services</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Hamilton Bailey Law Firm provides legal services to medical practitioners and healthcare
                  organisations in Australia. Our services include but are not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Practice setup and structuring advice</li>
                  <li>Regulatory compliance assistance</li>
                  <li>Contract drafting and review</li>
                  <li>Employment law advice</li>
                  <li>Property and leasing matters</li>
                  <li>Dispute resolution</li>
                  <li>Legal document preparation</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">3. Client Engagement</h2>
                <h3 className="font-blair text-xl text-gray-800 mb-3">3.1 Engagement Letters</h3>
                <p className="text-gray-600 leading-relaxed">
                  Before we commence work on your matter, we will provide you with an engagement letter
                  setting out the scope of our services, our fees, and other relevant terms. A solicitor-client
                  relationship only exists once you have signed and returned the engagement letter.
                </p>

                <h3 className="font-blair text-xl text-gray-800 mb-3 mt-6">3.2 Your Responsibilities</h3>
                <p className="text-gray-600 leading-relaxed mb-4">As a client, you agree to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Respond promptly to our communications</li>
                  <li>Pay our fees in accordance with the engagement letter</li>
                  <li>Notify us of any changes to your contact details</li>
                  <li>Act in good faith throughout our engagement</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">4. Website Use</h2>
                <h3 className="font-blair text-xl text-gray-800 mb-3">4.1 Permitted Use</h3>
                <p className="text-gray-600 leading-relaxed">
                  You may use our website for lawful purposes only. You must not use our website in any
                  way that breaches any applicable law or regulation, or in any way that is fraudulent
                  or harmful.
                </p>

                <h3 className="font-blair text-xl text-gray-800 mb-3 mt-6">4.2 Prohibited Activities</h3>
                <p className="text-gray-600 leading-relaxed mb-4">You must not:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Copy, reproduce, or distribute website content without permission</li>
                  <li>Attempt to gain unauthorised access to our systems</li>
                  <li>Transmit any malware or harmful code</li>
                  <li>Use automated systems to access the website without permission</li>
                  <li>Impersonate any person or entity</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">5. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  All content on our website, including text, graphics, logos, images, and software, is
                  the property of Hamilton Bailey Law Firm or our licensors and is protected by Australian
                  and international copyright and intellectual property laws.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You may not reproduce, distribute, modify, or create derivative works from any content
                  on our website without our prior written consent.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">6. Fees and Payment</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our fees are set out in our engagement letters and may be charged on a:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Fixed fee basis</li>
                  <li>Time-based (hourly) basis</li>
                  <li>Capped fee arrangement</li>
                  <li>Retainer arrangement</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  All fees are quoted exclusive of GST unless otherwise stated. We will provide you with
                  itemised tax invoices for our services. Payment terms are set out in our engagement letter.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">7. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the maximum extent permitted by law, Hamilton Bailey Law Firm&apos;s liability for any
                  claim arising out of or in connection with our services is limited to the amount of
                  fees paid by you for the relevant services.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  We are not liable for any indirect, incidental, special, or consequential damages,
                  including loss of profits, revenue, or data.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Nothing in these Terms excludes or limits any liability that cannot be excluded or
                  limited under Australian law, including liability under the Australian Consumer Law.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">8. Professional Insurance</h2>
                <p className="text-gray-600 leading-relaxed">
                  Hamilton Bailey Law Firm holds professional indemnity insurance as required by the
                  Legal Practitioners Act and the rules of the relevant Law Society. Details of our
                  insurance can be provided upon request.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">9. Confidentiality</h2>
                <p className="text-gray-600 leading-relaxed">
                  We maintain strict confidentiality regarding all client matters. Information you share
                  with us will not be disclosed to third parties except as required to provide our
                  services, with your consent, or as required by law.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">10. Termination</h2>
                <p className="text-gray-600 leading-relaxed">
                  Either party may terminate our engagement by providing written notice. Upon termination,
                  you remain responsible for payment of all fees and disbursements incurred up to the
                  date of termination. We will provide you with all documents to which you are entitled.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">11. Dispute Resolution</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any concerns about our services, please contact us immediately. We are
                  committed to resolving any issues promptly and fairly. If we cannot resolve a dispute,
                  you may refer the matter to the relevant Law Society or Legal Services Commission.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">12. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These Terms are governed by the laws of South Australia. You agree to submit to the
                  exclusive jurisdiction of the courts of South Australia for any disputes arising
                  from these Terms or our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">13. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 mb-2">
                    <strong>Hamilton Bailey Law Firm</strong>
                  </p>
                  <p className="text-gray-600">
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
                  href="/privacy-policy"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                  Privacy Policy
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
