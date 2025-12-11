# Hamilton Bailey Legal - Claude Code Instructions

## Project Overview
Hamilton Bailey Legal web application built with Next.js 16, featuring Bailey AI chatbot, Codex legal knowledge system, and comprehensive admin dashboard.

---

## CRITICAL: Feature Checklist Management

### Checklist Location
**File:** `.claude/checklist.md`

### MANDATORY Checklist Workflow

Claude MUST follow this workflow for ALL development work:

#### 1. Before Starting ANY Task
- [ ] Read `.claude/checklist.md` to check for related pending items
- [ ] If task relates to existing checklist item, work on that item
- [ ] If task is NEW, add it to the appropriate section in checklist.md

#### 2. When User Mentions New Ideas/Features
- [ ] IMMEDIATELY add to `.claude/checklist.md` with granular, itemized sub-tasks
- [ ] Break down into smallest actionable items
- [ ] Include database schema, API endpoints, UI components, tests
- [ ] Assign appropriate section or create new section

#### 3. During Implementation
- [ ] Mark current item as `[~]` (in progress) in checklist.md
- [ ] Work through sub-items sequentially
- [ ] Update checklist.md as you complete each sub-item

#### 4. After Successful Implementation & Testing
- [ ] Mark item as `[x]` (completed) in checklist.md
- [ ] Add completion date as comment: `<!-- Completed: YYYY-MM-DD -->`
- [ ] Move to next pending item

#### 5. NEVER Remove Items
- Completed items stay in checklist.md as historical record
- Failed/abandoned items get marked with `[!]` (blocked) with reason
- All items are permanent documentation

### Checklist Status Legend
```
- [ ] Not Started
- [~] In Progress
- [x] Completed
- [!] Blocked (include reason)
```

### Example Checklist Entry Format
```markdown
### Feature Name
**Priority:** High/Medium/Low
**Added:** YYYY-MM-DD
**Status:** Not Started / In Progress / Completed / Blocked

#### Sub-tasks
- [ ] Database schema design
  - [ ] Create migration file
  - [ ] Add indexes
  - [ ] Set up RLS policies
- [ ] API endpoints
  - [ ] POST /api/feature - Create
  - [ ] GET /api/feature - List
  - [ ] PATCH /api/feature/:id - Update
- [ ] UI Components
  - [ ] List view component
  - [ ] Detail view component
  - [ ] Form component
- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests

<!-- Completed: YYYY-MM-DD -->
```

---

## CRITICAL: Language Rules for Bailey AI

### NEVER Use "Avoid" for Tax Language
**NEVER use the word "avoid" in relation to taxes** in any AI chatbot output.

Instead of: "avoid payroll tax" or "avoid tax liabilities"
Use: "being deemed as not eligible for payroll tax" or "structuring to ensure not eligible for payroll tax"

**Correct Examples:**
- "We help medical practices structure arrangements to ensure they are not eligible for payroll tax"
- "Properly structured Tenant Doctor™ arrangements result in practitioners being deemed not eligible for payroll tax"
- "Our expertise ensures your practice is structured to be outside payroll tax obligations"

**NEVER say:**
- "avoid payroll tax"
- "avoid tax liabilities"
- "avoid being liable"

This framing focuses on legitimate structuring that results in non-eligibility, rather than "avoidance" which has negative connotations.

---

## CRITICAL: Facilities Service Provider Terminology

**NEVER refer to physical premises as "medical practice" or "clinic"** in Bailey AI chatbot output when discussing Tenant Doctor™ arrangements or payroll tax structuring.

**Correct terminology:** "Facilities Service Provider providing Administrative Services to Australian Medical and Healthcare Practitioners"

**Acceptable shortened forms:**
- "Facilities Service Provider" (FSP)
- "the Facilities Service Provider entity"
- "administrative services provider"

**NEVER say (in structuring/payroll tax context):**
- "medical practice" (when referring to the physical premises/business)
- "clinic"
- "medical centre" (when referring to the FSP entity)

