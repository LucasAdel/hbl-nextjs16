# Hamilton Bailey Legal - Feature Checklist & Roadmap

> **IMPORTANT: This is a LIVING DOCUMENT**
> - Claude MUST continuously add new ideas, features, and functions to this checklist
> - All items must be granular and itemized with sub-tasks
> - Items are NEVER removed - only marked as completed or blocked
> - Check off items `[x]` only after successful implementation AND testing
> - Add completion dates as comments: `<!-- Completed: YYYY-MM-DD -->`

## Status Legend
```
- [ ] Not Started
- [~] In Progress
- [x] Completed
- [!] Blocked (include reason in comment)
```

## Quick Stats
- **Total Features:** 16+
- **Completed:** 3
- **In Progress:** 1 (Self-Hosted Analytics)
- **Pending:** 12+

---

## Recently Completed
<!-- Keep last 10 completed items here for quick reference -->

### Codex Table of Contents Enhancements
- [x] Sticky TOC that follows scroll <!-- Completed: 2024-12-10 -->
- [x] Active section highlighting with IntersectionObserver <!-- Completed: 2024-12-10 -->
- [x] Estimated read time per section (words per minute calculation) <!-- Completed: 2024-12-10 -->
- [x] Total article read time in TOC header <!-- Completed: 2024-12-10 -->
- [x] Reading progress bar with section counter <!-- Completed: 2024-12-10 -->
- [x] Scrollable TOC with max-height for long articles <!-- Completed: 2024-12-10 -->

### Codex Theme & Display
- [x] Force light mode for all Codex pages (CodexThemeForcer component) <!-- Completed: 2024-12-10 -->

### Bailey AI Lead Emailer
- [x] Lead emailer integration with streaming endpoint <!-- Completed: 2024-12-10 -->
- [x] Professional email template with HBL branding <!-- Completed: 2024-12-10 -->
- [x] Phone number E.164 formatting for macOS FaceTime compatibility <!-- Completed: 2024-12-10 -->

---

## macOS Call Tracking & CRM Integration

**Priority:** High
**Epic:** Lead Management & Follow-up Tracking
**Goal:** Track all phone calls made from macOS (via FaceTime/Continuity) to leads, with full CRM integration in the HBL dashboard.

### 1. Database Schema & Models

#### 1.1 Call Records Table
- [ ] Create `call_records` table in Supabase
  - [ ] `id` - UUID primary key
  - [ ] `lead_id` - Foreign key to leads table (nullable for non-lead calls)
  - [ ] `contact_name` - Name of the person called
  - [ ] `phone_number` - Phone number called (E.164 format)
  - [ ] `phone_number_display` - Formatted display version (e.g., "0412 345 678")
  - [ ] `call_direction` - ENUM: 'outbound' | 'inbound'
  - [ ] `call_status` - ENUM: 'completed' | 'missed' | 'voicemail' | 'no_answer' | 'busy'
  - [ ] `started_at` - Timestamp when call started
  - [ ] `ended_at` - Timestamp when call ended
  - [ ] `duration_seconds` - Call duration in seconds
  - [ ] `duration_formatted` - Human-readable duration (e.g., "5m 32s")
  - [ ] `notes` - Text field for call notes/summary
  - [ ] `follow_up_required` - Boolean flag
  - [ ] `follow_up_date` - Date for follow-up reminder
  - [ ] `follow_up_notes` - Notes for follow-up action
  - [ ] `call_outcome` - ENUM: 'consultation_booked' | 'information_provided' | 'callback_requested' | 'not_interested' | 'wrong_number' | 'other'
  - [ ] `matter_type` - Legal matter type discussed (if applicable)
  - [ ] `assigned_to` - User ID of staff member who made/received call
  - [ ] `created_at` - Record creation timestamp
  - [ ] `updated_at` - Record update timestamp
  - [ ] `created_by` - User ID who created the record
  - [ ] `source` - ENUM: 'manual' | 'facetime_integration' | 'voip' | 'imported'

#### 1.2 Call Tags Table
- [ ] Create `call_tags` table for categorization
  - [ ] `id` - UUID primary key
  - [ ] `call_id` - Foreign key to call_records
  - [ ] `tag` - Tag string (e.g., "urgent", "VIP", "commercial", "family-law")

#### 1.3 Call Attachments Table
- [ ] Create `call_attachments` table
  - [ ] `id` - UUID primary key
  - [ ] `call_id` - Foreign key to call_records
  - [ ] `file_name` - Original file name
  - [ ] `file_url` - Storage URL
  - [ ] `file_type` - MIME type
  - [ ] `file_size` - Size in bytes
  - [ ] `uploaded_at` - Upload timestamp

#### 1.4 Database Indexes
- [ ] Index on `phone_number` for quick lookups
- [ ] Index on `lead_id` for lead-based queries
- [ ] Index on `started_at` for date range queries
- [ ] Index on `assigned_to` for user-based queries
- [ ] Composite index on `phone_number` + `started_at`

