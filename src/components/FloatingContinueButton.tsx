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
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-40 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent xl:right-[412px]" />
      <div className="fixed inset-x-4 bottom-4 z-50 sm:inset-x-6 lg:inset-x-10 xl:right-[412px]">
        <div className="rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-xl backdrop-blur-sm">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="flex gap-1.5">{Array.from({ length: totalSteps }).map((_, index) => <div key={index} className={`h-2 w-2 rounded-full transition-colors ${index + 1 === currentStep ? tc.bgPrimary : index + 1 < currentStep ? tc.bgPrimarySubtle : 'bg-slate-200'}`} />)}</div>
            <span>{t('floatingButton.stepOf', { current: currentStep, total: totalSteps })}</span>
            {!isValid && validationMessages[0] && <span className={tc.validationError}>• {validationMessages[0]}</span>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {currentStep > 1 ? <button onClick={onBack} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"><ArrowLeft size={18} /><span>{t('common.back')}</span></button> : <div />}
            {canSave && (
              <button
                onClick={saveDraft}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? t('common.saving') : t('common.saveDraft')}
              </button>
            )}
            <button onClick={onContinue} disabled={!isValid} className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-medium transition-all ${isValid ? `${tc.btnGradient} text-white shadow-lg ${tc.btnGradientHover}` : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}><span>{resolvedNextText}</span><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </>
  );
}