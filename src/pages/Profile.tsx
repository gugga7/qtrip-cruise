import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Bell,
  Calendar,
  ChevronRight,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  Shield,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { activeNiche } from '../config/niche';
import { formatDate as format } from '../lib/dateFormat';
import { tc } from '../config/themeClasses';
import { SEO } from '../components/SEO';

/* ── Status badge colors ── */
const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  quoted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};

/* ── Section card wrapper ── */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/* ── Edit profile modal ── */
function EditProfileModal({
  open,
  onClose,
  user,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.display_name || ''
  );
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName.trim(), phone: phone.trim() },
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('profile.profileUpdated'));
      onSaved();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t('profile.editProfile')}</h3>
              <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('profile.displayName')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none ${tc.focusInput}`}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('review.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none ${tc.focusInput}`}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !displayName.trim()}
                className={`flex-1 rounded-xl ${tc.btnGradient} px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main Profile Page ── */
export function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  interface TripBooking {
    id: string;
    destination: string;
    start_date: string;
    end_date: string;
    status: string;
    total_price: number;
    activities?: string[];
  }

  const [bookings, setBookings] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('trips')
      .select('id, destination_name, start_date, end_date, status, total_cost, selected_activities')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); }
        else {
          setBookings(
            (data ?? []).map((t: Record<string, unknown>) => ({
              id: t.id as string,
              destination: (t.destination_name as string) || 'Unknown',
              start_date: t.start_date as string,
              end_date: t.end_date as string,
              status: t.status as string,
              total_price: Number(t.total_cost) || 0,
              activities: Array.isArray(t.selected_activities)
                ? (t.selected_activities as { title?: string }[]).map((a) => a.title || '').filter(Boolean)
                : [],
            }))
          );
        }
        setLoading(false);
      });
  }, [user]);

  const cancelBooking = async (id: string) => {
    const { error: err } = await supabase
      .from('trips')
      .update({ status: 'completed' })
      .eq('id', id)
      .eq('user_id', user?.id ?? '');
    if (!err) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
    }
  };
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [notifQuotes, setNotifQuotes] = useState(true);
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifGroup, setNotifGroup] = useState(false);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Section className="p-8 text-center">
          <User size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-slate-600">{t('nav.signIn')} to view your profile.</p>
        </Section>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'Traveler';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const memberSince = user.created_at ? format(new Date(user.created_at), 'MMMM yyyy') : '';

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.end_date) >= now && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.end_date) < now || b.status === 'cancelled'
  );
  const activeBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <SEO title={t('profile.title')} path="/profile" noIndex />
      {/* ── Profile header card ── */}
      <Section>
        <div className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-r ${tc.profileHeaderGradient} px-6 pb-16 pt-8`}>
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br ${tc.avatarGradient} text-2xl font-bold text-white shadow-lg`}>
                {initials}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                <p className="text-sm text-slate-500">
                  {t('profile.memberSince', { date: memberSince })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Pencil size={12} />
              {t('profile.editProfile')}
            </button>
          </div>

          {/* Contact info pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {user.email && (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                <Mail size={12} className="text-slate-400" />
                {user.email}
              </span>
            )}
            {user.user_metadata?.phone && (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                <Phone size={12} className="text-slate-400" />
                {user.user_metadata.phone}
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Calendar, label: t('profile.tripHistory'), value: bookings.length },
          { icon: MapPin, label: t('profile.upcomingTrips'), value: upcomingBookings.length },
          { icon: Users, label: t('common.guests'), value: '—' },
          { icon: Wallet, label: t('common.total'), value: bookings.length > 0 ? `€${bookings.reduce((s, b) => s + (b.total_price || 0), 0).toLocaleString()}` : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <Section key={label} className="p-4 text-center">
            <Icon size={20} className={`mx-auto ${tc.textPrimaryLight}`} />
            <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
            <p className="text-[11px] text-slate-500">{label}</p>
          </Section>
        ))}
      </div>

      {/* ── Settings section ── */}
      <Section className="p-5">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Settings size={16} className="text-slate-400" />
          {t('profile.settings')}
        </h2>

        {/* Preferences */}
        <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('profile.preferences')}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">{t('profile.language')}</span>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">{t('profile.currency')}</span>
            </div>
            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {activeNiche.defaultCurrency}
            </span>
          </div>
        </div>

        {/* Notifications */}
        <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {t('profile.notifications')}
        </p>
        <div className="space-y-2">
          {([
            { label: t('profile.notifQuotes'), desc: t('profile.notifQuotesDesc'), icon: Mail, value: notifQuotes, toggle: setNotifQuotes },
            { label: t('profile.notifBookings'), desc: t('profile.notifBookingsDesc'), icon: Shield, value: notifBookings, toggle: setNotifBookings },
            { label: t('profile.notifGroup'), desc: t('profile.notifGroupDesc'), icon: Bell, value: notifGroup, toggle: setNotifGroup },
          ] as const).map(({ label, desc, icon: Icon, value, toggle }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(!value)}
                className={`relative h-6 w-11 rounded-full transition-colors ${value ? tc.toggleActive : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Bookings / Trip history ── */}
      <Section className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{t('profile.tripHistory')}</h2>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(['upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'upcoming' ? t('profile.upcomingTrips') : t('profile.tripHistory')}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-400">{t('common.loading')}</div>
          )}
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}
          {!loading && activeBookings.length === 0 && (
            <div className="py-8 text-center">
              <Calendar size={32} className="mx-auto text-slate-200" />
              <p className="mt-3 text-sm text-slate-400">{t('profile.noTrips')}</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {activeBookings.map((booking) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className={`shrink-0 ${tc.textPrimaryLight}`} />
                    <p className="truncate font-semibold text-slate-900">{booking.destination}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        statusStyles[booking.status] || statusStyles.pending
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {format(new Date(booking.start_date), 'MMM d')} –{' '}
                    {format(new Date(booking.end_date), 'MMM d, yyyy')}
                  </p>
                  {booking.activities?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {booking.activities.slice(0, 3).map((a: string, i: number) => (
                        <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                          {a}
                        </span>
                      ))}
                      {booking.activities.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{booking.activities.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {booking.total_price > 0 && (
                    <span className="text-sm font-semibold text-slate-700">
                      €{booking.total_price.toLocaleString()}
                    </span>
                  )}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-[10px] font-medium text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      {t('common.cancel')}
                    </button>
                  )}
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── Sign out ── */}
      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
      >
        <LogOut size={16} />
        {t('nav.signOut')}
      </button>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} onSaved={() => window.location.reload()} />
    </div>
  );
}
