# Hamilton Bailey Legal Website - Next.js 16 Migration Plan

**Project:** HBL-NextJS16
**Source:** `/Users/hbl/Documents/bailey-legal-bloom/`
**Target:** `/Users/hbl/Documents/hbl-nextjs16/`
**Date:** 2025-12-05
**Priority:** Public-facing Hamilton Bailey website FIRST

---

## Executive Summary

Migrate the Hamilton Bailey Legal website from React 19 + Vite to Next.js 16.0.3 with:
- **React 19.2.0** (already installed)
- **Tailwind CSS 4.x** (already installed)
- **TypeScript 5.x**
- **App Router** architecture
- **Server Components** for performance
- **Edge Runtime** for API routes

**Complexity Level:** Enterprise-grade (250+ components, 100+ pages)
**Migration Strategy:** Phased approach, public-facing pages first

---

## Phase 1: Foundation & Core Infrastructure

### 1.1 Project Configuration

| Task | Status | Details |
|------|--------|---------|
| Next.js 16.0.3 installed | DONE | Port 3016 configured |
| Tailwind CSS 4.x | DONE | @tailwindcss/postcss configured |
| React 19.2.0 | DONE | Latest React features available |
| TypeScript setup | DONE | tsconfig.json configured |
| ESLint setup | DONE | eslint-config-next installed |

### 1.2 Additional Dependencies to Install

```bash
# UI Component Libraries (from source project)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Utility Libraries
npm install lucide-react clsx tailwind-merge class-variance-authority

# Data & State Management
npm install @tanstack/react-query zustand

# Forms
npm install react-hook-form @hookform/resolvers zod

# Animation
npm install framer-motion

# Date Handling
npm install date-fns date-fns-tz

# Backend Integration
npm install @supabase/supabase-js @supabase/ssr

# Payments
npm install @stripe/stripe-js @stripe/react-stripe-js

# Email
npm install resend

# Analytics
npm install posthog-js

# Toast Notifications
npm install sonner

# Rich Text Editor (for CMS)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image

# Markdown
npm install react-markdown remark-gfm

# Maps
npm install mapbox-gl

# Charts
npm install recharts

# PDF Generation
npm install jspdf jspdf-autotable html2canvas
```

### 1.3 Directory Structure

```
/Users/hbl/Documents/hbl-nextjs16/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing routes (priority)
│   │   ├── page.tsx              # Homepage
│   │   ├── about/
│   │   ├── services/
│   │   ├── contact/
│   │   ├── articles/
│   │   ├── knowledge-base/
│   │   └── resources/
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── client-login/
│   │   └── staff-login/
│   ├── (portal)/                 # Protected client portal
│   │   ├── portal/
│   │   ├── matters/
│   │   ├── documents/
│   │   └── invoices/
│   ├── (dashboard)/              # Staff dashboard
│   │   ├── dashboard/
│   │   ├── admin/
│   │   └── cms/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── documents/
│   │   ├── stripe/
│   │   └── ai/
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Global loading
│   ├── error.tsx                 # Global error
│   └── not-found.tsx             # 404 page
├── components/                   # Shared components
│   ├── ui/                       # shadcn/ui components (60+)
│   ├── layout/                   # Layout components
│   ├── forms/                    # Form components
│   ├── navigation/               # Navigation components
│   └── features/                 # Feature-specific components
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase client
│   ├── stripe/                   # Stripe utilities
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # Constants
├── hooks/                        # Custom React hooks
├── contexts/                     # React contexts
├── services/                     # Business logic services
├── types/                        # TypeScript types
├── styles/                       # Global styles
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── articles/
└── docs/                         # Documentation
```

---

## Phase 2: Public-Facing Pages (PRIORITY)

### 2.1 Homepage Migration

**Source:** `src/pages/Index.tsx` + `src/App.tsx`
**Target:** `app/(public)/page.tsx`

**Components to migrate:**
- Hero.tsx → components/features/Hero.tsx
- AboutSection.tsx → components/features/AboutSection.tsx
- ServicesSection.tsx → components/features/ServicesSection.tsx
- TestimonialsSection.tsx → components/features/TestimonialsSection.tsx
- CTASection.tsx → components/features/CTASection.tsx
- Navigation.tsx → components/layout/Navigation.tsx
- Footer.tsx → components/layout/Footer.tsx

