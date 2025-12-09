"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route label mappings for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  services: "Services",
  documents: "Legal Documents",
  resources: "Resources",
  articles: "Articles",
  about: "About Us",
  contact: "Contact",
  login: "Login",
  signup: "Sign Up",
  "client-portal": "Client Portal",
  portal: "Portal",
  admin: "Admin",
  wishlist: "Wishlist",
  "book-appointment": "Book Appointment",
  "knowledge-base": "Knowledge Base",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  disclaimer: "Disclaimer",
  cms: "Content Management",
  users: "Users",
  leads: "Leads",
  appointments: "Appointments",
  analytics: "Analytics",
  settings: "Settings",
  media: "Media",
  integrations: "Integrations",
  "email-analytics": "Email Analytics",
};

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Use route label or format segment
    const label =
      routeLabels[segment] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

// Generate JSON-LD structured data for breadcrumbs
function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: `${baseUrl}${item.href}`,
      })),
    ],
  };
}

export function Breadcrumbs({
  items,
  className = "",
  showHome = true,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on home page
  if (pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au";

  const schema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {showHome && (
            <li className="flex items-center">
              <Link
                href="/"
                className="text-gray-500 hover:text-tiffany transition-colors flex items-center gap-1"
                title="Home"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            </li>
          )}

          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={item.href} className="flex items-center">
                {isLast ? (
                  <span
                    className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-tiffany transition-colors truncate max-w-[150px]"
                    >
                      {item.label}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// Compact version for mobile or tight spaces
export function BreadcrumbsCompact({
  items,
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  // Only show parent and current on mobile
  const displayItems =
    breadcrumbItems.length > 2
      ? [breadcrumbItems[0], breadcrumbItems[breadcrumbItems.length - 1]]
      : breadcrumbItems;

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://hamiltonbaileylaw.com.au";

  const schema = generateBreadcrumbSchema(breadcrumbItems, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-gray-500 hover:text-tiffany transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>

          {displayItems.length > 0 && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {breadcrumbItems.length > 2 && (
                <>
                  <span className="text-gray-400">...</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </>
              )}
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                {displayItems[displayItems.length - 1].label}
              </span>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Breadcrumbs;
