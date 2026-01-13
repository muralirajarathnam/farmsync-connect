import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  FlaskConical, 
  Bug, 
  Scissors, 
  Shovel,
  MoreHorizontal,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { Task } from '@/types/api';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskPreviewCardProps {
  task: Task;
  index: number;
}

const taskTypeIcons = {
  irrigation: Droplets,
  fertilizer: FlaskConical,
  pesticide: Bug,
  harvest: Scissors,
  planting: Shovel,
  other: MoreHorizontal,
};

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
};

export function TaskPreviewCard({ task, index }: TaskPreviewCardProps) {
  const { t } = useTranslation();
  
  const TaskIcon = taskTypeIcons[task.type] || taskTypeIcons.other;
  const dueDate = new Date(task.dueDate);
  const isOverdue = task.status === 'overdue' || (isPast(dueDate) && task.status !== 'completed');
  
  // Format due date nicely
  const getDateLabel = () => {
    if (isToday(dueDate)) return t('planning.today');
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isOverdue 
          ? 'bg-destructive/10 border border-destructive/30' 
          : 'bg-muted/50 hover:bg-muted'
      }`}
    >
      {/* Task Type Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${priorityColors[task.priority]}`}>
        <TaskIcon className="h-5 w-5" />
      </div>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {t(`tasks.types.${task.type}`)}
          </span>
          {isOverdue && (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {task.plotName}
        </p>
      </div>

      {/* Due Date */}
      <div className={`flex items-center gap-1 text-sm shrink-0 ${
        isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
      }`}>
        <Calendar className="h-3.5 w-3.5" />
        <span>{getDateLabel()}</span>
      </div>
    </motion.div>
  );
}
