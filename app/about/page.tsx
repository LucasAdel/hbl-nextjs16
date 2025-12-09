import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Hamilton Bailey Law Firm - a specialised law firm dedicated to serving the unique legal needs of Australian medical practitioners.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Our Story Section - Main Hero */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Illustration */}
            <div className="relative">
              {/* Corner decorative line */}
              <div className="absolute -top-4 -left-4 w-16 h-16">
                <div className="absolute top-0 left-4 w-px h-12 bg-tiffany/30" />
                <div className="absolute top-4 left-0 w-12 h-px bg-tiffany/30" />
              </div>

              {/* Image container */}
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
              {/* Our Story Heading */}
              <h1 className="font-serif text-4xl md:text-5xl font-normal text-gray-900 mb-8 tracking-tight">
                <span className="font-normal">O</span>
                <span className="text-[0.85em]">UR</span>
                {" "}
                <span className="font-normal">S</span>
                <span className="text-[0.85em]">TORY</span>
              </h1>

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
                  <h2 className="font-serif text-xl text-tiffany-dark mb-3 tracking-wide">
                    <span className="font-normal">O</span>
                    <span className="text-[0.85em]">UR</span>
                    {" "}
                    <span className="font-normal">V</span>
                    <span className="text-[0.85em]">ISION</span>
                  </h2>
                  <p className="font-montserrat text-sm text-gray-600 leading-relaxed">
                    To be the premier legal resource for Australian medical practitioners,
                    renowned for our specialised expertise and practical solutions.
                  </p>
                </div>

                {/* Our Values */}
                <div className="relative pl-6 border-l-2 border-gray-200">
                  <h2 className="font-serif text-xl text-tiffany-dark mb-3 tracking-wide">
                    <span className="font-normal">O</span>
                    <span className="text-[0.85em]">UR</span>
                    {" "}
                    <span className="font-normal">V</span>
                    <span className="text-[0.85em]">ALUES</span>
                  </h2>
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

      {/* Principal Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-gray-900 mb-8 tracking-tight">
                <span className="font-normal">O</span>
                <span className="text-[0.85em]">UR</span>
                {" "}
                <span className="font-normal">P</span>
                <span className="text-[0.85em]">RINCIPAL</span>
              </h2>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-base">
                  Welcome to Hamilton Bailey – where legal expertise meets the unique needs of
                  Australian medical practitioners. As Principal of our firm, I am privileged
                  to lead a dedicated team of legal professionals who share a singular focus:
                  providing exceptional legal services tailored specifically for the healthcare sector.
                </p>

                <p className="text-base">
                  With over a decade of experience in medical practice law, payroll tax matters,
                  and corporate commercial law, our team brings specialised expertise to complex
                  legal challenges. Having worked across international jurisdictions including
                  Australia, Dubai, and Asia, we understand both local regulatory frameworks and
                  cross-border considerations that affect modern healthcare practices.
                </p>

                <div className="bg-white border-l-4 border-tiffany p-6 my-8 rounded-r-lg shadow-sm">
                  <p className="italic text-gray-800 leading-relaxed">
                    &ldquo;We see ourselves not just as legal advisors, but as trusted partners in your
                    professional journey – committed to protecting your interests and enabling your
                    practice to thrive in a challenging healthcare landscape.&rdquo;
                  </p>
                </div>

                <p className="text-base">
                  On behalf of our entire team, I thank you for considering Hamilton Bailey as your
                  legal partner. We look forward to the opportunity to discuss your specific needs
                  and demonstrate how our specialised approach can benefit your practice.
                </p>

                <Link
                  href="/book-appointment"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg mt-4"
                >
                  Schedule a Consultation
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-xl bg-white">
                <Image
                  src="/images/lukasz-wyszynski.png"
                  alt="Lukasz Wyszynski - Principal & Founder"
                  width={500}
                  height={600}
                  className="w-full h-auto object-contain"
                />
                <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                  <h3 className="font-blair text-xl font-bold text-gray-900">Lukasz Wyszynski</h3>
                  <p className="text-tiffany font-semibold text-sm mt-1">Principal & Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Practice */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              <span className="font-normal">A</span>
              <span className="text-[0.85em]">REAS OF</span>
              {" "}
              <span className="font-normal">P</span>
              <span className="text-[0.85em]">RACTICE</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialised legal expertise for Australian medical practitioners across multiple domains.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-12 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Medical Practice Focused */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-tiffany" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-blair text-xl text-gray-900">Medical Practice Focused</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Payroll Tax (Medical/Healthcare-Sector)",
                      "Property (Medical/Healthcare-Sector)",
                      "Practice Establishment & Management",
                    ].map((item) => (
                      <li key={item} className="flex items-start text-gray-700">
                        <div className="w-6 h-6 bg-tiffany/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="w-2 h-2 bg-tiffany rounded-full" />
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Business & Innovation */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-tiffany/10 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-tiffany" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-blair text-xl text-gray-900">Business & Innovation</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Corporate & Commercial Law",
                      "Financial Securities",
                      "Start-up Law (IP/I.T./A.I.)",
                    ].map((item) => (
                      <li key={item} className="flex items-start text-gray-700">
                        <div className="w-6 h-6 bg-tiffany/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <span className="w-2 h-2 bg-tiffany rounded-full" />
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-gray-900 mb-6 tracking-tight">
              <span className="font-normal">W</span>
              <span className="text-[0.85em]">HY</span>
              {" "}
              <span className="font-normal">C</span>
              <span className="text-[0.85em]">HOOSE</span>
              {" "}
              <span className="font-normal">U</span>
              <span className="text-[0.85em]">S</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              When you work with Hamilton Bailey, you benefit from our specialised focus and
              extensive experience in healthcare law.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Healthcare Focus",
                description:
                  "Unlike general practice firms, we exclusively serve the medical community, providing deeper expertise in healthcare-specific legal issues.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                ),
              },
              {
                title: "Tailored Solutions",
                description:
                  "Our legal documents and advice are specifically designed for Australian medical practice contexts, not generic templates.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                ),
              },
              {
                title: "Ongoing Partnership",
                description:
                  "We build lasting relationships with our clients, providing continuous support as their practices grow and regulatory environments change.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-tiffany/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-tiffany" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-blair mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-tiffany-dark">
        <div className="container-custom text-center">
          <h2 className="font-blair text-3xl font-bold text-white mb-6">
            Ready to Work Together?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discuss how we can support your medical practice with tailored legal
            solutions.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-tiffany-dark font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
