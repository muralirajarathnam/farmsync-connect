import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlotSelector } from './PlotSelector';
import { CropScroller } from './CropScroller';
import type { Plot, Task, TaskType, TaskPriority } from '@/types/api';
import { format, addDays } from 'date-fns';

interface AddTaskSheetProps {
  plots: Plot[];
  onSave: (task: Omit<Task, 'id' | 'updatedAt' | 'syncStatus'>) => void;
  onCancel: () => void;
}

const taskTypes: TaskType[] = ['irrigation', 'fertilizer', 'pesticide', 'harvest', 'planting', 'other'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];

const priorityColors = {
  low: 'bg-info/20 text-info border-info/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
};

export function AddTaskSheet({ plots, onSave, onCancel }: AddTaskSheetProps) {
  const { t } = useTranslation();
  
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(plots[0]?.id || null);
  const [selectedType, setSelectedType] = useState<TaskType>('irrigation');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');

  const selectedPlot = plots.find(p => p.id === selectedPlotId);

  const handleSave = () => {
    if (!selectedPlotId) return;
    
    onSave({
      plotId: selectedPlotId,
      plotName: selectedPlot?.name,
      type: selectedType,
      title: title || undefined,
      dueDate: new Date(dueDate).toISOString(),
      status: 'pending',
      priority: selectedPriority,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-card border-t rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            {t('tasks.addNew')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          {/* Plot Selection */}
          <PlotSelector
            plots={plots}
            selectedPlotId={selectedPlotId}
            onSelect={(id) => setSelectedPlotId(id || plots[0]?.id || null)}
          />

          {/* Task Type */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">{t('tasks.type')}</h3>
            <div className="grid grid-cols-3 gap-2">
              {taskTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className="h-auto py-2"
                >
                  {t(`tasks.types.${type}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">{t('tasks.priority')}</h3>
            <div className="flex gap-2">
              {priorities.map((priority) => (
                <Button
                  key={priority}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPriority(priority)}
                  className={`flex-1 border-2 ${
                    selectedPriority === priority 
                      ? priorityColors[priority]
                      : ''
                  }`}
                >
                  {t(`tasks.priorities.${priority}`)}
                </Button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {t('tasks.dueDate')}
            </h3>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-12 text-lg"
            />
          </div>

          {/* Optional Title */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">{t('tasks.notes')} ({t('common.optional')})</h3>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tasks.notesPlaceholder')}
              className="h-12"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t p-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={!selectedPlotId}
          >
            {t('common.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
