"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

interface CanonicalUrlProps {
  baseUrl?: string;
  path?: string;
}

/**
 * CanonicalUrl Component
 *
 * Generates a canonical URL for the current page.
 * Use this in pages that might have duplicate content or URL parameters.
 *
 * Note: For most cases, use Next.js Metadata API instead:
 *
 * export const metadata: Metadata = {
 *   alternates: {
 *     canonical: 'https://hamiltonbaileylaw.com.au/your-path',
 *   },
 * };
 */
export function CanonicalUrl({
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au",
  path,
}: CanonicalUrlProps) {
  const pathname = usePathname();
  const canonicalPath = path || pathname;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}

/**
 * Helper function to generate canonical URL metadata
 * Use this in your page's generateMetadata function
 */
export function getCanonicalUrl(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au"
): string {
  // Remove query parameters and trailing slashes
  const cleanPath = path.split("?")[0].replace(/\/+$/, "");
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate hreflang tags for international SEO
 * Currently configured for Australian English only
 */
export function generateHreflangTags(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au"
) {
  const url = getCanonicalUrl(path, baseUrl);

  return {
    alternates: {
      canonical: url,
      languages: {
        "en-AU": url,
        "x-default": url,
      },
    },
  };
}

/**
 * Common metadata generator for consistent SEO across pages
 */
export function generatePageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au";
  const canonicalUrl = getCanonicalUrl(path, baseUrl);
  const defaultOgImage = `${baseUrl}/og-image.png`;

  return {
    title: `${title} | Hamilton Bailey Law`,
    description,
    keywords: keywords?.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Hamilton Bailey Law`,
      description,
      url: canonicalUrl,
      siteName: "Hamilton Bailey Law",
      locale: "en_AU",
      type: "website",
      images: [
        {
          url: ogImage || defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Hamilton Bailey Law`,
      description,
      images: [ogImage || defaultOgImage],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default CanonicalUrl;
