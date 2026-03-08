# AI-Powered Schedule Design

## Goal
Auto-suggest an optimized trip schedule using Kimi API when the user lands on /schedule, with a magical animated reveal and full manual override capability.

## Architecture

### Data flow
1. User lands on /schedule with selected activities, dates, destination
2. Frontend calls Supabase Edge Function (`ai-schedule`)
3. Edge Function calls Kimi API (chat completion, non-streaming)
4. Kimi returns JSON schedule assignments
5. Edge Function validates and returns to frontend
6. Frontend animates activities into their slots
7. User can manually adjust via existing dropdowns

### Supabase Edge Function
- Path: `supabase/functions/ai-schedule/index.ts`
- Holds `KIMI_API_KEY` as a Supabase secret
- Uses OpenAI SDK pointed at `https://api.moonshot.ai/v1`
- Model: `kimi-k2-turbo-preview`
- Single non-streaming call
- Returns `[{activityId, day, slot}]`

### Kimi prompt strategy
- System prompt: travel itinerary optimizer role
- Input: destination, trip days, activities (with duration/category/tags/location), accommodation, transport
- Rules: respect duration, use tags for slot hints, spread across days, leave free time, consider location
- Output: strict JSON array

## UX Flow

### Phase 1 - Thinking (~1-2s)
Full-width shimmer card with cycling status messages:
- "Analyzing your trip..."
- "Considering activity durations..."
- "Optimizing your days..."

### Phase 2 - Reveal
Activities animate into slots with staggered fade-in + slide-up (Framer Motion).
Each card lands with subtle scale bounce. Fills day by day.

### Phase 3 - Done
Brief success message: "Schedule suggested - feel free to adjust anything."
Manual controls (day/slot dropdowns) fully active.

### Error handling
- One automatic retry on failure
- Fall back to manual-only mode with small retry button
- "Couldn't auto-schedule - assign manually or try again"

### Re-trigger
- "Re-suggest schedule" button in header after initial load

## Files

| File | Action |
|------|--------|
| `supabase/functions/ai-schedule/index.ts` | Create - Edge Function |
| `src/lib/ai.ts` | Create - Client helper to call edge function |
| `src/hooks/useAISchedule.ts` | Create - React hook for AI schedule lifecycle |
| `src/pages/Schedule.tsx` | Modify - Add AI flow with animation |
| `.env` | Modify - Add edge function URL |

## Key decisions
- No streaming (schedule payload is tiny)
- No chat panel (auto-suggest + manual tweaks keeps it clean)
- Edge function secrets via `supabase secrets set`
- Kimi model: `kimi-k2-turbo-preview` (fast, cheap at $0.60/M input)