#### 1.5 Row Level Security (RLS)
- [ ] RLS policy: Staff can view all call records
- [ ] RLS policy: Staff can only edit their own call records
- [ ] RLS policy: Admins can edit all call records
- [ ] RLS policy: Super admins can delete call records

---

### 2. API Endpoints

#### 2.1 Call Records CRUD
- [ ] `POST /api/calls` - Create new call record
  - [ ] Validate phone number format
  - [ ] Auto-link to existing lead if phone matches
  - [ ] Calculate duration from start/end times
  - [ ] Send notification if follow-up required
- [ ] `GET /api/calls` - List call records with filtering
  - [ ] Filter by date range
  - [ ] Filter by phone number
  - [ ] Filter by lead_id
  - [ ] Filter by assigned_to
  - [ ] Filter by call_status
  - [ ] Filter by call_outcome
  - [ ] Pagination support
  - [ ] Sort by date (default), duration, contact name
- [ ] `GET /api/calls/:id` - Get single call record with full details
- [ ] `PATCH /api/calls/:id` - Update call record
  - [ ] Update notes
  - [ ] Update follow-up details
  - [ ] Update call outcome
  - [ ] Update tags
- [ ] `DELETE /api/calls/:id` - Soft delete call record (admin only)

#### 2.2 Call Analytics Endpoints
- [ ] `GET /api/calls/analytics/summary` - Dashboard summary stats
  - [ ] Total calls today/week/month
  - [ ] Average call duration
  - [ ] Calls by outcome breakdown
  - [ ] Calls by staff member
  - [ ] Conversion rate (calls to consultations booked)
- [ ] `GET /api/calls/analytics/by-staff` - Staff performance metrics
- [ ] `GET /api/calls/analytics/by-lead-source` - Track which leads convert best
- [ ] `GET /api/calls/analytics/peak-hours` - Identify best times to call

#### 2.3 Integration Endpoints
- [ ] `POST /api/calls/import` - Bulk import call records (CSV)
- [ ] `GET /api/calls/export` - Export call records (CSV/Excel)
- [ ] `POST /api/calls/link-lead/:callId/:leadId` - Link call to existing lead
- [ ] `POST /api/calls/create-lead/:callId` - Create new lead from call

---

### 3. macOS Integration Options

#### 3.1 Option A: Manual Entry (MVP)
- [ ] Quick-add call form in dashboard
  - [ ] Phone number input with Australian format validation
  - [ ] Auto-lookup contact name from leads database
  - [ ] Duration picker (minutes/seconds)
  - [ ] Quick outcome selection buttons
  - [ ] Notes textarea with rich text support
  - [ ] Follow-up checkbox with date picker

#### 3.2 Option B: Browser Extension
- [ ] Chrome/Safari extension development
  - [ ] Detect `tel:` link clicks on any webpage
  - [ ] Auto-start call timer when tel: link clicked
  - [ ] Popup to add notes when call ends
  - [ ] Auto-submit to HBL dashboard API

#### 3.3 Option C: Native macOS App (Menubar)
- [ ] Electron/Tauri menubar app
  - [ ] Detect FaceTime call start/end via macOS APIs
  - [ ] Auto-capture call duration
  - [ ] Notification to add notes when call ends
  - [ ] Quick-add form in menubar dropdown
  - [ ] Sync with HBL dashboard

#### 3.4 Option D: Apple Shortcuts Integration
- [ ] Create Apple Shortcut for call logging
  - [ ] Trigger after FaceTime call ends
  - [ ] Prompt for notes
  - [ ] Send to HBL dashboard API via webhook
  - [ ] Document setup instructions for staff

#### 3.5 Option E: CallKit/FaceTime Integration (Advanced)
- [ ] Research macOS CallKit APIs
- [ ] Research FaceTime automation possibilities
- [ ] Investigate AppleScript for FaceTime events
- [ ] Consider third-party call tracking services (CallRail, etc.)

---

### 4. Dashboard UI Components

#### 4.1 Call Log Page (`/admin/calls`)
- [ ] Create new admin page for call management
- [ ] Data table with columns:
  - [ ] Date/Time
  - [ ] Contact Name (linked to lead if exists)
  - [ ] Phone Number (clickable tel: link)
  - [ ] Duration
  - [ ] Outcome (color-coded badge)
  - [ ] Assigned To
  - [ ] Actions (view, edit, delete)
- [ ] Bulk actions (export selected, delete selected)
- [ ] Quick filters bar
- [ ] Search by name or phone number
- [ ] Date range picker

#### 4.2 Call Detail Modal/Page
- [ ] Full call details view
- [ ] Edit form for notes and follow-up
- [ ] Activity timeline showing edits
- [ ] Link to associated lead profile
- [ ] Quick actions:
  - [ ] Call again (tel: link)
  - [ ] Send follow-up email
  - [ ] Schedule follow-up
  - [ ] Create task

