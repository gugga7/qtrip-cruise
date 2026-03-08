import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { activeNiche } from '../../config/niche';

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
  is_active: boolean;
  niche_id: string;
  created_at: string;
}

interface Filters {
  country: string;
  niche: string;
  isActive: string; // '', 'true', 'false'
}

const EMPTY_DESTINATION: Omit<Destination, 'created_at' | 'is_active' | 'best_time_to_visit' | 'highlights'> = {
  id: '',
  name: '',
  country: '',
  description: '',
  hero_image_url: '',
  currency: '',
  language: '',
  niche_id: '',
};

export function Cities() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ country: '', niche: '', isActive: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDest, setNewDest] = useState(EMPTY_DESTINATION);
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

  // Derived data — niche options discovered from existing destinations + active niche
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

  const grouped = filtered.reduce<Record<string, Destination[]>>((acc, d) => {
    if (!acc[d.country]) acc[d.country] = [];
    acc[d.country].push(d);
    return acc;
  }, {});

  // Toggle active status
  const toggleActive = async (dest: Destination) => {
    const newStatus = !dest.is_active;
    // Optimistic update
    setDestinations((prev) =>
      prev.map((d) => (d.id === dest.id ? { ...d, is_active: newStatus } : d))
    );

    const { error } = await supabase
      .from('destinations')
      .update({ is_active: newStatus })
      .eq('id', dest.id);

    if (error) {
      // Revert
      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, is_active: !newStatus } : d))
      );
      showToast(`Failed to update status: ${error.message}`, 'error');
    } else {
      showToast(`${dest.name} is now ${newStatus ? 'active' : 'inactive'}`, 'success');
    }
  };

  // Add destination
  const handleAddDestination = async () => {
    const errors: string[] = [];
    if (!newDest.id) errors.push('ID is required.');
    if (!newDest.name) errors.push('Name is required.');
    if (!newDest.country) errors.push('Country is required.');
    if (newDest.hero_image_url && !/^https?:\/\//.test(newDest.hero_image_url)) {
      errors.push('Hero image URL must start with http:// or https://.');
    }
    if (newDest.currency && !/^[A-Z]{3}$/.test(newDest.currency)) {
      errors.push('Currency must be exactly 3 uppercase letters (e.g. USD, EUR).');
    }

    if (errors.length > 0) {
      showToast(errors.join(' '), 'error');
      return;
    }

    // Non-blocking warning for empty description
    if (!newDest.description.trim()) {
      console.warn('Destination description is empty — consider adding one.');
    }

    setSaving(true);
    const { error } = await supabase.from('destinations').insert({
      id: newDest.id,
      name: newDest.name,
      country: newDest.country,
      description: newDest.description,
      hero_image_url: newDest.hero_image_url,
      currency: newDest.currency,
      language: newDest.language,
      niche_id: newDest.niche_id,
      is_active: true,
      best_time_to_visit: [],
      highlights: [],
    });
    setSaving(false);

    if (error) {
      showToast(`Failed to add destination: ${error.message}`, 'error');
      return;
    }

    showToast(`${newDest.name} added successfully`, 'success');
    setNewDest(EMPTY_DESTINATION);
    setIsAddModalOpen(false);
    fetchDestinations();
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
          onClick={() => setIsAddModalOpen(true)}
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
              onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
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
              onChange={(e) => setFilters((prev) => ({ ...prev, niche: e.target.value }))}
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
              onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
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
                  <div className="mt-3 flex justify-end">
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

      {/* Add Destination Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setIsAddModalOpen(false)}
            />
            <div className="relative bg-white rounded-lg max-w-[calc(100vw-2rem)] sm:max-w-lg w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Destination</h3>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID (slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. marrakech"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.id}
                    onChange={(e) =>
                      setNewDest((prev) => ({
                        ...prev,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marrakech"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.name}
                    onChange={(e) => setNewDest((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Morocco"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.country}
                    onChange={(e) => setNewDest((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <input
                      type="text"
                      placeholder="e.g. MAD"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newDest.currency}
                      onChange={(e) =>
                        setNewDest((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <input
                      type="text"
                      placeholder="e.g. Arabic"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newDest.language}
                      onChange={(e) => setNewDest((prev) => ({ ...prev, language: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Niche</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.niche_id}
                    onChange={(e) => setNewDest((prev) => ({ ...prev, niche_id: e.target.value }))}
                  >
                    <option value="">Select niche</option>
                    {nicheOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.description}
                    onChange={(e) =>
                      setNewDest((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hero Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newDest.hero_image_url}
                    onChange={(e) =>
                      setNewDest((prev) => ({ ...prev, hero_image_url: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewDest(EMPTY_DESTINATION);
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleAddDestination}
                >
                  {saving ? 'Saving...' : 'Add Destination'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
