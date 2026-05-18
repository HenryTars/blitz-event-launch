# BliTz Dar — Book & Poetry Event Management Platform

A premium multi-tenant event management platform for book launches and poetry events. Built with Next.js 15, TypeScript, TailwindCSS, Framer Motion, Supabase, and Prisma.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS with custom design tokens |
| Animations | Framer Motion |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (event images) |
| Validation | Zod |
| Icons | Lucide React |
| State | Zustand + React hooks |
| QR Scanner | html5-qrcode |

---

## Project Structure

```
app/                    # Next.js App Router pages + API routes
├── api/                # All backend API endpoints
│   ├── admin/          # Admin API (events, users, analytics, logs)
│   ├── checkin/        # QR check-in by short code
│   ├── events/         # Event CRUD, guest list
│   ├── invitations/    # Invitation request, RSVP, approve/reject, preorder
│   ├── notifications/  # Notification CRUD, mark-read
│   ├── upload/         # Image upload to Supabase Storage
│   └── init-db/        # DB connection health-check
├── admin/              # Admin panel pages
├── events/[slug]/      # Event pages (detail, dashboard, edit, checkin)
├── invite/[token]/     # Personalized invitation pages
├── notifications/      # Full notification inbox
├── (auth, create-event, my-events, landing)

components/             # Reusable UI components
├── ui/                 # Primitives (Button, Card, Input, Label)
├── Header.tsx          # Global nav with mobile drawer
├── NotificationBell.tsx# Dropdown notification bell
├── EventCard.tsx       # Premium event card with lifecycle badges
├── EventDetailsClient.tsx # Event detail page client component
├── InvitationPage.tsx  # Personalized invitation RSVP page
├── InvitationGenerator.tsx # Create invitations with links/QR/WhatsApp
├── ShareEvent.tsx      # Social share modal (WhatsApp, Telegram, X, Email)
├── ImageUpload.tsx     # Drag-and-drop image upload
├── QRCode.tsx          # QR code display
├── AdminSidebar.tsx    # Admin navigation sidebar
└── DeleteEventModal.tsx

lib/                    # Shared utilities
├── prisma.ts           # Prisma client singleton
├── auth.ts             # Server-side auth helpers
├── rbac.ts             # Role-based access control (getCurrentUser, requireRole, etc.)
├── audit.ts            # Audit logging helpers
├── notifications.ts    # Create notification helpers
├── event-lifecycle.ts  # Lifecycle state machine (UPCOMING/TODAY/LIVE_NOW/ENDED)
├── url.ts              # Base URL + invite link generation
├── shortcode.ts        # 6-char alphanumeric short code generator
├── utils.ts            # cn() tailwind-merge helper
├── supabase/           # Supabase SSR clients (server.ts, browser.ts)
└── validation/         # Zod schemas (event.ts, invitation.ts)

prisma/
├── schema.prisma       # Full database schema (10 models + 2 enums)

scripts/                # Database migration SQL scripts
├── migrate-schema.ts   # Initial schema: roles, audit, admin actions, settings
├── migrate-approval.ts # EventStatus enum + approval columns
├── migrate-invitation.ts # Invitation approval fields
└── migrate-notifications.ts # Notification table

middleware.ts           # Supabase auth + admin route protection
```

---

## Database Schema

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | `USER` · `ORGANIZER` · `SUPER_ADMIN` |
| `EventStatus` | `DRAFT` · `PENDING_APPROVAL` · `PUBLISHED` · `REJECTED` · `ARCHIVED` |

### Models

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| **User** | Platform users with RBAC | Has many events, invitations, audit logs |
| **Event** | Book launch / poetry events | Belongs to author (User), has books, invitations, analytics |
| **Book** | Books tied to an event | Belongs to event, has many preorders |
| **Invitation** | Guest invites with RSVP + approval | Belongs to event + user, has preorder + check-ins |
| **Preorder** | Book preorders per invitation | Belongs to invitation + book |
| **CheckIn** | Event attendance records | Belongs to invitation |
| **EventAnalytics** | Aggregated event metrics | One-to-one with event |
| **AuditLog** | System audit trail | Optional user relation |
| **AdminAction** | Admin action tracking | Belongs to admin user |
| **Notification** | In-app user notifications | Standalone, linked by userId |
| **SystemSettings** | Key-value config store | Standalone |

---

## Features

### 1. Authentication & RBAC

- Supabase Auth (email/password) with auto-provisioning of DB User on first login
- Three roles: `USER`, `ORGANIZER`, `SUPER_ADMIN`
- Server-side role checking in all API routes (`getCurrentUser`, `requireAdmin`, `requireOrganizer`, `isEventOwner`, `canModifyEvent`)
- Suspension system: suspended users blocked at auth level
- Middleware protects `/admin/*` routes from unauthenticated access

