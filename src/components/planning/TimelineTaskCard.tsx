import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  FlaskConical, 
  Bug, 
  Scissors, 
  Shovel,
  MoreHorizontal,
  Check,
  Clock,
  Edit2,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types/api';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';

interface TimelineTaskCardProps {
  task: Task;
  index: number;
  onMarkDone: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onPlayAudio?: (taskId: string) => void;
}

const taskTypeIcons = {
  irrigation: Droplets,
  fertilizer: FlaskConical,
  pesticide: Bug,
  harvest: Scissors,
  planting: Shovel,
  other: MoreHorizontal,
};

const taskTypeColors = {
  irrigation: 'bg-info/20 text-info',
  fertilizer: 'bg-success/20 text-success',
  pesticide: 'bg-warning/20 text-warning',
  harvest: 'bg-primary/20 text-primary',
  planting: 'bg-success/20 text-success',
  other: 'bg-muted text-muted-foreground',
};

type UrgencyLevel = 'overdue' | 'today' | 'soon' | 'upcoming';

function getUrgencyLevel(dueDate: Date, status: string): UrgencyLevel {
  if (status === 'overdue' || (isPast(dueDate) && status !== 'completed')) {
    return 'overdue';
  }
  if (isToday(dueDate)) {
    return 'today';
  }
  const daysUntil = differenceInDays(dueDate, new Date());
  if (daysUntil <= 2) {
    return 'soon';
  }
  return 'upcoming';
}

const urgencyStyles: Record<UrgencyLevel, { bg: string; border: string; dot: string; text: string }> = {
  overdue: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    dot: 'bg-destructive',
    text: 'text-destructive',
  },
  today: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    dot: 'bg-warning',
    text: 'text-warning',
  },
  soon: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    dot: 'bg-info',
    text: 'text-info',
  },
  upcoming: {
    bg: 'bg-muted/50',
    border: 'border-transparent',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
};

export function TimelineTaskCard({ 
  task, 
  index, 
  onMarkDone, 
  onSnooze, 
  onEdit,
  onPlayAudio 
}: TimelineTaskCardProps) {
  const { t } = useTranslation();
  
  const TaskIcon = taskTypeIcons[task.type] || taskTypeIcons.other;
  const dueDate = new Date(task.dueDate);
  const urgency = getUrgencyLevel(dueDate, task.status);
  const styles = urgencyStyles[urgency];
  
  // Format date label
  const getDateLabel = () => {
    if (isToday(dueDate)) return t('planning.today');
    if (isTomorrow(dueDate)) return t('planning.tomorrow');
    if (urgency === 'overdue') {
      const daysAgo = Math.abs(differenceInDays(dueDate, new Date()));
      return `${daysAgo} ${t('planning.daysAgo')}`;
    }
    return format(dueDate, 'MMM d');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Dot with pulse for overdue */}
        <div className={`relative z-10 w-4 h-4 rounded-full ${styles.dot}`}>
          {urgency === 'overdue' && (
            <div className={`absolute inset-0 rounded-full ${styles.dot} animate-ping opacity-50`} />
          )}
        </div>
        {/* Line */}
        <div className="flex-1 w-0.5 bg-border mt-2" />
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 rounded-xl border ${styles.bg} ${styles.border} p-4 transition-all`}>
        <div className="flex items-start gap-3">
          {/* Task Icon */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${taskTypeColors[task.type]}`}>
            <TaskIcon className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-foreground">
                {t(`tasks.types.${task.type}`)}
              </span>
              {task.syncStatus === 'pending' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-warning/20 text-warning">
                  {t('common.pendingSync')}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {task.plotName}
            </p>
            
            {/* Date and urgency */}
            <div className={`text-sm font-medium ${styles.text}`}>
              {getDateLabel()}
              {urgency === 'overdue' && ` • ${t('tasks.statuses.overdue')}`}
            </div>
          </div>

          {/* Audio button */}
          {onPlayAudio && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => onPlayAudio(task.id)}
            >
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-success border-success/30 hover:bg-success/10"
            onClick={() => onMarkDone(task.id)}
          >
            <Check className="h-4 w-4" />
            {t('tasks.markDone')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onSnooze(task.id)}
          >
            <Clock className="h-4 w-4" />
            {t('tasks.snooze')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task.id)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
