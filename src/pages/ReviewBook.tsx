import { Calendar, CheckCircle2, Hotel, Mail, MapPin, Phone, Plane, Send, Ticket, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCreateQuoteRequest } from '../hooks/useQuoteRequests';
import type { QuoteRequestFormValues } from '../lib/types';
import { useAuth } from '../lib/auth';
import { useTripStore } from '../store/tripStore';
import { BookingTimeline } from '../components/BookingTimeline';
import { tc } from '../config/themeClasses';

interface ReviewBookProps { onNext: () => void; onBack: () => void; }

const defaultForm: QuoteRequestFormValues = { fullName: '', email: '', phone: '', preferredContactMethod: 'email', notes: '' };

export function ReviewBook({ onBack }: ReviewBookProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedDestination, startDate, endDate, travelers, budget, currency, selectedActivities, selectedAccommodation, selectedTransport, getTotalCost, clearTripData } = useTripStore();
  const createQuoteRequest = useCreateQuoteRequest();
  const [form, setForm] = useState<QuoteRequestFormValues>(defaultForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [quoteReference, setQuoteReference] = useState<string | null>(null);
  const nights = useMemo(() => startDate && endDate ? Math.max(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)), 1) : 0, [endDate, startDate]);
  const totalCost = getTotalCost();

  useEffect(() => {
    setForm((prev) => ({ ...prev, fullName: prev.fullName || user?.user_metadata?.full_name || '', email: prev.email || user?.email || '' }));
  }, [user?.email, user?.user_metadata?.full_name]);

  const validationMessages = useMemo(() => {
    const messages: string[] = [];
    if (!selectedDestination) messages.push(t('review.validationDestination'));
    if (!startDate || !endDate) messages.push(t('review.validationDates'));
    if (!selectedActivities.length) messages.push(t('review.validationActivities'));
    if (!selectedAccommodation) messages.push(t('review.validationAccommodation'));
    if (!selectedTransport) messages.push(t('review.validationTransport'));
    if (!form.fullName.trim()) messages.push(t('review.validationName'));
    if (!form.email.trim()) messages.push(t('review.validationEmail'));
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) messages.push(t('review.validationEmailFormat'));
    if (!form.phone.trim()) messages.push(t('review.validationPhone'));
    else if (!/^\+?[\d\s()-]{7,}$/.test(form.phone.trim())) messages.push(t('review.validationPhoneFormat'));
    return messages;
  }, [endDate, form.email, form.fullName, form.phone, selectedAccommodation, selectedActivities.length, selectedDestination, selectedTransport, startDate, t]);

  const handleSubmit = async () => {
    if (!selectedDestination) return;
    if (validationMessages.length) {
      validationMessages.forEach((message) => toast.error(message));
      return;
    }
    try {
      const result = await createQuoteRequest.mutateAsync({ form, destination: selectedDestination, startDate, endDate, travelers, budget, currency, estimatedTotal: totalCost, activities: selectedActivities, accommodation: selectedAccommodation, transport: selectedTransport });
      setQuoteReference(result.id);
      toast.success(t('review.quoteSuccess'));
      // If not logged in, auto-redirect to register after 2 seconds
      if (!user) {
        setTimeout(() => {
          navigate('/login', { state: { tripId: result.id, email: form.email, register: true } });
        }, 2000);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('review.quoteError'));
    }
  };

  const handleStartOver = () => {
    clearTripData();
    navigate('/preferences');
  };

  if (quoteReference) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('review.quoteReceived')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('review.quoteReceivedSub')}</p>
          {/* Booking status timeline */}
          <div className="mt-8 rounded-xl bg-slate-50 p-6">
            <BookingTimeline status="draft" />
          </div>

          <div className="mt-6 rounded-xl bg-white border border-slate-200 p-5 text-left">
            <p className="text-xs font-medium text-slate-500">{t('review.reference')}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{quoteReference}</p>
            <p className="mt-3 text-sm text-slate-600">{t('review.confirmationSummary', { destination: selectedDestination?.name, travelers, estimate: totalCost.toFixed(0) })}</p>
          </div>

          <div className={`mt-4 rounded-xl ${tc.nextStepsBg} border ${tc.nextStepsBorder} p-4 text-left`}>
            <p className={`text-sm font-medium ${tc.nextStepsTitle}`}>{t('review.whatHappensNext')}</p>
            <ul className={`mt-2 space-y-1.5 text-sm ${tc.nextStepsText}`}>
              <li className="flex items-start gap-2"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tc.nextStepsBadge} text-[10px] font-bold`}>1</span>{t('review.nextStep1')}</li>
              <li className="flex items-start gap-2"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tc.nextStepsBadge} text-[10px] font-bold`}>2</span>{t('review.nextStep2')}</li>
              <li className="flex items-start gap-2"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tc.nextStepsBadge} text-[10px] font-bold`}>3</span>{t('review.nextStep3')}</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={handleStartOver} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">{t('review.buildAnother')}</button>
            {!user ? (
              <button
                onClick={() => navigate('/login', { state: { tripId: quoteReference, email: form.email, register: true } })}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {t('review.createAccount')}
              </button>
            ) : (
              <button
                onClick={() => navigate('/booking')}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {t('review.goToProfile')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{t('review.title')}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{t('review.subtitle')}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Trip summary column */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500"><MapPin size={14} /> {t('review.destination')}</div>
              <p className="font-semibold text-slate-900">{selectedDestination?.name ?? '—'}</p>
              <p className="text-sm text-slate-500">{selectedDestination?.country ?? '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500"><Calendar size={14} /> {t('review.dates')}</div>
              <p className="font-semibold text-slate-900">{startDate ?? '—'} → {endDate ?? '—'}</p>
              <p className="text-sm text-slate-500">{t('review.nightsCount', { count: nights })}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500"><UserRound size={14} /> {t('review.travelers')}</div>
              <p className="font-semibold text-slate-900">{travelers}</p>
              <p className="text-sm text-slate-500">{t('review.budgetSignal', { currency, amount: budget || 0 })}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500"><Ticket size={14} /> {t('review.quoteEstimate')}</div>
              <p className="font-semibold text-slate-900">€{totalCost.toFixed(0)}</p>
              <p className="text-sm text-slate-500">{t('review.priceConfirmed')}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-900">
              <Ticket size={16} className={tc.textPrimaryMid} />
              <h2 className="font-semibold">{t('review.selectedActivities')}</h2>
            </div>
            <div className="space-y-2">
              {selectedActivities.map((activity) => (
                <div key={activity.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.scheduled ? `${t('schedule.day')} ${activity.scheduled.day} — ${activity.scheduled.slot}` : t('review.schedulePending')} · {activity.duration}h · {activity.participants ?? travelers} ppl</p>
                    </div>
                    <span className={`text-sm font-semibold ${tc.textPrimary}`}>€{activity.price * (activity.participants ?? travelers)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <Hotel size={16} className={tc.textPrimaryMid} />
                <h2 className="text-sm font-semibold">{t('review.accommodation')}</h2>
              </div>
              <p className="text-sm font-medium text-slate-900">{selectedAccommodation?.name ?? '—'}</p>
              <p className="text-xs text-slate-500">{selectedAccommodation ? t('review.accommodationDetails', { location: selectedAccommodation.location, price: selectedAccommodation.pricePerNight }) : t('review.noStay')}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <Plane size={16} className={tc.textPrimaryMid} />
                <h2 className="text-sm font-semibold">{t('review.transport')}</h2>
              </div>
              <p className="text-sm font-medium text-slate-900">{selectedTransport?.name ?? '—'}</p>
              <p className="text-xs text-slate-500">{selectedTransport ? t('review.transportDetails', { type: selectedTransport.type, price: selectedTransport.price }) : t('review.noTransport')}</p>
            </div>
          </div>

          {selectedDestination && (
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className={`text-xs uppercase tracking-[0.2em] ${tc.insightsLabel}`}>{t('review.destinationGuide')}</p>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-medium">{t('review.bestTime')}</p>
                  <p className="mt-1 text-xs text-slate-300">{selectedDestination.bestTimeToVisit.join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium">{t('review.travelTips')}</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-300">{selectedDestination.localTips.slice(0, 2).map((tip) => <li key={tip}>· {tip}</li>)}</ul>
                </div>
                <div>
                  <p className="font-medium">{t('review.healthSafety')}</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-slate-300">{selectedDestination.healthAndSafety.slice(0, 2).map((item) => <li key={item}>· {item}</li>)}</ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quote form column */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t('review.yourQuoteRequest')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('review.tellUsHow')}</p>
          </div>

          {user?.email && (
            <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {t('review.signedInAs', { email: user.email })}
            </div>
          )}

          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">{t('review.fullName')} <span className="text-red-400">*</span></span>
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none ${tc.focusInput} ${touched.fullName && !form.fullName.trim() ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}
              />
              {touched.fullName && !form.fullName.trim() && (
                <span className="text-xs text-red-500">{t('review.validationName')}</span>
              )}
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><Mail size={12} /> {t('review.email')} <span className="text-red-400">*</span></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none ${tc.focusInput} ${touched.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}
                />
                {touched.email && !form.email.trim() && (
                  <span className="text-xs text-red-500">{t('review.validationEmail')}</span>
                )}
                {touched.email && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) && (
                  <span className="text-xs text-red-500">{t('review.validationEmailFormat')}</span>
                )}
              </label>
              <label className="block space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600"><Phone size={12} /> {t('review.phone')} <span className="text-red-400">*</span></span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none ${tc.focusInput} ${touched.phone && (!/^\+?[\d\s()-]{7,}$/.test(form.phone.trim())) ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}
                  placeholder="+33 6 12 34 56 78"
                />
                {touched.phone && !form.phone.trim() && (
                  <span className="text-xs text-red-500">{t('review.validationPhone')}</span>
                )}
                {touched.phone && form.phone.trim() && !/^\+?[\d\s()-]{7,}$/.test(form.phone.trim()) && (
                  <span className="text-xs text-red-500">{t('review.validationPhoneFormat')}</span>
                )}
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">{t('review.preferredContact')}</span>
              <select value={form.preferredContactMethod} onChange={(e) => setForm((prev) => ({ ...prev, preferredContactMethod: e.target.value as QuoteRequestFormValues['preferredContactMethod'] }))} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none ${tc.focusInput}`}>
                <option value="email">{t('review.email')}</option>
                <option value="phone">{t('review.phone')}</option>
                <option value="whatsapp">{t('review.whatsapp')}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-slate-600">{t('review.notes')}</span>
              <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={4} placeholder={t('review.notesPlaceholder')} className={`w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none ${tc.focusInput}`} />
            </label>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{t('review.whatHappensNext')}</p>
            <ul className="mt-2 space-y-1.5">
              <li>{t('review.nextStep1')}</li>
              <li>{t('review.nextStep2')}</li>
              <li>{t('review.nextStep3')}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onBack} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50">{t('common.back')}</button>
            <button onClick={handleSubmit} disabled={createQuoteRequest.isPending} className={`flex flex-1 items-center justify-center gap-2 rounded-xl ${tc.btnGradient} px-5 py-2.5 text-sm font-medium text-white shadow-lg ${tc.btnGradientHover} disabled:cursor-not-allowed disabled:opacity-60`}>
              <Send size={16} /> {createQuoteRequest.isPending ? t('review.submitting') : t('review.submitQuote')}
            </button>
          </div>

          {validationMessages.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {t('review.completeMissingItems', { messages: validationMessages.join(' ') })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
