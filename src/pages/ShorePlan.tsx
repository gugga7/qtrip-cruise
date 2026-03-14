import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Anchor,
  Wand2,
  ArrowRight,
  RefreshCw,
  X,
  Sparkles,
  Clock,
  Plus,
} from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import type { PortStop } from '../store/tripStore';
import { useMultiPortCatalog } from '../hooks/useCatalog';
import { usePlanGeneration } from '../hooks/usePlanGeneration';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';
import type { Activity, ScheduleSlotName } from '../lib/types';

/* ── Props ── */
interface ShorePlanProps {
  onNext: () => void;
  onBack: () => void;
}

/* ── Time helpers ── */

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getAvailableSlots(port: PortStop): ScheduleSlotName[] {
  const depHour = parseInt(port.dockDeparture.split(':')[0]);
  return depHour >= 18
    ? ['Morning', 'Afternoon', 'Evening']
    : ['Morning', 'Afternoon'];
}

function getSlotTimes(port: PortStop) {
  const arrMin = timeToMinutes(port.dockArrival);
  const depMin = timeToMinutes(port.dockDeparture) - 30;
  const third = Math.floor((depMin - arrMin) / 3);
  return {
    Morning: `${port.dockArrival} – ${minutesToTime(arrMin + third)}`,
    Afternoon: `${minutesToTime(arrMin + third)} – ${minutesToTime(arrMin + 2 * third)}`,
    Evening: `${minutesToTime(arrMin + 2 * third)} – ${minutesToTime(depMin)}`,
  };
}

function getReturnTime(departure: string): string {
  const [h, m] = departure.split(':').map(Number);
  let total = h * 60 + m - 30;
  if (total < 0) total = 0;
  return minutesToTime(total);
}

/* ── Component ── */

