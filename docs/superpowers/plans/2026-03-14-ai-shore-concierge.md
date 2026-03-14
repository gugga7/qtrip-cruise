# AI-First Shore Excursion Concierge Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the 6-step cruise booking wizard into a 3-page AI-first concierge: Input → AI Plan → Book.

**Architecture:** The AI shifts from schedule-only to select-and-schedule. A new `usePlanGeneration` hook sends the full activity catalog per port to the edge function, which picks the best activities AND assigns them to time slots. The user refines via card-swap on a port-tabbed UI.

**Tech Stack:** React 18, TypeScript, Zustand (persist), Supabase Edge Functions (Deno), Kimi AI (kimi-k2-turbo-preview), Tailwind CSS, Framer Motion, react-i18next.

**Spec:** `docs/superpowers/specs/2026-03-14-ai-shore-concierge-design.md`

---

## Chunk 1: Foundation — Store, Catalog, AI Layer

### Task 1: Extend tripStore with vibePreferences and aiReasons

**Files:**
- Modify: `src/store/tripStore.ts`

- [ ] **Step 1: Add vibePreferences and aiReasons to TripState interface**

After line 45 (`portSchedule: PortStop[];`), add:
```typescript
vibePreferences: string[];
setVibePreferences: (vibes: string[]) => void;
aiReasons: Record<string, string>;
setAIReasons: (reasons: Record<string, string>) => void;
clearAIReasons: () => void;
setSelectedActivitiesFromPlan: (activities: Activity[]) => void;
```

- [ ] **Step 2: Add defaults to baseState**

After line 62 (`portSchedule: [] as PortStop[],`), add:
```typescript
vibePreferences: [] as string[],
aiReasons: {} as Record<string, string>,
```

- [ ] **Step 3: Add action implementations**

After the `updatePortTime` action (line 116), add:
```typescript
setVibePreferences: (vibes) => set({ vibePreferences: vibes }),
setAIReasons: (reasons) => set({ aiReasons: reasons }),
clearAIReasons: () => set({ aiReasons: {} }),
setSelectedActivitiesFromPlan: (activities) => set({ selectedActivities: activities }),
```

- [ ] **Step 4: Update clearTripData to reset new fields**

In `clearTripData` (line 117), the current `set(baseState)` already handles this since baseState includes the new defaults.

- [ ] **Step 5: Type check**

Run: `cd /Users/Shared/proj-backups/qtrip-cruise && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/store/tripStore.ts
git commit -m "feat(store): add vibePreferences, aiReasons, setSelectedActivitiesFromPlan"
```

---

### Task 2: Add useMultiPortCatalog hook

**Files:**
- Modify: `src/hooks/useCatalog.ts`

- [ ] **Step 1: Add useMultiPortCatalog hook**

At the end of the file, add:
```typescript
export function useMultiPortCatalog(destinationIds: string[]): {
  catalogs: Record<string, Activity[]>;
  loading: boolean;
} {
  const [catalogs, setCatalogs] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (destinationIds.length === 0) { setLoading(false); return; }
    setLoading(true);

    const uniqueIds = [...new Set(destinationIds)];
    Promise.all(
      uniqueIds.map(async (destId) => {
        if (!supabase) return { destId, activities: [] as Activity[] };
        const { data } = await supabase
          .from('activities')
          .select('*')
          .eq('destination_id', destId)
          .eq('is_active', true);
        const activities = (data ?? []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          destinationId: row.destination_id as string,
          title: (row.title as string) || (row.name as string) || '',
          description: (row.description as string) || '',
          duration: Number(row.duration) || 2,
          price: Number(row.price) || 0,
          category: (row.category as string) || '',
          location: (row.location as string) || '',
          tags: (row.tags as string[]) || [],
          mainImageUrl: (row.main_image_url as string) || '',
          galleryUrls: [],
        })) as Activity[];
        return { destId, activities };
      })
    ).then((results) => {
      const map: Record<string, Activity[]> = {};
      for (const { destId, activities } of results) {
        map[destId] = activities;
      }
      setCatalogs(map);
      setLoading(false);
    });
  }, [destinationIds.join(',')]);

  return { catalogs, loading };
}
```

