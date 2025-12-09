import { Metadata } from "next";
import { BundleGallery } from "@/components/bundles/BundleGallery";

export const metadata: Metadata = {
  title: "Smart Bundles | Hamilton Bailey Law",
  description: "Save up to 31% with our curated document bundles. Get all the legal templates you need for your healthcare practice at discounted prices.",
};

export default function BundlesPage() {
  // In production, get user from auth session
  const demoUser = {
    id: "demo-user-123",
    practiceType: "small",
  };

  // Demo cart items (in production, get from cart state)
  const demoCartItems: string[] = [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-sm font-medium rounded-full">
                3x XP on all bundles
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full">
                Save up to 31%
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Smart Bundles
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Curated document packages designed for healthcare practices.
              Get everything you need at discounted bundle pricing, plus earn
              triple XP on every purchase.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Curated by experts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Instant access</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Free updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle Gallery */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <BundleGallery
            userId={demoUser.id}
            practiceType={demoUser.practiceType}
            cartProductIds={demoCartItems}
            showSuggestions={true}
          />
        </div>
      </section>

      {/* Why Bundles Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose a Bundle?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Up to 31%</h3>
              <p className="text-gray-600 text-sm">
                Bundle pricing gives you significant savings compared to buying documents individually.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3x XP Rewards</h3>
              <p className="text-gray-600 text-sm">
                Earn triple the XP points on bundle purchases, plus bonus XP for completing bundles.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Complete Coverage</h3>
              <p className="text-gray-600 text-sm">
                Each bundle is designed to give you comprehensive coverage for specific practice needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I customize bundle contents?
              </h3>
              <p className="text-gray-600">
                Bundles are pre-configured for optimal coverage. However, you can purchase individual
                documents separately if you need specific items.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                What if I already own some documents in a bundle?
              </h3>
              <p className="text-gray-600">
                We&apos;ll show you dynamic bundle suggestions based on what&apos;s already in your cart,
                so you can complete bundles at discounted rates.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">
                How does the 3x XP bonus work?
              </h3>
              <p className="text-gray-600">
                When you purchase a bundle, you earn 3 times the normal XP based on your purchase amount.
                Plus, you receive a 500 XP bonus for completing a bundle, and first-time bundle buyers
                get an additional 200 XP bonus!
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
