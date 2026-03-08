# Phase 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make QTRIP production-ready with real data persistence, auth gating, clean codebase, and test coverage.

**Architecture:** Supabase for persistence (trips table + RLS), auth-gated routes via existing ProtectedRoute, React.lazy for code splitting, Vitest for testing. The wizard remains local-first; data persists only on quote submission or explicit draft save.

**Tech Stack:** React 18, Supabase (auth + DB + Edge Functions), Zustand, React Router 6, Vitest + React Testing Library, Framer Motion.

---

### Task 1: Dead Code Removal

Delete all files with zero imports. This reduces bundle size and removes confusion before any new work.

**Step 1: Delete unused component files**

Delete these 45 files (all verified zero imports):

```
# Components (top-level)
src/components/AIScheduleOptimizer.tsx
src/components/APIErrorBoundary.tsx
src/components/ActivityFilters.tsx
src/components/CategoryBar.tsx
src/components/CostBreakdown.tsx
src/components/CollaborationPanel.tsx
src/components/DaySchedule.tsx
src/components/DestinationGuide.tsx
src/components/DraggableActivity.tsx
src/components/DropPreview.tsx
src/components/DroppableSlot.tsx
src/components/ErrorMessage.tsx
src/components/ExpenseSplitting.tsx
src/components/FlightRateIndicator.tsx
src/components/GroupRecommendations.tsx
src/components/InfoTooltip.tsx
src/components/LoadingSpinner.tsx
src/components/LoadingStates.tsx
src/components/MediaViewer.tsx
src/components/OptimizationPreferences.tsx
src/components/OptimizationProgress.tsx
src/components/OptimizationSuggestions.tsx
src/components/PlanActions.tsx
src/components/RecommendedActivities.tsx
src/components/ScheduleAnimation.tsx
src/components/SeasonIndicator.tsx
src/components/SmartScheduler.tsx
src/components/SwapConfirmationDialog.tsx
src/components/TransportCard.tsx
src/components/TravelDocuments.tsx
src/components/WeatherForecast.tsx
src/components/DailyItinerary.tsx
src/components/TripSummaryReview.tsx

# Components (destination subfolder)
src/components/destination/DestinationGuide.tsx

# Components (TripPlanner subfolder — entire directory)
src/components/TripPlanner/

# Empty UI stubs
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/input.tsx
src/components/ui/motion-div.tsx

# Empty auth stubs
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
```

**Step 2: Delete unused hooks, utils, services, types, config, data**

```
# Hooks
src/hooks/useApi.ts
src/hooks/useAuth.ts
src/hooks/useBookings.ts
src/hooks/useDestination.ts
src/hooks/useDestinationDetails.ts
src/hooks/useOptimizationHistory.ts
src/hooks/useRealtime.ts
src/hooks/useScheduleOptimizer.ts
src/hooks/useStepValidation.ts
src/hooks/useSupabase.ts

# Services
src/services/aiScheduleManager.ts
src/services/realTimeData.ts

# Utils
src/utils/activityHandlers.ts
src/utils/apiCache.ts
src/utils/apiConfig.ts
src/utils/dateFormatters.ts
src/utils/defaultPreferences.ts
src/utils/gridHelpers.ts
src/utils/haptics.ts
src/utils/logger.ts
src/utils/sounds.ts

# Types
src/types/optimization.ts
src/types/preferences.ts
src/types/scheduling.ts

# Config/Data
src/config/mockConfig.ts
src/data/mockData.ts
```

**Step 3: Verify build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Clean build, no errors. Bundle should be smaller.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove 70+ unused files (dead code cleanup)"
```

---

### Task 2: Home Page as Entry Point

**Files:**
- Modify: `src/routes.tsx:71-77`

**Step 1: Change `/` redirect from `/preferences` to `/home`**

In `src/routes.tsx`, change the MainLayout `index` redirect:

```tsx
// Before
{
  index: true,
  element: <Navigate to="preferences" replace />,
}

