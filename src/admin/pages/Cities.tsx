import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { activeNiche } from '../../config/niche';
import { ImageUpload } from '../components/ImageUpload';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  hero_image_url: string;
  currency: string;
  language: string;
  best_time_to_visit: string[];
  highlights: string[];
  local_tips: string[];
  health_and_safety: string[];
  travel_requirements: string[];
  visa_required: boolean;
  emergency_number: string;
  is_active: boolean;
  niche_id: string;
  created_at: string;
}

interface Filters {
  country: string;
  niche: string;
  isActive: string; // '', 'true', 'false'
}

/** Form state uses flat strings for array fields (comma-separated). */
interface DestinationForm {
  id: string;
  name: string;
  country: string;
  description: string;
  hero_image_url: string;
  currency: string;
  language: string;
  niche_id: string;
  best_time_to_visit: string;
  highlights: string;
  local_tips: string;
  health_and_safety: string;
  travel_requirements: string;
  visa_required: boolean;
  emergency_number: string;
}

const EMPTY_FORM: DestinationForm = {
  id: '',
  name: '',
  country: '',
  description: '',
  hero_image_url: '',
  currency: '',
  language: '',
  niche_id: '',
  best_time_to_visit: '',
  highlights: '',
  local_tips: '',
  health_and_safety: '',
  travel_requirements: '',
  visa_required: false,
  emergency_number: '',
};

/** Convert a string[] (or null/undefined) to a comma-separated display string. */
function arrToStr(arr: string[] | null | undefined): string {
  return (arr ?? []).join(', ');
}

