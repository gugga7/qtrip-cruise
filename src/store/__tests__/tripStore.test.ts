import { describe, it, expect, beforeEach } from 'vitest';
import { useTripStore } from '../tripStore';

const mockDestination = {
  id: 'marrakech',
  slug: 'marrakech',
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
  mainImageUrl: '',
  destinationId: 'marrakech',
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
      mainImageUrl: '',
      destinationId: 'marrakech',
      description: '',
      amenities: [],
      rating: 4.5,
    });

    const total = useTripStore.getState().getTotalCost();
    // 3 nights * 200 + 120 activity * 2 travelers = 840
    expect(total).toBe(840);
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
