import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Users, Split } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useGroupStore } from '../store/groupStore';
import { tc } from '../config/themeClasses';

type SplitMode = 'equal' | 'custom';

export function ExpenseSplitter() {
  const { t } = useTranslation();
  const { getTotalCost, travelers } = useTripStore();
  const { activeGroup } = useGroupStore();
  const [mode, setMode] = useState<SplitMode>('equal');

  const total = getTotalCost();
  const memberCount = activeGroup?.members.length ?? travelers;
  const perPerson = memberCount > 0 ? total / memberCount : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
          <Split size={18} />
        </div>
        <h3 className="font-semibold text-slate-900">
          {t('expense.title')}
        </h3>
      </div>

      {/* Split mode toggle */}
      <div className="mt-4 flex rounded-lg bg-slate-100 p-0.5">
        {(['equal', 'custom'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              mode === m
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'equal' ? t('expense.equalSplit') : t('expense.custom')}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center">
        <p className="text-xs font-medium text-emerald-600">
          {t('expense.perPerson')}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">€{perPerson.toFixed(0)}</p>
        <p className="mt-1 text-xs text-slate-500">
          €{total.toFixed(0)} ÷ {memberCount} {t('expense.people')}
        </p>
      </div>

      {/* Member breakdown */}
      {activeGroup && (
        <div className="mt-4 space-y-2">
          {activeGroup.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${tc.bgPrimaryMuted} text-[10px] font-bold ${tc.textPrimary}`}>
                  {m.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-800">{m.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">€{perPerson.toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