#### 4.3 Quick Add Call Widget
- [ ] Floating action button (FAB) on dashboard
- [ ] Slide-out panel for quick call entry
- [ ] Recent contacts quick-select
- [ ] Voice-to-text for notes (optional)

#### 4.4 Call Analytics Dashboard
- [ ] KPI cards:
  - [ ] Total calls today
  - [ ] Average duration
  - [ ] Consultations booked
  - [ ] Follow-ups pending
- [ ] Charts:
  - [ ] Calls over time (line chart)
  - [ ] Calls by outcome (pie chart)
  - [ ] Calls by staff (bar chart)
  - [ ] Peak hours heatmap
- [ ] Leaderboard: Staff call performance

#### 4.5 Lead Profile Integration
- [ ] Call history section on lead detail page
- [ ] Quick-add call button on lead profile
- [ ] Call count badge on lead cards
- [ ] Last contacted date display

---

### 5. Notifications & Reminders

#### 5.1 Follow-up Reminders
- [ ] Email reminder for follow-up calls
- [ ] Dashboard notification bell
- [ ] Daily digest email of pending follow-ups
- [ ] Overdue follow-up alerts

#### 5.2 Team Notifications
- [ ] Notify assigned staff when call logged to their lead
- [ ] Notify admin when high-priority call outcome logged
- [ ] Weekly team call summary email

---

### 6. Gamification Integration

#### 6.1 XP & Achievements for Calls
- [ ] Award XP for logging calls
  - [ ] +10 XP per call logged
  - [ ] +25 XP for calls resulting in consultation booked
  - [ ] +5 XP for adding detailed notes (>100 chars)
- [ ] Achievements:
  - [ ] "First Call" - Log your first call
  - [ ] "Phone Warrior" - Log 50 calls
  - [ ] "Closer" - 10 consultations booked from calls
  - [ ] "Detailed Notes" - Add notes to 25 calls
  - [ ] "Speed Demon" - Return a lead call within 5 minutes

#### 6.2 Leaderboards
- [ ] Weekly call count leaderboard
- [ ] Conversion rate leaderboard
- [ ] Response time leaderboard

---

### 7. Reporting & Compliance

#### 7.1 Reports
- [ ] Daily call report (auto-generated)
- [ ] Weekly call summary report
- [ ] Monthly call analytics report
- [ ] Staff performance report
- [ ] Lead conversion funnel report

#### 7.2 Audit Trail
- [ ] Log all call record changes
- [ ] Track who edited what and when
- [ ] Export audit logs for compliance

#### 7.3 Data Retention
- [ ] Configure call record retention period
- [ ] Auto-archive old call records
- [ ] GDPR/Privacy compliance for call data

---

### 8. Mobile App Considerations

#### 8.1 iOS App Features (Future)
- [ ] Call logging from iPhone
- [ ] Push notifications for follow-ups
- [ ] Quick-add call widget
- [ ] CallKit integration for auto-logging

#### 8.2 Responsive Web
- [ ] Mobile-optimized call log page
- [ ] Touch-friendly quick-add form
- [ ] Swipe actions on call list

---

### 9. Third-Party Integrations

#### 9.1 VoIP Integration (Optional)
- [ ] Research Twilio integration
- [ ] Research RingCentral integration
- [ ] Research Zoom Phone integration
- [ ] Auto-log calls from VoIP system

#### 9.2 Calendar Integration
- [ ] Create calendar event when follow-up scheduled
- [ ] Google Calendar integration
- [ ] Outlook Calendar integration

#### 9.3 CRM Sync (Optional)
- [ ] Export to external CRM (HubSpot, Salesforce)
- [ ] Import from external CRM

---

### 10. Testing & QA

#### 10.1 Unit Tests
- [ ] Test call record CRUD operations
- [ ] Test duration calculation
- [ ] Test phone number formatting
- [ ] Test lead auto-linking

#### 10.2 Integration Tests
- [ ] Test API endpoints
- [ ] Test database triggers
- [ ] Test notification sending

#### 10.3 E2E Tests
- [ ] Test call logging flow
- [ ] Test call editing flow
- [ ] Test analytics dashboard
- [ ] Test export functionality

---

### 11. Documentation

- [ ] User guide for call logging
- [ ] API documentation
- [ ] Admin configuration guide
- [ ] macOS integration setup guide
- [ ] Troubleshooting guide

---

### 12. Implementation Phases

#### Phase 1: MVP (Manual Entry)
- [ ] Database schema
- [ ] Basic CRUD API
- [ ] Call log page UI
- [ ] Quick-add form
- [ ] Lead profile integration

#### Phase 2: Analytics
- [ ] Analytics endpoints
- [ ] Dashboard charts
- [ ] Basic reports

#### Phase 3: Automation
- [ ] Browser extension OR
- [ ] Apple Shortcuts integration OR
- [ ] Menubar app

#### Phase 4: Advanced
- [ ] Gamification
- [ ] Mobile optimization
- [ ] Third-party integrations

---

## Self-Hosted Analytics System (PostHog Replacement)

