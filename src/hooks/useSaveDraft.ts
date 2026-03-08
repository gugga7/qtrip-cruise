import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTripStore } from '../store/tripStore';

export function useSaveDraft() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const trip = useTripStore();
  const [saving, setSaving] = useState(false);

  const saveDraft = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('trips').insert({
        user_id: user.id,
        status: 'draft',
        email: user.email ?? '',
        destination_id: trip.selectedDestination?.id ?? null,
        destination_name: trip.selectedDestination?.name ?? null,
        start_date: trip.startDate,
        end_date: trip.endDate,
        travelers: trip.travelers,
        budget: trip.budget || null,
        budget_type: trip.budgetType,
        currency: trip.currency,
        selected_activities: trip.selectedActivities,
        selected_accommodation: trip.selectedAccommodation,
        selected_transport: trip.selectedTransport,
        total_cost: trip.getTotalCost(),
      });
      if (error) throw error;
      toast.success(t('common.draftSaved'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return { saveDraft, saving, canSave: !!user };
}
