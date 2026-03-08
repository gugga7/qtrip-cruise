import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  destinations as localDestinations,
  getActivitiesByDestination as localActivities,
  getAccommodationsByDestination as localAccommodations,
  getTransportsByDestination as localTransports,
} from '../data/travelCatalog';
import type { Activity, AccommodationType, Destination, TransportType } from '../lib/types';
import { activeNiche } from '../config/niche';

const image = (url: string) => ({ url, mime: 'image/jpeg' });

/* ── Destinations ── */
export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>(localDestinations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .in('id', activeNiche.destinations)
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setDestinations(
            data.map((d: Record<string, unknown>) => ({
              id: d.id,
              slug: d.id,
              name: d.name,
              country: d.country,
              description: d.description ?? '',
              heroImageUrl: d.hero_image_url ?? '',
              coverImageUrl: d.hero_image_url ?? '',
              currency: d.currency ?? 'EUR',
              language: d.language ?? '',
              bestTimeToVisit: d.best_time_to_visit ?? [],
              highlights: d.highlights ?? [],
              localTips: d.local_tips ?? [],
              healthAndSafety: d.health_and_safety ?? [],
              travelRequirements: d.travel_requirements ?? [],
              visaRequired: d.visa_required ?? false,
              emergencyNumber: d.emergency_number ?? '',
              attributes: {
                name: d.name,
                country: d.country,
                description: d.description ?? '',
                imageUrl: d.hero_image_url ?? '',
                coverImage: { data: { attributes: { url: d.hero_image_url ?? '' } } },
              },
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  return { destinations, loading };
}

/* ── Activities ── */
export function useActivities(destinationId?: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destinationId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    supabase
      .from('activities')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setActivities(
            data.map((a: Record<string, unknown>) => ({
              id: a.id,
              destinationId: a.destination_id,
              title: a.title,
              description: a.description ?? '',
              duration: Number(a.duration) || 0,
              price: Number(a.price) || 0,
              category: a.category ?? '',
              location: a.location ?? '',
              tags: a.tags ?? [],
              mainImageUrl: a.main_image_url ?? '',
              galleryUrls: [],
              mainImage: image(a.main_image_url ?? ''),
              imageGallery: [],
            }))
          );
        } else {
          // Fallback to local catalog
          setActivities(localActivities(destinationId));
        }
        setLoading(false);
      });
  }, [destinationId]);

  return { activities, loading };
}

/* ── Accommodations ── */
export function useAccommodations(destinationId?: string | null) {
  const [accommodations, setAccommodations] = useState<AccommodationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destinationId) {
      setAccommodations([]);
      setLoading(false);
      return;
    }

    supabase
      .from('accommodations')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setAccommodations(
            data.map((a: Record<string, unknown>) => ({
              id: a.id,
              destinationId: a.destination_id,
              name: a.name,
              type: a.type ?? '',
              description: a.description ?? '',
              location: a.location ?? '',
              pricePerNight: Number(a.price_per_night) || 0,
              price: Number(a.price_per_night) || 0,
              rating: Number(a.rating) || 0,
              amenities: a.amenities ?? [],
              mainImageUrl: a.main_image_url ?? '',
              galleryUrls: [],
              mainImage: image(a.main_image_url ?? ''),
              imageGallery: [],
            }))
          );
        } else {
          setAccommodations(localAccommodations(destinationId));
        }
        setLoading(false);
      });
  }, [destinationId]);

  return { accommodations, loading };
}

/* ── Transports ── */
export function useTransports(destinationId?: string | null) {
  const [transports, setTransports] = useState<TransportType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destinationId) {
      setTransports([]);
      setLoading(false);
      return;
    }

    supabase
      .from('transports')
      .select('*')
      .eq('destination_id', destinationId)
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setTransports(
            data.map((t: Record<string, unknown>) => ({
              id: t.id,
              destinationId: t.destination_id,
              name: t.name,
              type: t.type ?? '',
              provider: t.provider ?? '',
              price: Number(t.price) || 0,
              duration: t.duration ?? '',
              description: t.description ?? '',
              features: t.features ?? [],
              pricingUnit: t.pricing_unit ?? 'per_trip',
              mainImageUrl: t.main_image_url ?? '',
              galleryUrls: [],
              vehicleImage: image(t.main_image_url ?? ''),
              interiorImages: [],
            }))
          );
        } else {
          setTransports(localTransports(destinationId));
        }
        setLoading(false);
      });
  }, [destinationId]);

  return { transports, loading };
}
