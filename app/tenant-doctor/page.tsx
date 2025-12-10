import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  Building,
  Scale,
  ArrowRight,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tenant Doctor - Medical Practice Law | Hamilton Bailey",
  description:
    "Expert legal guidance on Tenant Doctor arrangements for Australian medical practices. Understand payroll tax compliance, service agreements, and operational independence requirements.",
  openGraph: {
    title: "Tenant Doctor - Medical Practice Law | Hamilton Bailey",
    description:
      "Expert legal guidance on Tenant Doctor arrangements for Australian medical practices.",
    type: "website",
  },
};

export default function TenantDoctorPage() {
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
              Tenant Doctor
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
                  Medical Practice Law
                </span>
              </div>
              <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-6">
                What is a Tenant Doctor?
              </h1>
              <p className="font-montserrat text-lg text-text-secondary dark:text-gray-300 mb-6 leading-relaxed">
                In the complex world of medical practice arrangements in Australia, the term
                &quot;Tenant Doctor&quot; refers to a specific model where a medical practitioner
                operates as an independent business within a medical centre.
              </p>
              <p className="font-montserrat text-text-secondary dark:text-gray-300 mb-8 leading-relaxed">
                Instead of being an employee or a contractor of the medical centre, the Tenant
                Doctor rents space and associated administrative support services from a service
                entity. This model is often structured around principles established in the
                <strong className="text-tiffany-dark dark:text-tiffany"> 1978 Phillips case</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact?service=Tenant+Doctor+Agreement"
                  className="inline-flex items-center justify-center px-6 py-3 bg-tiffany text-white font-semibold rounded-xl hover:bg-tiffany-dark transition-colors"
                >
                  Request Service Agreement
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
                Need Help With Tenant Doctor Agreements?
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
                href="/contact?service=Tenant+Doctor"
                className="block w-full text-center px-6 py-3 bg-tiffany-dark text-white font-semibold rounded-xl hover:bg-tiffany transition-colors"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Characteristics */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              Key Characteristics of a Tenant Doctor Arrangement
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Understanding these elements is critical for payroll tax compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building,
                title: "Operational Independence",
                description:
                  "The Tenant Doctor operates autonomously, managing their own patients, clinical decisions, and practice operations independently from the service entity.",
              },
              {
                icon: FileText,
                title: "Service Entity Relationship",
                description:
                  "A clear contractual arrangement with the service entity for premises rental and administrative support, not employment or contractor status.",
              },
              {
                icon: Scale,
                title: "Taxation Implications",
                description:
                  "Proper structuring can provide payroll tax exemptions and clear taxation obligations for both the practitioner and service entity.",
              },
              {
                icon: Shield,
                title: "Privacy Compliance",
                description:
                  "Clear delineation of data responsibilities and privacy obligations between the practitioner and service entity.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-tiffany" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-6">
                Why Tenant Doctor Arrangements Matter
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The distinction between a Tenant Doctor and other engagement models is crucial for
                payroll tax compliance. Recent audits and cases have highlighted the importance of
                proper structuring.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Notably, each payroll tax office ruling refers to principles established in
                foundational case law. This may explain why many legal and accounting advisers miss
                the originating authority that sets these guidelines.
              </p>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Medico-Legal Benefits
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  The Tenant Doctor model not only mitigates payroll tax risks but also clarifies
                  medico-legal responsibilities, particularly in shielding service entities from
                  liability for practitioners&apos; clinical negligence. Recent case law underscores
                  the importance of structuring arrangements to reflect genuine independence.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
                To Establish a Compliant Arrangement:
              </h3>
              <ul className="space-y-4 mb-8">
                {[
                  {
                    title: "Draft Clear Agreements",
                    description:
                      "Service agreements must clearly establish the tenant relationship, not employment or contractor status.",
                  },
                  {
                    title: "Separate Branding",
                    description:
                      "The practitioner should maintain distinct professional identity and branding where appropriate.",
                  },
                  {
                    title: "Fee Structures",
                    description:
                      "Rental and service fees should reflect genuine arm's-length commercial arrangements.",
                  },
                  {
                    title: "Operational Practices",
                    description:
                      "Day-to-day operations must demonstrate genuine independence in clinical and business decisions.",
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-tiffany" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.title}:
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Risks Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white">
                Risks of Non-Compliance
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Failure to structure agreements correctly exposes your practice to significant risks:
            </p>

            <div className="space-y-4">
              {[
                "Payroll tax audits and penalties from State Revenue Offices",
                "Privacy breaches due to unclear data responsibilities",
                "Legal disputes over employment status",
                "Medico-legal exposure for service entities",
                "Retrospective tax assessments with interest and penalties",
              ].map((risk, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-100 dark:border-amber-800"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 dark:text-gray-200">{risk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How We Help */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4">
              How Hamilton Bailey Can Help
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The Tenant Doctor model offers autonomy for practitioners and payroll tax protection
              for service entities—when properly structured.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Service Agreement Drafting",
                description:
                  "Our Tenant-Doctor Service Agreements are carefully curated to meet commercial and compliance requirements.",
              },
              {
                title: "Compliance Review",
                description:
                  "We review existing arrangements and provide advice on restructuring for compliance.",
              },
              {
                title: "Ongoing Support",
                description:
                  "Annual subscription service with legal, accounting, and compliance updates.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
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
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="font-blair text-3xl font-bold text-text-primary dark:text-white mb-4 text-center">
            Related Information
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
            Learn more about payroll tax and medical practice law
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Payroll Tax - Medical Practice Law",
                description: "Understanding payroll tax obligations for medical practices",
                href: "/medical-practice-law-payroll",
              },
              {
                title: "Payroll Tax - 21 Requirements",
                description: "Detailed requirements for payroll tax compliance",
                href: "/payroll-tax-21-requirements",
              },
              {
                title: "AHPRA Annual Declarations",
                description: "Compliance requirements for AHPRA declarations",
                href: "/ahpra",
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
            Unsure About Your Compliance?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            If you&apos;re unsure about compliance, seek expert advice. Contact Hamilton Bailey for
            streamlined support with your Tenant Doctor arrangements.
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
              href="/contact?service=Service+Agreement"
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
