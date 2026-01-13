import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  lines?: number;
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'plot' | 'task' | 'compact';
}

export function SkeletonCard({ 
  lines = 2, 
  showIcon = true, 
  className,
  variant = 'default' 
}: SkeletonCardProps) {
  if (variant === 'plot') {
    return (
      <div className={cn('farm-card animate-pulse', className)}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded-lg bg-muted" />
            <div className="flex gap-2">
              <div className="h-4 w-16 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded-full bg-muted" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (variant === 'task') {
    return (
      <div className={cn('farm-card animate-pulse', className)}>
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/2 rounded-lg bg-muted" />
            <div className="h-4 w-2/3 rounded-lg bg-muted" />
            <div className="flex gap-2 mt-3">
              <div className="h-10 w-20 rounded-xl bg-muted" />
              <div className="h-10 w-20 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('p-4 rounded-xl bg-card animate-pulse', className)}>
        <div className="flex items-center gap-3">
          {showIcon && <div className="h-10 w-10 rounded-lg bg-muted" />}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('farm-card animate-pulse', className)}>
      <div className="flex items-start gap-4">
        {showIcon && (
          <div className="h-12 w-12 rounded-xl bg-muted" />
        )}
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 rounded-lg bg-muted" />
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 rounded-lg bg-muted" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, variant = 'default' }: { count?: number; variant?: 'default' | 'plot' | 'task' | 'compact' }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}

// Grid skeleton for plots
export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant="plot" />
      ))}
    </div>
  );
}

// Stats skeleton
export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-card animate-pulse">
          <div className="h-8 w-8 rounded-lg bg-muted mx-auto mb-2" />
          <div className="h-6 w-10 rounded bg-muted mx-auto mb-1" />
          <div className="h-3 w-16 rounded bg-muted mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Weather widget skeleton
export function SkeletonWeather() {
  return (
    <div className="farm-card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-3 w-32 rounded bg-muted" />
        </div>
        <div className="h-16 w-16 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
