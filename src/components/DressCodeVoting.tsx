import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shirt, Check } from 'lucide-react';
import { tc } from '../config/themeClasses';

interface DressOption {
  id: string;
  label: Record<string, string>;
  emoji: string;
  votes: number;
}

const defaultOptions: DressOption[] = [
  { id: 'matching', label: { en: 'Matching outfits', fr: 'Tenues assorties' }, emoji: '👯', votes: 3 },
  { id: 'themed', label: { en: 'Themed costumes', fr: 'Costumes à thème' }, emoji: '🎭', votes: 5 },
  { id: 'color', label: { en: 'Same color code', fr: 'Code couleur unifié' }, emoji: '🎨', votes: 2 },
  { id: 'free', label: { en: 'Free choice', fr: 'Choix libre' }, emoji: '✨', votes: 1 },
];

export function DressCodeVoting() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [options, setOptions] = useState(defaultOptions);
  const [votedId, setVotedId] = useState<string | null>(null);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (id: string) => {
    if (votedId) return; // Already voted
    setVotedId(id);
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`rounded-xl ${tc.bgAccentMuted} ${tc.textAccent}`}>
          <Shirt size={18} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">
            {t('dressCode.title')}
          </h3>
          <p className="text-xs text-slate-500">
            {totalVotes} {t('dressCode.votes')}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {options.map((option) => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isVoted = votedId === option.id;
          const isWinning = option.votes === Math.max(...options.map((o) => o.votes));

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!votedId}
              className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                isVoted
                  ? `${tc.borderPrimaryMid} ${tc.bgPrimaryLight}`
                  : votedId
                  ? 'border-slate-100 bg-slate-50'
                  : `border-slate-200 bg-white ${tc.hoverBorderPrimaryLight} ${tc.hoverBgPrimaryMuted}`
              }`}
            >
              {/* Progress bar background */}
              {votedId && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    isWinning ? tc.bgPrimaryMuted : 'bg-slate-100'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm font-medium text-slate-800">
                    {option.label[lang] ?? option.label.en}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {votedId && (
                    <span className="text-xs font-semibold text-slate-500">
                      {Math.round(pct)}%
                    </span>
                  )}
                  {isVoted && (
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${tc.bgPrimary}`}>
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!votedId && (
        <p className="mt-3 text-center text-xs text-slate-400">
          {t('dressCode.clickToVote')}
        </p>
      )}
    </div>
  );
}
