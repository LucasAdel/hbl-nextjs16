"use client";

import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useSubdomain } from "@/hooks/use-subdomain";

export function CodexFooter() {
  const { isLibrary, getMainSiteUrl, getLibraryUrl } = useSubdomain();

  // On subdomain, use root paths; on main domain, use /codex prefix
  const getLibraryPath = (path: string) => {
    if (isLibrary) {
      return path.replace(/^\/codex/, "") || "/";
    }
    return path;
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-tiffany-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Legal Resource Codex</h3>
                <p className="text-sm text-slate-400">By Hamilton Bailey Law</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-md">
              Comprehensive legal resources and expert guidance for healthcare professionals
              across Australia. Stay compliant and informed with our regularly updated articles.
            </p>
            {isLibrary && (
              <a
                href={getMainSiteUrl()}
                className="inline-flex items-center gap-2 text-tiffany-400 hover:text-tiffany-300 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Hamilton Bailey Law
              </a>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link
                  href={getLibraryPath("/codex")}
                  className="hover:text-white transition-colors"
                >
                  All Articles
                </Link>
              </li>
              <li>
                <Link
                  href={getLibraryPath("/codex/featured")}
                  className="hover:text-white transition-colors"
                >
                  Featured Resources
                </Link>
              </li>
              <li>
                <Link
                  href={getLibraryPath("/codex/categories")}
                  className="hover:text-white transition-colors"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  href={getLibraryPath("/codex/practice-areas")}
                  className="hover:text-white transition-colors"
                >
                  Practice Areas
                </Link>
              </li>
              <li>
                <Link
                  href={getLibraryPath("/codex/search")}
                  className="hover:text-white transition-colors"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-tiffany-500" />
                <a href="tel:+61882319448" className="hover:text-white transition-colors">
                  (08) 8231 9448
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-tiffany-500" />
                <a
                  href="mailto:contact@hamiltonbailey.com"
                  className="hover:text-white transition-colors"
                >
                  contact@hamiltonbailey.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-tiffany-500 mt-0.5" />
                <span>
                  Level 1, 169 Fullarton Road
                  <br />
                  Dulwich SA 5065
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Hamilton Bailey Law. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <a
              href={isLibrary ? getMainSiteUrl("/privacy-policy") : "/privacy-policy"}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={isLibrary ? getMainSiteUrl("/terms-of-service") : "/terms-of-service"}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href={isLibrary ? getMainSiteUrl("/contact") : "/contact"}
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-500 text-center">
            <strong>Disclaimer:</strong> The information provided in this library is for general
            informational purposes only and does not constitute legal advice. For advice specific
            to your situation, please consult with a qualified legal professional.
          </p>
        </div>
      </div>
    </footer>
  );
}
