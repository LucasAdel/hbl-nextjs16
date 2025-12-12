"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, CheckCircle2 } from "lucide-react";

const Footer: React.FC = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on portal and codex routes (they have their own layouts)
  if (pathname?.startsWith("/portal") || pathname?.startsWith("/codex")) {
    return null;
  }

  return (
    <footer
      className="pt-20 pb-8 relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800"
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 rounded-full blur-3xl"
        style={{
          width: "384px",
          height: "384px",
          background: "rgba(42, 175, 162, 0.05)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 rounded-full blur-3xl"
        style={{
          width: "320px",
          height: "320px",
          background: "rgba(42, 175, 162, 0.03)",
        }}
      />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h4 className="font-blair text-2xl font-bold text-text-primary dark:text-white mb-4">
                Hamilton Bailey
              </h4>
              <p className="font-montserrat text-sm text-text-secondary dark:text-slate-400 mb-6 leading-relaxed">
                Specialising in legal services for medical practitioners in Australia.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-border-light/50 dark:border-slate-700/50">
              <p className="font-montserrat text-sm text-text-secondary dark:text-slate-400 leading-relaxed">
                147 Pirie Street
                <br />
                Adelaide, South Australia 5000
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-blair text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-tiffany rounded-full mr-3" />
              Services
            </h5>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services/medical-practice-compliance"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Medical Practice Law
                </Link>
              </li>
              <li>
                <Link
                  href="/services/regulatory-compliance"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Healthcare Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/services/intellectual-property"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Intellectual Property
                </Link>
              </li>
              <li>
                <Link
                  href="/services/employment-hr"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Employment Law
                </Link>
              </li>
              <li>
                <Link
                  href="/services/healthcare-contracts"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Commercial Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Legal Documents
                </Link>
              </li>
              <li>
                <Link
                  href="/services/healthcare-visas"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Visas (Medical/Healthcare)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-blair text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-tiffany rounded-full mr-3" />
              Legal Documents
            </h5>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/documents?type=service-agreements"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Service Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/documents?type=licencing-agreements"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Licencing Agreements
                </Link>
              </li>
              <li>
                <Link
                  href="/documents?type=employment-contracts"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Employment Contracts
                </Link>
              </li>
              <li>
                <Link
                  href="/documents?type=practice-management"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Practice Management
                </Link>
              </li>
              <li>
                <Link
                  href="/documents?type=dispute-resolution"
                  className="font-montserrat text-sm text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300"
                >
                  Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-blair text-lg font-bold text-text-primary dark:text-white mb-6 flex items-center">
              <div className="w-2 h-2 bg-tiffany rounded-full mr-3" />
              Contact
            </h5>
            <div className="space-y-4">
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1">Business Phone:</p>
                <p className="text-tiffany-dark dark:text-tiffany-light font-semibold text-sm">+61 8 5122 0056</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1">Business Hours:</p>
                <p className="text-tiffany-dark dark:text-tiffany-light font-semibold text-sm">Mon-Fri: 9am-5pm</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
                <p className="text-xs text-text-secondary dark:text-slate-400 mb-1">Response Time:</p>
                <p className="text-tiffany-dark dark:text-tiffany-light font-semibold text-sm">Within 48 Hours</p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center px-4 py-2 bg-tiffany/10 dark:bg-tiffany/20 hover:bg-tiffany/20 dark:hover:bg-tiffany/30 border border-tiffany/30 rounded-lg text-tiffany-dark dark:text-tiffany-light hover:text-tiffany transition-all duration-300 text-sm font-medium"
              >
                Contact Form
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Professional Accreditation Section */}
        <div className="mt-12 pt-8 border-t border-border-light/50 dark:border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Law Society Membership */}
            <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h6 className="font-semibold text-text-primary dark:text-white text-sm mb-1">
                    Professional Membership
                  </h6>
                  <p className="text-text-secondary dark:text-slate-400 text-xs leading-relaxed mb-2">
                    Member of the Law Society of South Australia
                  </p>
                  <a
                    href="https://www.lawsocietysa.asn.au/site/for-legal-practitioners/working-as-a-legal-practitioner/south-australian-legal-practitioners-conduct-rules.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-tiffany-dark dark:text-tiffany-light hover:text-tiffany text-xs font-medium transition-all duration-300"
                  >
                    Code of Conduct
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Professional Indemnity */}
            <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h6 className="font-semibold text-text-primary dark:text-white text-sm mb-1">
                    Professional Indemnity
                  </h6>
                  <p className="text-text-secondary dark:text-slate-400 text-xs leading-relaxed">
                    Liability limited by a scheme approved under Professional Standards Legislation.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Assurance */}
            <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-border-light/50 dark:border-slate-700/50">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-tiffany-dark dark:text-tiffany-light mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h6 className="font-semibold text-text-primary dark:text-white text-sm mb-1">Quality Assurance</h6>
                  <p className="text-text-secondary dark:text-slate-400 text-xs leading-relaxed">
                    Committed to the highest standards of legal practice and client service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border-light/50 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-secondary dark:text-slate-400 text-sm">
              &copy; {currentYear} Hamilton Bailey Law Firm. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                className="text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/disclaimer"
                className="text-text-secondary dark:text-slate-400 hover:text-tiffany transition-colors duration-300 text-sm"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
