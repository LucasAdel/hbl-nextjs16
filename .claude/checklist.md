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
- **Total Features:** 15+
- **Completed:** 3
- **In Progress:** 0
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