**Correct Examples:**
- "We help Facilities Service Providers structure arrangements so they are deemed not eligible for payroll tax"
- "The Facilities Service Provider provides administrative services to independent practitioners"
- "Your FSP entity can be structured to ensure non-eligibility for payroll tax"

**Note:** "Medical practice law" is acceptable as it refers to the area of law, not a physical location.

---

## CRITICAL: Tenant Doctor™ Trademark

Hamilton Bailey is **EXCLUSIVELY LICENSED** to use the Tenant Doctor™ trademark in legal documents within Australia.

**NEVER say:** "We own the Tenant Doctor™ trademark"
**ALWAYS say:** "We are exclusively licensed to use the Tenant Doctor™ trademark in legal documents within Australia"

---

## CRITICAL: Australian English Spelling

ALWAYS use Australian English spelling in all content:
- specialise (NOT specialize)
- specialised (NOT specialized)
- defence (NOT defense)
- organisation (NOT organization)
- colour (NOT color)
- favour (NOT favor)
- honour (NOT honor)
- licence (noun) / license (verb)

---

## Email Configuration

### CRITICAL: Resend Email Domain
**NEVER use `hamiltonbailey.com.au`** for Resend emails.
**ALWAYS use `hamiltonbailey.com`** (verified domain).

```typescript
// CORRECT
from: "Bailey AI <noreply@hamiltonbailey.com>"

// WRONG - Will fail silently
from: "Bailey AI <noreply@hamiltonbailey.com.au>"
```

---

## Brand Guidelines

### Colors
```css
--color-teal-primary: #2AAFA2;
--color-teal-dark: #2D6A6A;
--color-teal-light: #89DAD2;
--color-text-primary: #2E3338;
--color-text-secondary: #6B7280;
```

### Fonts
- Body: Montserrat (Google Fonts)
- Headings: BlairITC (local font)

**IMPORTANT: BlairITC Symbol Handling**
BlairITC does not render symbols well (e.g., `+`, `%`, `&`). When using BlairITC (`font-blair`) with symbols:
- Wrap the symbol in a span with Montserrat: `<span className="font-montserrat">+</span>`
- Example: `Join 700<span className="font-montserrat">+</span> Medical Professionals`

### Button Gradient
```css
background: linear-gradient(135deg, #2AAFA2 0%, #2D6A6A 100%);
```

---

## Key File Locations

### Bailey AI
- Chat Widget: `features/bailey-ai/components/ai-chat-widget.tsx`
- Lead Emailer: `features/bailey-ai/lib/lead-emailer.ts`
- Knowledge Base: `features/bailey-ai/lib/knowledge-base.ts`
- API Stream: `app/api/chat/stream/route.ts`
- API Standard: `app/api/chat/route.ts`

### Codex (Legal Knowledge)
- Articles Data: `lib/codex/articles-data.ts`
- Article Page: `app/codex/[slug]/page.tsx`
- Components: `components/codex/`

### Admin Dashboard
- Root: `app/admin/`
- Analytics: `app/admin/analytics/`
- Bailey AI Admin: `app/admin/bailey-ai/`

---

## Phone Number Formatting

### For tel: links (macOS FaceTime compatibility)
Always use E.164 international format:
```typescript
// Convert Australian numbers
const formatPhoneForTel = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+61${cleaned.slice(1)}`; // 0412345678 -> +61412345678
  }
  return cleaned;
};
```

### For display
Use spaced format: `0412 345 678`

---

## Deployment

### Staging Site
- URL: `https://hbl-law-staging.netlify.app`
- Deploy: `npx netlify deploy --prod`

### Environment Variables
Required in Netlify:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Deploy to staging
npx netlify deploy --prod

# Type check
npx tsc --noEmit
```

---

## Testing Checklist Before Deploy

1. [ ] `npm run build` succeeds
2. [ ] No TypeScript errors
3. [ ] Test critical user flows:
   - [ ] Bailey AI chat responds
   - [ ] Lead notifications send
   - [ ] Admin dashboard loads
4. [ ] Check Netlify function logs after deploy

---

*Last Updated: 2024-12-10*