- [ ] **Step 2: Add missing imports at top of file**

Ensure `useState` and `useEffect` are imported from React (they should already be).

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCatalog.ts
git commit -m "feat(hooks): add useMultiPortCatalog for multi-port catalog loading"
```

---

### Task 3: Add fetchAIPlan to ai.ts

**Files:**
- Modify: `src/lib/ai.ts`

- [ ] **Step 1: Add PlanResponse interface and fetchAIPlan function**

After the existing `fetchAISchedule` function, add:
```typescript
interface PortPlanRequest {
  portIndex: number;
  name: string;
  country: string;
  dockArrival: string;
  dockDeparture: string;
  catalog: Array<{
    id: string;
    title: string;
    duration: number;
    price: number;
    category: string;
    description: string;
    location?: string;
    tags?: string[];
  }>;
}

interface PlanAssignment {
  portIndex: number;
  activities: Array<{
    activityId: string;
    slot: ScheduleSlotName;
    reason: string;
  }>;
}

export async function fetchAIPlan(
  ports: PortPlanRequest[],
  travelers: number,
  totalBudget: number,
  vibes: string[],
): Promise<PlanAssignment[]> {
  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!functionsUrl) throw new Error('Missing Supabase configuration');

  const response = await fetch(`${functionsUrl}/ai-schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'plan',
      ports,
      travelers,
      totalBudget,
      vibes,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI plan generation failed: ${text}`);
  }

  const data = await response.json();
  if (!data.plan || !Array.isArray(data.plan)) {
    throw new Error('Invalid AI plan response');
  }

  return data.plan as PlanAssignment[];
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai.ts
git commit -m "feat(ai): add fetchAIPlan for select-and-schedule concierge mode"
```

---

### Task 4: Create usePlanGeneration hook

**Files:**
- Create: `src/hooks/usePlanGeneration.ts`

- [ ] **Step 1: Write the hook**

```typescript
import { useState, useRef, useCallback } from 'react';
import { useTripStore } from '../store/tripStore';
import { fetchAIPlan } from '../lib/ai';
import type { Activity } from '../lib/types';

export type PlanPhase = 'idle' | 'thinking' | 'revealing' | 'done' | 'error';

const THINKING_MESSAGES = [
  'Checking port schedules...',
  'Finding the best experiences...',
  'Fitting activities to your dock windows...',
  'Building your shore plan...',
  'Almost ready...',
];

