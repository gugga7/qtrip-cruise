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

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[msgIdx]);
    }, 1200);

    try {
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