// After
{
  index: true,
  element: <Navigate to="/home" replace />,
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/routes.tsx
git commit -m "feat: make /home the default entry point"
```

---

### Task 3: Code Splitting with React.lazy

**Files:**
- Modify: `src/routes.tsx`

**Step 1: Convert standalone page imports to React.lazy**

Replace the top-level imports in `src/routes.tsx` with lazy imports and wrap route elements in Suspense:

```tsx
import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { FullPageSpinner } from './components/Spinner';

// Eagerly loaded (wizard — sequential, always visited)
import { Preferences } from './pages/Preferences';
import { Activities } from './pages/Activities';
import { Transport } from './pages/Transport';
import { Accommodation } from './pages/Accommodation';
import { Schedule } from './pages/Schedule';
import { ReviewBook } from './pages/ReviewBook';
import { MainLayout } from './components/MainLayout';

// Lazy loaded (standalone pages)
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Profile = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const JoinGroup = React.lazy(() => import('./pages/JoinGroup').then(m => ({ default: m.JoinGroup })));
const BookingDetail = React.lazy(() => import('./pages/BookingDetail').then(m => ({ default: m.BookingDetail })));
const Routes = React.lazy(() => import('./pages/Routes').then(m => ({ default: m.Routes })));

// Lazy loaded (admin pages)
const Dashboard = React.lazy(() => import('./admin/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Cities = React.lazy(() => import('./admin/pages/Cities').then(m => ({ default: m.Cities })));
const Products = React.lazy(() => import('./admin/pages/Products').then(m => ({ default: m.Products })));
const AIConfig = React.lazy(() => import('./admin/pages/AIConfig').then(m => ({ default: m.AIConfig })));
const QuoteReview = React.lazy(() => import('./admin/pages/QuoteReview').then(m => ({ default: m.QuoteReview })));
const AdminLayout = React.lazy(() => import('./admin/components/AdminLayout').then(m => ({ default: m.AdminLayout })));

// Helper: wrap lazy component in Suspense
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullPageSpinner />}>{children}</Suspense>;
}
```

Then wrap each lazy route element:

```tsx
// Example for Home route:
{
  path: '/home',
  element: <Lazy><Home /></Lazy>,
}
```

Apply `<Lazy>` wrapping to: Home, Login, Profile, JoinGroup, BookingDetail, Routes, and all admin routes.

**Step 2: Verify build**

Run: `npx vite build`
Expected: Multiple chunks in output instead of one large bundle.

**Step 3: Commit**

```bash
git add src/routes.tsx
git commit -m "perf: lazy-load standalone and admin pages for code splitting"
```

---

### Task 4: Auth Gating — Fix ProtectedRoute & Wire Routes

**Files:**
- Modify: `src/components/ProtectedRoute.tsx`
- Modify: `src/routes.tsx`

**Step 1: Fix ProtectedRoute to use `useAuth()` correctly**

The current ProtectedRoute uses `token` which doesn't exist on the auth context. Fix it:

```tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from './Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

**Step 2: Wrap protected routes in `routes.tsx`**

Import ProtectedRoute and wrap `/profile`, `/booking`, and `/admin` routes:

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Profile route
{
  path: '/profile',
  element: <ProtectedRoute><Lazy><Profile /></Lazy></ProtectedRoute>,
}

// Booking route
{
  path: '/booking',
  element: <ProtectedRoute><Lazy><BookingDetail /></Lazy></ProtectedRoute>,
}

// Admin routes
{
  path: '/admin',
  element: <ProtectedRoute><Lazy><AdminLayout /></Lazy></ProtectedRoute>,
  children: [...]
}
```

**Step 3: Update Login page to redirect back after auth**

In `src/pages/Login.tsx`, use location state to redirect back:

```tsx
import { useNavigate, useLocation } from 'react-router-dom';

// Inside Login component:
const location = useLocation();
const from = (location.state as any)?.from?.pathname || '/home';

// In handleSubmit, change navigate('/') to:
navigate(from, { replace: true });
```

**Step 4: Verify build**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/components/ProtectedRoute.tsx src/routes.tsx src/pages/Login.tsx
git commit -m "feat: wire auth gating on profile, booking, and admin routes"
```

---

### Task 5: Supabase Trips Table Migration

**Files:**
- Create: `supabase/migrations/002_trips_table.sql`

**Step 1: Write the migration**

```sql
-- Create trip status enum
CREATE TYPE trip_status AS ENUM ('draft', 'submitted', 'quoted', 'confirmed', 'paid', 'completed');

-- Create trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status trip_status NOT NULL DEFAULT 'draft',
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  destination_id TEXT,
  destination_name TEXT,
  start_date DATE,
  end_date DATE,
  travelers INTEGER NOT NULL DEFAULT 2,
  budget NUMERIC,
  budget_type TEXT DEFAULT 'total',
  currency TEXT DEFAULT 'EUR',
  selected_activities JSONB DEFAULT '[]'::jsonb,
  selected_accommodation JSONB,
  selected_transport JSONB,
  schedule JSONB,
  group_id UUID REFERENCES trip_groups(id) ON DELETE SET NULL,
  total_cost NUMERIC,
  notes TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user lookups
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);

-- RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous quote submissions)
CREATE POLICY "Anyone can submit a trip" ON trips
  FOR INSERT WITH CHECK (true);

-- Users can read their own trips
CREATE POLICY "Users read own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own trips
CREATE POLICY "Users update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trips_updated_at();
```

**Step 2: Commit**

```bash
git add supabase/migrations/002_trips_table.sql
git commit -m "feat: add trips table migration with RLS"
```

---

### Task 6: Quote Submission Flow — Save Trip + Email + Navigate to Register

**Files:**
- Modify: `src/hooks/useQuoteRequests.ts`
- Modify: `src/pages/ReviewBook.tsx`
- Modify: `src/pages/Login.tsx`

**Step 1: Update `useQuoteRequests.ts` to save to `trips` table and call email Edge Function**

```tsx
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Activity, AccommodationType, Destination, QuoteRequestFormValues, TransportType } from '../lib/types';

interface QuoteRequestPayload {
  form: QuoteRequestFormValues;
  destination: Destination;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  budget: number;
  currency: string;
  estimatedTotal: number;
  activities: Activity[];
  accommodation: AccommodationType | null;
  transport: TransportType | null;
}

export function useCreateQuoteRequest() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: QuoteRequestPayload) => {
      // 1. Save trip to trips table
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user?.id ?? null,
          status: 'submitted',
          email: payload.form.email,
          full_name: payload.form.fullName,
          phone: payload.form.phone,
          preferred_contact_method: payload.form.preferredContactMethod,
          destination_id: payload.destination.id,
          destination_name: payload.destination.name,
          start_date: payload.startDate,
          end_date: payload.endDate,
          travelers: payload.travelers,
          budget: payload.budget || null,
          budget_type: 'total',
          currency: payload.currency,
          total_cost: payload.estimatedTotal,
          selected_activities: payload.activities,
          selected_accommodation: payload.accommodation,
          selected_transport: payload.transport,
          schedule: payload.activities.map((a) => ({
            id: a.id,
            title: a.title,
            scheduled: a.scheduled ?? null,
          })),
          notes: payload.form.notes || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // 2. Call send-email Edge Function
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (functionsUrl && anonKey) {
        // Send quote_submitted to user
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            to: payload.form.email,
            template: 'quote_submitted',
            locale: document.documentElement.lang || 'en',
            data: {
              name: payload.form.fullName,
              destination: payload.destination.name,
              travelers: payload.travelers,
              startDate: payload.startDate,
              endDate: payload.endDate,
              estimatedTotal: payload.estimatedTotal,
              currency: payload.currency,
            },
          }),
        }).catch(console.error);

        // Send quote_received to admin
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            to: 'admin@qtrip.com',
            template: 'quote_received',
            locale: 'en',
            data: {
              name: payload.form.fullName,
              email: payload.form.email,
              phone: payload.form.phone,
              destination: payload.destination.name,
              travelers: payload.travelers,
              startDate: payload.startDate,
              endDate: payload.endDate,
              estimatedTotal: payload.estimatedTotal,
              currency: payload.currency,
              notes: payload.form.notes,
            },
          }),
        }).catch(console.error);
      }

      return { id: data.id };
    },
  });
}
```

**Step 2: Update ReviewBook to navigate to `/login` (register mode) after submission**

In `src/pages/ReviewBook.tsx`, change the post-submission flow. After `setQuoteReference(result.id)` and showing confirmation, replace the "Go to Profile" button with "Create Account" that navigates to login with the trip ID:

In the `handleSubmit` success block, after `setQuoteReference(result.id)`:
```tsx
toast.success(t('review.quoteSuccess'));
// If not logged in, navigate to register after a brief delay
if (!user) {
  setTimeout(() => {
    navigate('/login', { state: { tripId: result.id, email: form.email, register: true } });
  }, 2000);
}
```

In the confirmation screen, change the "Go to Profile" button:
```tsx
{!user ? (
  <button
    onClick={() => navigate('/login', { state: { tripId: quoteReference, email: form.email, register: true } })}
    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
  >
    {t('review.createAccount')}
  </button>
) : (
  <button
    onClick={() => navigate('/booking')}
    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
  >
    {t('review.goToProfile')}
  </button>
)}
```

**Step 3: Update Login page to handle post-registration trip linking**

In `src/pages/Login.tsx`, read `state.register`, `state.email`, `state.tripId` from location state:

```tsx
const location = useLocation();
const state = location.state as { from?: { pathname: string }; tripId?: string; email?: string; register?: boolean } | null;
const from = state?.from?.pathname || '/home';

// Pre-fill email if coming from quote flow
const [email, setEmail] = useState(state?.email || '');
const [isSignUp, setIsSignUp] = useState(state?.register || false);
```

After successful auth, if `tripId` exists, link the trip to the user:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }

    // Link pending trip to the new user
    if (state?.tripId) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('trips')
          .update({ user_id: authUser.id })
          .eq('id', state.tripId)
          .is('user_id', null);
      }
      navigate('/booking', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : t('common.error'));
  } finally {
    setLoading(false);
  }
};
```

Add `import { supabase } from '../lib/supabase';` at the top.

**Step 4: Add i18n key `review.createAccount`**

Add to both EN and FR translation files:
- EN: `"createAccount": "Create an account"`
- FR: `"createAccount": "Créer un compte"`

**Step 5: Verify build**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/hooks/useQuoteRequests.ts src/pages/ReviewBook.tsx src/pages/Login.tsx src/locales/en/translation.json src/locales/fr/translation.json
git commit -m "feat: wire quote submission to trips table + email Edge Function + register redirect"
```

