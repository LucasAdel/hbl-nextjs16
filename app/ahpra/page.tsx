import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  FileCheck,
  Building,
  Users,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Shield,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AHPRA Annual Declarations | Hamilton Bailey",
  description:
    "Expert guidance on AHPRA compliance requirements for Australian medical practitioners. Understand your annual declaration obligations under National Law.",
  openGraph: {
    title: "AHPRA Annual Declarations | Hamilton Bailey",
    description:
      "Expert guidance on AHPRA compliance requirements for Australian medical practitioners.",
    type: "website",
  },
};

export default function AHPRAPage() {
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
              AHPRA Annual Declarations
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
                <Shield className="h-4 w-4 text-tiffany mr-2" />
                <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                  Regulatory Compliance
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                AHPRA Annual Declarations
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                Compliance Overview based on National Law for Australian health practitioners.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                Understanding your declaration obligations is essential for maintaining your
                professional registration and avoiding regulatory issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=AHPRA+Compliance"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Request Assessment
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
                Need Help With AHPRA Compliance?
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
                href="/contact?service=AHPRA+Declarations"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Declaration Requirements */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Key Declaration Requirements
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Essential disclosures for self-employed health practitioners
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Self-Employment Status",
                description:
                  "Provide a clear written statement confirming your status as self-employed. This declaration affirms your independent working arrangement when responding to AHPRA enquiries.",
              },
              {
                icon: Building,
                title: "Practice Addresses",
                description:
                  "Disclose the address of every premises where you practise. This includes primary clinics, secondary locations, and any addresses used for providing remote or telehealth services.",
              },
              {
                icon: FileCheck,
                title: "Business Names",
                description:
                  "Document any business name(s) under which you operate professionally. If operating through a practice company, disclose the company name(s) used for professional services.",
              },
              {
                icon: Users,
                title: "Shared Premises Practitioners",
                description:
                  "List the full names of all other registered health practitioners with whom you share premises and associated cost arrangements. This applies even if cost-sharing arrangements are informal.",
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

      {/* Why Compliance Matters */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6">
                Why AHPRA Compliance Matters
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Accurate and complete annual declarations are crucial for maintaining your
                professional standing and avoiding regulatory complications.
              </p>

              <ul className="space-y-4">
                {[
                  "Protects your professional registration status",
                  "Demonstrates commitment to regulatory compliance",
                  "Supports transparency in healthcare delivery",
                  "Facilitates regulatory oversight and public protection",
                  "Aligns with payroll tax and business structure requirements",
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

            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Common Declaration Mistakes
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Incomplete disclosure of all practice locations",
                  "Failure to update business name changes",
                  "Omitting telehealth service addresses",
                  "Not declaring cost-sharing arrangements",
                  "Inconsistency with payroll tax documentation",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                  >
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              How Hamilton Bailey Can Help
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive support for your AHPRA compliance requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Compliance Assessment",
                description:
                  "We review your current declarations and business structure to identify any compliance gaps.",
              },
              {
                title: "Documentation Support",
                description:
                  "Assistance preparing accurate declarations that align with your legal and tax structures.",
              },
              {
                title: "Ongoing Guidance",
                description:
                  "Regular updates on regulatory changes and annual review support for continued compliance.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-tiffany" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
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
                title: "Tenant Doctor Arrangements",
                description: "Understanding independent practitioner structures",
                href: "/tenant-doctor",
              },
              {
                title: "Payroll Tax Compliance",
                description: "Ensuring your business structure is tax compliant",
                href: "/medical-practice-law-payroll",
              },
              {
                title: "Regulatory Compliance Services",
                description: "Comprehensive compliance support for medical practices",
                href: "/services/regulatory-compliance",
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
            Need Help With Your AHPRA Declarations?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            If you would like to discuss your business compliance requirements, contact our team
            for expert guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact?service=AHPRA+Assessment"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
