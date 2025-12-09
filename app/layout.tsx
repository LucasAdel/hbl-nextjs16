import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { FloatingCartButton } from "@/components/cart/floating-cart-button";
import { CookieConsent } from "@/components/features/CookieConsent";
import { ThemeProvider } from "@/lib/theme-context";
import { FloatingThemeToggle } from "@/components/features/ThemeToggle";
import { LiveChat } from "@/components/features/LiveChat";
import { ServiceWorkerRegistration } from "@/components/features/ServiceWorkerRegistration";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo/JsonLd";
import { CartAbandonmentTracker } from "@/components/cart/CartAbandonmentTracker";
import { AIChatWidget } from "@/components/ai-chat-widget";
import { GamificationWidgetWrapper } from "@/components/gamification-widget-wrapper";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { CommandPalette } from "@/components/search/CommandPalette";
import { SocialProofNotifications } from "@/components/social-proof/SocialProofNotifications";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hamilton Bailey Law Firm | Legal Services for Medical Practitioners",
    template: "%s | Hamilton Bailey Law Firm",
  },
  description:
    "Specialised legal services for Australian medical practitioners. Expert advice on practice compliance, contracts, property law, and healthcare regulations. Serving Adelaide and nationwide.",
  keywords: [
    "medical law",
    "healthcare lawyer",
    "medical practice law",
    "AHPRA compliance",
    "tenant doctor agreement",
    "medical contracts",
    "healthcare regulations",
    "Adelaide lawyer",
    "Australian medical law",
  ],
  authors: [{ name: "Hamilton Bailey Law Firm" }],
  creator: "Hamilton Bailey Law Firm",
  publisher: "Hamilton Bailey Law Firm",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://hamiltonbailey.com",
    siteName: "Hamilton Bailey Law Firm",
    title: "Hamilton Bailey Law Firm | Legal Services for Medical Practitioners",
    description:
      "Expert legal services for medical practitioners and healthcare businesses across Australia. Specialising in practice compliance and commercial law.",
    images: [
      {
        url: "/images/hb-logo.svg",
        width: 1200,
        height: 630,
        alt: "Hamilton Bailey Law Firm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamilton Bailey Law Firm | Medical Practice Legal Services",
    description:
      "Specialised legal services for Australian medical practitioners and healthcare businesses.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Hamilton Bailey Law" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HB Law" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2AAFA2" />
        <meta name="theme-color" content="#2AAFA2" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('hbl-theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <PostHogProvider>
          <ThemeProvider>
            <Navigation />
          <main id="main-content" className="flex-grow w-full min-h-screen" role="main">
            {children}
          </main>
          <Footer />
          <FloatingCartButton />
          <FloatingThemeToggle />
          <LiveChat />
          <AIChatWidget />
          <GamificationWidgetWrapper />
          <CartSidebar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                color: "var(--color-foreground)",
              },
              className: "font-sans",
            }}
            richColors
            closeButton
          />
          <CookieConsent />
          <ServiceWorkerRegistration />
          <CartAbandonmentTracker />
          <CommandPalette />
          <SocialProofNotifications enabled={true} interval={45000} position="bottom-left" />
          {/* SEO Structured Data */}
          <OrganizationSchema />
          <WebsiteSchema />
          <LocalBusinessSchema />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
