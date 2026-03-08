import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

/* ── Mock data ── */

const mockDbDestination = {
  id: 'marrakech',
  name: 'Marrakech',
  country: 'Morocco',
  description: 'Vibrant city',
  hero_image_url: 'https://example.com/marrakech.jpg',
  currency: 'MAD',
  language: 'Arabic',
  best_time_to_visit: ['March', 'April'],
  highlights: ['Souks', 'Medina'],
  local_tips: ['Haggle'],
  health_and_safety: ['Stay hydrated'],
  travel_requirements: ['Passport'],
  visa_required: false,
  emergency_number: '15',
  is_active: true,
};

const mockDbActivity = {
  id: 'act-1',
  destination_id: 'marrakech',
  title: 'Desert Safari',
  description: 'A desert experience',
  duration: '3',
  price: '150',
  category: 'Adventure',
  location: 'Sahara',
  tags: ['outdoor', 'adventure'],
  main_image_url: 'https://example.com/safari.jpg',
  is_active: true,
};

const mockDbAccommodation = {
  id: 'acc-1',
  destination_id: 'marrakech',
  name: 'Riad Luxury',
  type: 'Riad',
  description: 'Traditional riad',
  location: 'Medina',
  price_per_night: '200',
  rating: '4.5',
  amenities: ['Pool', 'WiFi'],
  main_image_url: 'https://example.com/riad.jpg',
  is_active: true,
};

const mockDbTransport = {
  id: 'tr-1',
  destination_id: 'marrakech',
  name: 'Airport Transfer',
  type: 'Transfer',
  provider: 'LocalCars',
  price: '50',
  duration: '30 min',
  description: 'Private transfer',
  features: ['AC', 'WiFi'],
  pricing_unit: 'per_trip',
  main_image_url: 'https://example.com/car.jpg',
  is_active: true,
};

/* ── Supabase mock chain builder ── */

let chainByTable: Record<string, any>;

function createMockChain(responseData: any[] | null, responseError: any = null) {
  const response = { data: responseData, error: responseError };
  const chain: any = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    then: vi.fn().mockImplementation((cb: any) => Promise.resolve(cb(response))),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.in.mockReturnValue(chain);
  return chain;
}

/* ── Module mocks ── */

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockImplementation((table: string) => {
      return chainByTable?.[table] ?? (() => {
        const r = { data: null, error: null };
        const c: any = {
          select: vi.fn(),
          eq: vi.fn(),
          in: vi.fn(),
          then: vi.fn().mockImplementation((cb: any) => Promise.resolve(cb(r))),
        };
        c.select.mockReturnValue(c);
        c.eq.mockReturnValue(c);
        c.in.mockReturnValue(c);
        return c;
      })();
    }),
  },
}));

const localDestinationsFallback = [
  { id: 'local-dest', name: 'Local Dest', country: 'Local' },
] as any[];
const localActivitiesFallback = [{ id: 'local-act', title: 'Local Activity' }] as any[];
const localAccommodationsFallback = [{ id: 'local-acc', name: 'Local Accommodation' }] as any[];
const localTransportsFallback = [{ id: 'local-tr', name: 'Local Transport' }] as any[];

vi.mock('../../data/travelCatalog', async () => ({
  destinations: [{ id: 'local-dest', name: 'Local Dest', country: 'Local' }],
  getActivitiesByDestination: vi.fn().mockReturnValue([{ id: 'local-act', title: 'Local Activity' }]),
  getAccommodationsByDestination: vi.fn().mockReturnValue([{ id: 'local-acc', name: 'Local Accommodation' }]),
  getTransportsByDestination: vi.fn().mockReturnValue([{ id: 'local-tr', name: 'Local Transport' }]),
}));

vi.mock('../../config/niche', () => ({
  activeNiche: {
    destinations: ['marrakech', 'marbella'],
  },
}));

/* ── Import hooks under test (after mocks are registered) ── */

import { useDestinations, useActivities, useAccommodations, useTransports } from '../useCatalog';

/* ── Tests ── */

