# BliTz Launch Architecture

## Product architecture

- **Front-end:** Next.js App Router, TypeScript, TailwindCSS, Framer Motion.
- **UI:** reusable component library with premium visual system and motion-ready patterns.
- **State:** lightweight store with Zustand and local UI state via React hooks.
- **Backend / Data:** Supabase + PostgreSQL for scalable relational event and invitation data.
- **ORM:** Prisma schema to model Users, Events, Books, Invitations, Preorders, CheckIns, Analytics.
- **Integrations:** WhatsApp sharing, QR code generation, Stripe-ready preorder hooks.

## Folder structure

- `app/` — Next.js pages and route handlers.
- `components/` — reusable UI primitives and experience sections.
- `lib/` — shared utilities and backend clients.
- `prisma/` — database schema and migration configuration.
- `docs/` — product planning and architecture documentation.

## Database schema plan

- `User` — event creators and organizers.
- `Event` — launch experiences with author relationship and event details.
- `Book` — books available for launch/preorder.
- `Invitation` — personalized guest invites with RSVP status.
- `Preorder` — book preorder quantity linked to invitation.
- `CheckIn` — event attendance / QR scanning record.
- `EventAnalytics` — aggregated RSVP, preorder, attendance metrics.

## UI/UX design direction

- cinematic hero experiences and emotional typography.
- premium dark/light theme with glassmorphic cards.
- animated invitation flows and polished CTA interactions.
- mobile-first design with native-app momentum.
- story-driven content blocks and personalized invitation pages.
