import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  ClipboardList, 
  AlertTriangle, 
  CloudSun,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { AudioHelpButton } from '@/components/AudioHelpButton';

export default function Dashboard() {
  const { t } = useTranslation();
  
  const stats = [
    { icon: Sprout, label: t('dashboard.totalPlots'), value: '3', color: 'bg-primary/10 text-primary' },
    { icon: ClipboardList, label: t('dashboard.pendingTasks'), value: '5', color: 'bg-warning/10 text-warning' },
    { icon: AlertTriangle, label: t('dashboard.alerts'), value: '2', color: 'bg-destructive/10 text-destructive' },
  ];
  
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
      
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        {stats.map((stat, index) => (
          <div key={index} className="farm-card text-center">
            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>
      
      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="farm-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <CloudSun className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t('dashboard.weather')}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.weatherDesc')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">28°C</p>
            <p className="text-sm text-muted-foreground">☀️ Sunny</p>
          </div>
        </div>
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-foreground">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="farm-card flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t('dashboard.irrigation')}</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.irrigationDesc')}</p>
            </div>
          </div>
          <div className="farm-card flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t('dashboard.growth')}</p>
              <p className="text-xs text-muted-foreground">{t('dashboard.growthDesc')}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="farm-card"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.recentActivity')}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
