import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

export function Users() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(`Failed to fetch users: ${error.message}`);
        return;
      }
      setProfiles((data as Profile[]) || []);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    const action = currentIsAdmin ? 'remove admin from' : 'grant admin to';
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?\n\nUser ID: ${userId}`
    );
    if (!confirmed) return;

    setTogglingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentIsAdmin })
        .eq('id', userId);

      if (error) {
        toast.error(`Failed to update admin status: ${error.message}`);
        return;
      }

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, is_admin: !currentIsAdmin } : p))
      );
      toast.success(
        currentIsAdmin ? 'Admin privileges removed' : 'Admin privileges granted'
      );
    } catch {
      toast.error('Failed to update admin status');
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const adminCount = profiles.filter((p) => p.is_admin).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-slate-500">
            {profiles.length} {profiles.length === 1 ? 'user' : 'users'} — {adminCount} admin{adminCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-slate-400" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No users found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-[600px] divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email / ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile) => (
                <tr key={profile.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      {profile.email ? (
                        <p className="text-sm font-medium text-slate-900">{profile.email}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No email</p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-400 font-mono">{profile.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {profile.is_admin ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleAdmin(profile.id, profile.is_admin)}
                      disabled={togglingId === profile.id}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                        profile.is_admin
                          ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {togglingId === profile.id
                        ? 'Updating...'
                        : profile.is_admin
                          ? 'Remove Admin'
                          : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
