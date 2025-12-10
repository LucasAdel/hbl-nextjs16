import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  FileCheck,
  Calculator,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Payroll Tax - 21 Requirements | Hamilton Bailey",
  description:
    "Detailed payroll tax compliance requirements for Medical Sector Accountants. Learn about PT21 Compliance Certificates and annual review processes.",
  openGraph: {
    title: "Payroll Tax - 21 Requirements | Hamilton Bailey",
    description:
      "Detailed payroll tax compliance requirements for Medical Sector Accountants.",
    type: "website",
  },
};

export default function PayrollTax21RequirementsPage() {
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
            <li className="text-gray-900 dark:text-white font-medium">
              Payroll Tax - 21 Requirements
            </li>
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
                <Calculator className="h-4 w-4 text-tiffany mr-2" />
                <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                  For Accountants
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                Payroll Tax 21 Requirements
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                This page is specifically targeted towards Australian qualified Accountants who are
                considered Medical Sector Accountants and work exclusively with medical practices.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                In our firm&apos;s attempt to expand, we have been actively searching for Accountants
                able to review clients&apos; financial documentation according to the 21 requirements
                outlined by relevant Tax Authorities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=PT21+Compliance"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Partner With Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-tiffany-dark dark:text-tiffany font-semibold rounded-xl border border-tiffany/20 hover:border-tiffany/40 transition-colors"
                >
                  Book Discussion
                </Link>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Are You a Medical Sector Accountant?
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
                href="/contact?service=Accountant+Partnership"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Express Interest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Process */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              The Certification Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Understanding the dual certification requirement for payroll tax compliance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                  <Calculator className="h-7 w-7 text-tiffany" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Accountant Certification
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our interpretation of relevant case law and rulings suggests that certifications
                from accountants must verify compliance with the 21 financial and operational
                requirements.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Upon the Client&apos;s Accountant providing our office a PT21 Compliance Certificate,
                we will then finalise our mutual Client&apos;s annual legal-audit review.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center">
                  <FileCheck className="h-7 w-7 text-tiffany" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Legal Certification
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hamilton Bailey provides the legal certification component, reviewing the
                Service Agreement and overall compliance structure.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                This certification accompanied by the Service Agreement is then forwarded to the
                relevant Tax Authority in support of the Client&apos;s claim of compliance.
              </p>
            </div>
          </div>

          <div className="bg-tiffany/5 dark:bg-tiffany/10 rounded-xl p-6 border border-tiffany/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-tiffany flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Why Dual Certification?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Such expectations are predominantly due to the workload experienced by the relevant
                  Tax Authorities, and the justification that a particular arrangement is compliant
                  should be independently verified by qualified professionals in both accounting
                  and law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 21 Requirements Overview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6 text-center">
              The 21 Requirements Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
              Key areas that must be certified for payroll tax compliance
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Valid and binding Service Agreement in place",
                "Clear delineation of independent contractor status",
                "Arm's-length fee arrangements documented",
                "Operational independence demonstrated",
                "Separate ABN registration verified",
                "Professional indemnity insurance held by practitioner",
                "Control over work methods retained by practitioner",
                "Equipment and tools ownership clarified",
                "Risk of profit/loss borne by practitioner",
                "Right to delegate or subcontract",
                "Ability to work for other practices",
                "No exclusivity clauses (unless commercially justified)",
                "Billing arrangements properly structured",
                "Patient records ownership defined",
                "Marketing and branding separation",
                "Leave and entitlements not provided (as employee would receive)",
                "Superannuation arrangements compliant",
                "GST registration and treatment",
                "Medicare billing compliant",
                "Privacy Act compliance documented",
                "Two additional specific requirements (discussed in consultation)",
              ].map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-6 h-6 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-tiffany">{index + 1}</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{requirement}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800">
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                <strong>Note:</strong> There are two further requirements in addition to the above.
                However, for purposes of brevity these further points can be discussed in
                consultation with interested parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Opportunity */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Partnership Opportunity for Accountants
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;re seeking qualified accountants to partner with for client compliance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Joint Client Service",
                description:
                  "Work together to provide comprehensive compliance services to mutual clients",
              },
              {
                icon: CheckCircle,
                title: "Clear Process",
                description:
                  "Established workflow for PT21 certification and annual review processes",
              },
              {
                icon: FileCheck,
                title: "Professional Recognition",
                description:
                  "Certification process recognized by relevant Tax Authorities",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-100 dark:border-gray-700"
              >
                <div className="w-14 h-14 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-tiffany" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4 text-center">
            Related Information
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
            Learn more about medical practice compliance
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "What is a Tenant Doctor?",
                description: "Understanding the Tenant Doctor model and its benefits",
                href: "/tenant-doctor",
              },
              {
                title: "Payroll Tax - Medical Practice Law",
                description: "Overview of payroll tax issues for medical practices",
                href: "/medical-practice-law-payroll",
              },
              {
                title: "Legal Audits",
                description: "Our legal audit services for medical practices",
                href: "/medical-practice-law-legal-audits",
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
            Interested in Becoming a Certification Partner?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            If you believe you can satisfy the 21 requirements in your annual review and certify
            our joint clients, we&apos;d love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact?service=Accountant+Partnership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Express Interest
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book Discussion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
