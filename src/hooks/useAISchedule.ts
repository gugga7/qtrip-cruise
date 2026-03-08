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

let generationCounter = 0;

export function useAISchedule(dayCount: number) {
  const selectedActivities = useTripStore((s) => s.selectedActivities);

  const [phase, setPhase] = useState<AISchedulePhase>('idle');
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);
  const activeGeneration = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dayCountRef = useRef(dayCount);
  dayCountRef.current = dayCount;

  const allScheduled = selectedActivities.every((a) => a.scheduled);

  const generate = useCallback(async () => {
    const store = useTripStore.getState();
    const { selectedDestination, selectedActivities: activities, selectedAccommodation, selectedTransport, scheduleActivity } = store;
    const days = dayCountRef.current;

    if (!selectedDestination || activities.length === 0 || days === 0) return;

    // Each generate call gets a unique ID. Only the latest one applies results.
    const genId = ++generationCounter;
    activeGeneration.current = genId;
    const isStale = () => activeGeneration.current !== genId;

    setPhase('thinking');
    setError(null);
    setRevealedCount(0);
    setAssignments([]);

    if (intervalRef.current) clearInterval(intervalRef.current);
    let msgIndex = 0;
    intervalRef.current = setInterval(() => {
      msgIndex = (msgIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[msgIndex]);
    }, 800);

    try {
      const result = await fetchAISchedule(
        selectedDestination,
        days,
        activities,
        selectedAccommodation,
        selectedTransport,
      );

      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (isStale()) return;

      setAssignments(result);
      setPhase('revealing');

      for (let i = 0; i < result.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (isStale()) return;
        const a = result[i];
        scheduleActivity(a.activityId, a.day, a.slot);
        setRevealedCount(i + 1);
      }

      if (!isStale()) {
        setPhase('done');
      }
    } catch (err: any) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (isStale()) return;

      setError(err.message || 'Failed to generate schedule');
      setPhase('error');
    }
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, []);

  // Auto-trigger once on mount if nothing is scheduled
  useEffect(() => {
    if (!hasRun.current && !allScheduled && selectedActivities.length > 0) {
      hasRun.current = true;
      generate();
    }
  }, [allScheduled, selectedActivities.length, generate]);

  const retry = useCallback(() => {
    hasRun.current = true;
    const store = useTripStore.getState();
    for (const a of store.selectedActivities) {
      if (a.scheduled) {
        store.unscheduleActivity(a.id);
      }
    }
    generate();
  }, [generate]);

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