export function usePlanGeneration(catalogs: Record<string, Activity[]>) {
  const [phase, setPhase] = useState<PlanPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const hasRun = useRef(false);

  const generate = useCallback(async () => {
    const { portSchedule, vibePreferences, budget, travelers, setSelectedActivitiesFromPlan, setAIReasons } = useTripStore.getState();

    if (portSchedule.length === 0) return;

    setPhase('thinking');
    setError(null);
    setRevealedCount(0);

    // Cycle thinking messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[msgIdx]);
    }, 1200);

    try {
      // Build port plan requests
      const ports = portSchedule.map((port) => {
        const portCatalog = catalogs[port.destinationId] ?? [];
        return {
          portIndex: port.portIndex,
          name: port.portName,
          country: '',
          dockArrival: port.dockArrival,
          dockDeparture: port.dockDeparture,
          catalog: portCatalog.map((a) => ({
            id: a.id,
            title: a.title,
            duration: a.duration,
            price: a.price,
            category: a.category,
            description: a.description || '',
            location: a.location,
            tags: a.tags,
          })),
        };
      });

      const plan = await fetchAIPlan(ports, travelers, budget, vibePreferences);

      clearInterval(msgInterval);
      setPhase('revealing');

      // Resolve activity IDs to full Activity objects
      const allActivities: Activity[] = [];
      const reasons: Record<string, string> = {};
      let total = 0;

      for (const portPlan of plan) {
        const portCatalog = catalogs[portSchedule[portPlan.portIndex - 1]?.destinationId] ?? [];
        for (const assignment of portPlan.activities) {
          const activity = portCatalog.find((a) => a.id === assignment.activityId);
          if (!activity) {
            console.warn(`Unknown activityId from AI: ${assignment.activityId}`);
            continue;
          }
          allActivities.push({
            ...activity,
            scheduled: { day: portPlan.portIndex, slot: assignment.slot },
            participants: travelers,
          });
          reasons[assignment.activityId] = assignment.reason || '';
          total++;
        }
      }

      setTotalActivities(total);

      // Reveal with stagger
      for (let i = 0; i < allActivities.length; i++) {
        await new Promise((r) => setTimeout(r, 300));
        setSelectedActivitiesFromPlan(allActivities.slice(0, i + 1));
        setRevealedCount(i + 1);
      }

      setAIReasons(reasons);
      setPhase('done');
    } catch (err) {
      clearInterval(msgInterval);
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setPhase('error');
    }
  }, [catalogs]);

  const retry = useCallback(() => {
    useTripStore.getState().setSelectedActivitiesFromPlan([]);
    useTripStore.getState().clearAIReasons();
    hasRun.current = false;
    generate();
  }, [generate]);

  // Auto-trigger on first mount when catalogs are loaded
  const autoGenerate = useCallback(() => {
    if (hasRun.current) return;
    if (Object.keys(catalogs).length === 0) return;
    hasRun.current = true;
    generate();
  }, [catalogs, generate]);

  return {
    phase,
    thinkingMessage,
    revealedCount,
    totalActivities,
    error,
    generate: autoGenerate,
    retry,
  };
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePlanGeneration.ts
git commit -m "feat(hooks): create usePlanGeneration hook for AI concierge"
```

---

### Task 5: Enhance edge function with plan mode

**Files:**
- Modify: `supabase/functions/ai-schedule/index.ts`

- [ ] **Step 1: Add plan mode handling**

In the `serve` handler, after parsing `const body: ScheduleRequest = await req.json();`, add a branch for plan mode. Read the current file first, then add before the existing Kimi API call:

```typescript
// Check for plan mode
if ((body as any).mode === 'plan') {
  const planBody = body as any;
  const planPrompt = buildPlanSystemPrompt(planBody.vibes, planBody.totalBudget, planBody.travelers);
  const planUserMsg = buildPlanUserMessage(planBody.ports);

  const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${kimiKey}` },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: [
        { role: 'system', content: planPrompt },
        { role: 'user', content: planUserMsg },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Kimi API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Kimi');

  const plan = parsePlanResponse(content, planBody.ports);
  return new Response(JSON.stringify({ plan }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Add plan-specific prompt builders**

Before the `serve` handler, add:

```typescript
function buildPlanSystemPrompt(vibes: string[], totalBudget: number, travelers: number): string {
  return `You are a cruise shore excursion concierge. For each port, SELECT the best 2-3 activities from the provided catalog AND assign them to time slots.

SELECTION CRITERIA:
- Strongly prefer activities matching these vibes: ${vibes.join(', ')}
- Total budget across ALL ports: €${totalBudget} for ${travelers} travelers (€${Math.round(totalBudget / travelers)}/person)
- Pick a balanced mix — avoid selecting multiple activities from the same category
- Prefer unique local experiences over generic tourist activities

SCHEDULING RULES:
- Time slots: Morning, Afternoon, Evening (each = one third of the dock window)
- A 30-minute safety buffer before ship departure is MANDATORY
- If dock window is less than 8 hours, use ONLY Morning and Afternoon slots (no Evening)
- Maximum one activity per slot
- Consider 15 minutes travel time from port to first activity

OUTPUT: Return ONLY valid JSON. No markdown, no explanation:
{"plan": [{"portIndex": 1, "activities": [{"activityId": "id", "slot": "Morning", "reason": "8-12 word reason"}]}]}

Every port MUST have at least one activity. Select 2-3 per port (fewer for short dock windows under 6 hours).`;
}

function buildPlanUserMessage(ports: any[]): string {
  const lines: string[] = [];
  for (const port of ports) {
    lines.push(`\nPort ${port.portIndex}: ${port.name} (Dock ${port.dockArrival}–${port.dockDeparture})`);
    lines.push('Available activities:');
    for (const a of port.catalog || []) {
      lines.push(`  - ID: ${a.id} | "${a.title}" | ${a.duration}h | €${a.price}/person | Category: ${a.category} | ${a.description?.slice(0, 80) || 'N/A'}`);
    }
  }
  return lines.join('\n');
}

function parsePlanResponse(text: string, ports: any[]): any[] {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);
  const plan = parsed.plan || parsed;
  if (!Array.isArray(plan)) throw new Error('Plan response is not an array');

  const validSlots = ['Morning', 'Afternoon', 'Evening'];

  return plan.map((portPlan: any) => ({
    portIndex: portPlan.portIndex,
    activities: (portPlan.activities || []).filter((a: any) =>
      typeof a.activityId === 'string' && validSlots.includes(a.slot)
    ).map((a: any) => ({
      activityId: a.activityId,
      slot: a.slot,
      reason: typeof a.reason === 'string' ? a.reason : '',
    })),
  }));
}
```

- [ ] **Step 3: Type check (edge function is Deno, so just verify syntax)**

Run: `cd /Users/Shared/proj-backups/qtrip-cruise && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/ai-schedule/index.ts
git commit -m "feat(edge): add plan mode for AI concierge select-and-schedule"
```

---

## Chunk 2: Routes, Navigation, Layout (3-Step Wizard)

### Task 6: Update routes to 3-step wizard

**Files:**
- Modify: `src/routes.tsx`

- [ ] **Step 1: Add ShorePlan import**

After the existing page imports (line 13), add:
```typescript
import { ShorePlan } from './pages/ShorePlan';
```

- [ ] **Step 2: Replace wizard children**

Replace the 6 wizard children (lines 80-141) with 3:
```typescript
{
  path: 'preferences',
  element: (() => {
    const PreferencesStep = () => {
      const navigate = useNavigate();
      return <Preferences onNext={() => navigate('/plan')} onBack={() => navigate('/home')} />;
    };
    return <PreferencesStep />;
  })(),
  label: 'Your Cruise'
},
{
  path: 'plan',
  element: (() => {
    const PlanStep = () => {
      const navigate = useNavigate();
      return <ShorePlan onNext={() => navigate('/review')} onBack={() => navigate('/preferences')} />;
    };
    return <PlanStep />;
  })(),
  label: 'Shore Plan'
},
{
  path: 'review',
  element: (() => {
    const ReviewStep = () => {
      const navigate = useNavigate();
      return <ReviewBook onNext={() => navigate('/')} onBack={() => navigate('/plan')} />;
    };
    return <ReviewStep />;
  })(),
  label: 'Book'
}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes.tsx
git commit -m "feat(routes): 3-step cruise wizard — preferences, plan, review"
```

---

### Task 7: Update MainLayout steps array

**Files:**
- Modify: `src/components/MainLayout.tsx`

- [ ] **Step 1: Replace steps array (lines 9-16)**

```typescript
const steps = [
  { id: 1, title: 'Your Cruise', path: 'preferences' },
  { id: 2, title: 'Shore Plan', path: 'plan' },
  { id: 3, title: 'Book', path: 'review' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MainLayout.tsx
git commit -m "feat(layout): update steps array to 3-step cruise wizard"
```

---

### Task 8: Update Navigation step labels

**Files:**
- Modify: `src/components/Navigation.tsx`

- [ ] **Step 1: Update navLinks array (lines 32-36)**

```typescript
const navLinks = [
  { label: t('nav.preferences'), icon: MapPin, step: 1 },
  { label: t('nav.plan'), icon: Sparkles, step: 2 },
  { label: t('nav.review'), icon: Clock, step: 3 },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navigation.tsx
git commit -m "feat(nav): update navigation links for 3-step cruise wizard"
```

---

## Chunk 3: Page 1 — Preferences with Vibe Selector

### Task 9: Add vibe selector to Preferences

**Files:**
- Modify: `src/pages/Preferences.tsx`

- [ ] **Step 1: Add vibe constants and store fields**

After imports, add the vibe mapping:
```typescript
const VIBE_OPTIONS = [
  { label: 'Culture & History', value: 'Cultural Deep Dive', emoji: '🏛️' },
  { label: 'Food & Local Flavour', value: 'Food & Local Flavour', emoji: '🍽️' },
  { label: 'Beach & Water', value: 'Beach & Water', emoji: '🏖️' },
  { label: 'Adventure & Active', value: 'Adventure & Active', emoji: '🏄' },
  { label: 'Shopping & Markets', value: 'Shopping & Markets', emoji: '🛍️' },
  { label: 'Scenic & Landmarks', value: 'Must-See Landmarks', emoji: '📸' },
];
```

Add to the store destructure: `vibePreferences, setVibePreferences`

- [ ] **Step 2: Add vibe selector UI in the hero section**

After the travelers+budget grid and before the feature tags, add:
```typescript
{/* Vibe Selector */}
<div className="space-y-2">
  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
    {t('preferences.whatVibes')}
  </span>
  <div className="flex flex-wrap gap-2">
    {VIBE_OPTIONS.map((vibe) => {
      const isActive = vibePreferences.includes(vibe.value);
      return (
        <button
          key={vibe.value}
          onClick={() => {
            setVibePreferences(
              isActive
                ? vibePreferences.filter((v) => v !== vibe.value)
                : [...vibePreferences, vibe.value]
            );
          }}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            isActive
              ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30'
              : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
          }`}
        >
          {vibe.emoji} {vibe.label}
        </button>
      );
    })}
  </div>
</div>
```

- [ ] **Step 3: Update validation**

Add vibe validation to the messages array:
```typescript
if (vibePreferences.length === 0) messages.push(t('preferences.validationVibes'));
```

- [ ] **Step 4: Update the continue button text**

Change `nextText` from `t('preferences.continueToActivities')` to `t('preferences.generatePlan')`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Preferences.tsx
git commit -m "feat(preferences): add vibe selector for AI concierge"
```

---

## Chunk 4: Page 2 — ShorePlan (The Big One)

### Task 10: Create ShorePlan page

**Files:**
- Create: `src/pages/ShorePlan.tsx`

- [ ] **Step 1: Write the complete ShorePlan page**

This is the largest new file. Create `src/pages/ShorePlan.tsx` with the full implementation:

Key components within the file:
- `PortTabBar` — horizontal scrollable tabs for each port
- `PortHero` — dock window, "all aboard" warning, port cost subtotal
- `ActivitySlotCard` — activity card with swap/remove buttons, AI reasoning
- `FreeTimeCard` — empty slot with "Add" button
- `SwapDrawer` — modal showing alternative activities for a slot
- `ShorePlan` — main component orchestrating everything

The page should:
1. Read `portSchedule`, `vibePreferences`, `selectedActivities`, `aiReasons` from store
2. Call `useMultiPortCatalog` with destination IDs from portSchedule
3. Call `usePlanGeneration` to auto-generate the plan on mount
4. Show thinking/revealing/done states
5. Render port tabs, activity cards per active port, swap drawer
6. Guard redirect to `/preferences` if no ports
7. Show sticky footer with total cost + "Continue to Book" button

Write this as a single focused file (~400-500 lines). Use the existing niche theme classes (`tc.*`) for styling consistency.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/pages/ShorePlan.tsx
git commit -m "feat(shore-plan): create AI concierge plan page with port tabs and card swap"
```

---

## Chunk 5: Page 3 — Simplified ReviewBook

### Task 11: Simplify ReviewBook for cruise

**Files:**
- Modify: `src/pages/ReviewBook.tsx`

- [ ] **Step 1: Remove accommodation/transport validation (lines 38-39)**

Delete these two lines:
```typescript
if (!selectedAccommodation) messages.push(t('review.validationAccommodation'));
if (!selectedTransport) messages.push(t('review.validationTransport'));
```

Replace `if (!selectedDestination)` (line 35) with:
```typescript
const { portSchedule } = useTripStore();
if (portSchedule.length === 0) messages.push(t('review.validationDestination'));
```

- [ ] **Step 2: Remove accommodation/transport display sections (lines 179-196)**

Delete the accommodation card block (lines 179-187) and transport card block (lines 188-196).

- [ ] **Step 3: Update submission payload (line 55)**

Change `accommodation: selectedAccommodation` to `accommodation: null` and `transport: selectedTransport` to `transport: null`.

- [ ] **Step 4: Add port-based itinerary summary**

Replace the removed accommodation/transport sections with a port itinerary summary that shows each port with its scheduled activities.

- [ ] **Step 5: Update special requests placeholder**

Change the notes placeholder to cruise-specific: "Guide language preference, accessibility needs, cabin reference, dietary requirements"

- [ ] **Step 6: Commit**

```bash
git add src/pages/ReviewBook.tsx
git commit -m "feat(review): simplify for cruise — remove accommodation/transport, add port summary"
```

---

### Task 12: Update TripSummary sidebar

**Files:**
- Modify: `src/components/TripSummary.tsx`

- [ ] **Step 1: Remove accommodation/transport sections**

Find the transport and accommodation display blocks (around line 22-23 area) and remove them. Replace with a port schedule summary showing port names and dock times.

- [ ] **Step 2: Commit**

```bash
git add src/components/TripSummary.tsx
git commit -m "feat(trip-summary): remove accommodation/transport for cruise, add port summary"
```

---

### Task 13: Make accommodation/transport optional in useQuoteRequests

**Files:**
- Modify: `src/hooks/useQuoteRequests.ts`

- [ ] **Step 1: Update payload interface**

Change `accommodation: AccommodationType | null` and `transport: TransportType | null` to be optional with `?`:
```typescript
accommodation?: AccommodationType | null;
transport?: TransportType | null;
```

- [ ] **Step 2: Update insertion to handle undefined**

Where `selected_accommodation` and `selected_transport` are set in the insert payload, add null fallback:
```typescript
selected_accommodation: payload.accommodation ?? null,
selected_transport: payload.transport ?? null,
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useQuoteRequests.ts
git commit -m "feat(quotes): make accommodation/transport optional in quote payload"
```

---

## Chunk 6: Translations

### Task 14: Add translation keys for all three languages

**Files:**
- Modify: `src/locales/en/common.json`
- Modify: `src/locales/fr/common.json`
- Modify: `src/locales/es/common.json`

- [ ] **Step 1: Add English keys**

Add to preferences section:
```json
"whatVibes": "What's your vibe?",
"validationVibes": "Select at least one activity vibe.",
"generatePlan": "Generate my shore plan"
```

Add to nav section:
```json
"plan": "Shore Plan"
```

Add new `shorePlan` section:
```json
"shorePlan": {
  "title": "Your Shore Plan",
  "subtitle": "AI-curated activities for each port. Swap anything that doesn't feel right.",
  "thinking": "Building your shore plan...",
  "allAboard": "All aboard by",
  "shoreTime": "shore time",
  "freeTime": "Free time",
  "swap": "Swap",
  "remove": "Remove",
  "addActivity": "Add activity",
  "swapTitle": "Swap activity",
  "swapSubtitle": "Choose an alternative for this time slot",
  "noAlternatives": "No alternatives available for this slot",
  "portCost": "Port cost",
  "totalCost": "Total",
  "perPerson": "per person",
  "continueToBook": "Continue to book",
  "retryGenerate": "Try again",
  "browseManually": "Or browse activities manually",
  "generateError": "Couldn't generate your shore plan",
  "noActivitiesForPort": "No activities available for this port yet",
  "whyThis": "Why this?"
}
```

- [ ] **Step 2: Add French translations**

Same keys with French values.

- [ ] **Step 3: Add Spanish translations**

Same keys with Spanish values.

- [ ] **Step 4: Commit**

```bash
git add src/locales/
git commit -m "feat(i18n): add shore plan + vibe selector translation keys (EN/FR/ES)"
```

---

## Chunk 7: Verification and Final Commit

### Task 15: Full build verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Production build**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat: AI-first shore excursion concierge — complete 3-page flow

- Page 1: Port itinerary + vibe preferences
- Page 2: AI-generated plan with port tabs and card swap
- Page 3: Simplified review without accommodation/transport
- New usePlanGeneration hook (select + schedule)
- Edge function plan mode with concierge prompt
- 3-step wizard (down from 6)
- Trilingual (EN/FR/ES)"
git push origin main
```
