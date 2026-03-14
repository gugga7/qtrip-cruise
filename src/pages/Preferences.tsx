import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Anchor, Plus, X, Clock, Ship } from 'lucide-react';
import { useDestinations } from '../hooks/useCatalog';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { DestinationCardSkeleton } from '../components/Skeleton';
import { useTripStore } from '../store/tripStore';
import type { PortStop } from '../store/tripStore';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';

const VIBE_OPTIONS = [
  { label: 'Culture & History', value: 'Cultural Deep Dive', emoji: '🏛️' },
  { label: 'Food & Local Flavour', value: 'Food & Local Flavour', emoji: '🍽️' },
  { label: 'Beach & Water', value: 'Beach & Water', emoji: '🏖️' },
  { label: 'Adventure & Active', value: 'Adventure & Active', emoji: '🏄' },
  { label: 'Shopping & Markets', value: 'Shopping & Markets', emoji: '🛍️' },
  { label: 'Scenic & Landmarks', value: 'Must-See Landmarks', emoji: '📸' },
];

interface PreferencesProps {
  onNext: () => void;
  onBack: () => void;
}

export function Preferences({ onNext, onBack }: PreferencesProps) {
  const { t } = useTranslation();
  const { travelers, budget, currency, portSchedule, setPortSchedule, setTravelers, setBudget, setCurrency, setDestination, selectedDestination, vibePreferences, setVibePreferences } = useTripStore();
  const { destinations, loading } = useDestinations();

  /* ── Port management ── */
  const addPort = useCallback(() => {
    const nextIndex = portSchedule.length + 1;
    const newPort: PortStop = {
      portIndex: nextIndex,
      destinationId: '',
      portName: '',
      dockArrival: '08:00',
      dockDeparture: '17:00',
      date: '',
    };
    setPortSchedule([...portSchedule, newPort]);
  }, [portSchedule, setPortSchedule]);

  const removePort = useCallback((portIndex: number) => {
    const filtered = portSchedule
      .filter((p) => p.portIndex !== portIndex)
      .map((p, i) => ({ ...p, portIndex: i + 1 }));
    setPortSchedule(filtered);
  }, [portSchedule, setPortSchedule]);

  const updatePort = useCallback((portIndex: number, field: string, value: string) => {
    const updated = portSchedule.map((p) => {
      if (p.portIndex !== portIndex) return p;
      if (field === 'destinationId') {
        const dest = destinations.find((d) => d.id === value);
        return { ...p, destinationId: value, portName: dest?.name ?? '' };
      }
      return { ...p, [field]: value };
    });
    setPortSchedule(updated);

    // Auto-select first port's destination for activities
    if (field === 'destinationId' && portIndex === 1) {
      const dest = destinations.find((d) => d.id === value);
      if (dest) setDestination(dest);
    }
  }, [portSchedule, setPortSchedule, destinations, setDestination]);

  /* ── Compute dock hours for display ── */
  const getDockHours = (arrival: string, departure: string) => {
    if (!arrival || !departure) return null;
    const [ah, am] = arrival.split(':').map(Number);
    const [dh, dm] = departure.split(':').map(Number);
    const mins = (dh * 60 + dm) - (ah * 60 + am);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  /* ── Validation ── */
  const validationMessages = useMemo(() => {
    const messages: string[] = [];
    if (portSchedule.length === 0) messages.push(t('preferences.validationPorts'));
    for (const port of portSchedule) {
      if (!port.destinationId) {
        messages.push(t('preferences.validationPortDestination', { index: port.portIndex }));
        break;
      }
      if (!port.date) {
        messages.push(t('preferences.validationPortDate', { index: port.portIndex }));
        break;
      }
      if (!port.dockArrival || !port.dockDeparture) {
        messages.push(t('preferences.validationPortTimes', { index: port.portIndex }));
        break;
      }
      if (port.dockDeparture <= port.dockArrival) {
        messages.push(t('preferences.validationPortOrder', { index: port.portIndex }));
        break;
      }
    }
    if (vibePreferences.length === 0) messages.push(t('preferences.validationVibes'));
    return messages;
  }, [portSchedule, vibePreferences, t]);

  return (
    <div className="space-y-6 pb-28">
      {/* Hero with embedded controls */}
      <section className={`rounded-2xl bg-gradient-to-br ${activeNiche.theme.heroGradient} text-white shadow-md`}>
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

            {/* ── Port Itinerary Builder ── */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Anchor size={14} className="text-white/50" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                  {t('preferences.portItinerary')}
                </span>
              </div>

              {portSchedule.map((port) => (
                <div
                  key={port.portIndex}
                  className="rounded-xl border-2 border-white/15 bg-white/10 p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {port.portIndex}
                    </span>
                    <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {/* Port destination */}
                      <select
                        value={port.destinationId}
                        onChange={(e) => updatePort(port.portIndex, 'destinationId', e.target.value)}
                        className="w-full rounded-lg bg-white/15 px-2.5 py-2 text-sm font-medium text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 [&>option]:text-slate-900"
                      >
                        <option value="">{t('preferences.selectPort')}</option>
                        {destinations.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                        ))}
                      </select>
                      {/* Date */}
                      <input
                        type="date"
                        value={port.date}
                        onChange={(e) => updatePort(port.portIndex, 'date', e.target.value)}
                        className="w-full rounded-lg bg-white/15 px-2.5 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark]"
                      />
                    </div>
                    <button
                      onClick={() => removePort(port.portIndex)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-red-500/30 hover:text-red-200"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Dock times row */}
                  <div className="mt-2 flex items-center gap-2">
                    <Ship size={12} className="text-white/40" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/40">{t('preferences.dockIn')}</span>
                      <input
                        type="time"
                        value={port.dockArrival}
                        onChange={(e) => updatePort(port.portIndex, 'dockArrival', e.target.value)}
                        className="rounded-md bg-white/15 px-2 py-1 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark]"
                      />
                    </div>
                    <span className="text-white/30">→</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/40">{t('preferences.dockOut')}</span>
                      <input
                        type="time"
                        value={port.dockDeparture}
                        onChange={(e) => updatePort(port.portIndex, 'dockDeparture', e.target.value)}
                        className="rounded-md bg-white/15 px-2 py-1 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/30 [color-scheme:dark]"
                      />
                    </div>
                    {getDockHours(port.dockArrival, port.dockDeparture) && (
                      <span className="ml-auto flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        <Clock size={10} />
                        {getDockHours(port.dockArrival, port.dockDeparture)} {t('preferences.shoreTime')}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addPort}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <Plus size={16} />
                {t('preferences.addPort')}
              </button>
            </div>

            {/* Travelers + Budget row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Travelers */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">{t('common.travelers')}</span>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-sm transition-all hover:bg-white/25 hover:shadow-md active:scale-90"
                  >
                    −
                  </button>
                  <span className="min-w-[2ch] text-center text-3xl font-extrabold tabular-nums">{travelers}</span>
                  <button
                    onClick={() => setTravelers(travelers + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white shadow-sm transition-all hover:bg-white/25 hover:shadow-md active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">{t('preferences.budget')}</span>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-transparent text-sm font-bold text-white/60 focus:outline-none [&>option]:text-slate-900"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={budget || ''}
                    onChange={(e) => setBudget(Math.max(0, Number(e.target.value || 0)), 'total')}
                    className="w-24 bg-transparent text-center text-3xl font-extrabold text-white placeholder-white/30 focus:outline-none"
                    placeholder="500"
                  />
                </div>
              </div>
            </div>

            {/* Vibe Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                {t('preferences.whatVibes')}
              </span>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((vibe) => {
                  const isActive = vibePreferences.includes(vibe.value);
                  return (
                    <button
                      key={vibe.value}
                      onClick={() => {
                        setVibePreferences(
                          isActive
                            ? vibePreferences.filter((v) => v !== vibe.value)
                            : [...vibePreferences, vibe.value]
                        );
                      }}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-white/25 text-white shadow-sm ring-1 ring-white/30'
                          : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
                      }`}
                    >
                      {vibe.emoji} {vibe.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.fastQuote')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.curatedStays')}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{t('preferences.noPayment')}</span>
            </div>
          </div>

          {/* Right: port summary or destination preview */}
          {portSchedule.length > 0 && portSchedule[0].destinationId ? (
            <div className="space-y-3">
              <p className={`text-xs uppercase tracking-[0.2em] ${tc.textPrimaryPale}`}>{t('preferences.yourItinerary')}</p>
              {portSchedule.filter(p => p.destinationId).map((port) => {
                const dest = destinations.find((d) => d.id === port.destinationId);
                return (
                  <div key={port.portIndex} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    {dest?.heroImageUrl && (
                      <img src={dest.heroImageUrl} alt={dest.name} className="h-24 w-full object-cover" />
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{dest?.name ?? port.portName}</h3>
                        <span className="text-[10px] text-white/50">{port.date}</span>
                      </div>
                      <p className="mt-1 text-xs text-white/60">
                        {t('preferences.dock')} {port.dockArrival} – {port.dockDeparture}
                        {getDockHours(port.dockArrival, port.dockDeparture) && (
                          <> · {getDockHours(port.dockArrival, port.dockDeparture)} {t('preferences.shoreTime')}</>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-5 text-slate-300">
              <p className="font-medium text-white">{t('preferences.noDestination')}</p>
              <p className="mt-1 text-sm">{t('preferences.addPortsBelow')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Destinations / Ports grid */}
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
            {destinations.map((destination) => {
              const isInItinerary = portSchedule.some((p) => p.destinationId === destination.id);
              return (
                <button
                  key={destination.id}
                  onClick={() => {
                    if (!isInItinerary) {
                      // Quick-add port
                      const nextIndex = portSchedule.length + 1;
                      setPortSchedule([...portSchedule, {
                        portIndex: nextIndex,
                        destinationId: destination.id,
                        portName: destination.name,
                        dockArrival: '08:00',
                        dockDeparture: '17:00',
                        date: '',
                      }]);
                      if (nextIndex === 1) setDestination(destination);
                    }
                  }}
                  className={`overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    isInItinerary ? tc.selectedRing : 'border-slate-200'
                  }`}
                >
                  <img src={destination.heroImageUrl} alt={destination.name} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{destination.name}</h3>
                        <p className="text-xs text-slate-500">{destination.country}</p>
                      </div>
                      {isInItinerary ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tc.tagPrimary}`}>{t('preferences.inItinerary')}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{destination.currency}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{destination.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {destination.highlights.slice(0, 2).map((h) => (
                        <span key={h} className={`rounded-full px-2 py-0.5 text-xs font-medium ${tc.tagPrimary}`}>{h}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Port insights — show for first port's destination */}
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

      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={validationMessages.length === 0} currentStep={1} totalSteps={3} validationMessages={validationMessages} nextText={t('preferences.generatePlan')} />
    </div>
  );
}
