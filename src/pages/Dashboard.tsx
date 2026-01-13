import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { PlotsGrid } from '@/components/dashboard/PlotsGrid';
import { TasksPreview } from '@/components/dashboard/TasksPreview';

export default function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dashboard.welcome')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <AudioHelpButton size="md" />
      </motion.div>
      
      {/* Weather Widget */}
      <WeatherWidget />
      
      {/* My Plots Grid */}
      <PlotsGrid />
      
      {/* Upcoming Tasks Preview */}
      <TasksPreview />
    </div>
  );
}