---

### Task 7: Save Draft Button

**Files:**
- Modify: `src/components/FloatingContinueButton.tsx`
- Create: `src/hooks/useSaveDraft.ts`

**Step 1: Create `useSaveDraft` hook**

```tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTripStore } from '../store/tripStore';

export function useSaveDraft() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const trip = useTripStore();
  const [saving, setSaving] = useState(false);

  const saveDraft = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('trips').upsert(
        {
          user_id: user.id,
          status: 'draft',
          email: user.email ?? '',
          destination_id: trip.selectedDestination?.id ?? null,
          destination_name: trip.selectedDestination?.name ?? null,
          start_date: trip.startDate,
          end_date: trip.endDate,
          travelers: trip.travelers,
          budget: trip.budget || null,
          budget_type: trip.budgetType,
          currency: trip.currency,
          selected_activities: trip.selectedActivities,
          selected_accommodation: trip.selectedAccommodation,
          selected_transport: trip.selectedTransport,
          total_cost: trip.getTotalCost(),
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      );
      if (error) throw error;
      toast.success(t('common.draftSaved'));
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return { saveDraft, saving, canSave: !!user };
}
```

**Step 2: Add "Save Draft" button to FloatingContinueButton**

In `src/components/FloatingContinueButton.tsx`, add the save draft button next to the back button when user is logged in:

Add import:
```tsx
import { useSaveDraft } from '../hooks/useSaveDraft';
import { Save } from 'lucide-react';
```

Inside the component, add:
```tsx
const { saveDraft, saving, canSave } = useSaveDraft();
```

In the button row, add between the back button and continue button:
```tsx
{canSave && (
  <button
    onClick={saveDraft}
    disabled={saving}
    className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
  >
    <Save size={16} />
    {saving ? t('common.saving') : t('common.saveDraft')}
  </button>
)}
```

**Step 3: Add i18n keys**

EN: `"draftSaved": "Draft saved"`, `"saveDraft": "Save draft"`, `"saving": "Saving..."`
FR: `"draftSaved": "Brouillon enregistré"`, `"saveDraft": "Sauvegarder"`, `"saving": "Enregistrement..."`

**Step 4: Verify build**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/hooks/useSaveDraft.ts src/components/FloatingContinueButton.tsx src/locales/
git commit -m "feat: add save draft button for logged-in users"
```

---

### Task 8: UX Bug Fixes

**Files:**
- Modify: `src/components/MobileTripPill.tsx:22`
- Modify: `src/pages/BookingDetail.tsx`

**Step 1: Fix MobileTripPill hardcoded currency**

In `src/components/MobileTripPill.tsx`, replace `&euro;` with dynamic currency:

```tsx
// Before
<span className="text-sm font-semibold text-slate-900">
  &euro;{totalCost.toFixed(0)}
