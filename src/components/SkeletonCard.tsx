import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  lines?: number;
  showIcon?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 2, showIcon = true, className }: SkeletonCardProps) {
  return (
    <div className={cn('farm-card animate-pulse', className)}>
      <div className="flex items-start gap-4">
        {showIcon && (
          <div className="h-12 w-12 rounded-xl bg-muted" />
        )}
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 rounded bg-muted" />
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-muted" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
