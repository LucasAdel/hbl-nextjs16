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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-tiffany-lighter/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-32 pb-16">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-tiffany/3 dark:bg-tiffany/5" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-8 bg-tiffany/10 dark:bg-tiffany/20">
              <span className="font-montserrat text-sm font-semibold text-tiffany dark:text-tiffany-light uppercase tracking-wider">
                About Us
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Hamilton Bailey
            </h1>
            <p className="font-montserrat text-lg text-gray-600 dark:text-gray-300">
              A specialised law firm dedicated to serving the unique legal needs of Australian medical
              practitioners, with expertise spanning payroll tax, property law, and practice management.
            </p>
          </div>
        </div>
      </section>

      {/* Message from Principal Section - Image on LEFT */}
      <section className="py-16 bg-gradient-to-br from-white via-tiffany-lighter/20 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Image Column - LEFT */}
            <div className="w-full lg:w-1/3 relative">
              <div className="rounded-lg overflow-hidden shadow-2xl w-1/2 md:w-1/2 lg:w-full mx-auto lg:mx-0">
                <Image
                  src="/images/1534726735536.jpeg"
                  alt="Lukasz Wyszynski"
                  width={400}
                  height={533}
                  className="w-full aspect-[3/4] object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-tiffany-lighter/20 dark:bg-tiffany/10 rounded-lg -z-10 transform rotate-2" />
              <div className="mt-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg p-4 max-w-[90%] ml-auto relative z-10 text-center md:text-left">
                <h3 className="font-blair text-lg mb-1 text-gray-900 dark:text-white">Lukasz Wyszynski</h3>
                <p className="text-tiffany-dark dark:text-tiffany-light text-sm">Principal & Founder</p>
              </div>
            </div>

            {/* Message Column - RIGHT */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-8 relative border border-gray-100 dark:border-slate-700">
                <div className="absolute top-0 right-0 w-20 h-20 bg-tiffany-lighter/30 dark:bg-tiffany/10 rounded-bl-3xl -z-0" />

                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-1 bg-tiffany-dark dark:bg-tiffany mr-4" />
                    <h2 className="font-blair text-2xl text-gray-900 dark:text-white">A Message from the Principal</h2>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Welcome to Hamilton Bailey – where legal expertise meets the unique needs of Australian medical
                    practitioners. As Principal of our firm, I am privileged to lead a dedicated team of legal
                    professionals who share a singular focus: providing exceptional legal services tailored
                    specifically for the healthcare sector.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    With over a decade of experience in medical practice law, payroll tax matters, and corporate
                    commercial law, our team brings specialised expertise to complex legal challenges. Having worked
                    across international jurisdictions including Australia, Dubai, and Asia, we understand both local
                    regulatory frameworks and cross-border considerations that affect modern healthcare practices.
                  </p>

                  <div className="border-l-4 border-tiffany mb-8 bg-tiffany-lighter/20 dark:bg-tiffany/10 p-6 rounded-r-lg">
                    <blockquote className="italic text-gray-700 dark:text-gray-300">
                      &ldquo;We see ourselves not just as legal advisors, but as trusted partners in your professional
                      journey – committed to protecting your interests and enabling your practice to thrive in a
                      challenging healthcare landscape.&rdquo;
                    </blockquote>
                  </div>

                  <h3 className="font-blair text-xl mb-4 text-gray-900 dark:text-white">Our Areas of Expertise</h3>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    At Hamilton Bailey, we specialise in several key areas that are critical to healthcare
                    practitioners: Payroll Tax for medical practices, Property matters specific to healthcare
                    facilities, Corporate & Commercial Law, Financial Securities, and emerging areas like Start-up Law
                    incorporating IP, IT, and AI considerations.
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    On behalf of our entire team, I thank you for considering Hamilton Bailey as your legal partner.
                    We look forward to the opportunity to discuss your specific needs and demonstrate how our
                    specialised approach can benefit your practice.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Link
                      href="/book-appointment"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Schedule a Consultation
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section - Image on LEFT */}
      <section className="py-20 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl bg-tiffany/5 dark:bg-tiffany/10" />

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Image - LEFT */}
            <div className="relative">
              <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src="/images/lukasz_wyszynski_lawyer_doctor_account.png"
                  alt="Hamilton Bailey Law Firm - Legal and Healthcare Professionals"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-8 -right-8 w-72 h-72 rounded-2xl z-0 blur-sm opacity-30 bg-gradient-to-br from-tiffany-light to-tiffany/30" />
              <div className="absolute -top-8 -left-8 w-40 h-40 rounded-2xl z-0 opacity-50 border-4 border-tiffany-light dark:border-tiffany/50" />
            </div>

            {/* Content - RIGHT */}
            <div>
              <h2 className="font-blair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                Our Story
              </h2>

              <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  Hamilton Bailey emerged from a recognition that Australian medical practitioners needed specialised
                  legal support that truly understood the unique challenges of the healthcare sector, particularly in
                  areas of payroll tax and practice management.
                </p>

                <p>
                  With experience across international jurisdictions including Australia, Dubai, Qingdao, Mumbai, &
                  Saigon, our team brings a global perspective to local legal challenges faced by medical practitioners
                  and healthcare organisations.
                </p>

                <p>
                  Today, we are proud to serve medical practitioners across Australia, providing tailored legal
                  solutions that enhance practice management, ensure compliance, and protect professional interests. We
                  help organise practice structures with particular expertise in payroll tax, property law for medical
                  practices, and corporate arrangements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                  <h4 className="text-xl font-blair mb-4 text-tiffany-dark dark:text-tiffany-light">Our Vision</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To be the premier legal resource for Australian medical practitioners, renowned for our specialised
                    expertise and practical solutions.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700">
                  <h4 className="text-xl font-blair mb-4 text-tiffany-dark dark:text-tiffany-light">Our Values</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Integrity, expertise, practicality, and a commitment to understanding the unique needs of healthcare
                    professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas of Practice */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tiffany/5 dark:bg-tiffany/10 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-tiffany-lighter/30 dark:bg-tiffany/20 rounded-full mb-6">
              <span className="text-tiffany-dark dark:text-tiffany-light font-semibold tracking-wide uppercase text-sm">
                Expertise
              </span>
            </div>
            <h2 className="font-blair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Areas of Practice
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Specialised legal expertise for Australian medical practitioners across multiple domains.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-3xl font-blair mb-10 text-center text-gray-900 dark:text-white">Our Specialisations</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Medical Practice Focused */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-tiffany-lighter to-tiffany/30 dark:from-tiffany/30 dark:to-tiffany/10 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-tiffany-dark dark:text-tiffany-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="font-blair text-xl text-tiffany-dark dark:text-tiffany-light">Medical Practice Focused</h4>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Payroll Tax (Medical/Healthcare-Sector)",
                      "Property (Medical/Healthcare-Sector)",
                      "Practice Establishment & Management",
                    ].map((item) => (
                      <li key={item} className="flex items-start text-gray-700 dark:text-gray-300">
                        <div className="w-6 h-6 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
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
                    <div className="w-12 h-12 bg-gradient-to-br from-tiffany-lighter to-tiffany/30 dark:from-tiffany/30 dark:to-tiffany/10 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-tiffany-dark dark:text-tiffany-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className="font-blair text-xl text-tiffany-dark dark:text-tiffany-light">Business & Innovation</h4>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Corporate & Commercial Law",
                      "Financial Securities",
                      "Start-up Law (IP/I.T./A.I.)",
                    ].map((item) => (
                      <li key={item} className="flex items-start text-gray-700 dark:text-gray-300">
                        <div className="w-6 h-6 bg-tiffany/20 dark:bg-tiffany/30 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-tiffany/5 dark:bg-tiffany/10 rounded-full blur-3xl" />

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-tiffany-lighter/30 dark:bg-tiffany/20 rounded-full mb-6">
              <span className="text-tiffany-dark dark:text-tiffany-light font-semibold tracking-wide uppercase text-sm">
                Why Choose Us
              </span>
            </div>
            <h2 className="font-blair text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose Hamilton Bailey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              When you work with Hamilton Bailey, you benefit from our specialised focus and extensive experience in
              healthcare law.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Healthcare Focus",
                description:
                  "Unlike general practice firms, we exclusively serve the medical community, providing deeper expertise in healthcare-specific legal issues.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                ),
              },
              {
                title: "Tailored Solutions",
                description:
                  "Our legal documents and advice are specifically designed for Australian medical practice contexts, not generic templates.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                ),
              },
              {
                title: "Ongoing Partnership",
                description:
                  "We build lasting relationships with our clients, providing continuous support as their practices grow and regulatory environments change.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-tiffany-lighter to-tiffany/30 dark:from-tiffany/30 dark:to-tiffany/10 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg transition-all duration-300 group-hover:scale-105">
                  <svg className="w-10 h-10 text-tiffany-dark dark:text-tiffany-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="text-2xl font-blair mb-4 text-gray-900 dark:text-white group-hover:text-tiffany-dark dark:group-hover:text-tiffany-light transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-tiffany-dark">
        <div className="container-custom text-center">
          <h2 className="font-blair text-3xl font-bold text-white mb-6">Ready to Work Together?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to discuss how we can support your medical practice with tailored legal solutions.
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
