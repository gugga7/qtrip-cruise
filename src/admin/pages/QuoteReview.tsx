import { useEffect, useState } from 'react';
import { Clock, X, Eye, Send, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
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
  onAction: (id: string, status: string, quoteAmount?: string) => void;
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
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tc.bgPrimaryMuted} text-sm font-bold ${tc.textPrimary}`}>
            {(request.full_name || '?')
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{request.full_name || 'Unknown'}</p>
            <p className="text-sm text-slate-500">
              {request.destination_name || 'No destination'} — {request.travelers || 0} travelers —{' '}
              {formatDates(request.start_date, request.end_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
                    onClick={() => onAction(request.id, 'quoted', quoteAmount)}
                    className={`flex items-center gap-1.5 rounded-lg ${tc.bgPrimaryDark} px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90`}
                  >
                    <Send size={14} /> Send quote
                  </button>
                )}
                {request.status === 'quoted' && (
                  <button
                    onClick={() => onAction(request.id, 'confirmed')}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <Eye size={14} /> Confirm
                  </button>
                )}
                <button
                  onClick={() => onAction(request.id, 'draft')}
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .neq('status', 'draft')
        .order('created_at', { ascending: false });

      if (data) {
        setRequests(data as unknown as QuoteRequest[]);
      }
    } catch (err) {
      console.error('Failed to fetch quote requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, status: string, quoteAmount?: string) => {
    const updateData: Record<string, unknown> = { status };
    if (quoteAmount && status === 'quoted') {
      updateData.total_cost = Number(quoteAmount);
    }

    const { error } = await supabase.from('trips').update(updateData).eq('id', id);

    if (!error) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status, ...(quoteAmount && status === 'quoted' ? { total_cost: Number(quoteAmount) } : {}) }
            : r,
        ),
      );

      // Send email notification when quoting
      if (status === 'quoted') {
        const trip = requests.find((r) => r.id === id);
        if (trip) {
          const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          if (functionsUrl && anonKey) {
            fetch(`${functionsUrl}/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${anonKey}`,
              },
              body: JSON.stringify({
                to: trip.email,
                template: 'quote_received',
                locale: 'en',
                data: {
                  name: trip.full_name,
                  destination: trip.destination_name,
                  estimatedTotal: Number(quoteAmount),
                  currency: trip.currency || 'EUR',
                },
              }),
            }).catch(console.error);
          }
        }
      }
    } else {
      console.error('Failed to update trip status:', error);
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
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
      <div className="flex gap-2">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
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
        </div>
      )}
    </div>
  );
}