export function ShorePlan({ onNext, onBack }: ShorePlanProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* Store */
  const {
    portSchedule,
    selectedActivities,
    aiReasons,
    vibePreferences,
    travelers,
    currency,
    addActivity,
    removeActivity,
  } = useTripStore();

  /* Guard redirect */
  useEffect(() => {
    if (portSchedule.length === 0) {
      navigate('/preferences', { replace: true });
    }
  }, [portSchedule.length, navigate]);

  /* Data loading */
  const destinationIds = useMemo(
    () => Array.from(new Set(portSchedule.map((p) => p.destinationId))),
    [portSchedule],
  );
  const { catalogs, loading: catalogsLoading } =
    useMultiPortCatalog(destinationIds);

  const {
    phase,
    thinkingMessage,
    error,
    generate,
    retry,
  } = usePlanGeneration(catalogs);

  /* Auto-generate when catalogs load */
  useEffect(() => {
    if (!catalogsLoading && Object.keys(catalogs).length > 0) {
      generate();
    }
  }, [catalogsLoading, catalogs, generate]);

  /* Local state */
  const [activePort, setActivePort] = useState(1);
  const [swapSlot, setSwapSlot] = useState<{
    portIndex: number;
    slot: ScheduleSlotName;
  } | null>(null);

  /* Derived */
  const currentPort = portSchedule.find((p) => p.portIndex === activePort);
  const portActivities = useMemo(
    () => selectedActivities.filter((a) => a.scheduled?.day === activePort),
    [selectedActivities, activePort],
  );

  const totalCost = useMemo(
    () =>
      selectedActivities.reduce(
        (sum, a) => sum + a.price * (a.participants ?? travelers),
        0,
      ),
    [selectedActivities, travelers],
  );
  const perPerson = travelers > 0 ? Math.round(totalCost / travelers) : 0;

  const portSubtotal = useMemo(
    () =>
      portActivities.reduce(
        (sum, a) => sum + a.price * (a.participants ?? travelers),
        0,
      ),
    [portActivities, travelers],
  );

  /* Swap drawer catalog */
  const swapCandidates = useMemo(() => {
    if (!swapSlot || !currentPort) return [];
    const catalog = catalogs[currentPort.destinationId] ?? [];
    const selectedIds = new Set(selectedActivities.map((a) => a.id));
    return catalog.filter((a) => !selectedIds.has(a.id)).slice(0, 3);
  }, [swapSlot, currentPort, catalogs, selectedActivities]);

  /* ── Thinking state ── */
  if (phase === 'thinking' || (phase === 'idle' && catalogsLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border ${tc.borderPrimaryLight} bg-white p-8 text-center shadow-lg`}
        >
          {/* Shimmer */}
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r from-transparent ${tc.shimmer} to-transparent`}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 inline-block"
          >
            <Wand2 className={`h-10 w-10 ${tc.textPrimary}`} />
          </motion.div>

          <h2 className="mb-2 text-lg font-semibold text-slate-800">
            {t('shorePlan.building', 'Building your shore plan')}
          </h2>

          <motion.p
            key={thinkingMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-500"
          >
            {thinkingMessage}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  /* ── Error state ── */
  if (phase === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-md"
        >
          <p className="mb-4 text-amber-800">
            {error || t('shorePlan.errorGeneric', 'Something went wrong generating your plan.')}
          </p>
          <button
            onClick={retry}
            className={`${tc.btnGradient} mb-3 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]`}
          >
            <RefreshCw className="h-4 w-4" />
            {t('shorePlan.tryAgain', 'Try again')}
          </button>
          <p className="text-sm text-amber-600">
            <button
              onClick={onBack}
              className="underline hover:no-underline"
            >
              {t('shorePlan.browseManually', 'Or browse activities manually')}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── No port data safety ── */
  if (!currentPort) return null;

  const slotTimes = getSlotTimes(currentPort);
  const availableSlots = getAvailableSlots(currentPort);
  const returnTime = getReturnTime(currentPort.dockDeparture);

  /* Activity for a given slot */
  const activityForSlot = (slot: ScheduleSlotName) =>
    portActivities.find((a) => a.scheduled?.slot === slot);

  /* ── Plan view ── */
  return (
    <div className="relative min-h-screen pb-28">
      {/* ── Port Tab Bar ── */}
      <div className="sticky top-0 z-20 bg-white/80 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {portSchedule.map((port) => (
              <button
                key={port.portIndex}
                onClick={() => setActivePort(port.portIndex)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activePort === port.portIndex
                    ? `${tc.btnGradient} text-white shadow-sm`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {port.portName}
                {port.date && ` · ${port.date}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4">
        {/* ── Active Port Hero ── */}
        <motion.div
          key={activePort}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mb-6 rounded-2xl bg-gradient-to-br ${activeNiche.theme.heroGradient} p-6 text-white shadow-lg`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {currentPort.portName}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-white/80">
                <Anchor className="h-4 w-4" />
                <span>
                  {currentPort.dockArrival} – {currentPort.dockDeparture}
                </span>
              </div>
            </div>
            {currentPort.date && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {currentPort.date}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* All-aboard warning */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              All aboard by {returnTime}
            </span>

            {/* Shore time */}
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium border border-white/15 backdrop-blur-sm">
              {(() => {
                const mins =
                  timeToMinutes(currentPort.dockDeparture) -
                  timeToMinutes(currentPort.dockArrival) -
                  30;
                const hrs = Math.floor(mins / 60);
                const rm = mins % 60;
                return `${hrs}h${rm > 0 ? ` ${rm}m` : ''} shore time`;
              })()}
            </span>

            {/* Port subtotal */}
            {portSubtotal > 0 && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium border border-white/15 backdrop-blur-sm">
                {currency === 'EUR' ? '\u20AC' : currency} {portSubtotal}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Activity Slots ── */}
        <div className="space-y-4">
          {availableSlots.map((slot) => {
            const activity = activityForSlot(slot);
            const timeRange = slotTimes[slot];

            return (
              <motion.div
                key={slot}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: availableSlots.indexOf(slot) * 0.1 }}
              >
                {/* Slot header */}
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {slot}
                  </h3>
                  <span className="text-xs text-slate-400">{timeRange}</span>
                </div>

                {activity ? (
                  /* ── Filled activity card ── */
                  <div className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {activity.mainImageUrl && (
                        <img
                          src={activity.mainImageUrl}
                          alt={activity.title}
                          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold text-slate-800">
                          {activity.title}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {activity.duration}h
                          </span>
                          <span className="font-medium text-slate-700">
                            {currency === 'EUR' ? '\u20AC' : currency}
                            {activity.price}
                            <span className="font-normal text-slate-400">
                              /person
                            </span>
                          </span>
                        </div>

                        {/* AI reasoning */}
                        {aiReasons[activity.id] && (
                          <p
                            className={`mt-2 flex items-start gap-1.5 rounded-lg border ${tc.reasonBorder} bg-gradient-to-r ${tc.reasonBg} px-3 py-2 text-xs italic ${tc.reasonText}`}
                          >
                            <Sparkles
                              className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${tc.reasonIcon}`}
                            />
                            {aiReasons[activity.id]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          setSwapSlot({
                            portIndex: activePort,
                            slot,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${tc.badgeMuted} transition-colors ${tc.hoverBgPrimarySubtle}`}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Swap
                      </button>
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Empty / free-time card ── */
                  <button
                    onClick={() =>
                      setSwapSlot({ portIndex: activePort, slot })
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100/50 hover:text-slate-500"
                  >
                    <Plus className="h-4 w-4" />
                    Free time &mdash; add an activity
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Swap Drawer ── */}
      <AnimatePresence>
        {swapSlot && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSwapSlot(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl"
            >
              {/* Drag handle */}
              <div className="mb-4 flex justify-center">
                <div className="h-1 w-10 rounded-full bg-slate-300" />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {activityForSlot(swapSlot.slot)
                    ? 'Swap activity'
                    : 'Add activity'}
                </h2>
                <button
                  onClick={() => setSwapSlot(null)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-500">
                {swapSlot.slot} slot at {currentPort.portName}
              </p>

              {swapCandidates.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-400">
                  No alternatives available
                </div>
              ) : (
                <div className="space-y-3">
                  {swapCandidates.map((alt) => (
                    <motion.button
                      key={alt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        /* Remove existing activity in this slot if any */
                        const existing = activityForSlot(swapSlot.slot);
                        if (existing) removeActivity(existing.id);

                        addActivity({
                          ...alt,
                          scheduled: {
                            day: swapSlot.portIndex,
                            slot: swapSlot.slot,
                          },
                          participants: travelers,
                        });
                        setSwapSlot(null);
                      }}
                      className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      {alt.mainImageUrl && (
                        <img
                          src={alt.mainImageUrl}
                          alt={alt.title}
                          className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-slate-800">
                          {alt.title}
                        </h4>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {alt.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alt.duration}h
                          </span>
                          <span className="font-medium text-slate-700">
                            {currency === 'EUR' ? '\u20AC' : currency}
                            {alt.price}
                          </span>
                          {alt.category && (
                            <span
                              className={`rounded-full px-2 py-0.5 ${
                                activeNiche.categoryColors[alt.category]?.badge ??
                                'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {alt.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="mt-4 h-4 w-4 flex-shrink-0 text-slate-300" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Sticky Footer ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">
              {t('shorePlan.total', 'Total')}:{' '}
              {currency === 'EUR' ? '\u20AC' : currency}
              {totalCost}
            </span>{' '}
            <span className="hidden text-slate-400 sm:inline">
              for {travelers} traveler{travelers !== 1 ? 's' : ''} &middot;{' '}
              {currency === 'EUR' ? '\u20AC' : currency}
              {perPerson}/person
            </span>
          </div>

          <button
            onClick={onNext}
            className={`${tc.btnGradient} inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t('shorePlan.continue', 'Continue to Book')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
