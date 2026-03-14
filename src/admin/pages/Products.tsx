import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from '../components/ImageUpload';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type CatalogTab = 'activities' | 'accommodations' | 'transports';

interface Destination {
  id: string;
  name: string;
  country: string;
}

// Unified row shape used for display — each tab maps its columns into this.
interface CatalogItem {
  id: string;
  destination_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;       // category (activities), type (accommodations), transport_type
  main_image_url: string | null;
  is_active: boolean;
  // extra fields kept for editing
  raw: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Schema metadata per tab                                            */
/* ------------------------------------------------------------------ */

const TAB_META: Record<
  CatalogTab,
  {
    label: string;
    table: string;
    nameCol: string;
    priceCol: string;
    categoryCol: string;
    categoryLabel: string;
    priceLabel: string;
    fields: { key: string; label: string; type: 'text' | 'number' | 'textarea' | 'tags' }[];
  }
> = {
  activities: {
    label: 'Activities',
    table: 'activities',
    nameCol: 'title',
    priceCol: 'price',
    categoryCol: 'category',
    categoryLabel: 'Category',
    priceLabel: 'Price',
    fields: [
      { key: 'title', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'duration', label: 'Duration (hours)', type: 'number' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'main_image_url', label: 'Image URL', type: 'text' },
      { key: 'tags', label: 'Tags (comma-separated)', type: 'tags' },
    ],
  },
  accommodations: {
    label: 'Accommodations',
    table: 'accommodations',
    nameCol: 'name',
    priceCol: 'price_per_night',
    categoryCol: 'type',
    categoryLabel: 'Type',
    priceLabel: 'Price / night',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price_per_night', label: 'Price per night', type: 'number' },
      { key: 'rating', label: 'Rating (0-5)', type: 'number' },
      { key: 'main_image_url', label: 'Image URL', type: 'text' },
      { key: 'amenities', label: 'Amenities (comma-separated)', type: 'tags' },
    ],
  },
  transports: {
    label: 'Transports',
    table: 'transports',
    nameCol: 'name',
    priceCol: 'price',
    categoryCol: 'type',
    categoryLabel: 'Type',
    priceLabel: 'Price',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Transport type', type: 'text' },
      { key: 'provider', label: 'Provider', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'pricing_unit', label: 'Pricing unit (per_trip, per_person, per_day)', type: 'text' },
      { key: 'main_image_url', label: 'Image URL', type: 'text' },
      { key: 'features', label: 'Features (comma-separated)', type: 'tags' },
    ],
  },
};