**Server Component Strategy:**
```tsx
// app/(public)/page.tsx - Server Component
import { Hero } from '@/components/features/Hero'
import { AboutSection } from '@/components/features/AboutSection'
import { getTestimonials } from '@/lib/supabase/queries'

export default async function HomePage() {
  const testimonials = await getTestimonials() // Server-side fetch

  return (
    <>
      <Hero />
      <AboutSection />
      <TestimonialsSection testimonials={testimonials} />
    </>
  )
}
```

### 2.2 Service Pages

| Source Page | Target Route | Priority |
|-------------|--------------|----------|
| Services.tsx | /services | HIGH |
| PracticeSetup.tsx | /services/practice-setup | HIGH |
| RegulatoryCompliance.tsx | /services/regulatory-compliance | HIGH |
| PropertyLeasing.tsx | /services/property-leasing | HIGH |
| EmploymentHR.tsx | /services/employment-hr | HIGH |
| DisputeResolution.tsx | /services/dispute-resolution | HIGH |
| MedicalPracticeCompliance.tsx | /services/medical-practice | HIGH |
| HealthcareContracts.tsx | /services/healthcare-contracts | HIGH |
| IntellectualProperty.tsx | /services/intellectual-property | MEDIUM |
| RiskManagement.tsx | /services/risk-management | MEDIUM |

### 2.3 Resource Pages

| Source Page | Target Route | Priority |
|-------------|--------------|----------|
| TenantDoctor.tsx | /resources/tenant-doctor | HIGH |
| AhpraDeclarations.tsx | /resources/ahpra | HIGH |
| PayrollTax.tsx | /resources/payroll-tax | MEDIUM |
| PathologyAudits.tsx | /resources/pathology-audits | MEDIUM |
| Copyright.tsx | /resources/copyright | LOW |
| CorporateCommercial.tsx | /resources/corporate | LOW |

### 2.4 Content Pages

| Source Page | Target Route | Priority |
|-------------|--------------|----------|
| About.tsx | /about | HIGH |
| Contact.tsx | /contact | HIGH |
| Articles.tsx | /articles | HIGH |
| ArticleDetail.tsx | /articles/[slug] | HIGH |
| KnowledgeBase.tsx | /knowledge-base | MEDIUM |

---

## Phase 3: Component Migration Strategy

### 3.1 shadcn/ui Components (60+ files)

**Migration approach:** Copy and adapt from source

```bash
# Initialize shadcn/ui in Next.js 16 project
npx shadcn@latest init
```

**Components to install:**
```bash
npx shadcn@latest add accordion alert alert-dialog avatar badge breadcrumb button calendar card carousel checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider switch table tabs textarea toast toggle toggle-group tooltip
```

### 3.2 Custom Components Migration Map

| Source Component | Target Location | Notes |
|-----------------|-----------------|-------|
| Navigation.tsx | components/layout/Navigation.tsx | Convert to Server Component where possible |
| Hero.tsx | components/features/Hero.tsx | Client Component (animations) |
| BookingSystem/ | components/features/booking/ | Complex - multiple files |
| ChatSupport/ | components/features/chat/ | Client Component (real-time) |
| ClientPortal/ | components/features/portal/ | Protected routes |
| ArticleCMS/ | components/features/cms/ | Staff-only |
| DocumentLibrary/ | components/features/documents/ | Mixed SSR/CSR |

### 3.3 Hooks Migration

| Source Hook | Target Location | Changes |
|-------------|-----------------|---------|
| useAuth | hooks/useAuth.ts | Integrate with Supabase SSR |
| useBooking | hooks/useBooking.ts | Server Actions |
| useDocuments | hooks/useDocuments.ts | Server Components |
| useAnalytics | hooks/useAnalytics.ts | PostHog integration |

---

## Phase 4: Routing Migration

### 4.1 React Router → App Router Mapping

