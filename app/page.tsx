import Hero from "@/components/features/Hero";
import TrustStats from "@/components/features/TrustStats";
import ServicesOverview from "@/components/features/ServicesOverview";
import AboutSection from "@/components/features/AboutSection";
import Testimonials from "@/components/features/Testimonials";
import CallToAction from "@/components/features/CallToAction";
import { MapboxMap } from "@/components/contact/MapboxMap";
import Link from "next/link";
import { FileText, Building, Briefcase, Users, MapPin, Phone, Clock, Mail, Shield, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />

      {/* Secondary hero block */}
      <section className="py-8 bg-gradient-to-br from-tiffany/5 to-white">
        <div className="container-custom">
          <div className="relative rounded-2xl bg-gradient-to-br from-tiffany/10 to-white p-8 md:p-12">
            <div className="inline-flex items-center rounded-full border border-transparent bg-tiffany/20 px-3 py-1 text-xs font-semibold text-tiffany-dark mb-4">
              Trusted by 1000+ Healthcare Professionals
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Legal Excellence for Healthcare Practitioners
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  From practice setup to AHPRA compliance, payroll tax to acquisitions -
                  comprehensive legal support tailored for Australian GPs and healthcare
                  professionals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  <Link
                    href="/book-appointment"
                    className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-11 rounded-md px-8"
                  >
                    Book Your Medical Law Consultation
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-2 h-5 w-5"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-11 rounded-md px-8 border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    View Legal Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustStats />
      <ServicesOverview />

      {/* Legal Documents Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider block mb-3">
              Legal Documents
            </span>
            <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tailored For Healthcare Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our comprehensive library of legal documents specifically designed for
              Australian medical practitioners and healthcare organisations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: FileText,
                title: "Wills & Estate Planning",
                count: 6,
                href: "/documents?category=wills-estate",
              },
              {
                icon: Building,
                title: "Corporate Law",
                count: 6,
                href: "/documents?category=corporate",
              },
              {
                icon: Briefcase,
                title: "Commercial Law",
                count: 4,
                href: "/documents?category=commercial",
              },
              {
                icon: Users,
                title: "Employment Law",
                count: 3,
                href: "/documents?category=employment",
              },
            ].map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-tiffany/20 transition-colors">
                  <category.icon className="h-6 w-6 text-tiffany" />
                </div>
                <h3 className="font-blair text-lg text-gray-900 mb-1">{category.title}</h3>
                <p className="text-sm text-gray-500">{category.count} documents</p>
              </Link>
            ))}
          </div>

          <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-blair text-xl text-gray-900 mb-2">Need a Specific Document?</h3>
            <p className="text-gray-600 mb-6">
              Browse our complete collection of legal documents designed for medical practitioners.
            </p>
            <Link
              href="/documents"
              className="inline-flex items-center justify-center px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
            >
              View All Documents
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <AboutSection />
      <Testimonials />

      {/* Get In Touch Section with Map */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-tiffany/10">
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Get In Touch
              </span>
            </div>
            <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re here to assist Australian medical practitioners with their legal needs.
              Reach out to discuss how we can support your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-tiffany/5 to-white rounded-2xl p-8 border border-gray-100">
                <h3 className="font-blair text-2xl text-gray-900 mb-6">Our Practice</h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <MapPin className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h4 className="font-blair text-lg text-gray-900 mb-1">Address</h4>
                      <p className="text-gray-600">
                        147 Pirie Street<br />
                        Adelaide, South Australia 5000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Phone className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h4 className="font-blair text-lg text-gray-900 mb-1">Phone</h4>
                      <p className="text-gray-600">+61 8 5122 0056</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Mail className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h4 className="font-blair text-lg text-gray-900 mb-1">Contact</h4>
                      <p className="text-gray-600">Use our contact form for enquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Clock className="h-6 w-6 text-tiffany" />
                    </div>
                    <div>
                      <h4 className="font-blair text-lg text-gray-900 mb-1">Business Hours</h4>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 5:00 PM<br />
                        Saturday & Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2 text-tiffany" />
                    <span>CSRF Protected</span>
                    <span className="mx-2">•</span>
                    <Lock className="h-4 w-4 mr-2 text-tiffany" />
                    <span>256-bit Encryption</span>
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              >
                Send Us a Message
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Map Section */}
            <div className="relative h-full min-h-[400px]">
              <MapboxMap className="h-full min-h-[400px] rounded-2xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}
