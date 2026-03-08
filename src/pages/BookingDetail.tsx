import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate as format } from '../lib/dateFormat';
import { MapPin, Calendar, Users, Ticket, Hotel, Plane, ArrowLeft, Check, X } from 'lucide-react';
import { BookingTimeline } from '../components/BookingTimeline';
import { CountdownTimer } from '../components/CountdownTimer';
import { ExpenseSplitter } from '../components/ExpenseSplitter';
import { DressCodeVoting } from '../components/DressCodeVoting';
import { useFeature } from '../hooks/useNiche';
import { useTripStore } from '../store/tripStore';
import { useGroupStore } from '../store/groupStore';
import { tc } from '../config/themeClasses';

export function BookingDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trip = useTripStore();
  const { activeGroup } = useGroupStore();
  const showCountdown = useFeature('countdownTimer');
  const showExpenseSplit = useFeature('expenseSplitting');
  const showVoting = useFeature('votingSystem');
  const [quoteStatus, setQuoteStatus] = useState<'draft' | 'quoted' | 'confirmed' | 'paid' | 'completed'>('quoted');

  const nights =
    trip.startDate && trip.endDate
      ? Math.max(Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)), 0)
      : 0;

  const activitiesCost = trip.selectedActivities.reduce((sum, a) => sum + a.price * (a.participants ?? trip.travelers), 0);
  const accommodationCost = (trip.selectedAccommodation?.pricePerNight ?? 0) * nights;
  const transportCost = (trip.selectedTransport?.price ?? 0) * trip.travelers;
  const totalCost = activitiesCost + accommodationCost + transportCost;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${tc.loginBg} px-4 py-8`}>
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900">{t('bookingDetail.title')}</h1>

        {/* Timeline */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <BookingTimeline status={quoteStatus} />

          {/* Accept / Decline actions when quote is received */}
          {quoteStatus === 'quoted' && (
            <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={() => setQuoteStatus('confirmed')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                <Check size={16} /> {t('bookingDetail.acceptQuote')}
              </button>
              <button
                onClick={() => setQuoteStatus('draft')}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} /> {t('bookingDetail.declineQuote')}
              </button>
            </div>
          )}
        </div>

        {/* Countdown timer (niche feature) */}
        {showCountdown && trip.startDate && new Date(trip.startDate) > new Date() && (
          <div className="mt-6">
            <CountdownTimer
              targetDate={trip.startDate}
              label={t('bookingDetail.countdownTitle')}
            />
          </div>
        )}

        {/* Trip overview */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin size={16} /> {t('review.destination')}
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {trip.selectedDestination?.name ?? '—'}
            </p>
            <p className="text-sm text-slate-500">{trip.selectedDestination?.country}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Calendar size={16} /> {t('review.dates')}
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {trip.startDate ? format(new Date(trip.startDate), 'MMM d') : '—'}
              {trip.endDate ? ` — ${format(new Date(trip.endDate), 'MMM d')}` : ''}
            </p>
            <p className="text-sm text-slate-500">
              {nights > 0 ? t('review.nightsCount', { count: nights }) : ''}
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users size={16} /> {t('review.travelers')}
            </div>
            <p className="text-lg font-semibold text-slate-900">{trip.travelers}</p>
          </div>
        </div>

        {/* Itinerary */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Ticket size={18} /> {t('bookingDetail.itinerary')}
          </h2>
          {trip.selectedActivities.length > 0 ? (
            <div className="space-y-3">
              {trip.selectedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                    <p className="text-xs text-slate-500">
                      {activity.duration}h · {activity.participants ?? trip.travelers} ppl
                      {activity.scheduledDay != null &&
                        ` — ${t('schedule.day')} ${activity.scheduledDay}`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {trip.currency === 'EUR' ? '€' : trip.currency} {activity.price * (activity.participants ?? trip.travelers)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t('tripSummary.noActivities')}</p>
          )}
        </div>

        {/* Accommodation & Transport */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Hotel size={18} /> {t('review.accommodation')}
            </h2>
            {trip.selectedAccommodation ? (
              <div>
                <p className="font-medium text-slate-800">{trip.selectedAccommodation.name}</p>
                <p className="text-sm text-slate-500">{trip.selectedAccommodation.location}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {trip.currency === 'EUR' ? '€' : trip.currency}{' '}
                  {trip.selectedAccommodation.pricePerNight}/{t('common.night')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('review.noStay')}</p>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Plane size={18} /> {t('review.transport')}
            </h2>
            {trip.selectedTransport ? (
              <div>
                <p className="font-medium text-slate-800">{trip.selectedTransport.name}</p>
                <p className="text-sm text-slate-500">{trip.selectedTransport.type}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {trip.currency === 'EUR' ? '€' : trip.currency} {trip.selectedTransport.price}/{t('common.perPerson')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{t('review.noTransport')}</p>
            )}
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t('bookingDetail.costBreakdown')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('bookingDetail.activitiesCost')}</span>
              <span className="font-medium text-slate-800">
                {trip.currency === 'EUR' ? '€' : trip.currency} {activitiesCost.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('bookingDetail.accommodationCost')}</span>
              <span className="font-medium text-slate-800">
                {trip.currency === 'EUR' ? '€' : trip.currency} {accommodationCost.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{t('bookingDetail.transportCost')}</span>
              <span className="font-medium text-slate-800">
                {trip.currency === 'EUR' ? '€' : trip.currency} {transportCost.toFixed(0)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-slate-900">{t('common.total')}</span>
                <span className={tc.textPrimary}>
                  {trip.currency === 'EUR' ? '€' : trip.currency} {totalCost.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Group info (if active) */}
        {activeGroup && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {t('bookingDetail.groupInfo')}
            </h2>
            <p className="mb-3 text-sm text-slate-600">
              {activeGroup.name} — {activeGroup.members.length} {t('common.guests')}
            </p>
            <div className="space-y-2">
              {activeGroup.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-slate-800">{m.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.rsvpStatus === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : m.rsvpStatus === 'declined'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t(`group.${m.rsvpStatus}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Niche features: expense split + dress code voting */}
        {(showExpenseSplit || showVoting) && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {showExpenseSplit && <ExpenseSplitter />}
            {showVoting && <DressCodeVoting />}
          </div>
        )}

        {/* Booking reference */}
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-center text-white shadow-sm">
          <p className="text-sm text-slate-400">{t('bookingDetail.bookingRef')}</p>
          <p className="mt-1 text-2xl font-bold tracking-wider">
            {activeGroup?.inviteCode ?? 'QTRIP-' + Date.now().toString(36).toUpperCase().slice(-6)}
          </p>
        </div>
      </div>
    </div>
  );
}