</span>

// After — need to also get currency from store
const { getTotalCost, selectedActivities, selectedAccommodation, selectedTransport, currency } = useTripStore();
// ...
<span className="text-sm font-semibold text-slate-900">
  {currency === 'EUR' ? '€' : currency} {totalCost.toFixed(0)}
</span>
```

**Step 2: Normalize BookingDetail destination field**

In `src/pages/BookingDetail.tsx`, `trip.destination` is used but the store field is `selectedDestination`. The store exposes both (set together in `setDestination`), but for consistency replace `trip.destination?.name` with `trip.selectedDestination?.name` and `trip.destination?.country` with `trip.selectedDestination?.country`.

**Step 3: Verify build**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/components/MobileTripPill.tsx src/pages/BookingDetail.tsx
git commit -m "fix: dynamic currency in MobileTripPill, normalize destination field in BookingDetail"
```

---

### Task 9: Form Validation Polish

**Files:**
- Modify: `src/pages/Preferences.tsx`

**Step 1: Add red border on invalid date range**

In `src/pages/Preferences.tsx`, add a `dateError` flag:

```tsx
const dateError = startDate && endDate && new Date(endDate) <= new Date(startDate);
```

Add visual feedback to the end date input:

```tsx
<input
  type="date"
  min={startDate ?? new Date().toISOString().split('T')[0]}
  value={endDate ?? ''}
  onChange={(e) => setDates(startDate, e.target.value || null)}
  className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 ${
    dateError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-pink-400 focus:ring-pink-100'
  }`}
/>
{dateError && (
  <p className="text-xs text-red-500 mt-1">{t('preferences.validationDatesOrder')}</p>
)}
```

**Step 2: Commit**

```bash
git add src/pages/Preferences.tsx
git commit -m "feat: red border + inline error on invalid date range"
```

---

### Task 10: Login Page Restyle

**Files:**
- Modify: `src/pages/Login.tsx`

**Step 1: Restyle login page to match QTRIP pink theme**

The login page currently uses blue (`bg-blue-600`). Update to match the app's pink/rose theme:

- Change `bg-blue-600 hover:bg-blue-700` → `bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600`
- Change `focus:ring-blue-500 focus:border-blue-500` → `focus:ring-pink-100 focus:border-pink-400`
- Change `text-blue-600 hover:text-blue-500` → `text-pink-600 hover:text-pink-500`
- Change `bg-gray-50` → `bg-gradient-to-br from-pink-50 via-white to-fuchsia-50`
- Update input styling to rounded-xl with slate borders matching the rest of the app

**Step 2: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "style: restyle login page to match QTRIP pink theme"
```

---

