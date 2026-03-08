import { tc } from '../config/themeClasses';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className={`${sizes[size]} animate-spin rounded-full border-[3px] border-slate-200 ${tc.spinnerBorder}`} />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
      <span className="sr-only">{label ?? 'Loading...'}</span>
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className={`mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 ${tc.spinnerBorder}`} role="status" aria-live="polite" />
        {label && <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>}
        <span className="sr-only">{label ?? 'Loading...'}</span>
      </div>
    </div>
  );
}