**Priority:** High
**Epic:** First-Party Analytics & Privacy
**Goal:** Build a comprehensive self-hosted analytics system to replace PostHog, providing full data ownership, GDPR compliance without third-party data sharing, and no external costs.

### Benefits
- ✅ No third-party data sharing (full GDPR control)
- ✅ No external costs as traffic grows
- ✅ Complete ownership of all analytics data
- ✅ No cookie banner requirements for first-party analytics
- ✅ Simpler privacy policy
- ✅ Data stays in our Supabase database

---

### 1. Database Schema & Models

**Note:** Core analytics schema already exists in `analytics_events` table with comprehensive tracking fields.

#### 1.1 Page Views Table (`analytics_page_views`)
- [x] Using existing `analytics_events` table with `event_name='page_view'` <!-- Pre-existing -->
  - [ ] `id` - UUID primary key (gen_random_uuid())
  - [ ] `session_id` - UUID for grouping page views into sessions
  - [ ] `user_id` - UUID foreign key to auth.users (nullable for anonymous)
  - [ ] `path` - Text, URL path (e.g., "/services/tenant-doctor")
  - [ ] `full_url` - Text, complete URL with query params
  - [ ] `referrer` - Text, referrer URL (nullable)
  - [ ] `referrer_domain` - Text, extracted domain from referrer (nullable)
  - [ ] `page_title` - Text, document title at time of view
  - [ ] `utm_source` - Text, UTM source parameter (nullable)
  - [ ] `utm_medium` - Text, UTM medium parameter (nullable)
  - [ ] `utm_campaign` - Text, UTM campaign parameter (nullable)
  - [ ] `utm_term` - Text, UTM term parameter (nullable)
  - [ ] `utm_content` - Text, UTM content parameter (nullable)
  - [ ] `created_at` - Timestamp with timezone (default now())

#### 1.2 Sessions Table (`analytics_sessions`)
- [ ] Create `analytics_sessions` table in Supabase
  - [ ] `id` - UUID primary key (session_id referenced by page_views)
  - [ ] `user_id` - UUID foreign key to auth.users (nullable)
  - [ ] `started_at` - Timestamp, first page view
  - [ ] `ended_at` - Timestamp, last activity (updated on each page view)
  - [ ] `duration_seconds` - Integer, calculated session duration
  - [ ] `page_count` - Integer, number of pages viewed
  - [ ] `entry_page` - Text, first page visited
  - [ ] `exit_page` - Text, last page visited (updated on each view)
  - [ ] `is_bounce` - Boolean, true if only 1 page viewed
  - [ ] `device_type` - Text, 'desktop' | 'tablet' | 'mobile'
  - [ ] `browser` - Text, browser name (Chrome, Safari, Firefox, etc.)
  - [ ] `browser_version` - Text, browser version
  - [ ] `os` - Text, operating system (Windows, macOS, iOS, Android, Linux)
  - [ ] `os_version` - Text, OS version
  - [ ] `screen_width` - Integer, screen width in pixels
  - [ ] `screen_height` - Integer, screen height in pixels
  - [ ] `viewport_width` - Integer, viewport width in pixels
  - [ ] `viewport_height` - Integer, viewport height in pixels
  - [ ] `language` - Text, browser language (e.g., "en-AU")
  - [ ] `timezone` - Text, user timezone (e.g., "Australia/Sydney")
  - [ ] `country` - Text, country code from IP geolocation (nullable)
  - [ ] `city` - Text, city from IP geolocation (nullable)
  - [ ] `created_at` - Timestamp with timezone

#### 1.3 Events Table (`analytics_events`)
- [ ] Create `analytics_events` table in Supabase
  - [ ] `id` - UUID primary key
  - [ ] `session_id` - UUID foreign key to analytics_sessions
  - [ ] `user_id` - UUID foreign key to auth.users (nullable)
  - [ ] `event_name` - Text, event identifier (e.g., "form_submit", "button_click")
  - [ ] `event_category` - Text, category (e.g., "engagement", "conversion", "error")
  - [ ] `page_path` - Text, URL path where event occurred
  - [ ] `properties` - JSONB, flexible event properties
    - Example: `{"form_name": "contact", "form_id": "contact-form"}`
    - Example: `{"button_text": "Book Consultation", "button_id": "cta-book"}`
  - [ ] `element_id` - Text, DOM element ID (nullable)
  - [ ] `element_class` - Text, DOM element classes (nullable)
  - [ ] `element_text` - Text, element text content, truncated (nullable)
  - [ ] `created_at` - Timestamp with timezone

