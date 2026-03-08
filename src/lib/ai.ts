import type { Activity, AccommodationType, Destination, TransportType, ScheduleSlotName } from './types';

export interface ScheduleAssignment {
  activityId: string;
  day: number;
  slot: ScheduleSlotName;
  reason?: string;
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

  if (!Array.isArray(data.assignments)) {
    throw new Error('Invalid response: assignments missing');
  }

  const validSlots = new Set<string>(['Morning', 'Afternoon', 'Evening']);
  for (const a of data.assignments) {
    if (!a.activityId || typeof a.day !== 'number' || !validSlots.has(a.slot)) {
      throw new Error('Invalid assignment in response');
    }
  }

  return data.assignments as ScheduleAssignment[];
}
