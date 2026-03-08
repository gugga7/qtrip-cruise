import { useTranslation } from 'react-i18next';
import { Check, Clock, FileText, CreditCard, PartyPopper, Send } from 'lucide-react';
import { tc } from '../config/themeClasses';

type BookingStatus = 'draft' | 'quoted' | 'confirmed' | 'paid' | 'completed';

const steps: { key: BookingStatus; icon: typeof Send }[] = [
  { key: 'draft', icon: FileText },
  { key: 'quoted', icon: Send },
  { key: 'confirmed', icon: Check },
  { key: 'paid', icon: CreditCard },
  { key: 'completed', icon: PartyPopper },
];

function getStepIndex(status: BookingStatus): number {
  return steps.findIndex((s) => s.key === status);
}

export function BookingTimeline({ status }: { status: BookingStatus }) {
  const { t } = useTranslation();
  const currentIndex = getStepIndex(status);

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isCurrent
                    ? `${tc.borderPrimary} ${tc.bgPrimary} text-white shadow-lg ${tc.shadowPrimary}`
                    : 'border-slate-200 bg-white text-slate-300'
                }`}
              >
                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                  isCompleted
                    ? 'text-emerald-600'
                    : isCurrent
                    ? tc.textPrimary
                    : 'text-slate-400'
                }`}
              >
                {t(`booking.status.${step.key}`)}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1">
                <div
                  className={`h-full transition-all ${
                    index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
