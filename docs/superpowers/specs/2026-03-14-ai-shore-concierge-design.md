# AI-First Shore Excursion Concierge — Design Spec

## Problem

Cruise passengers want to explore ports independently but face three friction points:
1. They don't know what's available at each port
2. They can't judge whether activities fit their dock window
3. Ship excursions are overpriced (30-60% markup)

The current 6-step wizard (Preferences → Activities → Transport → Accommodation → Schedule → Review) was designed for multi-day land trips. Two steps are irrelevant for cruise (Transport, Accommodation), and the manual browse-then-schedule flow doesn't match the cruise mental model: "I dock at 8am and leave at 5pm — fill my day."

## Solution

An AI-first concierge that generates a complete shore plan from minimal input. Three pages, each with one job:

1. **"Tell Us Your Cruise"** — capture ports, dock times, group size, budget, activity vibes
2. **"Your Shore Plan"** — AI-generated plan with port tabs and card-swap refinement
3. **"Book It"** — cost summary, contact info, submit quote

The AI does the heavy lifting. The user approves and tweaks.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Flow model | AI-First Concierge | Minimum user effort, strong differentiator |
| Input level | Light preferences (itinerary + vibe + budget) | Enough for AI to be smart, fast to fill |
| Refinement model | Card swap (tap to see alternatives) | Covers 80% of use cases, simple to build |
| Plan layout | Port tabs + activity cards | One port at a time reduces cognitive load |
| Page count | 3 pages (Input → Plan → Book) | Each page has one clear job |

---

## Architectural Change: Select-and-Schedule AI

**This is a fundamental shift** from the current AI contract. Today, the AI only *schedules* activities the user has already selected. The new flow requires the AI to **select activities from the catalog AND schedule them**.

### Current contract
```
User picks activities → AI assigns them to day/slot
```

### New contract
```
AI receives full catalog per port + user preferences → AI picks the best activities AND assigns slots
```

This means:
- A new edge function mode (or new endpoint) that receives the full catalog
- The AI prompt changes from "assign these activities" to "pick the best 2-3 activities per port from this catalog, then assign them to slots"
- The hook changes from `useAISchedule` (schedule-only) to `usePlanGeneration` (select + schedule)
- `selectedActivities` in the store gets populated BY the AI response, not before

---

## Multi-Port Catalog Loading

The current `useActivities(destinationId)` loads activities for one destination. Page 2 needs all catalogs simultaneously.

### New hook: `useMultiPortCatalog`

```typescript
// In src/hooks/useCatalog.ts — add new exported hook
function useMultiPortCatalog(destinationIds: string[]) {
  // Parallel queries via Promise.all or React Query's useQueries
  // Returns: Record<string, Activity[]> keyed by destinationId
  // Also returns flat allActivities: Activity[] for convenience
}
```

This hook is called on Page 2 mount with all unique destinationIds from portSchedule.

---

## `selectedDestination` in Multi-Port World

The store's `selectedDestination: Destination | null` is a single value used throughout the codebase. In the new flow:

- **`selectedDestination` remains** — set to the first port's destination (for backward compatibility with components that read it)
- Page 2 uses `portSchedule` to determine per-port destinations, NOT `selectedDestination`
- ReviewBook validation replaces `if (!selectedDestination)` with `if (portSchedule.length === 0)`
- `usePlanGeneration` hook uses `portSchedule` directly, not `selectedDestination`

---

## Page 1: "Tell Us Your Cruise"

**Route:** `/preferences` (replaces current Preferences page)

### Components

**Port Itinerary Builder** (existing, enhanced)
- Add/remove ports with: destination dropdown, date, dock arrival time, dock departure time
- Shore time auto-calculated and displayed
- Quick-add from destination cards
- Existing component — minimal changes needed

**Travelers Stepper** (existing)
- Group size ± buttons, unchanged

**Shore Budget** (existing, reframed)
- Single total budget for all shore spending (not per-port)
- Label changed from "Total budget" to "Shore budget"
- The AI distributes the budget across ports proportionally to dock window length

**Vibe Selector** (new)
- 5-6 clickable pill tags the user toggles on/off
- Tags are the display labels; stored values are the category names they map to:

| Display Label | Stored Value (= activity category) |
|---|---|
| Culture & History | Cultural Deep Dive |
| Food & Local Flavour | Food & Local Flavour |
| Beach & Water | Beach & Water |
| Adventure & Active | Adventure & Active |
| Shopping & Markets | Shopping & Markets |
| Scenic & Landmarks | Must-See Landmarks |

- Stored in tripStore as `vibePreferences: string[]` (the stored values, not display labels)
- Frosted-glass styling consistent with other hero controls

**Validation**
- At least 1 port with destination, date, and dock times
- Departure after arrival for each port
- At least 1 vibe selected

**What's removed**
- DateRangeCalendar (ports define dates)
- Destination insights section (moved to Page 2 as port context)
- Destination cards grid stays as quick-add shortcuts for ports

### Navigation

- "Generate My Shore Plan" button (replaces "Continue to activities")
- Navigates to `/plan`
- `onBack` → `/home`

---

