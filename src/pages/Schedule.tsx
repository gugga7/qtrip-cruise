import { CalendarRange, Check, Clock, MapPin, RotateCcw, Sparkles, Sunrise, Sun, Moon, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import { useAISchedule } from '../hooks/useAISchedule';
import { useFeature } from '../hooks/useNiche';
import type { Activity, ScheduleSlotName } from '../lib/types';
import { useTripStore } from '../store/tripStore';
import type { PortStop } from '../store/tripStore';
import { tc } from '../config/themeClasses';
import { activeNiche, type CategoryColor } from '../config/niche';

interface ScheduleProps { onNext: () => void; onBack: () => void; }

const slots: ScheduleSlotName[] = ['Morning', 'Afternoon', 'Evening'];

/* ── Port-aware time utilities ── */
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

function getPortSlotTimes(port: PortStop) {
  const arrMin = timeToMinutes(port.dockArrival);
  const depMin = timeToMinutes(port.dockDeparture) - 30; // safety buffer
  const third = Math.floor((depMin - arrMin) / 3);
  return {
    Morning: `${port.dockArrival} – ${minutesToTime(arrMin + third)}`,
    Afternoon: `${minutesToTime(arrMin + third)} – ${minutesToTime(arrMin + 2 * third)}`,
    Evening: `${minutesToTime(arrMin + 2 * third)} – ${minutesToTime(depMin)}`,
  };
}

function getPortAbbrev(name: string): string {
  return name.slice(0, 3).toUpperCase();
}

/* ── Category colors (from niche config) ── */
const defaultColor: CategoryColor = { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400', light: 'bg-slate-50/60' };
function getColor(category: string) { return activeNiche.categoryColors[category] || defaultColor; }

/* ── Slot metadata ── */
const slotMeta: Record<ScheduleSlotName, { icon: typeof Sunrise; labelKey: string; time: string; gradient: string }> = {
  Morning:   { icon: Sunrise, labelKey: 'schedule.morning',   time: '9:00 – 12:00',  gradient: 'from-amber-100 to-orange-50' },
  Afternoon: { icon: Sun,     labelKey: 'schedule.afternoon', time: '13:00 – 17:00', gradient: 'from-sky-100 to-blue-50' },
  Evening:   { icon: Moon,    labelKey: 'schedule.evening',   time: '18:00 – 21:00', gradient: 'from-violet-100 to-indigo-50' },
};

/* ── Thinking card ── */
function ThinkingCard({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className={`absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent ${tc.shimmer} to-transparent`} />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tc.avatarGradient} text-white shadow-lg`}>
          <Wand2 size={22} className="animate-pulse" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{t('schedule.thinking')}</p>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-500"
          >
            {message}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Success banner ── */
function SuccessBanner({ onResuggest }: { onResuggest: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-emerald-600" />
        <p className="text-sm font-medium text-emerald-800">
          {t('schedule.suggestSuccess')}
        </p>
      </div>
      <button
        onClick={onResuggest}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        <RotateCcw size={12} /> {t('schedule.reSuggest')}
      </button>
    </motion.div>
  );
}

/* ── Error banner ── */
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <p className="text-sm text-amber-800">
        {t('schedule.suggestError')}{' '}
        <button onClick={onRetry} className="font-medium underline">
          {t('common.retry')}
        </button>.
      </p>
    </motion.div>
  );
}

/* ── AI reason bubble — always visible inline ── */
function ReasonBubble({ reason }: { reason: string }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.15 }}
      className={`mt-2 flex items-start gap-2 rounded-lg border ${tc.reasonBorder} bg-gradient-to-r ${tc.reasonBg} px-3 py-2`}
    >
      <Sparkles size={13} className={`mt-0.5 shrink-0 ${tc.reasonIcon}`} />
      <p className={`text-[11px] leading-relaxed ${tc.reasonText}`}>
        <span className={`font-semibold ${tc.reasonBold}`}>{t('schedule.aiPrefix')} </span>
        {reason}
      </p>
    </motion.div>
  );
}

/* ── Activity card (left panel) ── */
function ActivityCard({
  activity,
  reason,
  dayCount,
  portSchedule,
  isRevealing,
  index,
  revealedCount,
  onSchedule,
  onUnschedule,
  onDaySelect,
}: {
  activity: Activity;
  reason?: string;
  dayCount: number;
  portSchedule: PortStop[];
  isRevealing: boolean;
  index: number;
  revealedCount: number;
  onSchedule: (id: string, day: number, slot: ScheduleSlotName) => void;
  onUnschedule: (id: string) => void;
  onDaySelect: (day: number) => void;
}) {
  const { t } = useTranslation();
  const color = getColor(activity.category);
  const isScheduled = !!activity.scheduled;
  const currentDay = activity.scheduled?.day ?? 0;
  const currentSlot = activity.scheduled?.slot ?? '';

  return (
    <motion.div
      initial={isRevealing ? { opacity: 0, y: 16, scale: 0.97 } : false}
      animate={
        isRevealing && index < revealedCount
          ? { opacity: 1, y: 0, scale: 1 }
          : !isRevealing
          ? { opacity: 1, y: 0, scale: 1 }
          : undefined
      }
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`group relative rounded-xl border-l-[3px] border transition-all ${
        isScheduled
          ? `${color.border} border-r border-t border-b border-r-slate-200 border-t-slate-200 border-b-slate-200 ${color.light}`
          : 'border-l-slate-300 border-slate-200 bg-white'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Activity thumbnail */}
          {activity.mainImageUrl && (
            <img
              src={activity.mainImageUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{activity.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock size={11} />{activity.duration}h</span>
              <span>·</span>
              <span>€{activity.price}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color.badge}`}>
                {activity.category}
              </span>
              {activity.location && (
                <span className="flex items-center gap-0.5 text-slate-400"><MapPin size={10} />{activity.location}</span>
              )}
            </div>
            {/* AI reasoning bubble — shown inline below metadata */}
            {reason && <ReasonBubble reason={reason} />}
          </div>
          <button
            onClick={() => onUnschedule(activity.id)}
            className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100"
          >
            {t('schedule.clear')}
          </button>
        </div>

        {/* Day picker — graphic circles */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('schedule.day')}</span>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: dayCount }, (_, i) => {
              const day = i + 1;
              const isActive = currentDay === day;
              const port = portSchedule[i];
              const label = port ? getPortAbbrev(port.portName) : String(day);
              return (
                <button
                  key={day}
                  onClick={() => {
                    onSchedule(activity.id, day, currentSlot as ScheduleSlotName || 'Morning');
                    onDaySelect(day);
                  }}
                  title={port ? port.portName : `Day ${day}`}
                  className={`flex h-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    port ? 'min-w-[2.5rem] px-2' : 'w-8'
                  } ${
                    isActive
                      ? `${tc.dayBtnActive} scale-110`
                      : `bg-slate-100 text-slate-600 ${tc.dayBtnHover}`
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slot picker — icon buttons */}
        <div className="mt-2.5 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t('schedule.timeSlot')}</span>
          <div className="flex gap-2">
            {(() => {
              const selectedPort = currentDay > 0 ? portSchedule[currentDay - 1] : undefined;
              const availableSlots = selectedPort ? getAvailableSlots(selectedPort) : slots;
              return availableSlots.map((slot) => {
                const meta = slotMeta[slot];
                const SlotIcon = meta.icon;
                const isActive = currentSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => onSchedule(activity.id, currentDay || 1, slot)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${meta.gradient} text-slate-800 shadow-sm ring-1 ring-slate-200 scale-[1.03]`
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <SlotIcon size={14} className={isActive ? 'text-slate-700' : 'text-slate-400'} />
                    {t(meta.labelKey)}
                  </button>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Day preview slot ── */
function PreviewSlot({ slot, item, isActiveDay, portTimeOverride }: { slot: ScheduleSlotName; item: Activity | null; isActiveDay: boolean; portTimeOverride?: string }) {
  const { t } = useTranslation();
  const meta = slotMeta[slot];
  const SlotIcon = meta.icon;
  const color = item ? getColor(item.category) : null;

  return (
    <div className={`rounded-lg border transition-all ${
      item ? `${color!.border} ${color!.light}` : 'border-slate-200 bg-white'
    } ${isActiveDay ? `ring-1 ${tc.previewActiveRing}` : ''}`}>
      {/* Slot header with gradient */}
      <div className={`flex items-center gap-2 rounded-t-lg bg-gradient-to-r px-3 py-1.5 ${meta.gradient}`}>
        <SlotIcon size={12} className="text-slate-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t(meta.labelKey)}</span>
        <span className="text-[10px] text-slate-400">{portTimeOverride || meta.time}</span>
      </div>
      <div className="px-3 py-2">
        <AnimatePresence mode="wait">
          {item ? (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="flex items-center gap-2.5"
            >
              {item.mainImageUrl && (
                <img src={item.mainImageUrl} alt="" className="h-8 w-8 rounded-md object-cover" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-500">{item.duration}h · {item.category}</p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="free"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-0.5 text-sm italic text-slate-300"
            >
              {t('schedule.freeTime')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Day card in preview ── */
function DayPreview({ dayNumber, items, revealingDay, port, daySlots }: { dayNumber: number; items: (Activity | null)[]; revealingDay: number; port: PortStop | null; daySlots: ScheduleSlotName[] }) {
  const { t } = useTranslation();
  const hasAnyActivity = items.some(Boolean);
  const allFilled = items.every(Boolean);
  const isActiveDay = dayNumber === revealingDay;
  const portSlotTimes = port ? getPortSlotTimes(port) : null;
  const returnTime = port ? minutesToTime(timeToMinutes(port.dockDeparture) - 30) : null;

  return (
    <motion.div
      layout
      className={`rounded-xl p-4 transition-all ${
        isActiveDay
          ? tc.previewActiveDay
          : hasAnyActivity
          ? 'bg-slate-50'
          : 'bg-slate-50/50'
      }`}
    >
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {port ? (
            <p className="font-semibold text-slate-900">Port {port.portIndex}: {port.portName}</p>
          ) : (
            <p className="font-semibold text-slate-900">{t('schedule.day')} {dayNumber}</p>
          )}
          {allFilled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100"
            >
              <Check size={12} className="text-emerald-600" />
            </motion.div>
          )}
        </div>
        {port && (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-200">
              ⚓ Dock {port.dockArrival} – {port.dockDeparture}
            </span>
            {returnTime && (
              <span className="text-[10px] font-medium text-amber-600">
                All aboard by {returnTime}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {daySlots.map((slot, slotIndex) => {
          const item = items[slotIndex];
          return (
            <div key={`${dayNumber}-${slot}`}>
              <PreviewSlot slot={slot} item={item} isActiveDay={isActiveDay} portTimeOverride={portSlotTimes?.[slot]} />
              {/* Connector line between filled adjacent slots */}
              {slotIndex < daySlots.length - 1 && item && items[slotIndex + 1] && (
                <div className="flex justify-center py-0.5">
                  <div className="h-3 w-px border-l border-dashed border-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Main Schedule page ── */
export function Schedule({ onNext, onBack }: ScheduleProps) {
  const { t } = useTranslation();
  const aiEnabled = useFeature('aiSchedule');
  const { startDate, endDate, selectedActivities, scheduleActivity, unscheduleActivity, portSchedule } = useTripStore();
  const dayCount = useMemo(() => {
    if (portSchedule.length > 0) return portSchedule.length;
    if (!startDate || !endDate) return Math.max(selectedActivities.length, 1);
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  }, [endDate, selectedActivities.length, startDate, portSchedule]);

  const { phase, thinkingMessage, revealedCount, assignments, error, retry } = useAISchedule(aiEnabled ? dayCount : 0);

  // Build a map of activityId → reason from AI assignments
  const reasonMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) {
      if (a.reason) map.set(a.activityId, a.reason);
    }
    return map;
  }, [assignments]);

  // Figure out which day is currently being revealed
  const revealingDay = useMemo(() => {
    if (phase !== 'revealing' || assignments.length === 0) return 0;
    const lastRevealed = assignments[Math.min(revealedCount - 1, assignments.length - 1)];
    return lastRevealed?.day ?? 0;
  }, [phase, revealedCount, assignments]);

  const preview = useMemo(() =>
    Array.from({ length: dayCount }, (_, index) => {
      const port = portSchedule[index]; // undefined for non-cruise
      const availableSlots = port ? getAvailableSlots(port) : slots;
      return {
        day: index + 1,
        port: port || null,
        items: availableSlots.map((slot) =>
          selectedActivities.find(
            (a) => a.scheduled?.day === index + 1 && a.scheduled?.slot === slot
          ) || null
        ),
        slots: availableSlots,
      };
    }),
  [dayCount, selectedActivities, portSchedule]);

  // Scroll-to-day logic for the preview pane
  const previewRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const setDayRef = useCallback((day: number, el: HTMLDivElement | null) => {
    if (el) dayRefs.current.set(day, el);
    else dayRefs.current.delete(day);
  }, []);

  const scrollToDay = useCallback((day: number) => {
    const el = dayRefs.current.get(day);
    if (el && previewRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Auto-scroll preview when revealingDay changes
  useEffect(() => {
    if (revealingDay > 0) scrollToDay(revealingDay);
  }, [revealingDay, scrollToDay]);

  const validationMessages = selectedActivities.every((a) => a.scheduled)
    ? []
    : [t('schedule.assignAll')];

  if (!selectedActivities.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('schedule.noActivities')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('schedule.noActivitiesSub')}</p>
        <button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm text-white">{t('schedule.backToActivities')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className={`flex items-center gap-2 ${tc.scheduleHeaderText}`}>
          <CalendarRange size={16} />
          <span className="text-sm font-medium">{t('schedule.itineraryBuilder')}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          {t('schedule.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          {t('schedule.subtitle')}
        </p>
      </section>

      {/* AI status banners */}
      {aiEnabled && (
        <AnimatePresence mode="wait">
          {phase === 'thinking' && (
            <ThinkingCard key="thinking" message={thinkingMessage} />
          )}
          {phase === 'done' && (
            <SuccessBanner key="success" onResuggest={retry} />
          )}
          {phase === 'error' && (
            <ErrorBanner key="error" message={error || 'Unknown error'} onRetry={retry} />
          )}
        </AnimatePresence>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        {/* Activity scheduling controls */}
        <div className="space-y-3">
          {selectedActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              reason={reasonMap.get(activity.id)}
              dayCount={dayCount}
              portSchedule={portSchedule}
              isRevealing={phase === 'revealing'}
              index={index}
              revealedCount={revealedCount}
              onSchedule={scheduleActivity}
              onUnschedule={unscheduleActivity}
              onDaySelect={scrollToDay}
            />
          ))}
        </div>

        {/* Day preview — scrollable, hidden scrollbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">{t('schedule.previewByDay')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('schedule.tripAtGlance')}</p>
          <div
            ref={previewRef}
            className="hide-scrollbar mt-5 max-h-[70vh] space-y-4 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {preview.map((day) => (
              <div key={day.day} ref={(el) => setDayRef(day.day, el)}>
                <DayPreview
                  dayNumber={day.day}
                  items={day.items}
                  revealingDay={revealingDay}
                  port={day.port}
                  daySlots={day.slots}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <FloatingContinueButton
        onContinue={onNext}
        onBack={onBack}
        isValid={validationMessages.length === 0}
        currentStep={5}
        totalSteps={6}
        validationMessages={validationMessages}
        nextText={t('schedule.continueToReview')}
      />
    </div>
  );
}
