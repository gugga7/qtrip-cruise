import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Activity, AccommodationType, Destination, QuoteRequestFormValues, TransportType } from '../lib/types';

interface QuoteRequestPayload {
  form: QuoteRequestFormValues;
  destination: Destination;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  budget: number;
  currency: string;
  estimatedTotal: number;
  activities: Activity[];
  accommodation: AccommodationType | null;
  transport: TransportType | null;
}

export function useCreateQuoteRequest() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: QuoteRequestPayload) => {
      if (!supabase) throw new Error('Supabase not configured');
      // 1. Save trip to trips table
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user?.id ?? null,
          status: 'submitted',
          email: payload.form.email,
          full_name: payload.form.fullName,
          phone: payload.form.phone,
          preferred_contact_method: payload.form.preferredContactMethod,
          destination_id: payload.destination.id,
          destination_name: payload.destination.name,
          start_date: payload.startDate,
          end_date: payload.endDate,
          travelers: payload.travelers,
          budget: payload.budget || null,
          budget_type: 'total',
          currency: payload.currency,
          total_cost: payload.estimatedTotal,
          selected_activities: payload.activities,
          selected_accommodation: payload.accommodation,
          selected_transport: payload.transport,
          schedule: payload.activities.map((a) => ({
            id: a.id,
            title: a.title,
            scheduled: a.scheduled ?? null,
          })),
          notes: payload.form.notes || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // 2. Call send-email Edge Function (fire-and-forget)
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (functionsUrl && anonKey) {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        };

        // Send quote_submitted to user
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: payload.form.email,
            template: 'quote_submitted',
            locale: document.documentElement.lang || 'en',
            data: {
              name: payload.form.fullName,
              destination: payload.destination.name,
              travelers: payload.travelers,
              startDate: payload.startDate,
              endDate: payload.endDate,
              estimatedTotal: payload.estimatedTotal,
              currency: payload.currency,
            },
          }),
        }).catch(console.error);

        // Send quote_received to admin
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: 'admin@qtrip.com',
            template: 'quote_received',
            locale: 'en',
            data: {
              name: payload.form.fullName,
              email: payload.form.email,
              phone: payload.form.phone,
              destination: payload.destination.name,
              travelers: payload.travelers,
              startDate: payload.startDate,
              endDate: payload.endDate,
              estimatedTotal: payload.estimatedTotal,
              currency: payload.currency,
              notes: payload.form.notes,
            },
          }),
        }).catch(console.error);
      }

      return { id: data.id };
    },
  });
}
