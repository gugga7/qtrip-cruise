import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { activeNiche } from '../../config/niche';

/* ── Types ── */

interface AISettings {
  optimizationRules: {
    maxActivitiesPerDay: number;
    minBreakDuration: number;
    preferredStartTime: string;
    preferredEndTime: string;
  };
  constraints: {
    mustIncludeCategories: string[];
    avoidConflictingTypes: string[];
    preferredSequence: string[];
  };
  scoring: {
    timePreferenceWeight: number;
    locationProximityWeight: number;
    priceOptimizationWeight: number;
  };
}

const defaultSettings: AISettings = {
  optimizationRules: {
    maxActivitiesPerDay: 5,
    minBreakDuration: 30,
    preferredStartTime: '09:00',
    preferredEndTime: '22:00',
  },
  constraints: {
    mustIncludeCategories: ['Party & Nightlife', 'Group Experiences'],
    avoidConflictingTypes: [],
    preferredSequence: [],
  },
  scoring: {
    timePreferenceWeight: 0.3,
    locationProximityWeight: 0.3,
    priceOptimizationWeight: 0.4,
  },
};

const CATEGORY_OPTIONS = [
  'Party & Nightlife',
  'Adventure & Outdoor',
  'Wellness & Relaxation',
  'Food & Drink',
  'Culture & Sightseeing',
  'Group Experiences',
];

/* ── Component ── */

export function AIConfig() {
  const [selectedNiche, setSelectedNiche] = useState<string>(activeNiche.id);
  const [nicheOptions, setNicheOptions] = useState<string[]>([activeNiche.id]);
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* ── Fetch config from Supabase ── */

  const fetchConfig = useCallback(async (nicheId: string) => {
    setLoading(true);
    setFeedback(null);

    const { data, error } = await supabase
      .from('ai_configs')
      .select('settings')
      .eq('niche_id', nicheId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load AI config:', error);
      setFeedback({ type: 'error', message: 'Failed to load configuration.' });
      setSettings(defaultSettings);
    } else if (data?.settings) {
      setSettings(data.settings as AISettings);
    } else {
      // No row yet — use defaults
      setSettings(defaultSettings);
    }

    setLoading(false);
  }, []);

  /* ── Fetch distinct niche_ids for the selector ── */

  const fetchNicheOptions = useCallback(async () => {
    const { data, error } = await supabase
      .from('ai_configs')
      .select('niche_id');

    if (!error && data) {
      const ids = data.map((r) => r.niche_id as string);
      // Ensure the active niche is always in the list
      if (!ids.includes(activeNiche.id)) ids.unshift(activeNiche.id);
      setNicheOptions(ids);
    }
  }, []);

  useEffect(() => {
    fetchNicheOptions();
  }, [fetchNicheOptions]);

  useEffect(() => {
    fetchConfig(selectedNiche);
  }, [selectedNiche, fetchConfig]);

  /* ── Save (upsert) ── */

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);

    const { error } = await supabase
      .from('ai_configs')
      .upsert(
        {
          niche_id: selectedNiche,
          settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'niche_id' },
      );

    if (error) {
      console.error('Failed to save AI config:', error);
      setFeedback({ type: 'error', message: `Save failed: ${error.message}` });
    } else {
      setFeedback({ type: 'success', message: 'Configuration saved successfully.' });
    }

    setSaving(false);
  };

  /* ── Field helpers ── */

  const updateOptimization = <K extends keyof AISettings['optimizationRules']>(
    key: K,
    value: AISettings['optimizationRules'][K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      optimizationRules: { ...prev.optimizationRules, [key]: value },
    }));
  };

  const updateConstraints = <K extends keyof AISettings['constraints']>(
    key: K,
    value: AISettings['constraints'][K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      constraints: { ...prev.constraints, [key]: value },
    }));
  };

  const updateScoring = <K extends keyof AISettings['scoring']>(
    key: K,
    value: AISettings['scoring'][K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      scoring: { ...prev.scoring, [key]: value },
    }));
  };

  /* ── Render ── */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="ml-3 text-gray-600">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">AI Configuration</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`rounded-md p-4 ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 space-y-6">
          {/* Niche Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Niche</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
            >
              {nicheOptions.map((id) => (
                <option key={id} value={id}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Optimization Rules */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Optimization Rules</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Activities Per Day</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.optimizationRules.maxActivitiesPerDay}
                  onChange={(e) => updateOptimization('maxActivitiesPerDay', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Break Duration (minutes)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.optimizationRules.minBreakDuration}
                  onChange={(e) => updateOptimization('minBreakDuration', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Start Time</label>
                <input
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.optimizationRules.preferredStartTime}
                  onChange={(e) => updateOptimization('preferredStartTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred End Time</label>
                <input
                  type="time"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.optimizationRules.preferredEndTime}
                  onChange={(e) => updateOptimization('preferredEndTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Constraints</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Must Include Categories</label>
                <select
                  multiple
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.constraints.mustIncludeCategories}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    updateConstraints('mustIncludeCategories', values);
                  }}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scoring Weights */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Scoring Weights</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Time Preference</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.scoring.timePreferenceWeight}
                  onChange={(e) => updateScoring('timePreferenceWeight', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location Proximity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.scoring.locationProximityWeight}
                  onChange={(e) => updateScoring('locationProximityWeight', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price Optimization</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={settings.scoring.priceOptimizationWeight}
                  onChange={(e) => updateScoring('priceOptimizationWeight', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