### Task 11: Testing Setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
```

**Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

**Step 4: Add test script to `package.json`**

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 5: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts
git commit -m "chore: set up Vitest + React Testing Library"
```

---

### Task 12: Write Tests — tripStore

**Files:**
- Create: `src/store/__tests__/tripStore.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTripStore } from '../tripStore';

const mockDestination = {
  id: 'marrakech',
  name: 'Marrakech',
  country: 'Morocco',
  currency: 'EUR',
  heroImageUrl: '',
  description: '',
  highlights: [],
  bestTimeToVisit: [],
  language: 'Arabic',
  travelRequirements: [],
  localTips: [],
  healthAndSafety: [],
};

const mockActivity = {
  id: 'act-1',
  title: 'Desert Safari',
  description: '',
  price: 120,
  duration: 4,
  category: 'Adventure',
  imageUrl: '',
  destinationId: 'marrakech',
  scheduled: null,
  scheduledDay: null,
  scheduledSlot: null,
};

describe('tripStore', () => {
  beforeEach(() => {
    useTripStore.getState().reset();
  });

  it('sets destination and resets selections', () => {
    useTripStore.getState().addActivity(mockActivity);
    useTripStore.getState().setDestination(mockDestination);
    const state = useTripStore.getState();
    expect(state.selectedDestination?.id).toBe('marrakech');
    expect(state.selectedActivities).toHaveLength(0);
  });

  it('adds and removes activities', () => {
    useTripStore.getState().addActivity(mockActivity);
    expect(useTripStore.getState().selectedActivities).toHaveLength(1);

    // Adding same activity again should not duplicate
    useTripStore.getState().addActivity(mockActivity);
    expect(useTripStore.getState().selectedActivities).toHaveLength(1);

    useTripStore.getState().removeActivity('act-1');
    expect(useTripStore.getState().selectedActivities).toHaveLength(0);
  });

  it('calculates total cost correctly', () => {
    useTripStore.getState().setDates('2026-06-01', '2026-06-04');
    useTripStore.getState().addActivity(mockActivity);
    useTripStore.getState().setAccommodation({
      id: 'acc-1',
      name: 'Riad',
      location: 'Medina',
      pricePerNight: 200,
      type: 'riad',
      imageUrl: '',
      destinationId: 'marrakech',
      description: '',
      amenities: [],
      rating: 4.5,
    });

    const total = useTripStore.getState().getTotalCost();
    // 120 (activity) + 200*3 (3 nights) = 720
    expect(total).toBe(720);
  });

  it('resets all state', () => {
    useTripStore.getState().setDestination(mockDestination);
    useTripStore.getState().addActivity(mockActivity);
    useTripStore.getState().setTravelers(5);
    useTripStore.getState().reset();

    const state = useTripStore.getState();
    expect(state.selectedDestination).toBeNull();
    expect(state.selectedActivities).toHaveLength(0);
    expect(state.travelers).toBe(2);
  });

  it('sets budget and travelers', () => {
    useTripStore.getState().setBudget(5000, 'total');
    useTripStore.getState().setTravelers(6);
    const state = useTripStore.getState();
    expect(state.budget).toBe(5000);
    expect(state.travelers).toBe(6);
  });

  it('enforces minimum 1 traveler', () => {
    useTripStore.getState().setTravelers(0);
    expect(useTripStore.getState().travelers).toBe(1);
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/store/__tests__/tripStore.test.ts`
Expected: All 6 tests pass.

**Step 3: Commit**

```bash
git add src/store/__tests__/tripStore.test.ts
git commit -m "test: add tripStore unit tests"
```

---

### Task 13: Write Tests — groupStore

