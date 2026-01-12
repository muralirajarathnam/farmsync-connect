import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ClipboardList, 
  Droplets, 
  Leaf,
  Bug,
  Wheat,
  Shovel,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTasks, useUpdateTask } from '@/hooks/use-api';
import { StatusBadge } from '@/components/StatusBadge';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';
import type { Task, TaskType, TaskStatus } from '@/types/api';

const taskTypeIcons: Record<TaskType, React.ComponentType<{ className?: string }>> = {
  irrigation: Droplets,
  fertilizer: Leaf,
  pesticide: Bug,
  harvest: Wheat,
  planting: Shovel,
  other: MoreHorizontal,
};

const taskTypeColors: Record<TaskType, string> = {
  irrigation: 'bg-info/10 text-info',
  fertilizer: 'bg-primary/10 text-primary',
  pesticide: 'bg-warning/10 text-warning-foreground',
  harvest: 'bg-accent/30 text-accent-foreground',
  planting: 'bg-secondary/50 text-secondary-foreground',
  other: 'bg-muted text-muted-foreground',
};

const statusFilters = ['all', 'pending', 'inProgress', 'completed', 'overdue'] as const;

export default function TasksPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<typeof statusFilters[number]>('all');
  const { data: tasks, isLoading, error } = useTasks();
  const updateTask = useUpdateTask();
  
  const filteredTasks = tasks?.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });
  
  const handleAddTask = () => {
    navigate('/tasks/new');
  };
  
  const handleToggleTask = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTask.mutate({ taskId: task.id, updates: { status: newStatus } });
  };
  
  const groupedByDate = filteredTasks?.reduce((acc, task) => {
    const date = new Date(task.dueDate).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>) || {};
  
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('tasks.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {tasks?.filter(t => t.status !== 'completed').length || 0} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AudioHelpButton size="md" />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {statusFilters.map((status) => (
            <motion.button
              key={status}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status === 'all' ? 'All' : t(`tasks.statuses.${status}`)}
            </motion.button>
          ))}
        </div>
      </header>
      
      {/* Content */}
      <div className="px-4 pb-6">
        {isLoading ? (
          <SkeletonList count={4} />
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            {t('errors.generic')}
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  {formatDateHeader(date)}
                </h3>
                <div className="space-y-3">
                  {groupedByDate[date].map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={t('tasks.noTasks')}
            description={filter !== 'all' ? 'No tasks with this status' : undefined}
            action={{
              label: t('tasks.addNew'),
              onClick: handleAddTask,
            }}
          />
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const { t } = useTranslation();
  const Icon = taskTypeIcons[task.type];
  const isCompleted = task.status === 'completed';
  const isOverdue = task.status === 'overdue';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`farm-card ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-success" />
          ) : (
            <Circle className={`h-6 w-6 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
          )}
        </motion.button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${taskTypeColors[task.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`font-semibold ${isCompleted ? 'line-through' : ''}`}>
                  {t(`tasks.types.${task.type}`)}
                </h3>
                <p className="text-sm text-muted-foreground">{task.plotName}</p>
              </div>
            </div>
            
            {isOverdue && (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
            )}
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            
            <StatusBadge 
              status={
                task.priority === 'high' ? 'warning' : 
                task.priority === 'low' ? 'info' : 'info'
              }
            >
              {t(`tasks.priorities.${task.priority}`)}
            </StatusBadge>
            
            {task.syncStatus === 'pending' && (
              <StatusBadge status="pending">
                {t('common.pendingSync')}
              </StatusBadge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  if (date < today) {
    return 'Overdue';
  }
  
  return date.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
}