### 2. Event Management

- **Create Event**: Premium multi-section form with image uploads (hero + book cover), theme selection, book details
- **Edit Event**: Split-layout form, status-aware actions (Submit for Approval / Unpublish), SUPER_ADMIN bypass for editing any event
- **Delete Event**: Soft-delete with confirmation (type "delete" to confirm), sets `deleted=true` + `status=ARCHIVED`
- **Event Lifecycle**: Auto-calculated state — `UPCOMING`, `TODAY`, `LIVE_NOW`, `ENDED` — rendered as animated badges on cards
- **Event Status Workflow**: `DRAFT → PENDING_APPROVAL → PUBLISHED | REJECTED → ARCHIVED`
- **Visibility Rules**: Only PUBLISHED + non-ENDED events appear on the landing page
- **Featured Events**: Admins can feature/unfeature events; featured events appear in a dedicated section

### 3. Event Approval Workflow (Admin)

- Admin panel at `/admin/events` shows all events with search, status filter, pagination
- Validated status transitions (e.g., `PENDING_APPROVAL → PUBLISHED`, `PUBLISHED → ARCHIVED`)
- Rejection includes a reason field
- Events can be featured/unfeatured directly from the admin panel
- Both the organizer (via notification) and the audit log are updated on every action

### 4. Invitation System

- **Request Flow**: Public form on event detail page → invitation created with `isApproved=false`
- **Auto-approval**: If the requester is the event owner or admin, auto-approved
- **Approval Queue**: Organizers see pending requests in a dedicated "Pending Approval" section on the event dashboard
- **Approve/Reject**: One-click approve, rejection with optional reason
- **RSVP**: Guests can respond with ACCEPTED / DECLINED / LATER
- **Preorders**: Guests can preorder books (quantity 1-50) linked to their invitation
- **QR Code**: Each invitation has a unique QR for check-in
- **Token Regeneration**: Organizers can regenerate invitation tokens
- **Guest Management**: CSV export, copy invite link, remove guests with cascade cleanup

### 5. Check-In System

- Two check-in modes: manual (6-char short code) and live QR scanner (via html5-qrcode)
- Duplicate check-in detection
- Expired event blocking
- Check-in route at `/events/[slug]/checkin`

### 6. In-App Notifications

- **Notification Bell**: Header dropdown with unread badge, auto-polls every 15s
- **Notification Page**: Full inbox at `/notifications` with mark-read, mark-all-read, delete
- **Auto-triggered Notifications**:
  - Invitation approved → guest notified
  - Invitation rejected → guest notified (with rejection reason)
  - RSVP received → event owner notified
  - Event approved/rejected by admin → organizer notified

### 7. Event Sharing

- Social share modal: Copy Link, WhatsApp, Telegram, X/Twitter, Email
- Native Web Share API (preferred on mobile)
- Toast notifications for copy/share feedback
- Spring-animated modal with backdrop blur
- Integrated into event detail page hero and invitation page

### 8. Image Uploads

- Drag-and-drop or click-to-browse interface
- Validates file type (JPEG, PNG, WebP) and size (max 5MB)
- Uploads to Supabase Storage `events` bucket
- Preview, progress indicator, clear/change
- Integrated into create-event and edit-event forms

### 9. Admin Dashboard

- **Stats Grid**: Total users, events, invitations, check-ins
- **Event Status Breakdown**: Published/Pending/Draft/Rejected/Archived counts
- **Recent Activity**: Latest audit logs, recent signups
- **Full Management**: Events (search/filter/approve/reject/feature), Users (search/filter/suspend/promote), Audit Logs (filter by action/entity), Settings (key-value editor)
- **Responsive**: Mobile drawer sidebar with hamburger toggle

### 10. Event Dashboard (Organizer)

- Stats cards: Invitations, RSVPs, Accepted, Preorders, Checked-in
- Show/Hide QR code for check-in
- Export guest list as CSV
- Guest list table with copy link, regenerate, remove
- Pending approval queue with approve/reject buttons
- Edit event link, delete event button

### 11. Landing Page

- Cinematic hero section
- Upcoming events grid with lifecycle badges (Today amber, Live Now emerald with pulse)
- Featured events section
- Skeleton loading states

### 12. UI System

