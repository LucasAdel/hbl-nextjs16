import React from "react";
import Link from "next/link";
import { FileText, Building, Users, Scale, FileCheck, Plane } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, link }) => (
  <Link
    href={link}
    className="group block h-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-tiffany/10 dark:bg-tiffany/20 text-tiffany">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-4">{description}</p>
    <span className="inline-flex items-center font-semibold text-tiffany transition-colors group-hover:text-tiffany-dark dark:group-hover:text-tiffany-light">
      Learn more
      <svg
        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </span>
  </Link>
);

const services = [
  {
    title: "Practice Setup & Structuring",
    description:
      "Strategic guidance for establishing new practices, restructuring existing ones, and optimising your business entity for tax efficiency and asset protection.",
    icon: <Building className="h-7 w-7" />,
    link: "/services/practice-setup",
  },
  {
    title: "Regulatory Compliance",
    description:
      "Navigate AHPRA requirements, Medicare billing compliance, and privacy obligations with expert guidance tailored to medical practitioners.",
    icon: <FileCheck className="h-7 w-7" />,
    link: "/services/regulatory-compliance",
  },
  {
    title: "Property & Leasing",
    description:
      "Expert advice on medical centre leases, tenant doctor agreements, practice acquisitions, and property transactions for healthcare facilities.",
    icon: <FileText className="h-7 w-7" />,
    link: "/services/property-leasing",
  },
  {
    title: "Employment & HR",
    description:
      "Comprehensive employment law support including contracts, workplace policies, award compliance, and managing employment disputes.",
    icon: <Users className="h-7 w-7" />,
    link: "/services/employment-hr",
  },
  {
    title: "Dispute Resolution",
    description:
      "Professional representation in practice disputes, partnership disagreements, patient complaints, and regulatory investigations.",
    icon: <Scale className="h-7 w-7" />,
    link: "/services/dispute-resolution",
  },
  {
    title: "Healthcare Visas",
    description:
      "Specialist immigration assistance for international medical graduates and healthcare professionals seeking Australian visas.",
    icon: <Plane className="h-7 w-7" />,
    link: "/services/healthcare-visas",
  },
];

const ServicesOverview: React.FC = () => (
  <section className="py-16 bg-white dark:bg-slate-900">
    <div className="container-custom">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Comprehensive Medical Legal Services
        </h2>
        <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
          Everything your practice needs to thrive legally
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </div>
  </section>
);

export default ServicesOverview;