## Page 2: "Your Shore Plan"

**Route:** `/plan` (new page, replaces Activities + Transport + Accommodation + Schedule)

### Entry Flow

1. Page mounts → reads `portSchedule` + `vibePreferences` from tripStore
2. Guard: if `portSchedule.length === 0`, redirect to `/preferences`
3. Calls `useMultiPortCatalog` to load activity catalogs for all ports in parallel
4. Calls `usePlanGeneration` → AI generates a full plan (selecting + scheduling)
5. Shows thinking animation: "Building your shore plan..."
6. On AI response: populates `selectedActivities` in store, stores AI reasons
7. Plan reveals with staggered animation per port

### Layout

**Port Tab Bar** (top, horizontally scrollable, `overflow-x-auto`)
- One tab per port: `[Barcelona Apr 15] [Dubrovnik Apr 16] [Santorini Apr 17]`
- Active tab highlighted with niche primary color
- Each tab shows: port name, date, shore hours badge

**Active Port Hero** (below tabs)
- Port name (large), country
- Dock window: "⚓ Dock 08:00 – 17:00"
- "All aboard by 16:30" warning in amber (computed as `dockDeparture - 30 minutes`)
- Port cost subtotal (sum of activities scheduled to this port)

**Activity Cards** (below hero)
- One card per filled time slot (Morning, Afternoon, optionally Evening)
- Evening slot only shown when `dockDeparture >= 18:00`
- Card contents:
  - Time slot label + time range (dock window divided into thirds)
  - Activity thumbnail image
  - Activity title, duration, price per person
  - AI reasoning line (italic, 8-12 words) — read from `aiReasons[activityId]`
  - **Swap button** → opens swap drawer
  - **Remove button** → removes from `selectedActivities`, slot shows "Free time"
- Empty slot shows "Free time" card with **Add button** → opens swap drawer for that slot

**Swap Drawer** (bottom sheet on mobile, side modal on desktop)
- Shows up to 3 alternative activities for the same slot
- Source: `multiPortCatalog[currentPort.destinationId]` filtered by:
  - Not already in the plan
  - Duration fits within slot's time range
  - Category matches at least one `vibePreference` (soft preference, not hard filter)
- Ranked by: category match to vibes (primary) → price closest to budget share (secondary)
- If fewer than 3 alternatives exist, show what's available with a note
- Each alternative: thumbnail, title, duration, price, one-line description
- User taps to select → replaces in `selectedActivities`, drawer closes

**Running Totals**
- Per-port subtotal in the port hero
- Grand total in a sticky footer bar: "Total: €360 for 4 travelers · €90/person"
- Footer also has "Continue to Book" button

### AI Integration — New Contract

**This is a new AI mode, not a modification of the existing schedule-only flow.**

**New hook: `usePlanGeneration`** (replaces `useAISchedule` for cruise)

```typescript
function usePlanGeneration() {
  // Reads from store: portSchedule, vibePreferences, budget, travelers
  // Takes: multiPortCatalog (Record<string, Activity[]>)
  // Calls: fetchAIPlan() → new function in ai.ts
  // On success: calls store.setSelectedActivitiesFromPlan(plan)
  // Returns: { phase, plan, error, retry }
}
```

**Request body sent to edge function:**
```json
{
  "mode": "plan",
  "ports": [
    {
      "portIndex": 1,
      "name": "Barcelona",
      "country": "Spain",
      "dockArrival": "08:00",
      "dockDeparture": "17:00",
      "catalog": [
        { "id": "bcn-gothic", "title": "Gothic Quarter Walk", "duration": 3, "price": 35, "category": "Cultural Deep Dive", "description": "..." },
        { "id": "bcn-boqueria", "title": "La Boqueria Food Tour", "duration": 3.5, "price": 55, "category": "Food & Local Flavour", "description": "..." }
      ]
    }
  ],
  "travelers": 4,
  "totalBudget": 500,
  "vibes": ["Cultural Deep Dive", "Food & Local Flavour"]
}
```

**Response from edge function:**
```json
{
  "plan": [
    {
      "portIndex": 1,
      "activities": [
        { "activityId": "bcn-gothic", "slot": "Morning", "reason": "Cooler morning temps ideal for 3h walking tour" },
        { "activityId": "bcn-boqueria", "slot": "Afternoon", "reason": "Post-walk food tour — arrive hungry" }
      ]
    }
  ]
}
```

**Edge function prompt additions (when `mode === "plan"`):**
```
You are a cruise shore excursion concierge. For each port, SELECT the best 2-3 activities
from the provided catalog AND assign them to time slots.

SELECTION CRITERIA:
- Prefer activities matching the traveler's vibe preferences: [vibes]
- Stay within budget: total €[budget] across all ports, distribute proportionally
- Pick a balanced mix — don't select 3 activities from the same category
- Prefer highly-rated and unique local experiences

SCHEDULING RULES:
- [existing dock time / buffer / slot rules]

For each port, select 2-3 activities (fewer for short dock windows under 6 hours).
```

