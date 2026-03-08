import { CalendarDays, Users, Coins } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDestinations } from '../hooks/useCatalog';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { DestinationCardSkeleton } from '../components/Skeleton';
import { useTripStore } from '../store/tripStore';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';

interface PreferencesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Preferences({ onNext, onBack }: PreferencesProps) {
  const { t } = useTranslation();
  const { selectedDestination, startDate, endDate, travelers, budget, currency, setDestination, setDates, setTravelers, setBudget, setCurrency } = useTripStore();
  const { destinations, loading } = useDestinations();
  const validationMessages = useMemo(() => {
    const messages: string[] = [];
    if (!selectedDestination) messages.push(t('preferences.validationDestination'));
    if (!startDate || !endDate) messages.push(t('preferences.validationDates'));
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) messages.push(t('preferences.validationDatesOrder'));
    return messages;
  }, [endDate, selectedDestination, startDate]);
  const dateError = !!(startDate && endDate && new Date(endDate) <= new Date(startDate));

  return (
    <div className="space-y-6 pb-28">
      {/* Hero */}
      <section className={`overflow-hidden rounded-2xl bg-gradient-to-br ${activeNiche.theme.heroGradient} text-white shadow-md`}>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('preferences.heroTitle')}
            </h1>
            <p className="max-w-xl text-sm text-slate-300 sm:text-base">
              {t('preferences.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.fastQuote')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.curatedStays')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.noPayment')}</span>
            </div>
          </div>
          {selectedDestination ? (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img src={selectedDestination.heroImageUrl} alt={selectedDestination.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className={`text-xs uppercase tracking-[0.2em] ${tc.textPrimaryPale}`}>{t('preferences.selectedDestination')}</p>
                <h2 className="mt-1 text-xl font-semibold">{selectedDestination.name}</h2>
                <p className="mt-1 text-sm text-slate-300">{selectedDestination.description}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-slate-300">
              <p className="font-medium text-white">{t('preferences.noDestination')}</p>
              <p className="mt-1 text-sm">{t('preferences.chooseBelow')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-900">{t('preferences.chooseDestination')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('preferences.chooseDestinationSub')}</p>

        {loading ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination) => (
              <button
                key={destination.id}
                onClick={() => { setDestination(destination); setCurrency(destination.currency); }}
                className={`overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  selectedDestination?.id === destination.id
                    ? tc.selectedRing
                    : 'border-slate-200'
                }`}
              >
                <img src={destination.heroImageUrl} alt={destination.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{destination.name}</h3>
                      <p className="text-xs text-slate-500">{destination.country}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{destination.currency}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{destination.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {destination.highlights.slice(0, 2).map((h) => (
                      <span key={h} className={`rounded-full px-2 py-0.5 text-xs font-medium ${tc.tagPrimary}`}>{h}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Dates, Travelers & Budget */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* ── Travel dates ── */}
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_20px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_4px_28px_-8px_rgba(0,0,0,0.12)]">
          <div className={`h-1 bg-gradient-to-r ${tc.heroGradient}`} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tc.heroGradient} shadow-sm`}>
                <CalendarDays className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('preferences.travelDates')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{t('preferences.start')}</span>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate ?? ''}
                  onChange={(e) => setDates(e.target.value || null, endDate)}
                  className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all focus:outline-none focus:shadow-md ${tc.focusInput}`}
                />
              </div>
              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{t('preferences.end')}</span>
                <input
                  type="date"
                  min={startDate ?? new Date().toISOString().split('T')[0]}
                  value={endDate ?? ''}
                  onChange={(e) => setDates(startDate, e.target.value || null)}
                  className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all focus:outline-none focus:shadow-md focus:ring-2 ${
                    dateError
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : `border-slate-200 ${tc.focusInput}`
                  }`}
                />
                {dateError && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{t('preferences.validationDatesOrder')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Travelers ── */}
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_20px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_4px_28px_-8px_rgba(0,0,0,0.12)]">
          <div className={`h-1 bg-gradient-to-r ${tc.heroGradient}`} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tc.heroGradient} shadow-sm`}>
                <Users className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('common.travelers')}</h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">{travelers}</span>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 text-slate-500 text-xl font-medium transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-90`}
                >
                  −
                </button>
                <button
                  onClick={() => setTravelers(travelers + 1)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-slate-200 text-slate-500 text-xl font-medium transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-90`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Budget ── */}
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_2px_20px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_4px_28px_-8px_rgba(0,0,0,0.12)]">
          <div className={`h-1 bg-gradient-to-r ${tc.heroGradient}`} />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tc.heroGradient} shadow-sm`}>
                <Coins className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t('preferences.budget')}</h3>
            </div>
            <div className="flex items-center rounded-xl border-2 border-slate-200 bg-white shadow-sm transition-all focus-within:border-slate-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-slate-100">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-l-xl border-r border-slate-200 bg-slate-50 py-3 pl-4 pr-2 text-sm font-bold text-slate-500 focus:outline-none"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="MAD">MAD</option>
              </select>
              <input
                type="number"
                min={0}
                value={budget || ''}
                onChange={(e) => setBudget(Number(e.target.value || 0), 'total')}
                className="w-full bg-transparent py-3 px-4 text-lg font-bold text-slate-900 focus:outline-none"
                placeholder="4500"
              />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-400">{t('preferences.budgetHint')}</p>
          </div>
        </div>
      </section>

      {/* Destination insights — only when selected */}
      {selectedDestination && (
        <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
          <p className={`text-xs uppercase tracking-[0.2em] ${tc.textPrimaryPale}`}>{t('preferences.destinationInsights')}</p>
          <p className="mt-2 text-lg font-semibold">{selectedDestination.name}</p>
          <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
            <p><span className="font-medium text-white">{t('preferences.bestTime')}:</span> <span className="text-slate-300">{selectedDestination.bestTimeToVisit.join(', ')}</span></p>
            <p><span className="font-medium text-white">{t('preferences.languageLabel')}:</span> <span className="text-slate-300">{selectedDestination.language}</span></p>
            <p><span className="font-medium text-white">{t('preferences.requirements')}:</span> <span className="text-slate-300">{selectedDestination.travelRequirements[0]}</span></p>
          </div>
        </section>
      )}

      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={validationMessages.length === 0} currentStep={1} totalSteps={6} validationMessages={validationMessages} nextText={t('preferences.continueToActivities')} />
    </div>
  );
}
