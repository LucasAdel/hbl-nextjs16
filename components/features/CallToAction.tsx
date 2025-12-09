"use client";

import React from "react";
import Link from "next/link";

const CallToAction: React.FC = () => {
  return (
    <section
      className="py-20"
      style={{
        background: "rgb(29, 138, 127)",
      }}
    >
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="text-center lg:text-left max-w-2xl">
            <h2 className="font-blair text-3xl md:text-4xl font-normal text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="font-montserrat text-lg text-white/90">
              Contact our team today to discuss your legal needs as a medical practitioner in
              Australia.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Primary Button */}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-tiffany text-white font-montserrat font-semibold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl whitespace-nowrap"
            >
              Request a Consultation
            </Link>

            {/* Secondary Button */}
            <Link
              href="/documents"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-montserrat font-semibold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:bg-gray-50 whitespace-nowrap"
            >
              Browse Legal Documents
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
