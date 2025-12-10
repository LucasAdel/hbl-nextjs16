import { Metadata } from "next";
import { CodexHeader } from "@/components/codex/CodexHeader";
import { CodexFooter } from "@/components/codex/CodexFooter";

export const metadata: Metadata = {
  title: {
    default: "Hamilton Bailey Legal Codex | Healthcare Law Resources",
    template: "%s | Hamilton Bailey Legal Codex",
  },
  description:
    "Your comprehensive resource for Australian healthcare law, medical practice compliance, and regulatory guidance. Expert legal articles and insights for healthcare professionals.",
  keywords: [
    "hamilton bailey legal codex",
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
    siteName: "Hamilton Bailey Legal Codex",
    title: "Hamilton Bailey Legal Codex | Healthcare Law Resources",
    description:
      "Your comprehensive resource for Australian healthcare law, medical practice compliance, and regulatory guidance.",
    images: [
      {
        url: "/images/hb-logo-social.png",
        width: 1200,
        height: 630,
        alt: "Hamilton Bailey Legal Codex",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamilton Bailey Legal Codex",
    description:
      "Expert legal guides for healthcare professionals in Australia.",
  },
  alternates: {
    canonical: "https://codex.hamiltonbailey.com",
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
  name: "Hamilton Bailey Legal Codex",
  description:
    "Comprehensive legal resources and expert insights for medical practitioners and healthcare businesses across Australia.",
  url: "https://codex.hamiltonbailey.com",
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
    target: "https://codex.hamiltonbailey.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function CodexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-gray-50/30 to-tiffany-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-tiffany-500 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>

        {/* Codex Header */}
        <CodexHeader />

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Codex Footer */}
        <CodexFooter />
      </div>
    </>
  );
}
