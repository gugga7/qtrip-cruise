import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, differenceInDays } from 'date-fns';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tc } from '../config/themeClasses';
import 'react-day-picker/dist/style.css';

interface DateRangeCalendarProps {
  startDate: string | null;
  endDate: string | null;
  onDatesChange: (start: string | null, end: string | null) => void;
}

export function DateRangeCalendar({ startDate, endDate, onDatesChange }: DateRangeCalendarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const selected: DateRange | undefined =
    startDate || endDate
      ? {
          from: startDate ? new Date(startDate + 'T00:00:00') : undefined,
          to: endDate ? new Date(endDate + 'T00:00:00') : undefined,
        }
      : undefined;

  const nightCount =
    startDate && endDate
      ? differenceInDays(new Date(endDate), new Date(startDate))
      : null;

  const handleSelect = (range: DateRange | undefined) => {
    const from = range?.from ? format(range.from, 'yyyy-MM-dd') : null;
    const to = range?.to ? format(range.to, 'yyyy-MM-dd') : null;
    onDatesChange(from, to);
    if (from && to) {
      setTimeout(() => setOpen(false), 300);
    }
  };

  // Position the dropdown relative to trigger
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      width: Math.max(rect.width, 640),
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
    }
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, updatePos]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatDisplay = (dateStr: string | null, placeholder: string) => {
    if (!dateStr) return placeholder;
    return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy');
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left transition-all hover:shadow-md ${
          open ? `${tc.focusInput} shadow-md` : 'border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {t('preferences.start')}
            </span>
            <span className={`block truncate text-[15px] font-semibold ${startDate ? 'text-slate-900' : 'text-slate-300'}`}>
              {formatDisplay(startDate, 'Pick a date')}
            </span>
          </div>

          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tc.bgPrimaryMuted}`}>
            <span className={`text-sm font-bold ${tc.textPrimary}`}>→</span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {t('preferences.end')}
            </span>
            <span className={`block truncate text-[15px] font-semibold ${endDate ? 'text-slate-900' : 'text-slate-300'}`}>
              {formatDisplay(endDate, 'Pick a date')}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {nightCount !== null && nightCount > 0 && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tc.tagPrimary}`}>
              {nightCount} {nightCount === 1 ? 'night' : 'nights'}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Portal dropdown — renders outside parent overflow constraints */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] animate-in"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            position: 'absolute',
          }}
        >
          <div className="rdp-custom p-5 flex justify-center">
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              showOutsideDays
              classNames={{
                months: 'rdp-months flex flex-row gap-8',
              }}
              modifiersClassNames={{
                selected: 'rdp-day--selected',
                range_start: 'rdp-day--range-start',
                range_end: 'rdp-day--range-end',
                range_middle: 'rdp-day--range-middle',
              }}
            />
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 rounded-b-2xl">
            <CalendarDays size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {startDate && endDate
                ? `${formatDisplay(startDate, '')} — ${formatDisplay(endDate, '')}${nightCount ? ` · ${nightCount} nights` : ''}`
                : 'Click a start date, then an end date'}
            </span>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
