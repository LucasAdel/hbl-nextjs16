import Link from "next/link";
import { Home, Search, ArrowRight, BookOpen, FileText, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Display */}
        <div className="relative mb-8">
          <span className="text-[10rem] md:text-[14rem] font-blair font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-tiffany/10 dark:bg-tiffany/20 rounded-full p-6">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-tiffany" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-blair text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been
          moved, deleted, or the URL might be incorrect.
        </p>

        {/* Primary Action */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-tiffany hover:bg-tiffany-dark text-white font-semibold rounded-xl transition-colors mb-12"
        >
          <Home className="w-5 h-5" />
          Return Home
        </Link>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Here are some helpful links to get you back on track:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/services"
              className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-tiffany dark:hover:border-tiffany transition-colors"
            >
              <FileText className="w-6 h-6 text-tiffany mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Our Services
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Explore our legal services
              </p>
              <span className="inline-flex items-center gap-1 text-tiffany text-xs mt-2 group-hover:gap-2 transition-all">
                View Services <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/resources"
              className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-tiffany dark:hover:border-tiffany transition-colors"
            >
              <BookOpen className="w-6 h-6 text-tiffany mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Resources
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Articles and guides
              </p>
              <span className="inline-flex items-center gap-1 text-tiffany text-xs mt-2 group-hover:gap-2 transition-all">
                Browse Resources <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              href="/contact"
              className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-tiffany dark:hover:border-tiffany transition-colors"
            >
              <Phone className="w-6 h-6 text-tiffany mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Contact Us
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get in touch with our team
              </p>
              <span className="inline-flex items-center gap-1 text-tiffany text-xs mt-2 group-hover:gap-2 transition-all">
                Contact <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
