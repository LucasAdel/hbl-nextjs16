import { Metadata } from "next";
import { headers } from "next/headers";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibraryFooter } from "@/components/library/LibraryFooter";

export const metadata: Metadata = {
  title: {
    default: "Legal Resource Library | Hamilton Bailey Law",
    template: "%s | HBL Library",
  },
  description:
    "Comprehensive legal resources for healthcare professionals. Expert articles on compliance, employment law, AHPRA regulations, and medical practice management.",
  keywords: [
    "legal resources",
    "healthcare law articles",
    "medical practice compliance",
    "AHPRA resources",
    "employment law guides",
    "healthcare regulations",
    "payroll tax medical",
    "tenant doctor agreements",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Hamilton Bailey Law Library",
    title: "Legal Resource Library | Hamilton Bailey Law",
    description:
      "Expert legal guides and resources for healthcare professionals across Australia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Resource Library | Hamilton Bailey Law",
    description:
      "Expert legal guides for healthcare professionals.",
  },
  alternates: {
    canonical: "https://library.hamiltonbailey.com",
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Library Header */}
      <LibraryHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Library Footer - Only show on subdomain for standalone experience */}
      {isSubdomain && <LibraryFooter />}
    </div>
  );
}
