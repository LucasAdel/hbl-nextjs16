import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  Linkedin,
  Award,
  GraduationCap,
  MapPin,
  Globe,
  ArrowRight,
  Scale,
  Building,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Team | Legal Experts for Medical Practitioners",
  description:
    "Meet the Hamilton Bailey team - experienced legal professionals dedicated to serving Australian medical practitioners with specialised expertise in healthcare law.",
};

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string[];
  specialisations: string[];
  qualifications: string[];
  locations?: string[];
  email?: string;
  linkedin?: string;
  featured?: boolean;
}

const teamMembers: TeamMember[] = [
  {
    name: "Lukasz Wyszynski",
    role: "Principal & Founder",
    image: "/images/lukasz-wyszynski.png",
    bio: [
      "Lukasz Wyszynski is the founding Principal of Hamilton Bailey, bringing over a decade of experience in medical practice law, payroll tax matters, and corporate commercial law.",
      "Having worked across international jurisdictions including Australia, Dubai, Qingdao, Mumbai, and Saigon, Lukasz brings a global perspective to local legal challenges faced by medical practitioners and healthcare organisations.",
      "His expertise spans complex payroll tax disputes, medical practice acquisitions, property transactions for healthcare facilities, and regulatory compliance matters across multiple Australian states.",
    ],
    specialisations: [
      "Payroll Tax (Medical/Healthcare Sector)",
      "Property Law for Medical Practices",
      "Medical Practice Acquisitions",
      "Corporate & Commercial Law",
      "Healthcare Regulatory Compliance",
      "International Healthcare Transactions",
    ],
    qualifications: [
      "Bachelor of Laws (LLB)",
      "Bachelor of Commerce",
      "Admitted to Supreme Court of South Australia",
      "Member, Law Society of South Australia",
    ],
    locations: ["Adelaide", "Sydney", "Melbourne", "Brisbane", "Perth"],
    email: "lukasz@hamiltonbailey.com",
    linkedin: "https://www.linkedin.com/in/lukasz-wyszynski",
    featured: true,
  },
  {
    name: "Senior Associates",
    role: "Legal Team",
    image: "/images/healthcare-team.png",
    bio: [
      "Our senior associates bring diverse expertise across healthcare law, commercial litigation, and regulatory compliance.",
      "Each team member is carefully selected for their understanding of the unique challenges facing medical practitioners in Australia.",
    ],
    specialisations: [
      "Contract Drafting & Review",
      "Employment Law",
      "Lease Negotiations",
      "AHPRA Compliance",
      "Medical Board Matters",
    ],
    qualifications: [
      "Various tertiary law qualifications",
      "Admitted practitioners across multiple jurisdictions",
    ],
  },
];

const practiceAreas = [
  {
    icon: Scale,
    title: "Payroll Tax",
    description: "Expert guidance on payroll tax obligations for medical practices",
  },
  {
    icon: Building,
    title: "Property Law",
    description: "Commercial leases and property transactions for healthcare facilities",
  },
  {
    icon: Heart,
    title: "Healthcare Compliance",
    description: "AHPRA, Medicare, and regulatory compliance matters",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiffany/20 mb-6">
              <Scale className="h-4 w-4 text-tiffany" />
              <span className="text-sm font-semibold text-tiffany uppercase tracking-wider">
                Our Team
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Meet Your
              <span className="text-tiffany"> Legal Partners</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experienced legal professionals dedicated to serving the unique needs of
              Australian medical practitioners and healthcare organisations.
            </p>
          </div>
        </div>
      </section>

      {/* Principal Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {teamMembers
            .filter((m) => m.featured)
            .map((member) => (
              <div key={member.name} className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Image */}
                <div className="relative">
                  <div className="sticky top-8">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={600}
                        height={700}
                        className="w-full h-auto object-contain"
                        priority
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-tiffany text-white text-sm font-semibold rounded-full">
                          Principal
                        </span>
                      </div>
                    </div>

                    {/* Contact Buttons */}
                    <div className="mt-6 flex gap-4">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-xl transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                          Contact
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-6 py-3 bg-[#0077B5] hover:bg-[#006699] text-white font-semibold rounded-xl transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h2>
                  <p className="text-xl text-tiffany font-semibold mb-6">{member.role}</p>

                  {/* Bio */}
                  <div className="space-y-4 mb-8">
                    {member.bio.map((paragraph, idx) => (
                      <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Locations */}
                  {member.locations && (
                    <div className="mb-8">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        <MapPin className="w-4 h-4" />
                        Service Locations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {member.locations.map((location) => (
                          <span
                            key={location}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialisations */}
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      <Award className="w-4 h-4" />
                      Areas of Expertise
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {member.specialisations.map((spec) => (
                        <div
                          key={spec}
                          className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <div className="w-2 h-2 bg-tiffany rounded-full" />
                          <span className="text-sm">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      <GraduationCap className="w-4 h-4" />
                      Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {member.qualifications.map((qual) => (
                        <li
                          key={qual}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <div className="w-5 h-5 bg-tiffany/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-tiffany rounded-full" />
                          </div>
                          <span className="text-sm">{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Book Consultation CTA */}
                  <Link
                    href="/book-appointment"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Book a Consultation
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Practice Areas */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Practice Areas
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive legal services tailored for the healthcare sector
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {practiceAreas.map((area) => (
              <div
                key={area.title}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-tiffany/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <area.icon className="w-8 h-8 text-tiffany" />
                </div>
                <h3 className="font-blair text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {area.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporting Team */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Supporting Team
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A dedicated team of legal professionals supporting our clients&apos; needs
            </p>
          </div>

          {teamMembers
            .filter((m) => !m.featured)
            .map((member) => (
              <div
                key={member.name}
                className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="font-blair text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-tiffany font-semibold mb-4">{member.role}</p>
                    {member.bio.map((para, idx) => (
                      <p
                        key={idx}
                        className="text-gray-600 dark:text-gray-300 text-sm mb-2"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Expertise Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialisations.map((spec) => (
                        <span
                          key={spec}
                          className="px-3 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm rounded-full border border-gray-200 dark:border-gray-700"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-tiffany to-tiffany-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Schedule a consultation to discuss your legal needs with our experienced team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-tiffany-dark rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Appointment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
