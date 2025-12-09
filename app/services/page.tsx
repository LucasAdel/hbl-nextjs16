import { Metadata } from "next";
import Link from "next/link";
import { Shield, Building, Users, Clock, ArrowRight } from "lucide-react";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Comprehensive legal services for Australian medical practitioners including practice setup, regulatory compliance, employment law, and more.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 pt-32 pb-16">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-tiffany/3" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10">
              <span className="font-montserrat text-sm font-semibold text-tiffany uppercase tracking-wider">
                Our Services
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Legal Services for Medical Practitioners
            </h1>
            <p className="font-montserrat text-lg text-text-secondary max-w-2xl mx-auto">
              Comprehensive legal support tailored specifically for Australian healthcare
              professionals and medical practices.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Building, value: "1000+", label: "Clients Served" },
              { icon: Clock, value: "20+", label: "Years Experience" },
              { icon: Shield, value: "95%", label: "Success Rate" },
              { icon: Users, value: "4.9★", label: "Client Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-tiffany/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-tiffany" />
                </div>
                <div className="text-3xl font-bold text-tiffany mb-1">{stat.value}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-tiffany-lighter to-tiffany/30 dark:from-tiffany/30 dark:to-tiffany/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <Icon className="h-7 w-7 text-tiffany-dark dark:text-tiffany" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-blair text-text-primary dark:text-white mb-2">{service.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{service.shortDescription}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <h3 className="text-sm font-semibold text-tiffany-dark dark:text-tiffany uppercase tracking-wider mb-4">
                      What We Offer
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.slice(0, 6).map((feature) => (
                        <li key={feature} className="flex items-center text-gray-700 dark:text-gray-300">
                          <div className="w-5 h-5 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="w-2 h-2 bg-tiffany rounded-full" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 bg-tiffany/10 dark:bg-tiffany/20 text-tiffany-dark dark:text-tiffany font-semibold rounded-lg hover:bg-tiffany/20 dark:hover:bg-tiffany/30 transition-colors"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                      href={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-tiffany-dark dark:text-tiffany font-semibold hover:text-tiffany transition-colors"
                    >
                      Enquire Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-tiffany-dark">
        <div className="container-custom text-center">
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-white mb-6">
            Need Help Choosing the Right Service?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Book a free consultation to discuss your practice&apos;s specific legal needs with our
            team of healthcare law specialists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Book a Consultation
            </Link>
            <Link
              href="/documents"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Browse Documents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
