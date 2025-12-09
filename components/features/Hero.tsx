"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 hero-spacing overflow-hidden">
      {/* Force tiffany text color for secondary button */}
      <style jsx>{`
        .force-tiffany-text {
          color: #2d6a6a !important;
        }
        .force-tiffany-text:hover {
          color: #5ba5a5 !important;
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-tiffany-lighter/10 via-transparent to-transparent z-0" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-tiffany/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-tiffany-dark/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 animate-fade-up">
            <div className="inline-flex items-center px-4 py-2 bg-tiffany-lighter/30 rounded-full mb-8">
              <span className="text-tiffany-dark font-semibold text-sm tracking-wide">
                Hamilton Bailey Law Firm
              </span>
            </div>

            <h1 className="mb-8 leading-tight">
              Specialised Legal Services for Medical Practitioners
            </h1>

            <p className="text-xl text-gray-700 mb-12 max-w-xl leading-relaxed">
              Providing expert legal advice and documentation tailored to Australian medical
              practitioners, helping you organise practice management, compliance, and risk
              mitigation.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/services" className="btn-primary group">
                Explore Our Services
                <svg
                  className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5"
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

              <Link
                href="/book-appointment?type=initial-consultation"
                className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-tiffany-lighter
                   font-semibold py-4 px-8 rounded-xl transition-all duration-300
                   inline-flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                   focus:outline-none focus:ring-4 focus:ring-gray-200 group force-tiffany-text"
              >
                <span className="font-semibold">Book a Consultation</span>
                <svg
                  className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="#2d6a6a"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                <Image
                  src="/images/optimized/lukasz_wyszynski_tenant_doctor-800w.png"
                  alt="Medical professional in consultation"
                  className="w-full h-auto opacity-100 transition-opacity duration-300"
                  priority
                  width={600}
                  height={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              <div
                className="absolute -bottom-6 -left-6 glass-card p-4 sm:p-6 animate-fade-up hidden sm:block"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Trusted Legal Partner</p>
                    <p className="text-gray-600 text-xs">1000+ Healthcare Clients</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-6 -right-6 glass-card p-3 sm:p-4 animate-fade-up hidden sm:block"
                style={{ animationDelay: "0.7s" }}
              >
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-tiffany-dark">14+</p>
                  <p className="text-gray-600 text-xs">Years Experience</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-tiffany to-tiffany-light rounded-full opacity-10 blur-3xl" />
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-tiffany-dark to-tiffany rounded-full opacity-10 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
