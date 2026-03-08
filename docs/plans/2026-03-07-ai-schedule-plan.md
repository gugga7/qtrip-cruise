# AI-Powered Schedule Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-suggest an optimized trip schedule via Kimi API (Supabase Edge Function) with a magical animated reveal and full manual override.

**Architecture:** Supabase Edge Function holds the Kimi API key and proxies requests to `https://api.moonshot.ai/v1`. The frontend sends trip data, receives `[{activityId, day, slot}]`, and animates activities into position. Manual dropdowns remain for user tweaks.

**Tech Stack:** Supabase Edge Functions (Deno), OpenAI SDK (Kimi-compatible), React, Zustand, Framer Motion, TailwindCSS

---

## Task 1: Create the Supabase Edge Function

**Files:**
- Create: `supabase/functions/ai-schedule/index.ts`

**Step 1: Create the edge function file**

```bash
mkdir -p supabase/functions/ai-schedule
```

**Step 2: Write the edge function**

Create `supabase/functions/ai-schedule/index.ts`:

```typescript
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KIMI_API_KEY = Deno.env.get("KIMI_API_KEY");
const KIMI_BASE_URL = "https://api.moonshot.ai/v1";
const KIMI_MODEL = "kimi-k2-turbo-preview";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivityInput {
  id: string;
  title: string;
  duration: number;
  category: string;
  location?: string;
  tags?: string[];
  description: string;
}

interface ScheduleRequest {
  destination: { name: string; country: string; localTips: string[] };
  days: number;
  activities: ActivityInput[];
  accommodation?: { name: string; location: string; type: string };
  transport?: { name: string; type: string };
}

interface ScheduleAssignment {
  activityId: string;
  day: number;
  slot: "Morning" | "Afternoon" | "Evening";
}

function buildSystemPrompt(): string {
  return `You are a travel itinerary optimizer. You receive a destination, trip duration, selected activities with details, and optionally accommodation and transport info.

Your job: assign each activity to the best day and time slot for a great travel experience.

RULES:
- Time slots are: Morning, Afternoon, Evening
- Respect activity duration: a 3-4 hour activity fills an entire slot. Do not assign two long activities to the same slot.
- Use tags and categories as hints:
  - "evening", "food", "nightlife" tags → prefer Evening slot
  - "spa", "relaxing", "wellness" tags → prefer Afternoon slot
  - "sightseeing", "walking tour", "outdoor" → prefer Morning slot (cooler, better light)
  - "museum", "culture", "guided" → Morning or Afternoon
- Spread activities across all available days. Don't cram everything into day 1.
- Leave some free time — not every slot needs to be filled. Travelers appreciate breathing room.
- Consider location proximity: if two activities are in the same area, schedule them in adjacent slots on the same day.
- Consider the accommodation location for starting the day nearby.
- Maximum one activity per slot.

OUTPUT: Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Just the raw JSON array:
[{"activityId": "...", "day": 1, "slot": "Morning"}, ...]

