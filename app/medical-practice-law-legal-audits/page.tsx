import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  FileSearch,
  FileText,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  ClipboardCheck,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Legal Audits - Medical Practice Law | Hamilton Bailey",
  description:
    "Professional legal audit services for Australian medical practices. Review of pathology lease agreements, service agreements, and compliance documentation.",
  openGraph: {
    title: "Legal Audits - Medical Practice Law | Hamilton Bailey",
    description:
      "Professional legal audit services for Australian medical practices.",
    type: "website",
  },
};

export default function LegalAuditsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-gray-500 hover:text-tiffany dark:text-gray-400"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link
                href="/services"
                className="text-gray-500 hover:text-tiffany dark:text-gray-400"
              >
                Services
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li className="text-gray-900 dark:text-white font-medium">Legal Audits</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-gray-900 dark:via-gray-900 dark:to-tiffany-dark/10 pt-16 pb-20">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-tiffany/3 dark:bg-tiffany/5" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-tiffany/10 dark:bg-tiffany/20">
                <FileSearch className="h-4 w-4 text-tiffany mr-2" />
                <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                  Compliance Services
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                Legal Audits for Medical Practices
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                If you are a Medical Practice that would like to engage our firm to conduct a legal
                audit of your existing agreements, we can provide comprehensive review and advice.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                Our legal audits identify potential compliance issues and provide actionable
                recommendations for risk mitigation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=Legal+Audit"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Request Legal Audit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-tiffany-dark dark:text-tiffany font-semibold rounded-xl border border-tiffany/20 hover:border-tiffany/40 transition-colors"
                >
                  Book Consultation
                </Link>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Request a Legal Audit
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-tiffany" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Call us</p>
                    <p className="font-semibold text-gray-900 dark:text-white">(08) 8523 3177</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-tiffany" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email us</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      office@hamiltonbailey.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-tiffany" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Response time</p>
                    <p className="font-semibold text-gray-900 dark:text-white">Within 24 hours</p>
                  </div>
                </div>
              </div>
              <Link
                href="/contact?service=Legal+Audit+Request"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Start Your Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Audit */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              What We Audit
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive review of key practice documentation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Pathology Lease Agreements",
                description:
                  "Review of existing pathology lease agreements for compliance and optimization opportunities.",
              },
              {
                icon: ClipboardCheck,
                title: "Service Agreements",
                description:
                  "Tenant-Doctor and contractor service agreements for payroll tax compliance.",
              },
              {
                icon: Shield,
                title: "Compliance Documentation",
                description:
                  "Overall business structure and regulatory compliance documentation review.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-14 h-14 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mb-6">
                  <item.icon className="h-7 w-7 text-tiffany" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Our Audit Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A structured approach to identifying and addressing compliance issues
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Initial Contact",
                  description:
                    "Fill out the contact form and we will contact you to answer any preliminary questions you may have.",
                },
                {
                  step: "2",
                  title: "Engagement",
                  description:
                    "Our office will forward you our Terms of Engagement to execute.",
                },
                {
                  step: "3",
                  title: "Document Review",
                  description:
                    "Upon receiving the executed Terms of Engagement and a copy of your documents, we will undertake the legal audit.",
                },
                {
                  step: "4",
                  title: "Letter of Advice",
                  description:
                    "We provide your Practice a detailed Letter of Advice outlining our findings and recommendations.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-6 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-12 h-12 bg-tiffany text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You Receive */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6">
                What You Receive
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                In conducting the legal audit, our firm will review your current agreements and
                provide your Practice a comprehensive Letter of Advice.
              </p>

              <ul className="space-y-4">
                {[
                  "Detailed analysis of your existing agreements",
                  "Identification of problematic issues for short and long-term",
                  "Strategy recommendations for addressing identified issues",
                  "Compliance gap analysis and remediation roadmap",
                  "Priority ranking of issues requiring attention",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-tiffany" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-tiffany/5 dark:bg-tiffany/10 rounded-xl p-8 border border-tiffany/20">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Letter of Advice Includes:
              </h3>
              <ul className="space-y-3">
                {[
                  "Executive summary of findings",
                  "Detailed analysis by document/agreement",
                  "Risk assessment for identified issues",
                  "Recommended remediation steps",
                  "Timeline and priority recommendations",
                  "Cost estimates for recommended work",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                    <CheckCircle className="h-5 w-5 text-tiffany flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4 text-center">
            Related Services
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
            Explore our other compliance services
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Pathology Lease & Rent",
                description: "Expert negotiation for pathology lease agreements",
                href: "/pathology-lease-rent",
              },
              {
                title: "Tenant Doctor Arrangements",
                description: "Understanding independent practitioner structures",
                href: "/tenant-doctor",
              },
              {
                title: "Payroll Tax Compliance",
                description: "Ensuring your business structure is tax compliant",
                href: "/medical-practice-law-payroll",
              },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-tiffany transition-colors">
                  {page.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{page.description}</p>
                <span className="inline-flex items-center text-tiffany font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-tiffany-dark">
        <div className="container-custom text-center">
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Audit Your Practice Documentation?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Please complete the contact form and one of our staff members will contact you to
            discuss your matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact?service=Legal+Audit"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Legal Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
