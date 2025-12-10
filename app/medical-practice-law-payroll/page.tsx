import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  Calculator,
  Scale,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Building,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Payroll Tax - Medical Practice Law | Hamilton Bailey",
  description:
    "Expert legal guidance on payroll tax compliance for Australian medical practices. Protect your practice from audits with properly structured Tenant-Doctor Service Agreements.",
  openGraph: {
    title: "Payroll Tax - Medical Practice Law | Hamilton Bailey",
    description:
      "Expert legal guidance on payroll tax compliance for Australian medical practices.",
    type: "website",
  },
};

export default function MedicalPracticeLawPayrollPage() {
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
              Payroll Tax - Medical Practice Law
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
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                <span className="font-montserrat text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Tax Authority Focus Area
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                Payroll Tax &amp; Medical Practice Law
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                We are aware of the recent focus of Australian Tax Authorities (Federal and State)
                in relation to Tax Bills being sent to medical practices and businesses.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                This is occurring predominantly due to Tax Authorities analysing business structures
                and determining that practitioners may be deemed employees rather than independent
                contractors for payroll tax purposes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=Payroll+Tax+Compliance"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Request Compliance Review
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
                Concerned About Payroll Tax?
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
                href="/contact?service=Payroll+Tax"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Evidence Used by Tax Authorities
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Common evidence examined during payroll tax audits includes:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Service Agreements",
                description: "Lack of a valid and binding service agreement between parties",
              },
              {
                icon: Building,
                title: "Operational Structure",
                description: "Lack of appropriate operational independence and autonomy",
              },
              {
                icon: Calculator,
                title: "Fee Arrangements",
                description: "Lack of definite arm's-length fee structures",
              },
              {
                icon: Shield,
                title: "Branding & Identity",
                description: "Inadequate separation of practitioner and practice branding",
              },
              {
                icon: Scale,
                title: "Control Indicators",
                description: "Evidence of control over how, when, and where work is performed",
              },
              {
                icon: AlertTriangle,
                title: "Historical Patterns",
                description: "Retrospective analysis of payment patterns and arrangements",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6">
                Our Tenant-Doctor Service Agreements
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We acknowledge the traditional service agreements drafted by law firms. However, we
                recognized that the traditional &quot;one size fits all&quot; approach no longer
                meets the evolving requirements of Tax Authorities.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Unlike traditional service agreements, our Tenant-Doctor Service Agreements continue
                to be updated and carefully curated to meet commercial and compliance requirements.
              </p>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Key Differentiators
                </h3>
                <ul className="space-y-3">
                  {[
                    "Neither employment nor contractor agreements - avoiding mischaracterisation",
                    "Capacity for convenient and cost-effective updates",
                    "Legal, accounting, and compliance changes incorporated",
                    "Technology platform enabled sign-off process",
                    "Annual subscription for ongoing compliance",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-tiffany flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Fee Structure</h3>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our fees are based on a scale, subject to the number of Medical Practitioners
                  requiring a Tenant-Doctor Service Agreement at a single location/Premises.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We have a reduced upfront cost for the first year, then in the second year onwards
                  we charge a small annual subscription fee (payable monthly) which entitles your
                  practice to receive updates.
                </p>
                <div className="bg-tiffany/5 dark:bg-tiffany/10 rounded-lg p-4 mt-4">
                  <p className="text-sm text-tiffany-dark dark:text-tiffany font-medium">
                    Contact us for a quote based on your practice size and requirements.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
                  Important Notice
                </h4>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  For a Tenant-Doctor (or similar business structure) to maintain ongoing legal
                  compliance, it has been deemed by relevant Authorities that an annual review is
                  required. This is why we offer our subscription service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="py-20 bg-white dark:bg-gray-900">
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
                title: "Payroll Tax - 21 Requirements",
                description: "Detailed compliance requirements for accountants and practices",
                href: "/payroll-tax-21-requirements",
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
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 group"
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
            Protect Your Practice from Payroll Tax Issues
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Don&apos;t wait for an audit notice. Contact Hamilton Bailey to ensure your practice
            arrangements are compliant with current requirements.
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
              href="/contact?service=Tenant+Doctor+Agreement"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Request Service Agreement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
