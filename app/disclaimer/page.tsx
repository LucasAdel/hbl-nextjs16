import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, FileText, Mail, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Legal disclaimer for Hamilton Bailey Law Firm's website and services.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <AlertTriangle className="h-4 w-4 mr-2 text-tiffany" />
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Legal
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Disclaimer
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
            {/* Key Notice */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-12">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-blair text-lg text-red-800 mb-2">Important Legal Notice</h3>
                  <p className="text-red-700">
                    The information on this website is general in nature and is not intended to
                    constitute legal advice. You should seek independent legal advice specific to
                    your circumstances before acting on any information contained on this website.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">1. General Information Only</h2>
                <p className="text-gray-600 leading-relaxed">
                  The content on the Hamilton Bailey Law Firm website is provided for general
                  informational purposes only. It is not intended to be a substitute for professional
                  legal advice and should not be relied upon as such.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  While we strive to keep the information on our website accurate and up to date,
                  laws and regulations change frequently. We make no representations or warranties
                  about the accuracy, completeness, or suitability of the information for any purpose.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">2. No Solicitor-Client Relationship</h2>
                <p className="text-gray-600 leading-relaxed">
                  Viewing this website or contacting us through the website does not create a
                  solicitor-client relationship between you and Hamilton Bailey Law Firm. A
                  solicitor-client relationship is only established when:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>We have agreed to act for you in writing</li>
                  <li>You have signed an engagement letter</li>
                  <li>A conflict check has been completed</li>
                  <li>Any required retainer has been paid</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">3. No Legal Advice</h2>
                <p className="text-gray-600 leading-relaxed">
                  Nothing on this website constitutes legal advice. The information provided is
                  general in nature and may not apply to your specific situation. Legal advice
                  can only be given after considering your individual circumstances.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  If you require legal advice, please contact us to arrange a consultation where
                  we can properly assess your situation and provide tailored advice.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">4. Australian Law Only</h2>
                <p className="text-gray-600 leading-relaxed">
                  Hamilton Bailey Law Firm is licensed to practice law in Australia only. The
                  information on this website relates to Australian law and may not be applicable
                  in other jurisdictions.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  If you are located outside Australia or your matter involves international
                  elements, you should seek advice from lawyers qualified in the relevant jurisdiction.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">5. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  To the fullest extent permitted by law, Hamilton Bailey Law Firm excludes all
                  liability for any loss or damage arising from your use of this website or
                  reliance on its content, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-4">
                  <li>Direct, indirect, or consequential loss</li>
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or corruption of data</li>
                  <li>Any errors, omissions, or inaccuracies in the content</li>
                  <li>Interruption or unavailability of the website</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">6. Third-Party Links</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our website may contain links to third-party websites. These links are provided
                  for your convenience only. We have no control over the content of these websites
                  and accept no responsibility for them or for any loss or damage that may arise
                  from your use of them.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  The inclusion of any link does not imply our endorsement of the linked website
                  or its content.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">7. Document Templates</h2>
                <p className="text-gray-600 leading-relaxed">
                  Legal document templates available on our website are provided as a starting
                  point only. They may require modification to suit your specific circumstances.
                  We recommend having any document reviewed by a lawyer before use.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Use of document templates does not create a solicitor-client relationship
                  unless you have separately engaged our services.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">8. Privacy and Confidentiality</h2>
                <p className="text-gray-600 leading-relaxed">
                  Information you submit through our website is not protected by solicitor-client
                  privilege until a solicitor-client relationship is established. Please do not
                  send confidential information through our website contact forms.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4">
                  For more information about how we handle your personal information, please see
                  our <Link href="/privacy-policy" className="text-tiffany hover:text-tiffany-dark">Privacy Policy</Link>.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">9. Changes to This Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this disclaimer from time to time. Any changes will be posted on
                  this page with an updated revision date. Your continued use of the website
                  after any changes constitutes acceptance of the modified disclaimer.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">10. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  This disclaimer is governed by the laws of South Australia. Any disputes
                  arising from your use of this website will be subject to the exclusive
                  jurisdiction of the courts of South Australia.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="font-blair text-2xl text-text-primary mb-4">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this disclaimer or need legal assistance,
                  please contact us:
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

            {/* Seek Legal Advice CTA */}
            <div className="bg-tiffany/10 border border-tiffany/20 rounded-xl p-8 mt-12">
              <div className="flex items-start">
                <Info className="h-8 w-8 text-tiffany mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-blair text-xl text-tiffany-dark mb-3">
                    Need Legal Advice?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    If you require legal advice specific to your situation, we encourage you to
                    book a consultation with our team. We can provide tailored advice based on
                    your individual circumstances.
                  </p>
                  <Link
                    href="/book-appointment"
                    className="inline-flex items-center px-6 py-3 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors"
                  >
                    Book a Consultation
                  </Link>
                </div>
              </div>
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
                  href="/terms-of-service"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                  Terms of Service
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
