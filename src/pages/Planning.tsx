import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Plus,
  Sprout,
  ClipboardList,
  Bell
} from 'lucide-react';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { IconActionCard } from '@/components/IconActionCard';

export default function Planning() {
  const { t } = useTranslation();
  
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('planning.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('planning.subtitle')}</p>
        </div>
        <AudioHelpButton size="md" />
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        <IconActionCard
          icon={Sprout}
          label={t('planning.addPlot')}
          variant="primary"
          size="md"
        />
        <IconActionCard
          icon={ClipboardList}
          label={t('planning.addTask')}
          variant="default"
          size="md"
        />
        <IconActionCard
          icon={Bell}
          label={t('planning.reminders')}
          variant="default"
          size="md"
        />
      </motion.div>
      
      {/* My Plots Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('planning.myPlots')}</h2>
          <button className="text-sm font-medium text-primary">{t('common.viewAll')}</button>
        </div>
        
        <div className="space-y-3">
          {['North Field', 'South Field', 'West Plot'].map((name, i) => (
            <div key={i} className="farm-card flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
                {['🌾', '🌿', '☁️'][i]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {['Rice • 2.5 ha', 'Wheat • 1.8 ha', 'Cotton • 3.2 acres'][i]}
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Upcoming Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('planning.upcomingTasks')}</h2>
          <button className="text-sm font-medium text-primary">{t('common.viewAll')}</button>
        </div>
        
        <div className="farm-card">
          <div className="space-y-4">
            {[
              { type: 'irrigation', plot: 'North Field', date: 'Tomorrow', priority: 'high' },
              { type: 'fertilizer', plot: 'South Field', date: 'In 2 days', priority: 'medium' },
              { type: 'harvest', plot: 'West Plot', date: 'Next week', priority: 'low' },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  task.priority === 'high' ? 'bg-destructive' :
                  task.priority === 'medium' ? 'bg-warning' : 'bg-info'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t(`tasks.types.${task.type}`)}</p>
                  <p className="text-sm text-muted-foreground">{task.plot}</p>
                </div>
                <span className="text-sm text-muted-foreground">{task.date}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Reminders Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="farm-card"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{t('planning.reminders')}</h2>
        </div>
        <div className="rounded-xl bg-muted/50 p-4 text-center">
          <p className="text-muted-foreground">{t('planning.noReminders')}</p>
        </div>
      </motion.div>
    </div>
  );
}