```typescript
// Source: React Router v7 (Client-Side)
// Target: Next.js App Router (Server-First)

// BEFORE (React Router)
<Route path="/" element={<Index />} />
<Route path="/about" element={<About />} />
<Route path="/services/:slug" element={<ServiceDetail />} />
<Route path="/articles/:id" element={<ArticleDetail />} />

// AFTER (Next.js App Router)
app/
├── page.tsx                    // /
├── about/page.tsx              // /about
├── services/[slug]/page.tsx    // /services/:slug
├── articles/[id]/page.tsx      // /articles/:id
```

### 4.2 Dynamic Routes

```typescript
// app/services/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getServiceBySlug } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  // Pre-render all service pages at build time
  return [
    { slug: 'practice-setup' },
    { slug: 'regulatory-compliance' },
    { slug: 'property-leasing' },
    // ... all service slugs
  ]
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) notFound()

  return <ServiceContent service={service} />
}
```

### 4.3 Route Groups

```
app/
├── (public)/           # Public layout (Header + Footer)
│   ├── layout.tsx
│   └── ...
├── (auth)/             # Auth layout (minimal)
│   ├── layout.tsx
│   └── ...
├── (portal)/           # Client portal layout
│   ├── layout.tsx
│   └── ...
└── (dashboard)/        # Staff dashboard layout
    ├── layout.tsx
    └── ...
```

---

## Phase 5: Data Fetching Strategy

### 5.1 Server Components (Default)

```typescript
// app/(public)/articles/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return <ArticleList articles={articles} />
}
```

### 5.2 Client Components (When Needed)

```typescript
// components/features/booking/BookingCalendar.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>()

  const { data: slots } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => fetchAvailableSlots(selectedDate),
    enabled: !!selectedDate,
  })

  return (
    // Interactive calendar UI
  )
}
```

### 5.3 Server Actions

```typescript
// app/actions/booking.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = await createClient()

  const booking = {
    name: formData.get('name'),
    email: formData.get('email'),
    date: formData.get('date'),
    service: formData.get('service'),
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(booking)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/booking')
  return data
}
```

---

## Phase 6: API Routes Migration

### 6.1 Netlify Functions → Next.js API Routes

| Source Function | Target Route | Runtime |
|----------------|--------------|---------|
| sync-to-astro.js | app/api/sync/route.ts | Node |
| articles-draft.ts | app/api/articles/draft/route.ts | Edge |
| send-visa-guide.js | app/api/visa-guide/route.ts | Node |
| annotations-api.js | app/api/annotations/route.ts | Edge |

### 6.2 Example API Route

```typescript
// app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('appointments')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', date)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
```

---

## Phase 7: Styling Migration

### 7.1 Tailwind CSS v4 Configuration

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors - from source project */
  --color-primary: #2AAFA2;
  --color-primary-dark: #238F84;
  --color-secondary: #1a365d;
  --color-accent: #f59e0b;

  /* Fonts */
  --font-sans: 'Montserrat', sans-serif;
  --font-serif: 'BlairITC', serif;

  /* Custom breakpoints */
  --breakpoint-2xl: 1400px;

  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
}

/* Container customization */
@utility container {
  margin-inline: auto;
  padding-inline: 1rem;
  max-width: 1400px;
}

/* Custom font faces */
@font-face {
  font-family: 'BlairITC';
  src: url('/fonts/BlairITC-Light.woff') format('woff');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
```

### 7.2 CSS Modules (Optional)

```typescript
// For complex component-specific styles
import styles from './Component.module.css'
```

---

## Phase 8: Authentication & Authorization

### 8.1 Supabase SSR Integration

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### 8.2 Middleware Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect portal routes
  if (request.nextUrl.pathname.startsWith('/portal') && !user) {
    return NextResponse.redirect(new URL('/client-login', request.url))
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/staff-login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/portal/:path*', '/dashboard/:path*', '/admin/:path*'],
}
```

---

## Phase 9: SEO & Performance

### 9.1 Metadata

```typescript
// app/(public)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Hamilton Bailey Legal | Healthcare Law Specialists',
    template: '%s | Hamilton Bailey Legal',
  },
  description: 'Expert legal services for healthcare professionals. Practice setup, compliance, employment law, and dispute resolution.',
  keywords: ['healthcare law', 'medical practice', 'legal services', 'AHPRA', 'compliance'],
  authors: [{ name: 'Hamilton Bailey Legal' }],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://hamiltonbaileylegal.com.au',
    siteName: 'Hamilton Bailey Legal',
    images: [{ url: '/images/og-image.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### 9.2 Dynamic Metadata

```typescript
// app/(public)/articles/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params
  const article = await getArticle(id)

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  }
}
```

### 9.3 Static Generation

```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  const articles = await getAllArticles()
  return articles.map((article) => ({
    id: article.id,
  }))
}
```

---

## Phase 10: Testing Strategy

### 10.1 Unit Tests (Vitest)

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

### 10.2 E2E Tests (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

### 10.3 Test Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3016',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3016',
  },
})
```

