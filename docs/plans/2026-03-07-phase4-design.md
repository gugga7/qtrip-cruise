# QTRIP Phase 4 — Admin Dashboard, Per-Person Participants, PWA

**Date:** 2026-03-07
**Status:** Approved

---

## 1. Per-Person Activity Participants

### Data model
- Add `participants: number` to Activity type (defaults to `travelers` when added)
- tripStore: `addActivity` sets `participants = travelers`
- New action: `setActivityParticipants(activityId, count)` — clamps 1..travelers
- `getTotalCost()`: `sum + activity.price * (activity.participants ?? travelers)`

### UI
- Activity card: when selected, show participants stepper `[–] 6/8 people [+]`
- Inline price: `activity.price x participants = total`
- Trip summary sidebar + Review page: show participant count per activity
- BookingDetail: reflect per-activity participant counts

---

## 2. Admin Dashboard Upgrade

### Dashboard page (`/admin`)
- Fetch real stats from trips table: total quotes, pending, confirmed, revenue
- Recent quotes list (last 5) with status badges
- Restyle to pink theme
- "Review Quotes" quick action

### QuoteReview page (`/admin/quotes`)
- Replace demo data with Supabase query on trips table
- Status updates write back to Supabase
- "Send quote" triggers email Edge Function
- Refresh button to reload
- Show participant counts per activity in expanded detail
- Load on mount, manual refresh (no realtime)

---

## 3. PWA + Offline

- vite-plugin-pwa for service worker (app shell caching)
- Install prompt on mobile
- Manifest upgrade with 192px + 512px icons
- Offline: network requests fail gracefully with toast
- Wizard already works offline via Zustand/localStorage
