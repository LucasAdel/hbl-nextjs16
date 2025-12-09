"use client";

import React from "react";
import Image from "next/image";

const AboutSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Illustration */}
          <div className="relative">
            {/* Corner decorative line */}
            <div className="absolute -top-4 -left-4 w-16 h-16">
              <div className="absolute top-0 left-4 w-px h-12 bg-tiffany/30" />
              <div className="absolute top-4 left-0 w-12 h-px bg-tiffany/30" />
            </div>

            {/* Image container with rounded corners and shadow */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-tiffany-lighter/20 to-white">
              <Image
                src="/images/healthcare-team.png"
                alt="Healthcare professionals team - doctors, nurses and medical practitioners"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Bottom right decorative element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-tiffany/5 rounded-full blur-2xl" />
          </div>

          {/* Right Column - Content */}
          <div className="lg:pt-4">
            {/* Our Story Heading - Serif style like screenshot */}
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-gray-900 mb-8 tracking-tight">
              <span className="font-normal">O</span>
              <span className="text-[0.85em]">UR</span>
              {" "}
              <span className="font-normal">S</span>
              <span className="text-[0.85em]">TORY</span>
            </h2>

            {/* First paragraph */}
            <p className="font-montserrat text-base text-gray-700 leading-relaxed mb-6">
              Hamilton Bailey emerged from a recognition that Australian medical practitioners
              needed specialised legal support that truly understood the unique challenges of
              the healthcare sector, particularly in areas of payroll tax and practice management.
            </p>

            {/* Second paragraph */}
            <p className="font-montserrat text-base text-gray-700 leading-relaxed mb-6">
              With experience across international jurisdictions including Australia, Dubai,
              Qingdao, Mumbai, &amp; Saigon, our team brings a global perspective to local legal
              challenges faced by medical practitioners and healthcare organisations.
            </p>

            {/* Third paragraph */}
            <p className="font-montserrat text-base text-gray-700 leading-relaxed mb-10">
              Today, we are proud to serve medical practitioners across Australia, providing
              tailored legal solutions that enhance practice management, ensure compliance,
              and protect professional interests. We help organise practice structures with
              particular expertise in payroll tax, property law for medical practices, and
              corporate arrangements.
            </p>

            {/* Vision & Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Our Vision */}
              <div className="relative pl-6 border-l-2 border-gray-200">
                <h3 className="font-serif text-xl text-tiffany-dark mb-3 tracking-wide">
                  <span className="font-normal">O</span>
                  <span className="text-[0.85em]">UR</span>
                  {" "}
                  <span className="font-normal">V</span>
                  <span className="text-[0.85em]">ISION</span>
                </h3>
                <p className="font-montserrat text-sm text-gray-600 leading-relaxed">
                  To be the premier legal resource for Australian medical practitioners,
                  renowned for our specialised expertise and practical solutions.
                </p>
              </div>

              {/* Our Values */}
              <div className="relative pl-6 border-l-2 border-gray-200">
                <h3 className="font-serif text-xl text-tiffany-dark mb-3 tracking-wide">
                  <span className="font-normal">O</span>
                  <span className="text-[0.85em]">UR</span>
                  {" "}
                  <span className="font-normal">V</span>
                  <span className="text-[0.85em]">ALUES</span>
                </h3>
                <p className="font-montserrat text-sm text-gray-600 leading-relaxed">
                  Integrity, expertise, practicality, and a commitment to understanding
                  the unique needs of healthcare professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
