# QTRIP Framework Completion & Niche Architecture Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the QTRIP core framework so it can serve as a white-label base for niche travel booking apps. First niche: Bachelor/Bachelorette trips in Marrakech, Marbella, and Faro.

**Architecture:** Single codebase with config-driven theming and feature toggles. A `niche.config.ts` file controls theme (colors, fonts, copy), enabled features, and inventory source. Each niche is a configuration — not a separate app.

**Tech Stack:** React 18, TypeScript, Zustand, Supabase, Tailwind, Framer Motion, i18next, Vite

---

## Design Decisions

### 1. Niche Config System

A single `src/config/niche.ts` exports the active niche configuration:

```typescript
interface NicheConfig {
  id: string;                    // 'bachelor' | 'wellness' | 'corporate'
  name: string;                  // 'Bachelor & Bachelorette'
  tagline: string;               // 'Plan the ultimate celebration'
  destinations: string[];        // ['marrakech', 'marbella', 'faro']
  features: {
    groupBooking: boolean;
    votingSystem: boolean;
    countdownTimer: boolean;
    expenseSplitting: boolean;
    guestList: boolean;
    itinerarySharing: boolean;
  };
  theme: {
    primary: string;             // Tailwind color key
    accent: string;
    gradient: string;
    logo?: string;
  };
  categories: string[];          // Activity categories for this niche
  defaultCurrency: string;
  supportedLanguages: string[];
}
```

### 2. i18n (English + French)

- Library: `i18next` + `react-i18next`
- Namespace-based: `common`, `steps`, `activities`, `profile`, `errors`
- Translation files: `src/locales/{en,fr}/{namespace}.json`
- Language switcher in Navigation
- Dates localized via `date-fns/locale`

### 3. Profile Page

Full profile with:
- User avatar + display name + edit capability
- Trip history (past bookings with status)
- Upcoming trips with countdown
- Saved preferences (language, currency, notification settings)
- Group memberships
- Sign out

### 4. Group Booking Model

Core to bachelor/bachelorette use case:
- Trip organizer creates trip, gets a shareable invite link
- Invitees join via link, can view itinerary
- Organizer controls bookings; invitees can vote/suggest
- Group size tracked for pricing (per-person activities/transport)
- Guest list management (names, dietary restrictions, arrival info)

Database additions:
- `trip_groups` table (id, name, organizer_id, invite_code, trip_data)
- `group_members` table (group_id, user_id, role, rsvp_status, metadata)

### 5. Booking Completion Flow

Current flow ends at quote submission. Extend to:
- Quote request -> Admin reviews -> Quote sent to user
- User accepts quote -> Booking confirmed
- Status tracking: draft -> quoted -> confirmed -> paid -> completed
- Booking detail page with full itinerary + status timeline

### 6. Notification System

Phase 1 (MVP):
- Email confirmations (quote submitted, booking confirmed)
- In-app toast notifications
- Group invite emails

Phase 2 (later):
- Push notifications
- WhatsApp integration
- Reminder emails before trip

---

## Implementation Priority

1. Inventory update (bachelor/bachelorette data for 3 cities)
2. Niche config system (`niche.config.ts` + feature flags)
3. i18n infrastructure (i18next setup + EN/FR translations)
4. Profile page (complete rewrite)
5. Group booking model (database + store + UI)
6. Booking completion flow (status tracking + detail page)
7. Notification system (email + in-app toasts)

---

## Approved by user: 2026-03-07
