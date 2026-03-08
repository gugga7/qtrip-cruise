import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSaveDraft } from '../hooks/useSaveDraft';
import { tc } from '../config/themeClasses';

interface FloatingContinueButtonProps {
  onContinue: () => void;
  onBack: () => void;
  isValid: boolean;
  currentStep: number;
  totalSteps: number;
  validationMessages?: string[];
  nextText?: string;
}

export function FloatingContinueButton({ onContinue, onBack, isValid, currentStep, totalSteps, validationMessages = [], nextText }: FloatingContinueButtonProps) {
  const { t } = useTranslation();
  const { saveDraft, saving, canSave } = useSaveDraft();
  const resolvedNextText = nextText ?? t('common.continue');

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28 bg-gradient-to-t from-slate-50 to-transparent xl:right-[412px]" />

      <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-5 lg:inset-x-8 xl:right-[412px]">
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]">
          {/* Left: back + dots + step label */}
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={onBack}
                className="group flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                {t('common.back')}
              </button>
            )}
            {currentStep > 1 && <div className="h-4 w-px bg-slate-200" />}
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                      i + 1 === currentStep
                        ? `${tc.bgPrimary} scale-110`
                        : i + 1 < currentStep
                          ? tc.bgPrimaryMuted
                          : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400">
                {t('floatingButton.stepOf', { current: currentStep, total: totalSteps })}
              </span>
            </div>
            {!isValid && validationMessages[0] && (
              <>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <span className={`hidden sm:inline text-xs font-medium ${tc.validationError}`}>
                  {validationMessages[0]}
                </span>
              </>
            )}
          </div>

          {/* Right: save + continue */}
          <div className="flex items-center gap-2">
            {canSave && (
              <button
                onClick={saveDraft}
                disabled={saving}
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? t('common.saving') : t('common.saveDraft')}
              </button>
            )}
            <button
              onClick={onContinue}
              disabled={!isValid}
              className={`group flex items-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-semibold transition-all duration-200 ${
                isValid
                  ? `${tc.btnGradient} text-white shadow-lg ${tc.btnGradientHover} hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
              }`}
            >
              {resolvedNextText}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
