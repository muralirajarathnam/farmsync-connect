import { LucideIcon, FolderOpen, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  variant?: 'default' | 'compact' | 'fullscreen';
  className?: string;
}

export function EmptyState({ 
  icon: Icon = FolderOpen, 
  title, 
  description, 
  action,
  variant = 'default',
  className
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus;

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('flex flex-col items-center justify-center py-8 px-4 text-center', className)}
      >
        <div className="mb-3 rounded-xl bg-muted/50 p-3">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">{title}</p>
        {action && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            <ActionIcon className="h-4 w-4" />
            {action.label}
          </motion.button>
        )}
      </motion.div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('flex flex-col items-center justify-center min-h-[60vh] px-6 text-center', className)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="mb-6 rounded-3xl bg-primary/10 p-6"
        >
          <Icon className="h-14 w-14 text-primary" />
        </motion.div>
        <h2 className="mb-3 text-2xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mb-8 max-w-sm text-lg text-muted-foreground leading-relaxed">{description}</p>
        )}
        {action && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-lg font-semibold text-primary-foreground shadow-lg min-w-[200px] min-h-touch-lg"
          >
            <ActionIcon className="h-6 w-6" />
            {action.label}
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
    >
      <div className="mb-4 rounded-2xl bg-muted p-5">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-muted-foreground text-base leading-relaxed">{description}</p>
      )}
      {action && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-md min-h-touch-lg"
        >
          <ActionIcon className="h-5 w-5" />
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
