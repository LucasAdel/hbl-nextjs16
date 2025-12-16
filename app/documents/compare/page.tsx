import { Metadata } from "next";
import { Suspense } from "react";
import { DocumentComparison } from "@/components/documents/DocumentComparison";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Compare Legal Documents | Hamilton Bailey Law",
  description: "Compare features, pricing, and benefits of our legal document templates side-by-side. Find the perfect template for your medical practice needs.",
  openGraph: {
    title: "Compare Legal Documents | Hamilton Bailey Law",
    description: "Compare features, pricing, and benefits of our legal document templates side-by-side.",
    type: "website",
  },
};

export default function DocumentComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Compare Legal Documents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Not sure which template is right for you? Compare features, pricing, and
            included materials side-by-side to make an informed decision.
          </p>
        </div>

        {/* Comparison Tool */}
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          }
        >
          <DocumentComparison maxCompare={3} />
        </Suspense>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-tiffany/10 to-blue-500/10 dark:from-tiffany/20 dark:to-blue-500/20 rounded-2xl p-8 border border-tiffany/20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our legal experts can help you identify the right documents for your
              specific practice needs. Contact us to discuss your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-6 py-3 bg-tiffany text-white font-semibold rounded-lg hover:bg-tiffany-dark transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/documents"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Browse All Documents
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What&apos;s the difference between Basic and Professional?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Basic templates cover essential requirements for simple arrangements.
                Professional templates include comprehensive clauses, extended protection,
                and additional support materials.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Are templates customizable?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes! All templates are provided in editable Word format. Each includes
                instructions on which sections to customize for your specific needs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What does &quot;Free Updates&quot; include?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                When legislation changes or best practices evolve, we update our templates.
                During your update period, you&apos;ll receive the latest version at no additional cost.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Absolutely! If you purchase a Basic template and later need more features,
                you can upgrade by paying the difference. Contact us for upgrade options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
