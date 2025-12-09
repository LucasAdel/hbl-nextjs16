import { Metadata } from "next";
import { headers } from "next/headers";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryFooter } from "@/components/library/LibraryFooter";

export const metadata: Metadata = {
  title: {
    default: "Hamilton Bailey Legal Library | Healthcare Law Resources",
    template: "%s | Hamilton Bailey Legal Library",
  },
  description:
    "Your comprehensive resource for Australian healthcare law, medical practice compliance, and regulatory guidance. Expert legal articles and insights for healthcare professionals.",
  keywords: [
    "hamilton bailey legal library",
    "healthcare law resources",
    "medical practice law",
    "AHPRA compliance",
    "australian healthcare regulations",
    "medical practice compliance",
    "employment law healthcare",
    "tenant doctor agreements",
    "payroll tax medical",
    "healthcare contracts",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Hamilton Bailey Legal Library",
    title: "Hamilton Bailey Legal Library | Healthcare Law Resources",
    description:
      "Your comprehensive resource for Australian healthcare law, medical practice compliance, and regulatory guidance.",
    images: [
      {
        url: "/images/hb-logo-social.png",
        width: 1200,
        height: 630,
        alt: "Hamilton Bailey Legal Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamilton Bailey Legal Library",
    description:
      "Expert legal guides for healthcare professionals in Australia.",
  },
  alternates: {
    canonical: "https://library.hamiltonbailey.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hamilton Bailey Legal Library",
  description:
    "Comprehensive legal resources and expert insights for medical practitioners and healthcare businesses across Australia.",
  url: "https://library.hamiltonbailey.com",
  publisher: {
    "@type": "Organization",
    "@id": "https://hamiltonbailey.com/#organization",
    name: "Hamilton Bailey Law Firm",
    url: "https://hamiltonbailey.com",
    logo: {
      "@type": "ImageObject",
      url: "https://hamiltonbailey.com/images/hb-logo.svg",
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://library.hamiltonbailey.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get headers to detect subdomain (for server components)
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isSubdomain = host.startsWith("library.");

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-50/30 to-tiffany-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-tiffany-500 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Library Header */}
        <LibraryHeader />

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Library Footer - Only show on subdomain for standalone experience */}
        {isSubdomain && <LibraryFooter />}
      </div>
    </>
  );
}
