import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, DollarSign, RefreshCw } from 'lucide-react';
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
  const [recent, setRecent] = useState<RecentTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: trips } = await supabase
        .from('trips')
        .select('id, full_name, destination_name, travelers, total_cost, status, created_at')
        .order('created_at', { ascending: false });

      if (trips) {
        const total = trips.length;
        const pending = trips.filter(t => t.status === 'submitted').length;
        const confirmedStatuses = ['confirmed', 'paid', 'completed'];
        const confirmed = trips.filter(t => confirmedStatuses.includes(t.status)).length;
        const revenue = trips
          .filter(t => confirmedStatuses.includes(t.status))
          .reduce((sum, t) => sum + (t.total_cost || 0), 0);

        setStats({ total, pending, confirmed, revenue });
        setRecent(trips.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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
        </>
      )}
    </div>
  );
}
