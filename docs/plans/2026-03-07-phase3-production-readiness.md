# QTRIP Phase 3 — Production Readiness, UX Polish & Testing

**Date:** 2026-03-07
**Status:** Approved
**Priority order:** Production readiness > UX polish > Testing

---

## 1. Supabase Data Persistence

### Database schema

New `trips` table:
- `id` (uuid, PK), `user_id` (FK auth.users, nullable — anonymous submissions allowed)
- `status` (enum: draft | submitted | quoted | confirmed | paid | completed)
- `email` (text — contact email provided on Review page)
- `destination_id`, `start_date`, `end_date`, `travelers`, `budget`, `budget_type`, `currency`
- `selected_activities` (jsonb), `selected_accommodation` (jsonb), `selected_transport` (jsonb), `schedule` (jsonb)
- `group_id` (FK trip_groups, nullable), `total_cost` (numeric)
- `created_at`, `updated_at` timestamps
- RLS: users read/write own trips; anonymous inserts allowed (user_id null)

### Quote submission flow

1. User clicks "Submit Quote" on Review page
2. Save trip to `trips` table (user_id null for anonymous users)
3. Call `send-email` Edge Function: `quote_submitted` (to user email) + `quote_received` (to admin)
4. Navigate to `/register` with trip ID in route state
5. After registration, link the trip to the new user_id
6. Redirect to `/booking`

### Save draft

- Optional button on floating continue bar, visible only when logged in
- Saves current wizard state to `trips` with status `draft`
- Toast: "Draft saved."

---

## 2. Auth Gating

### Protected routes (wrap with ProtectedRoute)
- `/profile`
- `/booking`
- `/admin/*`

### Unprotected routes
- `/home` (landing)
- `/preferences`, `/activities`, `/transport`, `/accommodation`, `/schedule`, `/review` (wizard)
- `/join/:code` (redirects to login if not authenticated)

### Post-registration redirect
After registering from the quote flow, automatically link the pending trip to the user's `user_id` and redirect to `/booking`.

### Review page
Add email input field (required) for anonymous users. Used for Edge Function and pre-fills registration form.

---

## 3. Home Page as Entry Point

- `/` redirects to `/home` instead of `/preferences`
- Wizard stays at root level: `/preferences`, `/activities`, etc.
- "Start Planning" on Home navigates to `/preferences`
- No navigation changes needed — step nav only shows on MainLayout routes

---

## 4. Code Splitting & Performance

### Lazy routes
Convert to `React.lazy()` with `Suspense` + `FullPageSpinner` fallback:
- Home, Login, Profile, BookingDetail, JoinGroup
- All admin pages
- Wizard pages stay eagerly loaded (sequential flow)

### Dead code removal
Delete unused files (verify zero imports via grep before each deletion):
- `src/components/TripPlanner/` (entire subfolder)
- `src/components/PlanActions.tsx`
- `src/components/LoadingSpinner.tsx` (replaced by Spinner.tsx)
- `src/components/LoadingStates.tsx`
- Any other components with zero imports

---

## 5. UX Polish

### Form validation
- Review page: email input with inline validation (required, valid format)
- Preferences: red border on invalid date ranges

### Micro-interactions
- Toast after quote submission: "Quote submitted! Check your email."
- Toast after save draft: "Draft saved."
- Success animation on quote confirmation (checkmark scale-in)

### Bug fixes
- MobileTripPill: replace hardcoded `€` with `trip.currency`
- BookingDetail: normalize `trip.destination` vs `trip.selectedDestination`

---

## 6. Testing

### Setup
- Add Vitest + React Testing Library + jsdom

### Test coverage (critical paths, ~10-15 tests)
- `tripStore` — set destination, add/remove activities, cost calculations, reset
- `groupStore` — create group, add/remove members, RSVP status
- Quote submission flow — saves trip, calls Edge Function, navigates to register
- `LanguageSwitcher` — toggles language, updates i18n
- `formatDate` — correct locale output for EN/FR
