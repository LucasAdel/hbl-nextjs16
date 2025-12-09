import Script from "next/script";

// Organization Schema
interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  sameAs?: string[];
}

export function OrganizationSchema({
  name = "Hamilton Bailey Law Firm",
  url = "https://hamiltonbailey.com",
  logo = "https://hamiltonbailey.com/images/hb-logo.svg",
  phone = "+61 8 8212 8585",
  email = "enquiries@hamiltonbailey.com",
  address = {
    streetAddress: "Level 1, 123 King William Street",
    addressLocality: "Adelaide",
    addressRegion: "SA",
    postalCode: "5000",
    addressCountry: "AU",
  },
  sameAs = [
    "https://www.linkedin.com/company/hamilton-bailey-law",
    "https://www.facebook.com/hamiltonbaileylaw",
  ],
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name,
    url,
    logo,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    sameAs,
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Australia",
    },
    serviceType: [
      "Healthcare Law",
      "Medical Practice Law",
      "AHPRA Compliance",
      "Commercial Contracts",
      "Employment Law",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local Business Schema
interface LocalBusinessSchemaProps extends OrganizationSchemaProps {
  geo?: {
    latitude: number;
    longitude: number;
  };
}

export function LocalBusinessSchema({
  geo = { latitude: -34.9285, longitude: 138.6007 },
  ...props
}: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${props.url || "https://hamiltonbailey.com"}/#organization`,
    name: props.name || "Hamilton Bailey Law Firm",
    image: props.logo || "https://hamiltonbailey.com/images/hb-logo.svg",
    url: props.url || "https://hamiltonbailey.com",
    telephone: props.phone || "+61 8 8212 8585",
    email: props.email || "enquiries@hamiltonbailey.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: props.address?.streetAddress || "Level 1, 123 King William Street",
      addressLocality: props.address?.addressLocality || "Adelaide",
      addressRegion: props.address?.addressRegion || "SA",
      postalCode: props.address?.postalCode || "5000",
      addressCountry: props.address?.addressCountry || "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    priceRange: "$$",
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article/Blog Post Schema
interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
}

export function ArticleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  author,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: imageUrl,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author.name,
      url: author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Hamilton Bailey Law Firm",
      logo: {
        "@type": "ImageObject",
        url: "https://hamiltonbailey.com/images/hb-logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service Schema
interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  areaServed?: string;
  serviceType?: string;
}

export function ServiceSchema({
  name,
  description,
  url,
  provider = "Hamilton Bailey Law Firm",
  areaServed = "Australia",
  serviceType = "Legal Service",
}: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "LegalService",
      name: provider,
      url: "https://hamiltonbailey.com",
    },
    areaServed: {
      "@type": "Country",
      name: areaServed,
    },
    serviceType,
  };

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema
interface FAQSchemaProps {
  questions: { question: string; answer: string }[];
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Product Schema (for documents)
interface ProductSchemaProps {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
}

export function ProductSchema({
  name,
  description,
  url,
  imageUrl,
  price,
  currency = "AUD",
  availability = "InStock",
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "Hamilton Bailey Law Firm",
      },
    },
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website Schema with Search
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hamilton Bailey Law Firm",
    url: "https://hamiltonbailey.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://hamiltonbailey.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