#### 1.4 Conversions Table (`analytics_conversions`)
- [ ] Create `analytics_conversions` table for goal tracking
  - [ ] `id` - UUID primary key
  - [ ] `session_id` - UUID foreign key to analytics_sessions
  - [ ] `user_id` - UUID foreign key to auth.users (nullable)
  - [ ] `conversion_type` - Text, type of conversion:
    - 'booking_started' - User started booking flow
    - 'booking_completed' - User completed booking
    - 'document_purchased' - User purchased document
    - 'contact_submitted' - User submitted contact form
    - 'lead_captured' - Bailey AI captured lead info
    - 'signup_completed' - User signed up
  - [ ] `conversion_value` - Decimal, monetary value (if applicable)
  - [ ] `source_page` - Text, page where conversion occurred
  - [ ] `properties` - JSONB, additional conversion details
  - [ ] `created_at` - Timestamp with timezone

#### 1.5 Real-Time Visitors Table (`analytics_realtime`)
- [ ] Create `analytics_realtime` table for live visitor tracking
  - [ ] `session_id` - UUID primary key (also foreign key)
  - [ ] `current_page` - Text, page currently being viewed
  - [ ] `last_activity` - Timestamp, last heartbeat
  - [ ] `is_active` - Boolean, true if activity within last 30 seconds
  - [ ] Note: Records auto-expire/delete after 5 minutes of inactivity

#### 1.6 Database Indexes
- [ ] Index on `analytics_page_views.session_id`
- [ ] Index on `analytics_page_views.path`
- [ ] Index on `analytics_page_views.created_at`
- [ ] Index on `analytics_page_views.referrer_domain`
- [ ] Composite index on `analytics_page_views(created_at, path)`
- [ ] Index on `analytics_sessions.started_at`
- [ ] Index on `analytics_sessions.user_id`
- [ ] Index on `analytics_events.event_name`
- [ ] Index on `analytics_events.created_at`
- [ ] Index on `analytics_conversions.conversion_type`
- [ ] Index on `analytics_conversions.created_at`

#### 1.7 Database Functions
- [ ] Create function `update_session_stats()` - trigger to update session on new page view
- [ ] Create function `cleanup_realtime()` - scheduled to remove stale realtime records
- [ ] Create function `calculate_session_duration()` - calculate duration on session end

#### 1.8 Row Level Security (RLS)
- [ ] RLS policy: Analytics tables are INSERT only for anonymous (API key validation)
- [ ] RLS policy: Only admins can SELECT from analytics tables
- [ ] RLS policy: No UPDATE/DELETE for non-admins
- [ ] RLS policy: Service role bypasses all for server-side operations

#### 1.9 Data Retention
- [ ] Create scheduled job to archive/delete old analytics data
- [ ] Default retention: 24 months for page views
- [ ] Default retention: 24 months for events
- [ ] Default retention: Permanent for conversions (business metrics)
- [ ] Daily aggregation job to create `analytics_daily_summary` table

---

### 2. API Endpoints

#### 2.1 Event Collection Endpoints
- [ ] `POST /api/analytics/pageview` - Track page view
  - [ ] Accept: path, title, referrer, utm params
  - [ ] Extract session_id from cookie or create new
  - [ ] Parse user agent for device/browser info
  - [ ] Rate limit: 100 requests/minute per IP
  - [ ] Validate origin header (CSRF protection)
  - [ ] Return session_id for client to store
- [ ] `POST /api/analytics/event` - Track custom event
  - [ ] Accept: event_name, category, properties, element info
  - [ ] Require valid session_id
  - [ ] Rate limit: 50 events/minute per session
  - [ ] Validate event_name against allowlist
- [ ] `POST /api/analytics/conversion` - Track conversion
  - [ ] Accept: conversion_type, value, properties
  - [ ] Require valid session_id
  - [ ] Trigger any conversion notifications
- [ ] `POST /api/analytics/heartbeat` - Keep session alive for realtime
  - [ ] Accept: session_id, current_page
  - [ ] Update realtime table
  - [ ] Called every 30 seconds while page is open

#### 2.2 Analytics Query Endpoints (Admin Only)
- [ ] `GET /api/admin/analytics/overview` - Dashboard overview stats
  - [ ] Total visitors (today, 7d, 30d)
  - [ ] Total page views (today, 7d, 30d)
  - [ ] Unique visitors
  - [ ] Average session duration
  - [ ] Bounce rate
  - [ ] Pages per session
- [ ] `GET /api/admin/analytics/pages` - Top pages report
  - [ ] Page path, views, unique visitors
  - [ ] Average time on page
  - [ ] Bounce rate per page
  - [ ] Entry rate, exit rate
- [ ] `GET /api/admin/analytics/sources` - Traffic sources report
  - [ ] Referrer breakdown
  - [ ] UTM campaign performance
  - [ ] Direct vs referral vs organic
- [ ] `GET /api/admin/analytics/devices` - Device analytics
  - [ ] Device type breakdown (desktop/tablet/mobile)
  - [ ] Browser breakdown
  - [ ] OS breakdown
  - [ ] Screen size distribution
- [ ] `GET /api/admin/analytics/geography` - Location analytics
  - [ ] Country breakdown
  - [ ] City breakdown (top 20)
  - [ ] Timezone distribution
