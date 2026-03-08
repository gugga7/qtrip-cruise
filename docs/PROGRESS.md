# QTRIP Framework Completion — Progress Tracker

**Started:** 2026-03-07
**Goal:** Complete core framework, then apply bachelor/bachelorette niche

---

## Phase 1: Core Framework

### 1. Inventory Update
- [x] Replace mock data with bachelor/bachelorette inventory
- [x] 3 destinations: Marrakech, Marbella, Faro
- [x] 6 categories: Party & Nightlife, Adventure & Outdoor, Wellness & Relaxation, Food & Drink, Culture & Sightseeing, Group Experiences
- [x] Activities (36), accommodations (9), transport (6) per destination

### 2. Niche Config System
- [x] Create `src/config/niche.ts` with NicheConfig interface
- [x] Create bachelor niche config as first instance
- [x] Feature flag hooks (`useFeature('groupBooking')`, `useNiche()`)
- [x] Wire config into app components (theme colors, destinations filter)

### 3. i18n (EN/FR)
- [x] Install i18next + react-i18next
- [x] Set up translation files structure (`src/locales/`)
- [x] EN/FR translation files with all keys
- [x] i18n initialization with localStorage persistence
- [x] Language switcher component
- [x] Wire language switcher into Navigation (desktop + mobile)
- [x] Extract hardcoded strings from remaining pages into translation keys
- [x] Localize dates with date-fns (formatDate utility with FR/EN locale)

### 4. Profile Page
- [x] Gradient hero header with initials avatar
- [x] Edit profile modal (display name, phone)
- [x] Contact info pills (email, phone)
- [x] Quick stats grid (trips, upcoming, guests, total spent)
- [x] Preferences section (language switcher + currency)
- [x] Trip history with upcoming/past tab switcher
- [x] Animated booking cards with status badges + cancel
- [x] Full i18n integration
- [x] Sign out

### 5. Group Booking
- [x] Database schema (trip_groups, group_members tables + RLS + indexes)
- [x] Zustand store (groupStore.ts with full CRUD + persistence)
- [x] Create group flow (name + organizer → invite code generated)
- [x] Invite link with copy-to-clipboard
- [x] Group dashboard (member list, RSVP badges, summary bar)
- [x] Guest list management (add/remove/confirm/decline)
- [x] Join group flow (invitee joins via link — `/join/:code` route)

### 6. Booking Completion
- [x] BookingTimeline component (5-step visual: draft → quoted → confirmed → paid → completed)
- [x] Enhanced quote confirmation screen with timeline + next-steps card
- [x] Booking detail page (standalone route `/booking` with full itinerary)
- [x] Admin quote review + send flow (`/admin/quotes`)
- [x] User accept/decline quote (BookingDetail page with status toggle)

### 7. Notifications
- [x] In-app toast notifications (react-hot-toast, already wired)
- [x] Email templates (quote submitted, quote received, booking confirmed, group invite) — EN/FR
- [x] Supabase Edge Function for sending emails (Resend API)

---

## Phase 2: Bachelor/Bachelorette Niche (after framework)

- [x] Apply bachelor theme (pink/rose/fuchsia gradient, niche-driven hero)
- [x] Countdown timer component (feature-flagged, shown on booking detail)
- [x] Expense splitting component (feature-flagged, per-person breakdown)
- [x] Dress code voting component (feature-flagged, poll with live results)
- [x] Landing page customization (destination cards, how-it-works, CTA banner)
- [x] Marketing copy in EN/FR (bachelor-themed taglines and descriptions)

---

## Completed

_(items move here when done)_
