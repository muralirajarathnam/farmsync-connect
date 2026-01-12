import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IconActionCardProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-card hover:bg-muted border-border/50',
  primary: 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary',
  success: 'bg-success/10 hover:bg-success/20 border-success/20 text-success',
  warning: 'bg-warning/10 hover:bg-warning/20 border-warning/20 text-warning-foreground',
};

const sizeStyles = {
  sm: 'min-h-[70px] min-w-[70px] gap-1.5 p-3',
  md: 'min-h-[90px] min-w-[90px] gap-2 p-4',
  lg: 'min-h-[110px] min-w-[110px] gap-3 p-5',
};

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export function IconActionCard({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: IconActionCardProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Icon className={cn(iconSizes[size], 'flex-shrink-0')} />
      <span className="text-sm font-medium text-center leading-tight">{label}</span>
    </motion.button>
  );
}
