import { useState, useRef, useEffect } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);

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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatDisplay = (dateStr: string | null, placeholder: string) => {
    if (!dateStr) return placeholder;
    return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy');
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left transition-all hover:shadow-md ${
          open ? `${tc.focusInput} shadow-md` : 'border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* From */}
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {t('preferences.start')}
            </span>
            <span className={`block truncate text-[15px] font-semibold ${startDate ? 'text-slate-900' : 'text-slate-300'}`}>
              {formatDisplay(startDate, 'Pick a date')}
            </span>
          </div>

          {/* Arrow */}
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tc.bgPrimaryMuted}`}>
            <span className={`text-sm font-bold ${tc.textPrimary}`}>→</span>
          </div>

          {/* To */}
          <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {t('preferences.end')}
            </span>
            <span className={`block truncate text-[15px] font-semibold ${endDate ? 'text-slate-900' : 'text-slate-300'}`}>
              {formatDisplay(endDate, 'Pick a date')}
            </span>
          </div>
        </div>

        {/* Night badge + chevron */}
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

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] animate-in">
          <div className="rdp-custom p-4 flex justify-center">
            <DayPicker
              mode="range"
              selected={selected}
              onSelect={handleSelect}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              showOutsideDays
              modifiersClassNames={{
                selected: 'rdp-day--selected',
                range_start: 'rdp-day--range-start',
                range_end: 'rdp-day--range-end',
                range_middle: 'rdp-day--range-middle',
              }}
            />
          </div>
          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <CalendarDays size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {startDate && endDate
                ? `${formatDisplay(startDate, '')} — ${formatDisplay(endDate, '')}${nightCount ? ` · ${nightCount} nights` : ''}`
                : 'Click a start date, then an end date'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