- [ ] `GET /api/admin/analytics/events` - Event analytics
  - [ ] Event counts by name
  - [ ] Event trends over time
  - [ ] Top event categories
- [ ] `GET /api/admin/analytics/conversions` - Conversion analytics
  - [ ] Conversion counts by type
  - [ ] Conversion rate calculation
  - [ ] Conversion value totals
  - [ ] Conversion funnel visualization data
- [ ] `GET /api/admin/analytics/realtime` - Real-time visitor data
  - [ ] Current active visitors count
  - [ ] Current pages being viewed
  - [ ] Geographic distribution of active users
- [ ] `GET /api/admin/analytics/export` - Export analytics data
  - [ ] CSV export for date range
  - [ ] Filter by metrics type

---

### 3. Client-Side Tracking

#### 3.1 Analytics Provider Component
- [ ] Create `AnalyticsProvider` component (`components/providers/AnalyticsProvider.tsx`)
  - [ ] Wrap app in provider
  - [ ] Initialize session on mount
  - [ ] Store session_id in sessionStorage (not localStorage - session-scoped)
  - [ ] Handle session expiry (30 min inactivity = new session)
  - [ ] Expose tracking methods via context

#### 3.2 Page View Tracking
- [ ] Create `usePageView` hook
  - [ ] Track on route change (Next.js router events)
  - [ ] Debounce rapid navigation
  - [ ] Extract UTM params from URL
  - [ ] Get referrer from document.referrer
  - [ ] Get page title from document.title

#### 3.3 Event Tracking
- [ ] Create `useTrackEvent` hook
  - [ ] Return `trackEvent(name, category, properties)` function
  - [ ] Queue events if offline, send when online
  - [ ] Batch events to reduce API calls (send every 5 seconds or 10 events)
- [ ] Create `TrackClick` wrapper component
  - [ ] Wrap any element to auto-track clicks
  - [ ] Extract element id, classes, text
- [ ] Create `TrackForm` wrapper component
  - [ ] Wrap forms to auto-track submissions
  - [ ] Track form start (first field focus)
  - [ ] Track form abandonment
  - [ ] Track form completion

#### 3.4 Conversion Tracking
- [ ] Create `useTrackConversion` hook
  - [ ] `trackConversion(type, value?, properties?)`
  - [ ] Deduplicate conversions within session
- [ ] Integrate with existing flows:
  - [ ] Booking form completion
  - [ ] Contact form submission
  - [ ] Document purchase
  - [ ] Bailey AI lead capture

#### 3.5 Session Management
- [ ] Create `useAnalyticsSession` hook
  - [ ] Generate/retrieve session_id
  - [ ] Track session start time
  - [ ] Calculate pages per session
  - [ ] Detect returning visitors (optional localStorage flag)

#### 3.6 Real-Time Heartbeat
- [ ] Create heartbeat mechanism
  - [ ] Send heartbeat every 30 seconds while page is visible
  - [ ] Use Page Visibility API to pause when tab hidden
  - [ ] Track time on page accurately

#### 3.7 Device Detection
- [ ] Create `getDeviceInfo()` utility
  - [ ] Parse user agent for browser/OS
  - [ ] Detect device type from screen size
  - [ ] Get viewport dimensions
  - [ ] Get screen dimensions
  - [ ] Get language and timezone

---

### 4. Admin Dashboard UI

#### 4.1 Analytics Overview Page (`/admin/analytics`)
- [ ] Create main analytics dashboard page
- [ ] Date range selector (Today, 7d, 30d, Custom)
- [ ] Comparison period toggle (vs previous period)
- [ ] KPI cards row:
  - [ ] Total Visitors (with trend arrow)
  - [ ] Page Views (with trend arrow)
  - [ ] Avg. Session Duration (with trend arrow)
  - [ ] Bounce Rate (with trend arrow)
  - [ ] Conversions (with trend arrow)

#### 4.2 Visitors Chart
- [ ] Line chart: Visitors over time
  - [ ] Granularity: hourly (today), daily (7d/30d)
  - [ ] Show unique vs total visitors
  - [ ] Hover tooltip with exact values

#### 4.3 Top Pages Table
- [ ] Data table with columns:
  - [ ] Page Path (clickable link)
  - [ ] Page Views
  - [ ] Unique Visitors
  - [ ] Avg. Time on Page
  - [ ] Bounce Rate
  - [ ] Entry % / Exit %
- [ ] Sortable columns
- [ ] Search/filter by path
- [ ] Pagination (20 per page)

#### 4.4 Traffic Sources Panel
- [ ] Pie chart: Traffic source breakdown
  - [ ] Direct
  - [ ] Organic Search
  - [ ] Referral
  - [ ] Social
  - [ ] Email
  - [ ] Paid
- [ ] Top referrers list
- [ ] UTM campaign performance table

#### 4.5 Device & Browser Panel
- [ ] Donut chart: Device type breakdown
- [ ] Bar chart: Top browsers
- [ ] Bar chart: Top operating systems
- [ ] Note: "Screen size distribution coming soon"

