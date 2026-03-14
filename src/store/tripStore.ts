import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, Accommodation, Destination, ScheduleSlotName, Transport } from '../lib/types';

export interface PortStop {
  portIndex: number;       // 1-indexed, maps to existing "day"
  destinationId: string;
  portName: string;
  dockArrival: string;     // "08:00" HH:mm
  dockDeparture: string;   // "17:00" HH:mm
  date: string;            // "2026-04-15"
}

interface TripState {
  selectedDestination: Destination | null;
  destination: Destination | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  budget: number;
  budgetType: 'total' | 'per_person';
  currency: string;
  selectedActivities: Activity[];
  selectedAccommodation: Accommodation | null;
  selectedTransport: Transport | null;
  setDestination: (destination: Destination | null) => void;
  setDates: (start: string | null, end: string | null) => void;
  setTravelers: (count: number) => void;
  setBudget: (amount: number, type: 'total' | 'per_person') => void;
  setCurrency: (currency: string) => void;
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  scheduleActivity: (activityId: string | number, day: number, slot: ScheduleSlotName) => void;
  unscheduleActivity: (activityId: string | number) => void;
  setActivityParticipants: (activityId: string, count: number) => void;
  setAccommodation: (accommodation: Accommodation | null) => void;
  setTransport: (transport: Transport | null) => void;
  getTotalCost: () => number;
  getRemainingBudget: () => number;
  clearTripData: () => void;
  clearStore: () => void;
  autoSchedule: (activityId: string | number, day: number, slot: ScheduleSlotName) => void;
  reset: () => void;
  // Cruise port scheduling
  portSchedule: PortStop[];
  setPortSchedule: (ports: PortStop[]) => void;
  updatePortTime: (portIndex: number, field: 'dockArrival' | 'dockDeparture' | 'date', value: string) => void;
}

const baseState = {
  selectedDestination: null,
  destination: null,
  selectedActivities: [] as Activity[],
  selectedAccommodation: null,
  selectedTransport: null,
  startDate: null,
  endDate: null,
  travelers: 2,
  budget: 0,
  budgetType: 'total' as const,
  currency: 'EUR',
  portSchedule: [] as PortStop[],
};

const getTripNights = (startDate: string | null, endDate: string | null) => {
  if (!startDate || !endDate) return 0;
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
};

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      ...baseState,
      setDestination: (destination) => set({ selectedDestination: destination, destination, selectedActivities: [], selectedAccommodation: null, selectedTransport: null }),
      setDates: (start, end) => set({ startDate: start, endDate: end }),
      setTravelers: (count) => set({ travelers: Math.max(1, count) }),
      setBudget: (amount, type) => set({ budget: Math.max(0, amount), budgetType: type }),
      setCurrency: (currency) => set({ currency }),
      addActivity: (activity) => set((state) => ({ selectedActivities: state.selectedActivities.some((item) => item.id === activity.id) ? state.selectedActivities : [...state.selectedActivities, { ...activity, participants: state.travelers }] })),
      removeActivity: (activityId) => set((state) => ({ selectedActivities: state.selectedActivities.filter((activity) => activity.id !== activityId) })),
      scheduleActivity: (activityId, day, slot) => set((state) => ({ selectedActivities: state.selectedActivities.map((activity) => activity.id === String(activityId) ? { ...activity, scheduled: { day, slot } } : activity) })),
      unscheduleActivity: (activityId) => set((state) => ({ selectedActivities: state.selectedActivities.map((activity) => activity.id === String(activityId) ? { ...activity, scheduled: null } : activity) })),
      setActivityParticipants: (activityId, count) => set((state) => ({ selectedActivities: state.selectedActivities.map((a) => a.id === activityId ? { ...a, participants: Math.max(1, Math.min(count, state.travelers)) } : a) })),
      setAccommodation: (accommodation) => set({ selectedAccommodation: accommodation }),
      setTransport: (transport) => set({ selectedTransport: transport }),
      getTotalCost: () => {
        const state = get();
        const nights = Math.max(getTripNights(state.startDate, state.endDate), 1);
        const activitiesTotal = state.selectedActivities.reduce((sum, activity) => sum + activity.price * (activity.participants ?? state.travelers), 0);
        const accommodationTotal = (state.selectedAccommodation?.pricePerNight ?? 0) * nights;
        const transportBase = state.selectedTransport?.price ?? 0;
        const transportTotal = state.selectedTransport?.pricingUnit === 'per_person' ? transportBase * state.travelers : transportBase;
        return activitiesTotal + accommodationTotal + transportTotal;
      },
      getRemainingBudget: () => {
        const state = get();
        const totalBudget = state.budgetType === 'per_person' ? state.budget * state.travelers : state.budget;
        return totalBudget - state.getTotalCost();
      },
      // Cruise port scheduling
      setPortSchedule: (ports) => {
        const sorted = [...ports].sort((a, b) => a.date.localeCompare(b.date));
        const startDate = sorted[0]?.date ?? null;
        const endDate = sorted[sorted.length - 1]?.date ?? null;
        set({ portSchedule: sorted, startDate, endDate });
      },
      updatePortTime: (portIndex, field, value) => set((state) => {
        const updated = state.portSchedule.map((p) =>
          p.portIndex === portIndex ? { ...p, [field]: value } : p
        );
        const sorted = [...updated].sort((a, b) => a.date.localeCompare(b.date));
        const startDate = sorted[0]?.date ?? state.startDate;
        const endDate = sorted[sorted.length - 1]?.date ?? state.endDate;
        return { portSchedule: sorted, startDate, endDate };
      }),
      clearTripData: () => set(baseState),
      clearStore: () => set(baseState),
      autoSchedule: (activityId, day, slot) => get().scheduleActivity(activityId, day, slot),
      reset: () => set(baseState),
    }),
    { name: 'trip-store' }
  )
);

export type { Activity, Accommodation, Destination, Transport };