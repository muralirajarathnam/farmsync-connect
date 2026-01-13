import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  ClipboardList,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { PlotSelector } from '@/components/planning/PlotSelector';
import { TimelineTaskCard } from '@/components/planning/TimelineTaskCard';
import { AddTaskSheet } from '@/components/planning/AddTaskSheet';
import { SyncStatusIndicator } from '@/components/plots/SyncStatusIndicator';
import { SkeletonCard } from '@/components/SkeletonCard';
import { usePlots, useTasks, useCreateTask, useUpdateTask } from '@/hooks/use-api';
import { useConnectivityStore } from '@/stores/connectivity';
import { toast } from 'sonner';
import type { Task } from '@/types/api';
import { addDays } from 'date-fns';

export default function Planning() {
  const { t } = useTranslation();
  const { isOnline } = useConnectivityStore();
  
  const { data: plots, isLoading: plotsLoading } = usePlots();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const { data: tasks, isLoading: tasksLoading } = useTasks(selectedPlotId || undefined);
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter tasks
  const filteredTasks = tasks
    ?.filter(task => {
      if (filterStatus === 'pending') return task.status !== 'completed';
      if (filterStatus === 'completed') return task.status === 'completed';
      return true;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Handle task creation
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'updatedAt' | 'syncStatus'>) => {
    try {
      setSyncStatus('pending');
      await createTask.mutateAsync(taskData);
      
      if (isOnline) {
        setSyncStatus('synced');
        toast.success(t('common.synced'));
      } else {
        toast.info(t('common.savedLocally'));
      }
    } catch (error) {
      setSyncStatus('error');
      toast.error(t('errors.syncError'));
    }
    
    setShowAddTask(false);
  };

  // Handle mark as done
  const handleMarkDone = async (taskId: string) => {
    try {
      setSyncStatus('pending');
      await updateTask.mutateAsync({ 
        taskId, 
        updates: { status: 'completed' } 
      });
      
      if (isOnline) {
        setSyncStatus('synced');
        toast.success(t('tasks.completed'));
      } else {
        toast.info(t('common.savedLocally'));
      }
    } catch (error) {
      setSyncStatus('error');
      toast.error(t('errors.syncError'));
    }
  };

  // Handle snooze (add 1 day)
  const handleSnooze = async (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      setSyncStatus('pending');
      await updateTask.mutateAsync({ 
        taskId, 
        updates: { 
          dueDate: addDays(new Date(task.dueDate), 1).toISOString(),
          status: 'pending'
        } 
      });
      
      if (isOnline) {
        setSyncStatus('synced');
        toast.success(t('tasks.snoozed'));
      } else {
        toast.info(t('common.savedLocally'));
      }
    } catch (error) {
      setSyncStatus('error');
      toast.error(t('errors.syncError'));
    }
  };

  // Handle edit (for now just show toast)
  const handleEdit = (taskId: string) => {
    toast.info(t('common.comingSoon'));
  };

  // Handle audio play (mock)
  const handlePlayAudio = (taskId: string) => {
    toast.info(t('common.audioPlaying'));
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b px-4 py-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('planning.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('planning.subtitle')}</p>
          </div>
          <AudioHelpButton size="md" />
        </div>
        
        {/* Sync Status */}
        <SyncStatusIndicator status={syncStatus} className="mt-3" />
      </motion.div>

      <div className="px-4 py-6 space-y-6">
        {/* Plot Selector */}
        {plotsLoading ? (
          <SkeletonCard className="h-24" />
        ) : plots && plots.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlotSelector
              plots={plots}
              selectedPlotId={selectedPlotId}
              onSelect={setSelectedPlotId}
            />
          </motion.div>
        ) : null}

        {/* Filter & Add Task */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex gap-2">
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {t(`planning.filter.${status}`)}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => setShowAddTask(true)}
            className="gap-2"
            disabled={!plots || plots.length === 0}
          >
            <Plus className="h-4 w-4" />
            {t('tasks.addNew')}
          </Button>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t('planning.timeline')}
            </h2>
          </div>

          {tasksLoading ? (
            <>
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-32" />
              <SkeletonCard className="h-32" />
            </>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <div className="pl-2">
              {filteredTasks.map((task, index) => (
                <TimelineTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onMarkDone={handleMarkDone}
                  onSnooze={handleSnooze}
                  onEdit={handleEdit}
                  onPlayAudio={handlePlayAudio}
                />
              ))}
            </div>
          ) : (
            <div className="farm-card text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-success/50 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">{t('tasks.allDone')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('planning.noTasks')}</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="h-4 w-4" />
                {t('tasks.addNew')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Task Sheet */}
      <AnimatePresence>
        {showAddTask && plots && (
          <AddTaskSheet
            plots={plots}
            onSave={handleCreateTask}
            onCancel={() => setShowAddTask(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