#### 4.6 Geography Panel
- [ ] Top countries table
- [ ] Top cities table
- [ ] Map visualization (optional, use simple list if complex)

#### 4.7 Real-Time Dashboard (`/admin/analytics/realtime`)
- [ ] Live visitor count (auto-refresh every 10 seconds)
- [ ] Current pages being viewed (live list)
- [ ] World map with active visitor dots (optional)
- [ ] "Active now" indicator on main dashboard

#### 4.8 Events Dashboard (`/admin/analytics/events`)
- [ ] Events over time chart
- [ ] Top events table
- [ ] Event category breakdown
- [ ] Filter by event name/category

#### 4.9 Conversions Dashboard (`/admin/analytics/conversions`)
- [ ] Conversion funnel visualization
  - [ ] Page View → Engagement → Conversion
- [ ] Conversion rate by type
- [ ] Conversion value totals
- [ ] Top converting pages

#### 4.10 Export & Reports
- [ ] Export button on each dashboard section
- [ ] CSV download for date range
- [ ] Scheduled email reports (future enhancement)

---

### 5. Migration from PostHog

#### 5.1 Remove PostHog Dependencies
- [x] Remove `posthog-js` from package.json <!-- Completed: 2025-12-15 -->
- [ ] Remove `NEXT_PUBLIC_POSTHOG_KEY` from environment variables
- [ ] Remove `NEXT_PUBLIC_POSTHOG_HOST` from environment variables
- [x] Delete `components/providers/PostHogProvider.tsx` <!-- Completed: 2025-12-15 -->
- [x] Delete `lib/analytics/posthog-pageview.tsx` <!-- Completed: 2025-12-15 -->
- [x] Update `app/layout.tsx` to remove PostHog provider <!-- Completed: 2025-12-15 -->
- [x] Delete `lib/posthog.ts` <!-- Completed: 2025-12-15 -->

#### 5.2 Replace with New Analytics
- [x] Add `AnalyticsProvider` to `app/layout.tsx` <!-- Already present, using existing -->
- [x] Existing comprehensive tracker replaces PostHog functionality <!-- Completed: 2025-12-15 -->
- [x] Update cookie consent to reference first-party analytics only <!-- Completed: 2025-12-15 -->
- [x] Update privacy policy to reflect first-party analytics <!-- Completed: 2025-12-15 -->

#### 5.3 Verify Migration
- [ ] Test page view tracking works
- [ ] Test event tracking works
- [ ] Test conversion tracking works
- [ ] Verify no PostHog network requests
- [ ] Test admin dashboard displays data

---

### 6. Privacy & Compliance

#### 6.1 Privacy by Design
- [ ] No PII stored in analytics (email, name, phone never logged)
- [ ] IP addresses NOT stored (only derived country/city)
- [ ] User agent parsed server-side, raw string not stored
- [ ] Session IDs not linkable to user identity for anonymous users
- [ ] Cookie-less tracking option (session storage only)

#### 6.2 GDPR Compliance
- [ ] First-party analytics = no consent required for essential analytics
- [ ] Document analytics as "legitimate interest" in privacy policy
- [ ] Implement data export for user data requests (already done)
- [ ] Implement data deletion for user data requests (already done)
- [ ] 24-month automatic data retention limit

#### 6.3 Cookie Policy Update
- [ ] Update cookie policy to list analytics session cookie
- [ ] Cookie name: `hbl_analytics_session`
- [ ] Cookie duration: Session only (browser close = delete)
- [ ] Cookie purpose: "Track pages viewed for website improvement"
- [ ] First-party only, no third-party sharing

---

### 7. Performance Optimizations

#### 7.1 Client-Side Performance
- [ ] Analytics script < 5KB gzipped
- [ ] Async/deferred script loading
- [ ] No blocking of page render
- [ ] Batch API calls (group events, send periodically)
- [ ] Use `navigator.sendBeacon` for page unload events

#### 7.2 Server-Side Performance
- [ ] Rate limiting to prevent abuse
- [ ] Async processing (return 200 immediately, process in background)
- [ ] Database connection pooling
- [ ] Query result caching (Redis) for dashboard data
- [ ] Aggregate old data into daily summaries

#### 7.3 Database Performance
- [ ] Partitioning by month for large tables (future)
- [ ] Materialized views for common aggregations (future)
- [ ] Query optimization with EXPLAIN ANALYZE

---

### 8. Testing

#### 8.1 Unit Tests
- [ ] Test page view API endpoint
- [ ] Test event API endpoint
- [ ] Test conversion API endpoint
- [ ] Test session management logic
- [ ] Test device detection utility
- [ ] Test UTM parameter parsing
- [ ] Test data aggregation functions

#### 8.2 Integration Tests
- [ ] Test full page view tracking flow
- [ ] Test event tracking with batching
- [ ] Test session creation and update
- [ ] Test admin API authentication
- [ ] Test data export endpoint

