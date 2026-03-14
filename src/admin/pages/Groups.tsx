import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Users, Copy, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { tc } from '../../config/themeClasses';

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  dietary_restrictions: string | null;
  arrival_info: string | null;
  notes: string | null;
  created_at: string;
}

interface TripGroup {
  id: string;
  name: string;
  organizer_id: string;
  invite_code: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  trip_data: Record<string, unknown>;
  status: 'planning' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  group_members: GroupMember[];
}

type FilterTab = 'all' | 'planning' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  planning:   { label: 'Planning',   bg: 'bg-blue-100',    text: 'text-blue-700' },
  quoted:     { label: 'Quoted',     bg: 'bg-purple-100',  text: 'text-purple-700' },
  confirmed:  { label: 'Confirmed',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
  completed:  { label: 'Completed',  bg: 'bg-green-100',   text: 'text-green-700' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-red-100',     text: 'text-red-700' },
};

const rsvpConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   bg: 'bg-amber-100',   text: 'text-amber-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  declined:  { label: 'Declined',  bg: 'bg-red-100',     text: 'text-red-700' },
};

function formatDate(d: string | null): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDates(start: string | null, end: string | null): string {
  if (!start) return 'No dates set';
  return end ? `${formatDate(start)} — ${formatDate(end)}` : formatDate(start);
}

function getRsvpBreakdown(members: GroupMember[]) {
  const confirmed = members.filter((m) => m.rsvp_status === 'confirmed').length;
  const pending = members.filter((m) => m.rsvp_status === 'pending').length;
  const declined = members.filter((m) => m.rsvp_status === 'declined').length;
  return { confirmed, pending, declined };
}

function GroupCard({ group }: { group: TripGroup }) {
  const [expanded, setExpanded] = useState(false);
  const badge = statusConfig[group.status] || statusConfig.planning;
  const members = group.group_members || [];
  const rsvp = getRsvpBreakdown(members);

  const copyInviteLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/join/${group.invite_code}`;
    navigator.clipboard.writeText(link).then(
      () => toast.success('Invite link copied!'),
      () => toast.error('Failed to copy invite link'),
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${tc.bgPrimaryMuted} text-sm font-bold ${tc.textPrimary}`}>
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{group.name}</p>
            <p className="truncate text-sm text-slate-500">
              {formatDates(group.start_date, group.end_date)} — {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          {/* RSVP mini-breakdown */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {rsvp.confirmed}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {rsvp.pending}
            </span>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              {rsvp.declined}
            </span>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {members.length}
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
          {/* Group info */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Organizer ID</p>
              <p className="mt-1 text-sm text-slate-800 font-mono truncate">{group.organizer_id}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Invite Code</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-800">{group.invite_code}</code>
                <button
                  onClick={copyInviteLink}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  title="Copy invite link"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Created</p>
              <p className="mt-1 text-sm text-slate-800">
                {new Date(group.created_at).toLocaleDateString('en-GB', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Destination</p>
              <p className="mt-1 text-sm text-slate-800">{group.destination_id || 'Not set'}</p>
            </div>
          </div>

          {/* RSVP breakdown */}
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600">{rsvp.confirmed} confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600">{rsvp.pending} pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600">{rsvp.declined} declined</span>
            </div>
          </div>

          {/* Members table */}
          {members.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wider text-slate-400">Name</th>
                    <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wider text-slate-400">Email</th>
                    <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wider text-slate-400">Role</th>
                    <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wider text-slate-400">RSVP</th>
                    <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wider text-slate-400">Dietary</th>
                    <th className="pb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Arrival</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const rsvpBadge = rsvpConfig[member.rsvp_status] || rsvpConfig.pending;
                    return (
                      <tr key={member.id}>
                        <td className="py-2.5 pr-4 font-medium text-slate-800">{member.name}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{member.email || 'N/A'}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            member.role === 'organizer'
                              ? `${tc.bgPrimaryMuted} ${tc.textPrimary}`
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rsvpBadge.bg} ${rsvpBadge.text}`}>
                            {rsvpBadge.label}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600">{member.dietary_restrictions || '—'}</td>
                        <td className="py-2.5 text-slate-600">{member.arrival_info || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              No members yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Groups() {
  const [groups, setGroups] = useState<TripGroup[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_groups')
        .select('*, group_members(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setGroups(data as unknown as TripGroup[]);
      }
    } catch (err) {
      toast.error('Failed to fetch groups');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = filter === 'all' ? groups : groups.filter((g) => g.status === filter);
  const totalMembers = groups.reduce((sum, g) => sum + (g.group_members?.length || 0), 0);

  const filterTabs: FilterTab[] = ['all', 'planning', 'quoted', 'confirmed', 'completed', 'cancelled'];
  const filterLabels: Record<FilterTab, string> = {
    all: 'All',
    planning: 'Planning',
    quoted: 'Quoted',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Group bookings</h1>
          <p className="text-sm text-slate-500">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} — {totalMembers} total members
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
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Group list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className={`animate-spin ${tc.textPrimaryMid}`} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((g) => <GroupCard key={g.id} group={g} />)
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Clock size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                No {filter !== 'all' ? filterLabels[filter].toLowerCase() : ''} groups found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
