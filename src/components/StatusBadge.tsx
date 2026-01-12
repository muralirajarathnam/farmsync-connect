import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'info' | 'pending' | 'synced' | 'error';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

const statusStyles = {
  healthy: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  critical: 'bg-destructive text-destructive-foreground',
  info: 'bg-info text-info-foreground',
  pending: 'bg-warning/80 text-warning-foreground',
  synced: 'bg-success text-success-foreground',
  error: 'bg-destructive text-destructive-foreground',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export function StatusBadge({ status, children, size = 'sm', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