#### 8.3 E2E Tests
- [ ] Test analytics dashboard loads
- [ ] Test date range filtering
- [ ] Test real-time updates
- [ ] Test export functionality
- [ ] Test tracking on key pages (home, services, contact)

#### 8.4 Performance Tests
- [ ] Load test analytics API (1000 req/s)
- [ ] Measure tracking script impact on page load
- [ ] Test dashboard query performance

---

### 9. Documentation

#### 9.1 Technical Documentation
- [ ] Database schema documentation
- [ ] API endpoint documentation
- [ ] Event tracking guide (how to add new events)
- [ ] Conversion tracking guide

#### 9.2 Admin User Guide
- [ ] Dashboard overview tour
- [ ] Understanding metrics definitions
- [ ] Reading conversion funnels
- [ ] Exporting data guide

---

### 10. Implementation Phases

#### Phase 1: Core Tracking (MVP)
- [ ] Database schema (page_views, sessions, events)
- [ ] Page view API endpoint
- [ ] Event API endpoint
- [ ] AnalyticsProvider component
- [ ] Basic page view tracking
- [ ] Remove PostHog dependencies

#### Phase 2: Admin Dashboard
- [ ] Overview dashboard page
- [ ] Top pages report
- [ ] Traffic sources report
- [ ] Basic charts and tables

#### Phase 3: Advanced Tracking
- [ ] Conversion tracking
- [ ] Real-time visitors
- [ ] Event batching
- [ ] Session duration tracking

#### Phase 4: Enhanced Dashboard
- [ ] Device/browser analytics
- [ ] Geography analytics
- [ ] Events dashboard
- [ ] Conversions dashboard
- [ ] Export functionality

#### Phase 5: Optimizations
- [ ] Performance tuning
- [ ] Data aggregation jobs
- [ ] Caching layer
- [ ] Advanced reports

---

### 11. Predefined Events (Built-in Tracking)

#### 11.1 Automatic Events
- [ ] `page_view` - Every page navigation
- [ ] `session_start` - New session created
- [ ] `session_end` - Session ended (via heartbeat timeout)

#### 11.2 Engagement Events
- [ ] `scroll_depth` - User scrolled 25%, 50%, 75%, 100%
- [ ] `time_on_page` - User spent 30s, 60s, 120s, 300s on page
- [ ] `outbound_click` - User clicked external link
- [ ] `file_download` - User downloaded a file
- [ ] `video_play` - User played embedded video (if any)

#### 11.3 Form Events
- [ ] `form_start` - User focused first form field
- [ ] `form_submit` - User submitted form
- [ ] `form_error` - Form validation error occurred
- [ ] `form_abandon` - User left page with partially filled form

#### 11.4 Bailey AI Events
- [ ] `chat_open` - User opened Bailey AI chat
- [ ] `chat_message_sent` - User sent a message
- [ ] `chat_lead_captured` - Lead info captured
- [ ] `chat_cta_clicked` - User clicked CTA in chat

#### 11.5 Conversion Events
- [ ] `booking_started` - User began booking flow
- [ ] `booking_completed` - User completed booking
- [ ] `contact_submitted` - Contact form submitted
- [ ] `document_viewed` - Document page viewed
- [ ] `document_purchased` - Document purchased
- [ ] `signup_completed` - User created account

---

*Added: 2025-12-15*
*Status: Not Started*

---

## Other Pending Features

### Bailey AI Enhancements
- [x] Lead emailer integration with streaming endpoint <!-- Completed: 2024-12-10 -->
- [x] Professional email template with HBL branding <!-- Completed: 2024-12-10 -->
- [x] Phone number E.164 formatting for macOS FaceTime compatibility <!-- Completed: 2024-12-10 -->
- [x] Chat button notification badge (red "1" indicator) <!-- Completed: 2025-12-11 - CURRENT STATE: Hardcoded "1" badge showing for all users when hasNewMessage is true (proactive message indicator) -->
- [ ] **FUTURE: Multitenancy chat badge - track per-user unread message counts**
  - [ ] CURRENT STATE: Badge displays hardcoded "1" for all users
  - [ ] NOT YET: Tracking actual unread message counts per user in database
  - [ ] NOT YET: Passing user ID to chat widget component
  - [ ] NOT YET: Fetching unread count from database via API
  - [ ] NOT YET: Displaying dynamic count instead of hardcoded "1"
  - [ ] NOT YET: Updating badge when new messages arrive in real-time
  - [ ] NOT YET: Clearing unread count when user opens chat
  - [ ] NOTE: Currently shows "1" for all users (proactive message indicator only, not per-user unread tracking)
- [ ] AI conversation analytics dashboard
- [ ] Lead scoring based on chat interactions
- [ ] Automated follow-up email sequences

### Admin Dashboard
- [ ] Real-time analytics dashboard
- [ ] Staff performance metrics
- [ ] Client portal

### Email Marketing
- [ ] Newsletter system
- [ ] Drip campaign builder
- [ ] Email template library

---

*Last Updated: 2024-12-10*