Every activity in the input MUST appear exactly once in the output.`;
}

function buildUserMessage(req: ScheduleRequest): string {
  const lines: string[] = [
    `Destination: ${req.destination.name}, ${req.destination.country}`,
    `Trip duration: ${req.days} days`,
    `Local tips: ${req.destination.localTips.join("; ")}`,
    "",
    "Activities to schedule:",
  ];

  for (const a of req.activities) {
    lines.push(
      `- ID: ${a.id} | "${a.title}" | ${a.duration}h | Category: ${a.category} | Location: ${a.location || "N/A"} | Tags: ${(a.tags || []).join(", ") || "none"} | ${a.description}`
    );
  }

  if (req.accommodation) {
    lines.push("", `Accommodation: ${req.accommodation.name} (${req.accommodation.type}) in ${req.accommodation.location}`);
  }
  if (req.transport) {
    lines.push(`Transport: ${req.transport.name} (${req.transport.type})`);
  }

  return lines.join("\n");
}

function parseSchedule(text: string, activityIds: string[]): ScheduleAssignment[] {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Response is not an array");

  const validSlots = ["Morning", "Afternoon", "Evening"];
  const assignments: ScheduleAssignment[] = [];

  for (const item of parsed) {
    if (
      typeof item.activityId === "string" &&
      typeof item.day === "number" &&
      validSlots.includes(item.slot) &&
      activityIds.includes(item.activityId)
    ) {
      assignments.push({
        activityId: item.activityId,
        day: item.day,
        slot: item.slot as ScheduleAssignment["slot"],
      });
    }
  }

  return assignments;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!KIMI_API_KEY) {
      throw new Error("KIMI_API_KEY not configured");
    }

    const body: ScheduleRequest = await req.json();
    const activityIds = body.activities.map((a) => a.id);

    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserMessage(body) },
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
    if (!content) throw new Error("Empty response from Kimi");

    const assignments = parseSchedule(content, activityIds);

    // Verify all activities are assigned
    const assignedIds = new Set(assignments.map((a) => a.activityId));
    const missing = activityIds.filter((id) => !assignedIds.has(id));
    if (missing.length > 0) {
      // Assign missing activities to first available slots
      let nextDay = 1;
      const slots: ScheduleAssignment["slot"][] = ["Morning", "Afternoon", "Evening"];
      for (const id of missing) {
        const usedSlots = assignments
          .filter((a) => a.day === nextDay)
          .map((a) => a.slot);
        const freeSlot = slots.find((s) => !usedSlots.includes(s));
        if (freeSlot) {
          assignments.push({ activityId: id, day: nextDay, slot: freeSlot });
        } else {
          nextDay++;
          assignments.push({ activityId: id, day: nextDay, slot: "Morning" });
        }
      }
    }

    return new Response(JSON.stringify({ assignments }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-schedule error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate schedule" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
```

**Step 3: Commit**

```bash
git add supabase/functions/ai-schedule/index.ts
git commit -m "feat: add Supabase Edge Function for AI schedule generation via Kimi API"
```

---

## Task 2: Add client-side AI helper and env config

**Files:**
- Create: `src/lib/ai.ts`
- Modify: `.env`

**Step 1: Add edge function URL to .env**

Append to `.env`:

```
# AI Schedule
VITE_SUPABASE_FUNCTIONS_URL=http://127.0.0.1:56321/functions/v1
```

**Step 2: Create the client-side AI helper**

Create `src/lib/ai.ts`:

```typescript
import type { Activity, AccommodationType, Destination, TransportType, ScheduleSlotName } from './types';

export interface ScheduleAssignment {
  activityId: string;
  day: number;
  slot: ScheduleSlotName;
}

interface AIScheduleRequest {
  destination: { name: string; country: string; localTips: string[] };
  days: number;
  activities: Array<{
    id: string;
    title: string;
    duration: number;
    category: string;
    location?: string;
    tags?: string[];
    description: string;
  }>;
  accommodation?: { name: string; location: string; type: string };
  transport?: { name: string; type: string };
}

export async function fetchAISchedule(
  destination: Destination,
  days: number,
  activities: Activity[],
  accommodation: AccommodationType | null,
  transport: TransportType | null,
): Promise<ScheduleAssignment[]> {
  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!functionsUrl || !anonKey) {
    throw new Error('Missing Supabase configuration');
  }

  const body: AIScheduleRequest = {
    destination: {
      name: destination.name,
      country: destination.country,
      localTips: destination.localTips,
    },
    days,
    activities: activities.map((a) => ({
      id: a.id,
      title: a.title,
      duration: a.duration,
      category: a.category,
      location: a.location,
      tags: a.tags,
      description: a.description,
    })),
    ...(accommodation && {
      accommodation: {
        name: accommodation.name,
        location: accommodation.location,
        type: accommodation.type,
      },
    }),
    ...(transport && {
      transport: {
        name: transport.name,
        type: transport.type,
      },
    }),
  };

  const response = await fetch(`${functionsUrl}/ai-schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.assignments as ScheduleAssignment[];
}
```

**Step 3: Commit**

```bash
git add src/lib/ai.ts .env
git commit -m "feat: add AI schedule client helper and edge function URL config"
```

---

## Task 3: Create useAISchedule hook

**Files:**
- Create: `src/hooks/useAISchedule.ts`

**Step 1: Write the hook**

Create `src/hooks/useAISchedule.ts`:

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAISchedule, type ScheduleAssignment } from '../lib/ai';
import { useTripStore } from '../store/tripStore';

export type AISchedulePhase = 'idle' | 'thinking' | 'revealing' | 'done' | 'error';

const THINKING_MESSAGES = [
  'Analyzing your trip...',
  'Considering activity durations...',
  'Optimizing your days...',
  'Finalizing your itinerary...',
];

export function useAISchedule(dayCount: number) {
  const {
    selectedDestination,
    selectedActivities,
    selectedAccommodation,
    selectedTransport,
    scheduleActivity,
  } = useTripStore();

  const [phase, setPhase] = useState<AISchedulePhase>('idle');
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);
  const retryCount = useRef(0);

  const allScheduled = selectedActivities.every((a) => a.scheduled);

  const generate = useCallback(async () => {
    if (!selectedDestination || selectedActivities.length === 0 || dayCount === 0) return;

    setPhase('thinking');
    setError(null);
    setRevealedCount(0);

    // Cycle thinking messages
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[msgIndex]);
    }, 800);

    try {
      const result = await fetchAISchedule(
        selectedDestination,
        dayCount,
        selectedActivities,
        selectedAccommodation,
        selectedTransport,
      );

      clearInterval(msgInterval);
      setAssignments(result);
      setPhase('revealing');

      // Staggered reveal — apply one assignment every 300ms
      for (let i = 0; i < result.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const a = result[i];
        scheduleActivity(a.activityId, a.day, a.slot);
        setRevealedCount(i + 1);
      }

      setPhase('done');
    } catch (err: any) {
      clearInterval(msgInterval);

      // One automatic retry
      if (retryCount.current < 1) {
        retryCount.current++;
        generate();
        return;
      }

      setError(err.message || 'Failed to generate schedule');
      setPhase('error');
    }
  }, [selectedDestination, selectedActivities, selectedAccommodation, selectedTransport, dayCount, scheduleActivity]);

  // Auto-trigger on first mount if nothing is scheduled
  useEffect(() => {
    if (!hasRun.current && !allScheduled && selectedActivities.length > 0) {
      hasRun.current = true;
      generate();
    }
  }, [allScheduled, selectedActivities.length, generate]);

  const retry = useCallback(() => {
    retryCount.current = 0;
    hasRun.current = true;
    // Unschedule all first
    for (const a of selectedActivities) {
      if (a.scheduled) {
        useTripStore.getState().unscheduleActivity(a.id);
      }
    }
    generate();
  }, [generate, selectedActivities]);

  return {
    phase,
    thinkingMessage,
    revealedCount,
    assignments,
    error,
    retry,
    totalActivities: selectedActivities.length,
  };
}
```

**Step 2: Commit**

```bash
git add src/hooks/useAISchedule.ts
git commit -m "feat: add useAISchedule hook with phased reveal lifecycle"
```

---

## Task 4: Rewrite Schedule page with AI flow and animations

**Files:**
- Modify: `src/pages/Schedule.tsx`

**Step 1: Read the current file then replace with the new version**

Read `src/pages/Schedule.tsx` first, then write the new version:

```tsx
import { CalendarRange, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { useAISchedule } from '../hooks/useAISchedule';
import type { ScheduleSlotName } from '../lib/types';
import { useTripStore } from '../store/tripStore';

interface ScheduleProps { onNext: () => void; onBack: () => void; }

const slots: ScheduleSlotName[] = ['Morning', 'Afternoon', 'Evening'];

function ThinkingCard({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-pink-50/60 to-transparent" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
          <Wand2 size={22} className="animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Building your itinerary</p>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-500"
          >
            {message}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessBanner({ onResuggest }: { onResuggest: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">
          Schedule suggested — feel free to adjust anything.
        </p>
      </div>
      <button
        onClick={onResuggest}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
      >
        <RotateCcw size={12} /> Re-suggest
      </button>
    </motion.div>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <p className="text-sm text-amber-800">
        Couldn't auto-schedule — assign manually or{' '}
        <button onClick={onRetry} className="font-medium underline">
          try again
        </button>.
      </p>
    </motion.div>
  );
}

export function Schedule({ onNext, onBack }: ScheduleProps) {
  const { startDate, endDate, selectedActivities, scheduleActivity, unscheduleActivity } = useTripStore();
  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return Math.max(selectedActivities.length, 1);
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  }, [endDate, selectedActivities.length, startDate]);

  const { phase, thinkingMessage, revealedCount, error, retry } = useAISchedule(dayCount);

  const preview = useMemo(() =>
    Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      items: slots.map((slot) =>
        selectedActivities.find(
          (activity) =>
            activity.scheduled?.day === index + 1 &&
            activity.scheduled?.slot === slot
        ) || null
      ),
    })),
  [dayCount, selectedActivities]);

  const validationMessages = selectedActivities.every((a) => a.scheduled)
    ? []
    : ['Assign every selected activity to a day and time slot.'];

  if (!selectedActivities.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">No activities selected</h1>
        <p className="mt-2 text-sm text-slate-500">Go back and choose at least one experience before scheduling.</p>
        <button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">Back to activities</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-pink-700">
          <CalendarRange size={16} />
          <span className="text-sm font-medium">Itinerary builder</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Your optimized schedule
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Our AI arranges your activities for the best flow. Adjust anything that doesn't feel right.
        </p>
      </section>

      {/* AI status banners */}
      <AnimatePresence mode="wait">
        {phase === 'thinking' && (
          <ThinkingCard key="thinking" message={thinkingMessage} />
        )}
        {phase === 'done' && (
          <SuccessBanner key="success" onResuggest={retry} />
        )}
        {phase === 'error' && (
          <ErrorBanner key="error" message={error || 'Unknown error'} onRetry={retry} />
        )}
      </AnimatePresence>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Activity scheduling controls */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {selectedActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={phase === 'revealing' ? { opacity: 0, y: 16, scale: 0.97 } : false}
              animate={
                phase === 'revealing' && index < revealedCount
                  ? { opacity: 1, y: 0, scale: 1 }
                  : phase !== 'revealing'
                  ? { opacity: 1, y: 0, scale: 1 }
                  : undefined
              }
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{activity.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{activity.duration}h · €{activity.price} · {activity.category}</p>
                </div>
                <button
                  onClick={() => unscheduleActivity(activity.id)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Day</span>
                  <select
                    value={activity.scheduled?.day ?? ''}
                    onChange={(e) =>
                      scheduleActivity(activity.id, Number(e.target.value), activity.scheduled?.slot ?? 'Morning')
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="" disabled>Select a day</option>
                    {Array.from({ length: dayCount }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Day {i + 1}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">Time slot</span>
                  <select
                    value={activity.scheduled?.slot ?? ''}
                    onChange={(e) =>
                      scheduleActivity(activity.id, activity.scheduled?.day ?? 1, e.target.value as ScheduleSlotName)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="" disabled>Select a slot</option>
                    {slots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Day preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Preview by day</h2>
          <p className="mt-1 text-sm text-slate-500">Your trip at a glance.</p>
          <div className="mt-5 space-y-4">
            {preview.map((day) => (
              <div key={day.day} className="rounded-xl bg-slate-50 p-4">
                <p className="mb-3 font-semibold text-slate-900">Day {day.day}</p>
                <div className="space-y-2">
                  {slots.map((slot, slotIndex) => {
                    const item = day.items[slotIndex];
                    return (
                      <div
                        key={`${day.day}-${slot}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{slot}</p>
                        <AnimatePresence mode="wait">
                          {item ? (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                            >
                              <p className="mt-0.5 text-sm font-medium text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500">{item.duration}h · {item.category}</p>
                            </motion.div>
                          ) : (
                            <motion.p
                              key="free"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-0.5 text-sm text-slate-400"
                            >
                              Free time
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FloatingContinueButton
        onContinue={onNext}
        onBack={onBack}
        isValid={validationMessages.length === 0}
        currentStep={5}
        totalSteps={6}
        validationMessages={validationMessages}
        nextText="Continue to review"
      />
    </div>
  );
}
```

**Step 2: Add shimmer keyframe to `src/index.css`**

Append to `src/index.css` after the existing `@tailwind` directives:

```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/pages/Schedule.tsx src/index.css
git commit -m "feat: rewrite Schedule page with AI auto-suggest and animated reveal"
```

---

## Task 5: Set up Kimi API key as Supabase secret and test locally

**Step 1: Set the Supabase secret**

```bash
cd /Users/Shared/proj-backups/QTRIP
echo "KIMI_API_KEY=sk-UkJv8xjo1JuXy3vIJoF4VIpNnWCppsL8sZMdaEO3zYWnsMP6" | npx supabase secrets set --env-file /dev/stdin 2>/dev/null || echo "Will set secret when Supabase is running"
```

Note: If local Supabase isn't running, the secret can be set via env file. For local dev, create `supabase/.env` with:

```
KIMI_API_KEY=sk-UkJv8xjo1JuXy3vIJoF4VIpNnWCppsL8sZMdaEO3zYWnsMP6
```

**Step 2: Start local Supabase (if not running)**

```bash
npx supabase start
```

**Step 3: Serve the edge function locally**

```bash
npx supabase functions serve ai-schedule --env-file supabase/.env --no-verify-jwt
```

This starts the function at `http://127.0.0.1:56321/functions/v1/ai-schedule`.