- Premium dark theme with gold accents (#C5A57B)
- Glassmorphism (backdrop-blur, translucent borders)
- Cinematic typography (Inter + Playfair Display)
- Framer Motion spring animations
- Responsive mobile-first design
- Custom tailwind design tokens (colors, fonts, shadows, animations, spacing)

---

## API Reference

### Public API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/events` | No | List published events with lifecycle state |
| GET | `/api/events/[slug]` | No | Single event details |
| POST | `/api/invitations/request` | No | Public invitation request |
| GET | `/api/invitations/[token]` | No | Get invitation by token |
| PATCH | `/api/invitations/[token]` | No | Submit RSVP |
| POST | `/api/invitations/[token]/preorder` | No | Place/update preorder |

### Authenticated API

| Method | Route | Required Role | Description |
|--------|-------|---------------|-------------|
| POST | `/api/events` | Authenticated | Create event |
| GET | `/api/events/mine` | Authenticated | User's events |
| PATCH | `/api/events/[slug]/edit` | Owner/Admin | Update event |
| POST | `/api/events/[slug]/delete` | Owner/Admin | Soft-delete event |
| GET | `/api/events/[slug]/guests` | Owner/Admin | List guests |
| DELETE | `/api/events/[slug]/guests/[id]` | Owner/Admin | Remove guest |
| POST | `/api/events/[slug]/guests/[id]/regenerate` | Owner/Admin | Regenerate token |
| POST | `/api/checkin/[token]` | Owner/Admin | Check in guest |
| GET | `/api/invitations/pending` | Owner/Admin | List pending approvals |
| POST | `/api/invitations/[id]/approve` | Owner/Admin | Approve invitation |
| POST | `/api/invitations/[id]/reject` | Owner/Admin | Reject invitation |
| POST | `/api/invitations/[token]/checkin` | Owner/Admin | Check in by token |
| POST | `/api/invitations` | Auth | Create invitation |
| GET | `/api/notifications` | Auth | List notifications |
| PATCH | `/api/notifications/read-all` | Auth | Mark all read |
| PATCH | `/api/notifications/[id]` | Auth | Mark one read |
| DELETE | `/api/notifications/[id]` | Auth | Delete notification |
| POST | `/api/upload` | Auth | Upload image |

### Admin API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/events` | List all events (search, status filter, pagination) |
| PATCH | `/api/admin/events` | Change event status, feature/unfeature |
| GET | `/api/admin/users` | List users (search, role filter, pagination) |
| PATCH | `/api/admin/users` | Suspend/activate/promote/demote users |
| GET | `/api/admin/analytics` | Platform-wide analytics |
| GET | `/api/admin/logs` | Audit logs (action/entity filter, pagination) |

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase pooler)
DATABASE_URL=postgresql://user:password@aws-x-xx-x-xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://user:password@aws-x-xx-x-xxx.pooler.supabase.com:5432/postgres

# Optional
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Install & Run

```bash
npm install
npx prisma generate
npx tsx scripts/migrate-schema.ts     # Initial schema
npx tsx scripts/migrate-approval.ts   # Event approval workflow
npx tsx scripts/migrate-invitation.ts # Invitation approval fields
npx tsx scripts/migrate-notifications.ts # Notification table
npm run dev
```

> **Note**: Prisma's `db push` may time out on Supabase pooler (port 6543). Use the migration scripts with `NODE_TLS_REJECT_UNAUTHORIZED=0` instead. The scripts use raw SQL via the `pg` module and handle idempotent column additions.

### Deploy to Vercel

`NEXT_PUBLIC_*` env vars are inlined at build time — they must be set before deployment. The `postinstall` hook (`prisma generate`) runs automatically during build.

### Supabase Storage

Create a public bucket called `events` in the Supabase dashboard for image uploads.

---

## Status Transition Map

```
Event Status:
  DRAFT ──────────► PENDING_APPROVAL
  PENDING_APPROVAL ──► PUBLISHED
  PENDING_APPROVAL ──► REJECTED
  PUBLISHED ────────► ARCHIVED
  PUBLISHED ────────► DRAFT
  REJECTED ────────► DRAFT
  REJECTED ────────► PENDING_APPROVAL
  ARCHIVED ────────► DRAFT
```

---

## Key Design Decisions

- **Event lifecycle**: Calculated client-side via pure function (no DB field) — uses local time
- **Soft-delete**: `Event.deleted` boolean + `status: ARCHIVED` instead of hard delete
- **Invitation approval**: `isApproved` boolean with review metadata, not a separate status
- **RBAC**: All permission checks happen server-side in API routes; UI is a secondary layer
- **Audit logging**: Fire-and-forget — never blocks the main operation
- **Notifications**: Polling-based (15s interval) in the header, no WebSocket/SSE
- **Schema migrations**: Raw SQL scripts via `pg` module instead of Prisma Migrate (due to Supabase pooler limitations)
- **File uploads**: Through a server API route → Supabase Storage, not client-side direct upload
