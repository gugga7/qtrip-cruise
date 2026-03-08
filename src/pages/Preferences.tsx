import { Users, Coins } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDestinations } from '../hooks/useCatalog';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { DateRangeCalendar } from '../components/DateRangeCalendar';
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

  return (
    <div className="space-y-6 pb-28">
      {/* Hero with embedded controls */}
      <section className={`overflow-hidden rounded-2xl bg-gradient-to-br ${activeNiche.theme.heroGradient} text-white shadow-md`}>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left: title + inline controls */}
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('preferences.heroTitle')}
              </h1>
              <p className="max-w-xl text-sm text-white/70 sm:text-base">
                {t('preferences.heroSubtitle')}
              </p>
            </div>

            {/* ── Inline controls: dates, travelers, budget ── */}
            <div className="space-y-3">
              {/* Date range */}
              <div className="relative">
                <DateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onDatesChange={(start, end) => setDates(start, end)}
                />
              </div>

              {/* Travelers + Budget row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Travelers */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Users size={18} className="shrink-0 text-white/70" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">{t('common.travelers')}</span>
                    <span className="block text-lg font-bold tabular-nums">{travelers}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/80 transition-all hover:bg-white/10 active:scale-90"
                    >
                      −
                    </button>
                    <button
                      onClick={() => setTravelers(travelers + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-sm font-medium text-white/80 transition-all hover:bg-white/10 active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <Coins size={18} className="shrink-0 text-white/70" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">{t('preferences.budget')}</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent text-xs font-bold text-white/70 focus:outline-none [&>option]:text-slate-900"
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        value={budget || ''}
                        onChange={(e) => setBudget(Number(e.target.value || 0), 'total')}
                        className="w-full bg-transparent text-lg font-bold text-white placeholder-white/30 focus:outline-none"
                        placeholder="4500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.fastQuote')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.curatedStays')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.noPayment')}</span>
            </div>
          </div>

          {/* Right: destination preview */}
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
