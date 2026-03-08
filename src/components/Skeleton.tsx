interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'card';
}

export function Skeleton({ className = '', variant = 'line' }: SkeletonProps) {
  const base = 'animate-pulse bg-slate-200';

  if (variant === 'circle') {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`${base} rounded-2xl ${className}`}>
        <div className="h-40 rounded-t-2xl bg-slate-200" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 rounded bg-slate-300" />
          <div className="h-3 w-1/2 rounded bg-slate-300" />
          <div className="h-3 w-2/3 rounded bg-slate-300" />
        </div>
      </div>
    );
  }

  return <div className={`${base} rounded ${className}`} />;
}

export function DestinationCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-40 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-36 animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="flex justify-between">
          <div className="h-5 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