describe('useCatalog hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain config for each test
    chainByTable = {
      destinations: createMockChain([mockDbDestination]),
      activities: createMockChain([mockDbActivity]),
      accommodations: createMockChain([mockDbAccommodation]),
      transports: createMockChain([mockDbTransport]),
    };
  });

  /* ── useDestinations ── */

  describe('useDestinations', () => {
    it('starts with loading state and resolves to loading=false after fetch', async () => {
      const { result } = renderHook(() => useDestinations());

      // After the effect resolves, loading should be false
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Destinations should be populated (not empty)
      expect(result.current.destinations.length).toBeGreaterThan(0);
    });

    it('maps DB rows to Destination objects (snake_case to camelCase)', async () => {
      const { result } = renderHook(() => useDestinations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const dest = result.current.destinations[0];
      expect(dest.id).toBe('marrakech');
      expect(dest.slug).toBe('marrakech');
      expect(dest.name).toBe('Marrakech');
      expect(dest.country).toBe('Morocco');
      expect(dest.description).toBe('Vibrant city');
      expect(dest.heroImageUrl).toBe('https://example.com/marrakech.jpg');
      expect(dest.coverImageUrl).toBe('https://example.com/marrakech.jpg');
      expect(dest.currency).toBe('MAD');
      expect(dest.language).toBe('Arabic');
      expect(dest.bestTimeToVisit).toEqual(['March', 'April']);
      expect(dest.highlights).toEqual(['Souks', 'Medina']);
      expect(dest.localTips).toEqual(['Haggle']);
      expect(dest.healthAndSafety).toEqual(['Stay hydrated']);
      expect(dest.travelRequirements).toEqual(['Passport']);
      expect(dest.visaRequired).toBe(false);
      expect(dest.emergencyNumber).toBe('15');
    });

    it('populates nested attributes object', async () => {
      const { result } = renderHook(() => useDestinations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const attrs = result.current.destinations[0].attributes;
      expect(attrs.name).toBe('Marrakech');
      expect(attrs.country).toBe('Morocco');
      expect(attrs.imageUrl).toBe('https://example.com/marrakech.jpg');
      expect(attrs.coverImage.data.attributes.url).toBe('https://example.com/marrakech.jpg');
    });

    it('keeps localDestinations as fallback on error', async () => {
      chainByTable.destinations = createMockChain(null, { message: 'DB error' });

      const { result } = renderHook(() => useDestinations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should keep the local fallback (initial state)
      expect(result.current.destinations).toEqual(localDestinationsFallback);
    });

    it('keeps localDestinations as fallback on empty data', async () => {
      chainByTable.destinations = createMockChain([]);

      const { result } = renderHook(() => useDestinations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.destinations).toEqual(localDestinationsFallback);
    });

    it('filters by is_active and activeNiche.destinations via query chain', async () => {
      const { supabase } = await import('../../lib/supabase');

      renderHook(() => useDestinations());

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('destinations');
      });

      const chain = chainByTable.destinations;
      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
      expect(chain.in).toHaveBeenCalledWith('id', ['marrakech', 'marbella']);
    });
  });

  /* ── useActivities ── */

  describe('useActivities', () => {
    it('returns empty array and loading=false with no destinationId', async () => {
      const { result } = renderHook(() => useActivities());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activities).toEqual([]);
    });

    it('returns empty array and loading=false with null destinationId', async () => {
      const { result } = renderHook(() => useActivities(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activities).toEqual([]);
    });

    it('fetches and maps data correctly with valid destinationId', async () => {
      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activities).toHaveLength(1);
      const act = result.current.activities[0];
      expect(act.id).toBe('act-1');
      expect(act.destinationId).toBe('marrakech');
      expect(act.title).toBe('Desert Safari');
      expect(act.description).toBe('A desert experience');
      expect(act.category).toBe('Adventure');
      expect(act.location).toBe('Sahara');
      expect(act.tags).toEqual(['outdoor', 'adventure']);
      expect(act.mainImageUrl).toBe('https://example.com/safari.jpg');
      expect(act.galleryUrls).toEqual([]);
      expect(act.imageGallery).toEqual([]);
    });

    it('coerces duration and price with Number()', async () => {
      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const act = result.current.activities[0];
      expect(act.duration).toBe(3);
      expect(act.price).toBe(150);
      expect(typeof act.duration).toBe('number');
      expect(typeof act.price).toBe('number');
    });

    it('creates mainImage with url and mime from main_image_url', async () => {
      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const act = result.current.activities[0];
      expect(act.mainImage).toEqual({
        url: 'https://example.com/safari.jpg',
        mime: 'image/jpeg',
      });
    });

    it('falls back to localActivities on error', async () => {
      chainByTable.activities = createMockChain(null, { message: 'DB error' });
      const { getActivitiesByDestination } = await import('../../data/travelCatalog');

      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getActivitiesByDestination).toHaveBeenCalledWith('marrakech');
      expect(result.current.activities).toEqual(localActivitiesFallback);
    });

    it('falls back to localActivities on empty data', async () => {
      chainByTable.activities = createMockChain([]);

      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activities).toEqual(localActivitiesFallback);
    });

    it('queries with correct destination_id and is_active filters', async () => {
      const { supabase } = await import('../../lib/supabase');

      renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('activities');
      });

      const chain = chainByTable.activities;
      expect(chain.select).toHaveBeenCalledWith('*');
      expect(chain.eq).toHaveBeenCalledWith('destination_id', 'marrakech');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  /* ── useAccommodations ── */

  describe('useAccommodations', () => {
    it('returns empty array and loading=false with no destinationId', async () => {
      const { result } = renderHook(() => useAccommodations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accommodations).toEqual([]);
    });

    it('fetches and maps data correctly with valid destinationId', async () => {
      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accommodations).toHaveLength(1);
      const acc = result.current.accommodations[0];
      expect(acc.id).toBe('acc-1');
      expect(acc.destinationId).toBe('marrakech');
      expect(acc.name).toBe('Riad Luxury');
      expect(acc.type).toBe('Riad');
      expect(acc.description).toBe('Traditional riad');
      expect(acc.location).toBe('Medina');
      expect(acc.amenities).toEqual(['Pool', 'WiFi']);
      expect(acc.mainImageUrl).toBe('https://example.com/riad.jpg');
      expect(acc.galleryUrls).toEqual([]);
      expect(acc.imageGallery).toEqual([]);
    });

    it('maps price_per_night to both pricePerNight and price', async () => {
      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const acc = result.current.accommodations[0];
      expect(acc.pricePerNight).toBe(200);
      expect(acc.price).toBe(200);
      expect(typeof acc.pricePerNight).toBe('number');
      expect(typeof acc.price).toBe('number');
    });

    it('coerces rating with Number()', async () => {
      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const acc = result.current.accommodations[0];
      expect(acc.rating).toBe(4.5);
      expect(typeof acc.rating).toBe('number');
    });

    it('creates mainImage with url and mime', async () => {
      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const acc = result.current.accommodations[0];
      expect(acc.mainImage).toEqual({
        url: 'https://example.com/riad.jpg',
        mime: 'image/jpeg',
      });
    });

    it('falls back to localAccommodations on error', async () => {
      chainByTable.accommodations = createMockChain(null, { message: 'DB error' });
      const { getAccommodationsByDestination } = await import('../../data/travelCatalog');

      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getAccommodationsByDestination).toHaveBeenCalledWith('marrakech');
      expect(result.current.accommodations).toEqual(localAccommodationsFallback);
    });

    it('falls back to localAccommodations on empty data', async () => {
      chainByTable.accommodations = createMockChain([]);

      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.accommodations).toEqual(localAccommodationsFallback);
    });

    it('queries with correct destination_id and is_active filters', async () => {
      const { supabase } = await import('../../lib/supabase');

      renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('accommodations');
      });

      const chain = chainByTable.accommodations;
      expect(chain.eq).toHaveBeenCalledWith('destination_id', 'marrakech');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  /* ── useTransports ── */

  describe('useTransports', () => {
    it('returns empty array and loading=false with no destinationId', async () => {
      const { result } = renderHook(() => useTransports());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transports).toEqual([]);
    });

    it('fetches and maps data correctly with valid destinationId', async () => {
      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transports).toHaveLength(1);
      const tr = result.current.transports[0];
      expect(tr.id).toBe('tr-1');
      expect(tr.destinationId).toBe('marrakech');
      expect(tr.name).toBe('Airport Transfer');
      expect(tr.type).toBe('Transfer');
      expect(tr.provider).toBe('LocalCars');
      expect(tr.duration).toBe('30 min');
      expect(tr.description).toBe('Private transfer');
      expect(tr.features).toEqual(['AC', 'WiFi']);
      expect(tr.mainImageUrl).toBe('https://example.com/car.jpg');
      expect(tr.galleryUrls).toEqual([]);
      expect(tr.interiorImages).toEqual([]);
    });

    it('coerces price with Number()', async () => {
      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const tr = result.current.transports[0];
      expect(tr.price).toBe(50);
      expect(typeof tr.price).toBe('number');
    });

    it('maps pricing_unit and defaults to per_trip', async () => {
      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transports[0].pricingUnit).toBe('per_trip');
    });

    it('defaults pricing_unit to per_trip when not provided', async () => {
      const transportWithoutPricingUnit = { ...mockDbTransport, pricing_unit: undefined };
      chainByTable.transports = createMockChain([transportWithoutPricingUnit]);

      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transports[0].pricingUnit).toBe('per_trip');
    });

    it('creates vehicleImage with url and mime from main_image_url', async () => {
      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const tr = result.current.transports[0];
      expect(tr.vehicleImage).toEqual({
        url: 'https://example.com/car.jpg',
        mime: 'image/jpeg',
      });
    });

    it('falls back to localTransports on error', async () => {
      chainByTable.transports = createMockChain(null, { message: 'DB error' });
      const { getTransportsByDestination } = await import('../../data/travelCatalog');

      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(getTransportsByDestination).toHaveBeenCalledWith('marrakech');
      expect(result.current.transports).toEqual(localTransportsFallback);
    });

    it('falls back to localTransports on empty data', async () => {
      chainByTable.transports = createMockChain([]);

      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.transports).toEqual(localTransportsFallback);
    });

    it('queries with correct destination_id and is_active filters', async () => {
      const { supabase } = await import('../../lib/supabase');

      renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('transports');
      });

      const chain = chainByTable.transports;
      expect(chain.eq).toHaveBeenCalledWith('destination_id', 'marrakech');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  /* ── Nullish field defaults ── */

  describe('nullish field defaults', () => {
    it('defaults nullish destination fields correctly', async () => {
      const sparseDestination = {
        id: 'sparse',
        name: 'Sparse',
        country: 'Unknown',
        description: null,
        hero_image_url: null,
        currency: null,
        language: null,
        best_time_to_visit: null,
        highlights: null,
        local_tips: null,
        health_and_safety: null,
        travel_requirements: null,
        visa_required: null,
        emergency_number: null,
        is_active: true,
      };
      chainByTable.destinations = createMockChain([sparseDestination]);

      const { result } = renderHook(() => useDestinations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const dest = result.current.destinations[0];
      expect(dest.description).toBe('');
      expect(dest.heroImageUrl).toBe('');
      expect(dest.coverImageUrl).toBe('');
      expect(dest.currency).toBe('EUR');
      expect(dest.language).toBe('');
      expect(dest.bestTimeToVisit).toEqual([]);
      expect(dest.highlights).toEqual([]);
      expect(dest.localTips).toEqual([]);
      expect(dest.healthAndSafety).toEqual([]);
      expect(dest.travelRequirements).toEqual([]);
      expect(dest.visaRequired).toBe(false);
      expect(dest.emergencyNumber).toBe('');
    });

    it('defaults nullish activity fields correctly', async () => {
      const sparseActivity = {
        id: 'act-sparse',
        destination_id: 'marrakech',
        title: 'Sparse Act',
        description: null,
        duration: null,
        price: null,
        category: null,
        location: null,
        tags: null,
        main_image_url: null,
        is_active: true,
      };
      chainByTable.activities = createMockChain([sparseActivity]);

      const { result } = renderHook(() => useActivities('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const act = result.current.activities[0];
      expect(act.description).toBe('');
      expect(act.duration).toBe(0);
      expect(act.price).toBe(0);
      expect(act.category).toBe('');
      expect(act.location).toBe('');
      expect(act.tags).toEqual([]);
      expect(act.mainImageUrl).toBe('');
      expect(act.mainImage).toEqual({ url: '', mime: 'image/jpeg' });
    });

    it('defaults nullish accommodation fields correctly', async () => {
      const sparseAccommodation = {
        id: 'acc-sparse',
        destination_id: 'marrakech',
        name: 'Sparse Acc',
        type: null,
        description: null,
        location: null,
        price_per_night: null,
        rating: null,
        amenities: null,
        main_image_url: null,
        is_active: true,
      };
      chainByTable.accommodations = createMockChain([sparseAccommodation]);

      const { result } = renderHook(() => useAccommodations('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const acc = result.current.accommodations[0];
      expect(acc.type).toBe('');
      expect(acc.description).toBe('');
      expect(acc.location).toBe('');
      expect(acc.pricePerNight).toBe(0);
      expect(acc.price).toBe(0);
      expect(acc.rating).toBe(0);
      expect(acc.amenities).toEqual([]);
      expect(acc.mainImageUrl).toBe('');
    });

    it('defaults nullish transport fields correctly', async () => {
      const sparseTransport = {
        id: 'tr-sparse',
        destination_id: 'marrakech',
        name: 'Sparse Tr',
        type: null,
        provider: null,
        price: null,
        duration: null,
        description: null,
        features: null,
        pricing_unit: null,
        main_image_url: null,
        is_active: true,
      };
      chainByTable.transports = createMockChain([sparseTransport]);

      const { result } = renderHook(() => useTransports('marrakech'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const tr = result.current.transports[0];
      expect(tr.type).toBe('');
      expect(tr.provider).toBe('');
      expect(tr.price).toBe(0);
      expect(tr.duration).toBe('');
      expect(tr.description).toBe('');
      expect(tr.features).toEqual([]);
      expect(tr.pricingUnit).toBe('per_trip');
      expect(tr.mainImageUrl).toBe('');
      expect(tr.vehicleImage).toEqual({ url: '', mime: 'image/jpeg' });
    });
  });
});