const TABS: CatalogTab[] = ['activities', 'accommodations', 'transports'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toItem(tab: CatalogTab, row: Record<string, unknown>): CatalogItem {
  const meta = TAB_META[tab];
  return {
    id: row.id as string,
    destination_id: row.destination_id as string,
    name: row[meta.nameCol] as string,
    description: (row.description as string) ?? null,
    price: (row[meta.priceCol] as number) ?? 0,
    category: (row[meta.categoryCol] as string) ?? null,
    main_image_url: (row.main_image_url as string) ?? null,
    is_active: row.is_active !== undefined ? (row.is_active as boolean) : true,
    raw: row,
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Products() {
  const [tab, setTab] = useState<CatalogTab>('activities');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 25;

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /* ---------- fetch destinations once ---------- */
  useEffect(() => {
    supabase
      .from('destinations')
      .select('id, name, country')
      .then(({ data, error: err }) => {
        if (err) console.error('Failed to load destinations', err);
        else setDestinations((data as Destination[]) ?? []);
      });
  }, []);

  /* ---------- fetch items when tab / filter / page changes ---------- */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const meta = TAB_META[tab];

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from(meta.table as 'activities').select('*', { count: 'exact' });

    if (filterDestination) {
      query = query.eq('destination_id', filterDestination);
    }

    const { data, error: err, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (err) {
      setError(err.message);
      setItems([]);
      setTotalCount(0);
    } else {
      setItems((data ?? []).map((r) => toItem(tab, r as unknown as Record<string, unknown>)));
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [tab, filterDestination, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ---------- toggle active ---------- */
  const handleToggleActive = async (item: CatalogItem) => {
    const meta = TAB_META[tab];
    const newVal = !item.is_active;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: newVal } : i))
    );

    const { error: err } = await supabase
      .from(meta.table as 'activities')
      .update({ is_active: newVal } as never)
      .eq('id', item.id);

    if (err) {
      // Revert
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !newVal } : i))
      );
      setError(`Failed to update status: ${err.message}`);
    }
  };

  /* ---------- delete item ---------- */
  const handleDelete = async (item: CatalogItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const meta = TAB_META[tab];
    const { error: err } = await supabase
      .from(meta.table as 'activities')
      .delete()
      .eq('id', item.id);
    if (err) {
      setError(`Failed to delete: ${err.message}`);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  /* ---------- open modal ---------- */
  const openAdd = () => {
    setEditingItem(null);
    setFormData({ destination_id: filterDestination || '' });
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({ ...item.raw });
    setSaveError(null);
    setModalOpen(true);
  };

  /* ---------- save (add / edit) ---------- */
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const meta = TAB_META[tab];

    // Build payload from form fields
    const payload: Record<string, unknown> = {};
    for (const f of meta.fields) {
      const val = formData[f.key];
      if (f.type === 'number') {
        payload[f.key] = val !== undefined && val !== '' ? Number(val) : null;
      } else if (f.type === 'tags') {
        payload[f.key] =
          typeof val === 'string'
            ? val
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(val)
            ? val
            : null;
      } else {
        payload[f.key] = val ?? null;
      }
    }
    payload.destination_id = formData.destination_id;

    // --- Validation ---
    const errors: string[] = [];
    const nameVal = (payload[meta.nameCol] as string) ?? '';
    if (!nameVal.trim() || nameVal.trim().length < 2) {
      errors.push('Name is required (minimum 2 characters).');
    }
    if (tab === 'activities') {
      if (!payload.price || Number(payload.price) <= 0) errors.push('Price must be greater than 0.');
      if (!payload.duration || Number(payload.duration) <= 0) errors.push('Duration must be greater than 0.');
    } else if (tab === 'accommodations') {
      if (!payload.price_per_night || Number(payload.price_per_night) <= 0) errors.push('Price per night must be greater than 0.');
    } else if (tab === 'transports') {
      if (!payload.price || Number(payload.price) <= 0) errors.push('Price must be greater than 0.');
    }
    if (!payload.description || !(payload.description as string).trim()) errors.push('Description is required.');
    if (!payload.destination_id) errors.push('Please select a destination.');

    if (errors.length > 0) {
      setSaveError(errors.join(' '));
      setSaving(false);
      return;
    }

    if (editingItem) {
      // Update
      const { error: err } = await supabase
        .from(meta.table as 'activities')
        .update(payload as never)
        .eq('id', editingItem.id);

      if (err) {
        setSaveError(err.message);
        setSaving(false);
        return;
      }
    } else {
      // Insert
      const { error: err } = await supabase
        .from(meta.table as 'activities')
        .insert(payload as never);

      if (err) {
        setSaveError(err.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setModalOpen(false);
    fetchItems();
  };

  /* ---------- search filter ---------- */
  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q) ||
      (item.category ?? '').toLowerCase().includes(q)
    );
  });

  const destName = (id: string) =>
    destinations.find((d) => d.id === id)?.name ?? id;

  const meta = TAB_META[tab];

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Catalog Management</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          onClick={openAdd}
        >
          Add {meta.label.slice(0, -1)}
        </button>
      </div>

      {/* Tab selector */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0); }}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                tab === t
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {TAB_META[t].label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Search ${meta.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              />
            </div>

            {/* Destination filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filterDestination}
                onChange={(e) => { setFilterDestination(e.target.value); setPage(0); }}
              >
                <option value="">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.country})
                  </option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-end">
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    view === 'grid'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setView('grid')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    view === 'list'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setView('list')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              className="mt-1 text-sm font-medium text-red-600 underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="ml-3 text-gray-500">Loading {meta.label.toLowerCase()}...</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">
              No {meta.label.toLowerCase()} found.
            </p>
          ) : view === 'grid' ? (
            /* ---------- GRID VIEW ---------- */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {item.main_image_url ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img
                        src={item.main_image_url}
                        alt={item.name}
                        className="object-cover w-full h-44"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <button
                        className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${
                          item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      {destName(item.destination_id)}
                      {item.category && <> &middot; {item.category}</>}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        ${item.price}
                        {tab === 'accommodations' && (
                          <span className="text-gray-400 font-normal">/night</span>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-sm text-blue-600 hover:text-blue-500"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm text-red-600 hover:text-red-500"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ---------- LIST VIEW ---------- */
            <div className="overflow-x-auto">
              <table className="min-w-[700px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {meta.categoryLabel}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {meta.priceLabel}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.main_image_url ? (
                            <img
                              className="flex-shrink-0 h-10 w-10 rounded-full object-cover"
                              src={item.main_image_url}
                              alt=""
                            />
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100" />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {destName(item.destination_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                          onClick={() => handleToggleActive(item)}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          className="text-blue-600 hover:text-blue-500"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-500"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalCount > PAGE_SIZE && (() => {
          const from = page * PAGE_SIZE;
          const to = Math.min(from + filtered.length, totalCount);
          const isLastPage = from + PAGE_SIZE >= totalCount;
          return (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-500">Showing {from + 1}&ndash;{to} of {totalCount}</p>
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
          );
        })()}
      </div>

      {/* ============================================================ */}
      {/*  Add / Edit Modal                                             */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative bg-white rounded-lg max-w-[calc(100vw-2rem)] sm:max-w-lg w-full p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {meta.label.slice(0, -1)}
              </h3>

              {saveError && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-700">{saveError}</p>
                </div>
              )}

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Destination selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destination <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={(formData.destination_id as string) ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, destination_id: e.target.value }))
                    }
                  >
                    <option value="">Select destination</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic fields */}
                {meta.fields.map((f) => {
                  const isRequired = ['name', 'title', 'description', 'price', 'price_per_night', 'duration', 'type'].includes(f.key);
                  return (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700">
                      {f.label}
                      {isRequired && <span className="text-red-500"> *</span>}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={isRequired}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={(formData[f.key] as string) ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                      />
                    ) : f.type === 'tags' ? (
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="tag1, tag2, tag3"
                        value={
                          Array.isArray(formData[f.key])
                            ? (formData[f.key] as string[]).join(', ')
                            : (formData[f.key] as string) ?? ''
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                      />
                    ) : f.type === 'number' ? (
                      <input
                        type="number"
                        step="any"
                        required={isRequired}
                        min={isRequired ? 0.01 : undefined}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={(formData[f.key] as number) ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                      />
                    ) : f.key === 'main_image_url' ? (
                      <ImageUpload
                        value={(formData[f.key] as string) ?? ''}
                        onChange={(url) =>
                          setFormData((prev) => ({ ...prev, [f.key]: url }))
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        required={isRequired}
                        minLength={f.key === 'name' ? 2 : undefined}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={(formData[f.key] as string) ?? ''}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSave}
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
