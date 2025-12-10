import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  FileText,
  Building,
  TrendingUp,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  DollarSign,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pathology Lease & Rent Negotiations | Hamilton Bailey",
  description:
    "Expert legal guidance on pathology lease agreements and rent negotiations for Australian medical practices. Maximize your rental returns while maintaining compliance.",
  openGraph: {
    title: "Pathology Lease & Rent Negotiations | Hamilton Bailey",
    description:
      "Expert legal guidance on pathology lease agreements and rent negotiations for Australian medical practices.",
    type: "website",
  },
};

export default function PathologyLeaseRentPage() {
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
              Pathology Lease &amp; Rent
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
                <Building className="h-4 w-4 text-tiffany mr-2" />
                <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                  Property &amp; Leasing
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                Pathology Lease &amp; Rent Negotiations
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                Our office has observed a dramatic rise in Medical Practices receiving
                &quot;Please explain&quot; letters from the Department of Health relating to their
                rental agreements with pathology providers.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                We provide expert representation in negotiating mutually beneficial lease
                agreements while ensuring compliance with regulatory requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=Pathology+Lease"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Request Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-tiffany-dark dark:text-tiffany font-semibold rounded-xl border border-tiffany/20 hover:border-tiffany/40 transition-colors"
                >
                  Book Appointment
                </Link>
              </div>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Received a &quot;Please Explain&quot; Letter?
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
                href="/contact?service=Pathology+Lease+Urgent"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Get Urgent Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white">
                The Challenge with Pathology Rent
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The logical solution to a &quot;Please explain&quot; letter from a Government
              Agency/Department requesting you to provide rationale as to the agreed upon annual
              pathology rent is to provide accurate, justified documentation.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              In our experience, where a business charges approximately $20,000 per annum for their
              premises, in most cases the business (landlord) could be charging significantly more
              with proper structuring and justification.
            </p>

            <div className="bg-tiffany/5 dark:bg-tiffany/10 rounded-xl p-6 border border-tiffany/20">
              <h3 className="font-semibold text-tiffany-dark dark:text-tiffany mb-3">
                Our Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upon our firm completing processes and final negotiations with Pathology Providers,
                the average rental sums paid to our clients by the Pathology Providers have
                significantly increased. There have been several cases where our firm successfully
                negotiated annual rents substantially above initial offers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Our Process
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A systematic approach to pathology lease negotiations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Initial Assessment",
                description:
                  "Preliminary analysis of your business's unique circumstances and review of provided documents",
              },
              {
                step: "2",
                title: "Valuation Research",
                description:
                  "Verify results with our Australian-wide database and market comparisons",
              },
              {
                step: "3",
                title: "Negotiation",
                description:
                  "Expert representation in negotiations with Pathology Providers on your behalf",
              },
              {
                step: "4",
                title: "Documentation",
                description:
                  "Draft compliant Lease/Sublease Agreement with proper valuation justification",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-10 h-10 bg-tiffany text-white rounded-full flex items-center justify-center font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Considerations */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6">
                Key Considerations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Proper structuring of pathology lease arrangements requires attention to several
                critical elements:
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: FileText,
                    title: "Proper Lease Documentation",
                    description:
                      "Have a qualified solicitor draft a Lease/Sublease Agreement between the landlord and the Pathology Laboratory tenant with appropriate medical sector expertise.",
                  },
                  {
                    icon: DollarSign,
                    title: "Valuation Justification",
                    description:
                      "Ensure the landlord has justified the valuation as proposed within the Lease document. This is critically important for regulatory compliance.",
                  },
                  {
                    icon: Scale,
                    title: "Market Rate Analysis",
                    description:
                      "Understanding of commercial rental rates specific to medical and pathology premises in your area.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <div className="w-10 h-10 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-tiffany" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Fixed-Fee Service
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We provide a Fixed-Fee service that includes the entirety of the
                  &quot;Pathology Lease Terms&quot; Negotiations.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Upon our preliminary analysis of your business&apos;s unique circumstances and
                  review of your provided documents, we will provide you a written quote prior to
                  commencing work.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
                  Important Note
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  The Department of Health&apos;s Redbook Policy Guide (2018) is not legislation or
                  regulation, and was drafted for the purpose of assisting the Department.
                  Professional legal advice is essential for proper compliance.
                </p>
              </div>
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
            Learn more about our property and leasing services
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Legal Audits",
                description: "Comprehensive legal audits for pathology lease agreements",
                href: "/medical-practice-law-legal-audits",
              },
              {
                title: "Property & Leasing",
                description: "Full property and leasing services for medical practices",
                href: "/services/property-leasing",
              },
              {
                title: "Tenant Doctor Arrangements",
                description: "Understanding independent practitioner structures",
                href: "/tenant-doctor",
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
            Maximize Your Pathology Rental Returns
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            If you are attracted to the idea of having our firm represent you in negotiating a
            mutually beneficial Lease Agreement between your business and Pathology Laboratory,
            contact us today.
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
              href="/contact?service=Pathology+Lease+Negotiation"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