/** Convert a comma-separated string to a trimmed, non-empty string[]. */
function strToArr(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Build a DestinationForm from an existing Destination record. */
function destToForm(dest: Destination): DestinationForm {
  return {
    id: dest.id,
    name: dest.name,
    country: dest.country,
    description: dest.description ?? '',
    hero_image_url: dest.hero_image_url ?? '',
    currency: dest.currency ?? '',
    language: dest.language ?? '',
    niche_id: dest.niche_id ?? '',
    best_time_to_visit: arrToStr(dest.best_time_to_visit),
    highlights: arrToStr(dest.highlights),
    local_tips: arrToStr(dest.local_tips),
    health_and_safety: arrToStr(dest.health_and_safety),
    travel_requirements: arrToStr(dest.travel_requirements),
    visa_required: dest.visa_required ?? false,
    emergency_number: dest.emergency_number ?? '',
  };
}

const ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function Cities() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ country: '', niche: '', isActive: '' });
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  // Modal state — null means closed, 'add' means new, string id means editing
  const [modalMode, setModalMode] = useState<null | 'add' | string>(null);
  const [form, setForm] = useState<DestinationForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('country')
      .order('name');

    if (error) {
      showToast(`Failed to load destinations: ${error.message}`, 'error');
      setLoading(false);
      return;
    }
    setDestinations(data as Destination[]);
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Derived data
  const nicheOptions = Array.from(
    new Set([activeNiche.id, ...destinations.map((d) => d.niche_id).filter(Boolean)])
  ).sort();
  const countries = Array.from(new Set(destinations.map((d) => d.country))).sort();

  const filtered = destinations.filter((d) => {
    if (filters.country && d.country !== filters.country) return false;
    if (filters.niche && d.niche_id !== filters.niche) return false;
    if (filters.isActive === 'true' && !d.is_active) return false;
    if (filters.isActive === 'false' && d.is_active) return false;
    return true;
  });

  const totalFiltered = filtered.length;
  const paginatedFrom = page * PAGE_SIZE;
  const paginatedTo = Math.min(paginatedFrom + PAGE_SIZE, totalFiltered);
  const paginatedItems = filtered.slice(paginatedFrom, paginatedTo);
  const isLastPage = paginatedTo >= totalFiltered;

  const grouped = paginatedItems.reduce<Record<string, Destination[]>>((acc, d) => {
    if (!acc[d.country]) acc[d.country] = [];
    acc[d.country].push(d);
    return acc;
  }, {});

  // ----- Modal helpers -----

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setModalMode('add');
  };

  const openEditModal = (dest: Destination) => {
    setForm(destToForm(dest));
    setModalMode(dest.id);
  };

  const closeModal = () => {
    setModalMode(null);
    setForm(EMPTY_FORM);
  };

  const isEditing = modalMode !== null && modalMode !== 'add';

  // ----- Toggle active -----

  const toggleActive = async (dest: Destination) => {
    const newStatus = !dest.is_active;
    setDestinations((prev) =>
      prev.map((d) => (d.id === dest.id ? { ...d, is_active: newStatus } : d))
    );

    const { error } = await supabase
      .from('destinations')
      .update({ is_active: newStatus })
      .eq('id', dest.id);

    if (error) {
      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, is_active: !newStatus } : d))
      );
      showToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      showToast(`${dest.name} is now ${newStatus ? 'active' : 'inactive'}`, 'success');
    }
  };

  // ----- Delete -----

  const handleDelete = async (dest: Destination) => {
    if (!window.confirm(`Are you sure you want to delete "${dest.name}"? This cannot be undone.`)) {
      return;
    }

    const { error } = await supabase.from('destinations').delete().eq('id', dest.id);

    if (error) {
      showToast(`Failed to delete destination: ${error.message}`, 'error');
      return;
    }

    setDestinations((prev) => prev.filter((d) => d.id !== dest.id));
    showToast(`${dest.name} deleted successfully`, 'success');
  };

  // ----- Save (add or edit) -----

  const handleSave = async () => {
    const errors: string[] = [];
    if (!form.id) errors.push('ID is required.');
    if (form.id && !ID_REGEX.test(form.id)) {
      errors.push('ID must contain only lowercase letters, numbers, and hyphens (no leading/trailing hyphens).');
    }
    if (!form.name) errors.push('Name is required.');
    if (!form.country) errors.push('Country is required.');
    if (form.hero_image_url && !/^https?:\/\//.test(form.hero_image_url)) {
      errors.push('Hero image URL must start with http:// or https://.');
    }
    if (form.currency && !/^[A-Z]{3}$/.test(form.currency)) {
      errors.push('Currency must be exactly 3 uppercase letters (e.g. USD, EUR).');
    }

    if (errors.length > 0) {
      showToast(errors.join(' '), 'error');
      return;
    }

    const payload = {
      name: form.name,
      country: form.country,
      description: form.description,
      hero_image_url: form.hero_image_url,
      currency: form.currency,
      language: form.language,
      niche_id: form.niche_id,
      best_time_to_visit: strToArr(form.best_time_to_visit),
      highlights: strToArr(form.highlights),
      local_tips: strToArr(form.local_tips),
      health_and_safety: strToArr(form.health_and_safety),
      travel_requirements: strToArr(form.travel_requirements),
      visa_required: form.visa_required,
      emergency_number: form.emergency_number,
    };

    setSaving(true);

    if (isEditing) {
      // Update existing
      const { error } = await supabase
        .from('destinations')
        .update(payload)
        .eq('id', modalMode as string);
      setSaving(false);

      if (error) {
        showToast(`Failed to update destination: ${error.message}`, 'error');
        return;
      }
      showToast(`${form.name} updated successfully`, 'success');
    } else {
      // Insert new
      const { error } = await supabase.from('destinations').insert({
        id: form.id,
        ...payload,
        is_active: true,
      });
      setSaving(false);

      if (error) {
        showToast(`Failed to add destination: ${error.message}`, 'error');
        return;
      }
      showToast(`${form.name} added successfully`, 'success');
    }

    closeModal();
    fetchDestinations();
  };

  // ----- Form field updater -----

  const updateField = <K extends keyof DestinationForm>(key: K, value: DestinationForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Destination Management</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          onClick={openAddModal}
        >
          Add Destination
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.country}
              onChange={(e) => { setFilters((prev) => ({ ...prev, country: e.target.value })); setPage(0); }}
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Niche</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.niche}
              onChange={(e) => { setFilters((prev) => ({ ...prev, niche: e.target.value })); setPage(0); }}
            >
              <option value="">All Niches</option>
              {nicheOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.isActive}
              onChange={(e) => { setFilters((prev) => ({ ...prev, isActive: e.target.value })); setPage(0); }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {/* Grouped Destination Cards */}
      {!loading && Object.keys(grouped).length === 0 && (
        <div className="bg-white shadow-sm rounded-lg p-12 text-center text-gray-500">
          No destinations found.
        </div>
      )}

      {!loading &&
        Object.entries(grouped).map(([country, dests]) => (
          <div key={country} className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{country}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dests.map((dest) => (
                <div
                  key={dest.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900">{dest.name}</h4>
                    <p className="text-sm text-gray-500">{dest.country}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
                      {dest.currency && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{dest.currency}</span>
                      )}
                      {dest.language && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{dest.language}</span>
                      )}
                      {dest.niche_id && (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                          {dest.niche_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                      onClick={() => openEditModal(dest)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => handleDelete(dest)}
                    >
                      Delete
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dest.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      onClick={() => toggleActive(dest)}
                    >
                      {dest.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Pagination */}
      {!loading && totalFiltered > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white shadow-sm rounded-lg px-6 py-3">
          <p className="text-sm text-gray-500">Showing {paginatedFrom + 1}&ndash;{paginatedTo} of {totalFiltered}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={isLastPage}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            />
            <div className="relative bg-white rounded-lg max-w-[calc(100vw-2rem)] sm:max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Destination' : 'Add New Destination'}
              </h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* ID — read-only when editing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID (slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    placeholder="e.g. marrakech"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    value={form.id}
                    onChange={(e) =>
                      updateField('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                  />
                  {!isEditing && (
                    <p className="mt-1 text-xs text-gray-400">
                      Lowercase letters, numbers, and hyphens only.
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marrakech"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morocco"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>

                {/* Currency / Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input
                      type="text"
                      placeholder="e.g. MAD"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={form.currency}
                      onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <input
                      type="text"
                      placeholder="e.g. Arabic"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={form.language}
                      onChange={(e) => updateField('language', e.target.value)}
                    />
                  </div>
                </div>

                {/* Niche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Niche</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={form.niche_id}
                    onChange={(e) => updateField('niche_id', e.target.value)}
                  >
                    <option value="">Select niche</option>
                    {nicheOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                {/* Hero Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hero Image</label>
                  <ImageUpload
                    value={form.hero_image_url}
                    onChange={(url) => updateField('hero_image_url', url)}
                  />
                </div>

                {/* Emergency number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency number</label>
                  <input
                    type="text"
                    placeholder="e.g. 112"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={form.emergency_number}
                    onChange={(e) => updateField('emergency_number', e.target.value)}
                  />
                </div>

                {/* Visa required */}
                <div className="flex items-center gap-2">
                  <input
                    id="visa_required"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={form.visa_required}
                    onChange={(e) => updateField('visa_required', e.target.checked)}
                  />
                  <label htmlFor="visa_required" className="text-sm font-medium text-gray-700">
                    Visa required
                  </label>
                </div>

                {/* Array fields — comma-separated inputs */}
                {([
                  ['best_time_to_visit', 'Best time to visit'],
                  ['highlights', 'Highlights'],
                  ['local_tips', 'Local tips'],
                  ['health_and_safety', 'Health and safety'],
                  ['travel_requirements', 'Travel requirements'],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {label} (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. item one, item two, item three`}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={form[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* Modal footer */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSave}
                >
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Destination'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