---

## Phase 11: Deployment

### 11.1 Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Server-only
SUPABASE_SERVICE_ROLE_KEY=your_service_key
STRIPE_SECRET_KEY=your_stripe_secret
RESEND_API_KEY=your_resend_key
CLAUDE_API_KEY=your_claude_key
```

### 11.2 Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev --port 3016",
  "installCommand": "npm install"
}
```

---

## Implementation Order (Epics)

### Epic 1: Foundation (Week 1)
- [ ] Install all dependencies
- [ ] Set up directory structure
- [ ] Configure Tailwind CSS v4 theme
- [ ] Set up Supabase SSR
- [ ] Create base layouts

### Epic 2: Public Pages (Week 2-3)
- [ ] Homepage with Hero, About, Services, Testimonials
- [ ] About page
- [ ] Contact page with form
- [ ] Services index and detail pages
- [ ] Navigation and Footer

### Epic 3: Content System (Week 3-4)
- [ ] Articles listing page
- [ ] Article detail page
- [ ] Knowledge base
- [ ] Resource pages
- [ ] Search functionality

### Epic 4: Booking System (Week 4-5)
- [ ] Booking calendar component
- [ ] Appointment form
- [ ] Payment integration (Stripe)
- [ ] Confirmation emails
- [ ] Calendar sync

### Epic 5: Client Portal (Week 5-6)
- [ ] Client authentication
- [ ] Portal dashboard
- [ ] Matters management
- [ ] Document access
- [ ] Invoice viewing

### Epic 6: Staff Dashboard (Week 6-7)
- [ ] Staff authentication + 2FA
- [ ] Dashboard home
- [ ] Lead management
- [ ] Appointment management
- [ ] CMS integration

### Epic 7: E-Commerce (Week 7-8)
- [ ] Document store
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Order confirmation
- [ ] Download access

### Epic 8: AI Features (Week 8-9)
- [ ] Claude AI integration
- [ ] Document analysis
- [ ] Smart recommendations
- [ ] Chat assistant

### Epic 9: Analytics & Polish (Week 9-10)
- [ ] PostHog integration
- [ ] Performance optimization
- [ ] SEO audit
- [ ] Accessibility review
- [ ] Final testing

---

## Success Metrics

| Metric | Target | Current (Source) |
|--------|--------|------------------|
| Lighthouse Performance | 90+ | ~75 |
| Lighthouse SEO | 100 | ~85 |
| First Contentful Paint | <1.5s | ~2.5s |
| Largest Contentful Paint | <2.5s | ~4s |
| Time to Interactive | <3s | ~5s |
| Bundle Size | <500KB | ~2MB |
| Core Web Vitals | All Green | Mixed |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Complex component migration | Phased approach, component-by-component |
| State management changes | Keep TanStack Query for client state |
| API compatibility | Create adapter layer if needed |
| Authentication flow | Use Supabase SSR helper library |
| Third-party integrations | Test early, have fallbacks |

---

## BMAD Method Integration

This plan will be reviewed and refined by BMAD agents:
- **Architect (Winston)**: Architecture decisions
- **Developer (Amelia)**: Implementation details
- **PM (John)**: Prioritization and scope
- **UX Expert (Sally)**: User experience
- **Test Architect (Murat)**: Testing strategy

**After every /compact or context compression, re-activate BMAD agents to maintain continuity.**

---

*Generated by BMAD Party Mode - 2025-12-05*
