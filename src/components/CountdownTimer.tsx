import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PartyPopper } from 'lucide-react';
import { tc } from '../config/themeClasses';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className={`rounded-2xl bg-gradient-to-r ${tc.ctaGradient} p-5 text-center text-white shadow-lg`}>
        <PartyPopper size={28} className="mx-auto" />
        <p className="mt-2 text-lg font-bold">
          {t('countdown.celebration')}
        </p>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.minutes') },
    { value: timeLeft.seconds, label: t('countdown.seconds') },
  ];

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${tc.heroGradient} p-5 text-white shadow-lg`}>
      {label && (
        <p className="mb-3 text-center text-sm font-medium text-white/80">{label}</p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ value, label: unitLabel }) => (
          <div key={unitLabel} className="rounded-xl bg-white/15 px-2 py-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold tabular-nums sm:text-3xl">
              {String(value).padStart(2, '0')}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {unitLabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
