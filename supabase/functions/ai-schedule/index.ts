import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Read at request time, not module load time (edge runtime may not have env vars during module init)
function getKimiKey(): string | undefined {
  return Deno.env.get("KIMI_API_KEY");
}
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
  reason?: string;
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
[{"activityId": "...", "day": 1, "slot": "Morning", "reason": "Brief 8-12 word reason for this placement"}, ...]

The "reason" field should be a short, friendly explanation of WHY this slot works best (e.g. "Cooler morning temps are ideal for a 4-hour walking tour", "Relaxing spa sessions feel best in the afternoon").

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
        reason: typeof item.reason === "string" ? item.reason : undefined,
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
    const kimiKey = getKimiKey();
    if (!kimiKey) {
      throw new Error("KIMI_API_KEY not configured");
    }

    const body: ScheduleRequest = await req.json();
    const activityIds = body.activities.map((a) => a.id);

    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${kimiKey}`,
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