**Files:**
- Create: `src/store/__tests__/groupStore.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupStore } from '../groupStore';

describe('groupStore', () => {
  beforeEach(() => {
    const store = useGroupStore.getState();
    store.setActiveGroup(null);
  });

  it('creates a group with organizer', () => {
    const store = useGroupStore.getState();
    store.createGroup('Beach Party', 'Alice');
    const group = useGroupStore.getState().activeGroup;
    expect(group).not.toBeNull();
    expect(group!.name).toBe('Beach Party');
    expect(group!.members).toHaveLength(1);
    expect(group!.members[0].name).toBe('Alice');
    expect(group!.members[0].role).toBe('organizer');
    expect(group!.inviteCode).toBeTruthy();
  });

  it('adds and removes members', () => {
    const store = useGroupStore.getState();
    store.createGroup('Test Group', 'Alice');
    store.addMember('Bob');
    store.addMember('Charlie');

    let group = useGroupStore.getState().activeGroup!;
    expect(group.members).toHaveLength(3);

    store.removeMember(group.members[1].id);
    group = useGroupStore.getState().activeGroup!;
    expect(group.members).toHaveLength(2);
  });

  it('updates RSVP status', () => {
    const store = useGroupStore.getState();
    store.createGroup('Test', 'Alice');
    store.addMember('Bob');

    const bobId = useGroupStore.getState().activeGroup!.members[1].id;
    store.updateRSVP(bobId, 'confirmed');

    const bob = useGroupStore.getState().activeGroup!.members.find(m => m.id === bobId);
    expect(bob!.rsvpStatus).toBe('confirmed');
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/store/__tests__/groupStore.test.ts`
Expected: All 3 tests pass.

**Step 3: Commit**

```bash
git add src/store/__tests__/groupStore.test.ts
git commit -m "test: add groupStore unit tests"
```

---

### Task 14: Write Tests — formatDate

**Files:**
- Create: `src/lib/__tests__/dateFormat.test.ts`

**Step 1: Write tests**

```ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '../dateFormat';
import i18n from '../i18n';

describe('formatDate', () => {
  it('formats date in English', async () => {
    await i18n.changeLanguage('en');
    const result = formatDate(new Date('2026-06-15'), 'MMMM d, yyyy');
    expect(result).toBe('June 15, 2026');
  });

  it('formats date in French', async () => {
    await i18n.changeLanguage('fr');
    const result = formatDate(new Date('2026-06-15'), 'MMMM d, yyyy');
    expect(result).toBe('juin 15, 2026');
  });

  it('accepts string dates', async () => {
    await i18n.changeLanguage('en');
    const result = formatDate('2026-12-25', 'MMM d');
    expect(result).toBe('Dec 25');
  });
});
```

**Step 2: Run tests**

Run: `npx vitest run src/lib/__tests__/dateFormat.test.ts`
Expected: All 3 tests pass.

**Step 3: Commit**

```bash
git add src/lib/__tests__/dateFormat.test.ts
git commit -m "test: add formatDate locale tests"
```

---

### Task 15: Run All Tests & Final Build Verification

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

**Step 2: Run full build**

Run: `npx tsc --noEmit && npx vite build`
Expected: Clean build with smaller bundle (multiple chunks due to code splitting).

**Step 3: Final commit and push**

```bash
git push origin ui-polish-refined
```

---

## Summary

| Task | What | Commit |
|------|------|--------|
| 1 | Delete 70+ dead files | `chore: remove 70+ unused files` |
| 2 | `/` → `/home` | `feat: make /home the default entry point` |
| 3 | React.lazy code splitting | `perf: lazy-load standalone and admin pages` |
| 4 | ProtectedRoute + auth gating | `feat: wire auth gating on profile, booking, admin` |
| 5 | Trips table migration | `feat: add trips table migration with RLS` |
| 6 | Quote → trips table + email + register | `feat: wire quote submission to trips table` |
| 7 | Save draft button | `feat: add save draft button for logged-in users` |
| 8 | MobileTripPill currency + BookingDetail fix | `fix: dynamic currency + normalize destination` |
| 9 | Date validation red border | `feat: red border on invalid date range` |
| 10 | Login page restyle | `style: restyle login page to match pink theme` |
| 11 | Vitest setup | `chore: set up Vitest + React Testing Library` |
| 12 | tripStore tests | `test: add tripStore unit tests` |
| 13 | groupStore tests | `test: add groupStore unit tests` |
| 14 | formatDate tests | `test: add formatDate locale tests` |
| 15 | Final verification + push | — |
