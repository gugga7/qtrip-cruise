import { useEffect, useState } from 'react';
import { Clock, X, Eye, Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { tc } from '../../config/themeClasses';

interface Activity {
  name: string;
  participants?: number;
  maxParticipants?: number;
  price?: number;
  totalPrice?: number;
  [key: string]: unknown;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  destination_name: string;
  start_date: string;
  end_date: string;
  travelers: number;
  selected_activities: Activity[] | null;
  selected_accommodation: { name: string; [key: string]: unknown } | null;
  selected_transport: { name: string; [key: string]: unknown } | null;
  total_cost: number;
  currency: string;
  notes: string;
  status: string;
  created_at: string;
}

type FilterTab = 'all' | 'submitted' | 'quoted' | 'confirmed' | 'paid' | 'completed';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600' },
  submitted: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  quoted: { label: 'Quoted', bg: 'bg-purple-100', text: 'text-purple-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  paid: { label: 'Paid', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
};

function formatDates(start: string, end: string): string {
  if (!start) return 'No dates';
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  return end ? `${fmt(start)} — ${fmt(end)}` : fmt(start);
}

function QuoteCard({
  request,
  onAction,
}: {
  request: QuoteRequest;
  onAction: (id: string, status: string, quoteAmount?: string, adminNotes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState((request.total_cost || 0).toString());
  const [adminNotes, setAdminNotes] = useState('');
  const badge = statusConfig[request.status] || statusConfig.draft;
  const currency = request.currency || 'EUR';
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const activities: Activity[] = Array.isArray(request.selected_activities)
    ? request.selected_activities
    : [];
  const accommodationName =
    request.selected_accommodation && typeof request.selected_accommodation === 'object'
      ? request.selected_accommodation.name || 'N/A'
      : 'N/A';
  const transportName =
    request.selected_transport && typeof request.selected_transport === 'object'
      ? request.selected_transport.name || 'N/A'
      : 'N/A';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${tc.bgPrimaryMuted} text-sm font-bold ${tc.textPrimary}`}>
            {(request.full_name || '?')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{request.full_name || 'Unknown'}</p>
            <p className="truncate text-sm text-slate-500">
              {request.destination_name || 'No destination'} — {request.travelers || 0} travelers —{' '}
              {formatDates(request.start_date, request.end_date)}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          <span className="text-sm font-semibold text-slate-700">
            {symbol}
            {(request.total_cost || 0).toLocaleString()}
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</p>
              <p className="mt-1 text-sm text-slate-800">{request.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Phone</p>
              <p className="mt-1 text-sm text-slate-800">{request.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Submitted</p>
              <p className="mt-1 text-sm text-slate-800">
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Activities with participant counts */}
          {activities.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Activities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activities.map((a, i) => {
                  const ppl = a.participants || 0;
                  const max = a.maxParticipants || request.travelers || 0;
                  const price = a.totalPrice || a.price || 0;
                  return (
                    <span
                      key={`${a.name}-${i}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {a.name}
                      {ppl > 0 && ` — ${ppl}/${max} ppl`}
                      {price > 0 && ` — ${symbol}${price.toLocaleString()}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accommodation & Transport */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Accommodation</p>
              <p className="mt-1 text-sm text-slate-800">{accommodationName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Transport</p>
              <p className="mt-1 text-sm text-slate-800">{transportName}</p>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-600">Client notes</p>
              <p className="mt-1 text-sm text-slate-800">{request.notes}</p>
            </div>
          )}

          {/* Admin actions */}
          {(request.status === 'submitted' || request.status === 'quoted') && (
            <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Final quote amount ({symbol})
                  </label>
                  <input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none ${tc.focusInput}`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Internal notes</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Availability confirmed, etc."
                    className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none ${tc.focusInput}`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {request.status === 'submitted' && (
                  <button
                    onClick={() => onAction(request.id, 'quoted', quoteAmount, adminNotes)}
                    className={`flex items-center gap-1.5 rounded-lg ${tc.bgPrimaryDark} px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90`}
                  >
                    <Send size={14} /> Send quote
                  </button>
                )}
                {request.status === 'quoted' && (
                  <button
                    onClick={() => onAction(request.id, 'confirmed', undefined, adminNotes)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <Eye size={14} /> Confirm
                  </button>
                )}
                <button
                  onClick={() => onAction(request.id, 'draft', undefined, adminNotes)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={14} /> Decline
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuoteReview() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 25;

  const fetchData = async () => {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, count } = await query.range(from, to);

      if (data) {
        setRequests(data as unknown as QuoteRequest[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      toast.error('Failed to fetch quote requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filter]);

  const handleAction = async (id: string, status: string, quoteAmount?: string, adminNotes?: string) => {
    const updateData: Record<string, unknown> = { status };
    if (quoteAmount && status === 'quoted') {
      updateData.total_cost = Number(quoteAmount);
    }
    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    const { error } = await supabase.from('trips').update(updateData).eq('id', id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status, ...(quoteAmount && status === 'quoted' ? { total_cost: Number(quoteAmount) } : {}), ...(adminNotes ? { admin_notes: adminNotes } : {}) }
            : r,
        ),
      );

      const trip = requests.find((r) => r.id === id);
      const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const emailHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
      };

      // Send email notification when quoting
      if (status === 'quoted' && trip && functionsUrl && anonKey) {
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            to: trip.email,
            template: 'quote_received',
            locale: 'en',
            data: {
              name: trip.full_name,
              destination: trip.destination_name,
              reference: trip.id,
              dates: trip.start_date + ' – ' + trip.end_date,
              estimatedTotal: Number(quoteAmount),
              currency: trip.currency || 'EUR',
            },
          }),
        }).catch((err) => toast.error(`Email send failed: ${err.message}`));
      }

      // Send confirmation email
      if (status === 'confirmed' && trip && functionsUrl && anonKey) {
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            to: trip.email,
            template: 'booking_confirmed',
            locale: 'en',
            data: {
              name: trip.full_name,
              destination: trip.destination_name,
              reference: trip.id,
              dates: trip.start_date + ' – ' + trip.end_date,
              estimatedTotal: trip.total_cost,
              currency: trip.currency || 'EUR',
            },
          }),
        }).catch((err) => toast.error(`Email send failed: ${err.message}`));
      }

      // Send decline email
      if (status === 'draft' && trip && functionsUrl && anonKey) {
        fetch(`${functionsUrl}/send-email`, {
          method: 'POST',
          headers: emailHeaders,
          body: JSON.stringify({
            to: trip.email,
            template: 'quote_declined',
            locale: 'en',
            data: {
              name: trip.full_name,
              destination: trip.destination_name,
              reference: trip.id,
            },
          }),
        }).catch((err) => toast.error(`Email send failed: ${err.message}`));
      }

      toast.success(`Trip ${status === 'draft' ? 'declined' : status} successfully`);
    } else {
      toast.error(`Failed to update trip status: ${error.message}`);
    }
  };

  // Filtering is now server-side; `requests` already contains only the current filter+page
  const filtered = requests;
  const pendingCount = requests.filter((r) => r.status === 'submitted').length;

  const filterTabs: FilterTab[] = ['all', 'submitted', 'quoted', 'confirmed', 'paid', 'completed'];
  const filterLabels: Record<FilterTab, string> = {
    all: 'All',
    submitted: 'Pending',
    quoted: 'Quoted',
    confirmed: 'Confirmed',
    paid: 'Paid',
    completed: 'Completed',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quote requests</h1>
          <p className="text-sm text-slate-500">
            {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filterLabels[f]}
            {f === 'submitted' && pendingCount > 0 && (
              <span className={`ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${tc.bgPrimary} text-[10px] font-bold text-white`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Quote list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className={`animate-spin ${tc.textPrimaryMid}`} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((r) => <QuoteCard key={r.id} request={r} onAction={handleAction} />)
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Clock size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No {filter !== 'all' ? filterLabels[filter].toLowerCase() : ''} quote requests.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (() => {
            const from = page * PAGE_SIZE;
            const to = Math.min(from + filtered.length, totalCount);
            const isLastPage = from + PAGE_SIZE >= totalCount;
            return (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 mt-3 rounded-xl bg-white border border-slate-200">
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
      )}
    </div>
  );
}