**Step 4: Test with curl**

```bash
curl -X POST http://127.0.0.1:56321/functions/v1/ai-schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -d '{
    "destination": {"name": "Marrakech", "country": "Morocco", "localTips": ["Carry cash for souk shopping"]},
    "days": 3,
    "activities": [
      {"id": "marrakech-medina", "title": "Medina and Souk Discovery Walk", "duration": 4, "category": "Culture", "location": "Old Medina", "tags": ["guided", "shopping"], "description": "Private guided walk"},
      {"id": "marrakech-hammam", "title": "Traditional Hammam Ritual", "duration": 2, "category": "Wellness", "location": "Hivernage", "tags": ["spa", "relaxing"], "description": "Restorative spa block"}
    ],
    "accommodation": {"name": "Riad Saffron Courtyard", "location": "Medina", "type": "Riad"}
  }'
```

Expected: JSON response with `{"assignments": [{activityId, day, slot}, ...]}`.

**Step 5: Create supabase/.env and commit**

Create `supabase/.env` (add to .gitignore if not already):

```
KIMI_API_KEY=sk-UkJv8xjo1JuXy3vIJoF4VIpNnWCppsL8sZMdaEO3zYWnsMP6
```

Ensure `supabase/.env` is in `.gitignore`:

```bash
echo "supabase/.env" >> .gitignore
```

**Step 6: Commit**

```bash
git add .gitignore .env
git commit -m "chore: add edge function env config and gitignore for secrets"
```

---

## Task 6: End-to-end smoke test

**Step 1: Start all services**

Terminal 1:
```bash
npx supabase start
```

Terminal 2:
```bash
npx supabase functions serve ai-schedule --env-file supabase/.env --no-verify-jwt
```

Terminal 3:
```bash
npm run dev
```

**Step 2: Walk through the flow**

1. Go to `http://localhost:5197/preferences`
2. Select Marrakech, set dates (3+ nights), set travelers
3. Continue to Activities, select both Marrakech activities
4. Continue through Transport and Accommodation (select options)
5. Arrive at Schedule page
6. **Observe**: Thinking card appears with cycling messages
7. **Observe**: Activities animate into their slots one by one
8. **Observe**: Success banner appears with "Re-suggest" button
9. **Test**: Manually change a day/slot dropdown — it should work normally
10. **Test**: Click "Re-suggest" — it should clear and re-generate
11. Continue to Review — verify scheduled activities show their day/slot

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: AI-powered schedule complete — Kimi API via Supabase Edge Function"
```