**Processing the response:**
1. For each `activityId` in the response, look up the full Activity object from the catalog
2. Set `activity.scheduled = { day: portIndex, slot }`
3. Store reasoning: `aiReasons[activityId] = reason`
4. Call `store.addActivity(activity)` for each — populates `selectedActivities`

### State Additions (tripStore)

```typescript
// New state
aiReasons: Record<string, string>        // activityId → AI reasoning text
setAIReasons: (reasons: Record<string, string>) => void
clearAIReasons: () => void

// New action
setSelectedActivitiesFromPlan: (activities: Activity[]) => void
// Replaces entire selectedActivities array (used by plan generation)
```

`aiReasons` is cleared in `clearTripData`.

### Error Handling

- **AI call fails:** Show error banner with "Retry" button and "Or browse activities manually" link (falls back to a simple catalog browse mode — flat list of activities per port, user adds manually)
- **Port has zero catalog activities:** Show "No activities available for this port yet" in the port tab content
- **AI returns unknown activityId:** Skip that activity silently, log warning
- **Direct navigation to `/plan` without Page 1:** Guard redirect to `/preferences`

### Validation

- At least 1 activity selected across all ports
- "Continue to Book" button in sticky footer

---

## Page 3: "Book It"

**Route:** `/review` (simplified from current ReviewBook)

### Layout

**Itinerary Summary** (compact)
- Per-port: port name, date, dock times, selected activities with times and prices
- Visual timeline connector between ports

**Cost Breakdown**
- Per-port subtotals
- Grand total
- Per-person cost
- No accommodation or transport lines

**Contact Form**
- Full name, email, phone (with inline validation — already built)
- Preferred contact method (email/phone/WhatsApp)
- Special requests textarea with cruise-relevant placeholders:
  - "Guide language preference, accessibility needs, cabin reference, dietary requirements"

**Submit**
- Creates quote request via `useCreateQuoteRequest`
- Submission payload: drops `accommodation` and `transport` fields (set to `null`)
- Success state with reference number and next steps

### Navigation
- `onBack` → `/plan`

### Validation Changes
- Remove: `if (!selectedAccommodation)` check
- Remove: `if (!selectedTransport)` check
- Replace: `if (!selectedDestination)` with `if (portSchedule.length === 0)`

---

## Route Changes

### Current (6 steps in wizard)
```
/preferences → /activities → /transport → /accommodation → /schedule → /review
```

### New (3 steps)
```
/preferences → /plan → /review
```

### routes.tsx changes
- Add new route: `/plan` → `ShorePlan` component (eager-loaded, critical path)
- Remove `/activities`, `/transport`, `/accommodation`, `/schedule` from wizard children
- Update `onNext`/`onBack` callbacks:
  - Preferences: `onNext → /plan`, `onBack → /home`
  - ShorePlan: `onNext → /review`, `onBack → /preferences`
  - Review: `onBack → /plan`

### Navigation/Layout changes
- `MainLayout` steps array: reduce from 6 to 3 items
- `Navigation` component: update step labels to ["Your Cruise", "Shore Plan", "Book"]
- `FloatingContinueButton`: pass `totalSteps: 3`
- `TripSummary` sidebar: remove accommodation/transport sections, show port-based summary

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ShorePlan.tsx` | **Create** | Page 2 — AI plan with port tabs, activity cards, swap drawer |
| `src/pages/Preferences.tsx` | **Modify** | Add vibe selector, remove destination grid complexity, update nav to `/plan` |
| `src/pages/ReviewBook.tsx` | **Modify** | Remove accommodation/transport sections and validation, update `onBack` |
| `src/store/tripStore.ts` | **Modify** | Add `vibePreferences`, `aiReasons`, `setSelectedActivitiesFromPlan` |
| `src/routes.tsx` | **Modify** | Add `/plan` route, remove 4 wizard steps, update nav callbacks |
| `src/lib/ai.ts` | **Modify** | Add `fetchAIPlan()` function for select-and-schedule mode |
| `src/hooks/usePlanGeneration.ts` | **Create** | New hook for AI plan generation (replaces useAISchedule for cruise) |
| `src/hooks/useCatalog.ts` | **Modify** | Add `useMultiPortCatalog(destinationIds)` hook |
| `supabase/functions/ai-schedule/index.ts` | **Modify** | Add `mode: "plan"` with select-and-schedule prompt |
| `src/components/MainLayout.tsx` | **Modify** | Update steps array from 6 to 3 |
| `src/components/Navigation.tsx` | **Modify** | Update step labels |
| `src/components/TripSummary.tsx` | **Modify** | Remove accommodation/transport, show port-based summary |
| `src/hooks/useQuoteRequests.ts` | **Modify** | Make accommodation/transport optional in submission payload |
| `src/locales/en/common.json` | **Modify** | Add plan page + vibe selector translation keys |
| `src/locales/fr/common.json` | **Modify** | French translations |
| `src/locales/es/common.json` | **Modify** | Spanish translations |

---

## Out of Scope (Future)

- Chat-based refinement
- Cruise line / ship name tracking
- Cabin-based group coordination
- Port contingency planning (missed ports)
- Activity travel-time-from-dock calculations
- Guide language matching
- Real-time availability checking
- Per-port budgets (current: single total budget)
