import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, ClipboardList } from 'lucide-react';
import { useTasks } from '@/hooks/use-api';
import { TaskPreviewCard } from './TaskPreviewCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';

export function TasksPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: tasks, isLoading, error } = useTasks();

  // Filter to show only pending/overdue tasks, sorted by due date
  const upcomingTasks = tasks
    ?.filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const handleViewAll = () => {
    navigate('/planning');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          {t('planning.upcoming')}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          className="text-primary hover:text-primary/80"
        >
          {t('common.viewAll')}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeletons
          <>
            <SkeletonCard className="h-16" />
            <SkeletonCard className="h-16" />
            <SkeletonCard className="h-16" />
          </>
        ) : error ? (
          // Error state
          <div className="farm-card text-center py-6">
            <p className="text-destructive">{t('errors.generic')}</p>
          </div>
        ) : upcomingTasks && upcomingTasks.length > 0 ? (
          // Tasks list
          upcomingTasks.map((task, index) => (
            <TaskPreviewCard key={task.id} task={task} index={index} />
          ))
        ) : (
          // Empty state
          <div className="farm-card text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="font-medium text-foreground">{t('tasks.allDone')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('tasks.noTasks')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
