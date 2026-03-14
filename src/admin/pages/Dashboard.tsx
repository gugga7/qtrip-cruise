import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { tc } from '../../config/themeClasses';

interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
  revenue: number;
}

interface RecentTrip {
  id: string;
  full_name: string;
  destination_name: string;
  travelers: number;
  total_cost: number;
  status: string;
  created_at: string;
}

const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600' },
  submitted: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-700' },
  quoted: { label: 'Quoted', bg: 'bg-purple-100', text: 'text-purple-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  paid: { label: 'Paid', bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, confirmed: 0, revenue: 0 });
  const [allTrips, setAllTrips] = useState<RecentTrip[]>([]);
  const [recent, setRecent] = useState<RecentTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: trips, error: fetchError } = await supabase
        .from('trips')
        .select('id, full_name, destination_name, travelers, total_cost, status, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (trips) {
        const total = trips.length;
        const pending = trips.filter(t => t.status === 'submitted').length;
        const confirmedStatuses = ['confirmed', 'paid', 'completed'];
        const confirmed = trips.filter(t => confirmedStatuses.includes(t.status)).length;
        const revenue = trips
          .filter(t => confirmedStatuses.includes(t.status))
          .reduce((sum, t) => sum + (t.total_cost || 0), 0);

        setStats({ total, pending, confirmed, revenue });
        setAllTrips(trips);
        setRecent(trips.slice(0, 5));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(message);
      toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    {
      title: 'Total Quotes',
      value: stats.total.toString(),
      icon: FileText,
      iconBg: tc.bgPrimaryMuted,
      iconColor: tc.textPrimary,
    },
    {
      title: 'Pending',
      value: stats.pending.toString(),
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Confirmed',
      value: stats.confirmed.toString(),
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Revenue',
      value: `€${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      iconBg: tc.bgAccentMuted,
      iconColor: tc.textAccent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            to="/admin/quotes"
            className={`inline-flex items-center gap-1.5 rounded-lg ${tc.bgPrimaryDark} px-4 py-2 text-sm font-medium text-white transition hover:bg-opacity-90`}
          >
            Review Quotes
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className={`animate-spin ${tc.textPrimaryMid}`} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl bg-slate-50 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${card.iconBg}`}>
                      <Icon size={20} className={card.iconColor} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent quotes */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Quotes</h2>
              <Link to="/admin/quotes" className={`text-sm font-medium ${tc.textPrimary} ${tc.hoverTextPrimary}`}>
                View all
              </Link>
            </div>
            {recent.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recent.map((trip) => {
                  const badge = statusBadge[trip.status] || statusBadge.draft;
                  return (
                    <div key={trip.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tc.bgPrimaryMuted} text-xs font-bold ${tc.textPrimary}`}>
                          {(trip.full_name || '?')
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{trip.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">
                            {trip.destination_name || 'No destination'} — {trip.travelers || 0} travelers
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          €{(trip.total_cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No quotes yet.</p>
            )}
          </div>

          {/* Analytics row 1: Status Chart + Revenue Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Quotes by Status */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quotes by Status</h2>
              {(() => {
                const statusOrder = ['draft', 'submitted', 'quoted', 'confirmed', 'paid', 'completed', 'cancelled'] as const;
                const statusColors: Record<string, string> = {
                  draft: 'bg-gray-400',
                  submitted: 'bg-amber-400',
                  quoted: 'bg-blue-400',
                  confirmed: 'bg-green-500',
                  paid: 'bg-emerald-500',
                  completed: 'bg-slate-500',
                  cancelled: 'bg-red-400',
                };
                const statusLabels: Record<string, string> = {
                  draft: 'Draft',
                  submitted: 'Submitted',
                  quoted: 'Quoted',
                  confirmed: 'Confirmed',
                  paid: 'Paid',
                  completed: 'Completed',
                  cancelled: 'Cancelled',
                };
                const counts = statusOrder.map(s => ({
                  status: s,
                  count: allTrips.filter(t => t.status === s).length,
                })).filter(s => s.count > 0);
                const maxCount = Math.max(...counts.map(c => c.count), 1);
                const total = allTrips.length || 1;

                return counts.length > 0 ? (
                  <div className="space-y-3">
                    {counts.map(({ status, count }) => (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-600">{statusLabels[status]}</span>
                          <span className="text-sm text-slate-500">{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-3 rounded-full ${statusColors[status]} transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No data yet.</p>
                );
              })()}
            </div>

            {/* Revenue Summary */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue Summary</h2>
              {(() => {
                const revenueStatuses = ['confirmed', 'paid', 'completed'];
                const revenueTrips = allTrips.filter(t => revenueStatuses.includes(t.status));
                const totalRevenue = revenueTrips.reduce((sum, t) => sum + (t.total_cost || 0), 0);
                const avgQuoteValue = allTrips.length > 0
                  ? allTrips.reduce((sum, t) => sum + (t.total_cost || 0), 0) / allTrips.length
                  : 0;
                const conversionRate = allTrips.length > 0
                  ? (revenueTrips.length / allTrips.length) * 100
                  : 0;

                return (
                  <div className="space-y-5">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                      <p className="text-sm font-medium text-emerald-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-emerald-700">
                        &euro;{totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-500 mt-1">
                        From {revenueTrips.length} confirmed/paid/completed trip{revenueTrips.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-sm font-medium text-slate-500 mb-1">Avg Quote Value</p>
                        <p className="text-xl font-semibold text-slate-800">
                          &euro;{Math.round(avgQuoteValue).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-sm font-medium text-slate-500 mb-1">Conversion Rate</p>
                        <p className="text-xl font-semibold text-slate-800">
                          {conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {revenueTrips.length} of {allTrips.length} quotes
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Analytics row 2: Popular Destinations + Activity Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Popular Destinations */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Destinations</h2>
              {(() => {
                const destCounts: Record<string, number> = {};
                allTrips.forEach(t => {
                  const name = t.destination_name || 'Unknown';
                  destCounts[name] = (destCounts[name] || 0) + 1;
                });
                const sorted = Object.entries(destCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);
                const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
                const barColors = [
                  'bg-blue-500',
                  'bg-indigo-400',
                  'bg-purple-400',
                  'bg-violet-400',
                  'bg-fuchsia-400',
                ];

                return sorted.length > 0 ? (
                  <div className="space-y-3">
                    {sorted.map(([name, count], i) => (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-600 truncate mr-2">{name}</span>
                          <span className="text-sm text-slate-500 whitespace-nowrap">{count} trip{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-3 rounded-full ${barColors[i % barColors.length]} transition-all duration-500`}
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No destinations yet.</p>
                );
              })()}
            </div>

            {/* Recent Activity Timeline */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
              {(() => {
                const timelineTrips = allTrips.slice(0, 10);
                return timelineTrips.length > 0 ? (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
                    <div className="space-y-0">
                      {timelineTrips.map((trip, i) => {
                        const badge = statusBadge[trip.status] || statusBadge.draft;
                        const date = new Date(trip.created_at);
                        const formatted = date.toLocaleDateString('en-IE', {
                          day: 'numeric',
                          month: 'short',
                        });
                        return (
                          <div key={trip.id} className="relative flex items-start gap-4 py-2.5 pl-8">
                            {/* Dot on timeline */}
                            <div className={`absolute left-1.5 top-4 h-3 w-3 rounded-full border-2 border-white ${i === 0 ? tc.bgPrimaryDark || 'bg-blue-600' : 'bg-slate-300'}`} />
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {trip.full_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {trip.destination_name || 'No destination'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                                <span className="text-xs text-slate-400 whitespace-nowrap">{formatted}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No activity yet.</p>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
