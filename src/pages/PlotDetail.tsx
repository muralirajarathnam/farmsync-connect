import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Droplets, 
  FlaskConical, 
  Leaf, 
  CloudRain,
  Edit3,
  MapPin,
  Ruler,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { usePlots, useSoilData, useTasks } from '@/hooks/use-api';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { StatusBadge } from '@/components/StatusBadge';
import { SkeletonCard } from '@/components/SkeletonCard';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell 
} from 'recharts';

const cropIcons: Record<string, string> = {
  'Rice': '🌾',
  'Wheat': '🌿',
  'Cotton': '☁️',
  'Sugarcane': '🎋',
  'Maize': '🌽',
};

export default function PlotDetailPage() {
  const { plotId } = useParams<{ plotId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { data: plots } = usePlots();
  const { data: soilData, isLoading: soilLoading } = useSoilData(plotId || '');
  const { data: tasks } = useTasks(plotId);
  
  const plot = plots?.find(p => p.id === plotId);
  const upcomingTasks = tasks?.filter(t => t.status !== 'completed').slice(0, 3);
  
  if (!plot) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }
  
  const cropEmoji = cropIcons[plot.cropType || ''] || '🌱';
  
  // Soil data for chart
  const soilChartData = soilData ? [
    { name: 'N', value: soilData.n, color: 'hsl(142, 76%, 36%)' },
    { name: 'P', value: soilData.p, color: 'hsl(38, 92%, 50%)' },
    { name: 'K', value: soilData.k / 3, color: 'hsl(30, 41%, 45%)' }, // Scale K for visibility
  ] : [];
  
  const getSoilHealthStatus = () => {
    if (!soilData) return 'info';
    const ph = soilData.ph;
    if (ph >= 6 && ph <= 7.5) return 'healthy';
    if (ph >= 5.5 && ph < 6 || ph > 7.5 && ph <= 8) return 'warning';
    return 'critical';
  };
  
  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-top">
        <div className="flex items-center gap-3 px-4 py-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{plot.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{cropEmoji} {plot.cropType}</span>
              {plot.area && (
                <>
                  <span>•</span>
                  <span>{plot.area} {t(`plots.${plot.areaUnit || 'hectares'}`)}</span>
                </>
              )}
            </p>
          </div>
          <AudioHelpButton size="md" />
        </div>
      </header>
      
      <div className="space-y-6 px-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="farm-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Droplets className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {soilData?.moisture ? `${Math.round(soilData.moisture)}%` : '--'}
                </p>
                <p className="text-xs text-muted-foreground">{t('soil.moisture')}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="farm-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {soilData?.ph ? soilData.ph.toFixed(1) : '--'}
                </p>
                <p className="text-xs text-muted-foreground">{t('soil.ph')}</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Soil Health Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="farm-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t('plots.soilHealth')}</h2>
            </div>
            <StatusBadge status={getSoilHealthStatus()}>
              {t(`soil.${getSoilHealthStatus() === 'healthy' ? 'healthy' : getSoilHealthStatus() === 'warning' ? 'needsAttention' : 'critical'}`)}
            </StatusBadge>
          </div>
          
          {soilLoading ? (
            <div className="h-40 animate-pulse bg-muted rounded-lg" />
          ) : soilData ? (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={soilChartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'K' ? value * 3 : value,
                      name === 'N' ? t('soil.nitrogen') : name === 'P' ? t('soil.phosphorus') : t('soil.potassium')
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {soilChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
          )}
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Edit3 className="h-4 w-4" />
            {t('soil.updateSoil')}
          </motion.button>
        </motion.div>
        
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="farm-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">{t('tasks.title')}</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tasks')}
              className="text-sm font-medium text-primary"
            >
              {t('plots.viewDetails')}
            </motion.button>
          </div>
          
          {upcomingTasks && upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl bg-muted/50 p-3"
                >
                  <div className={`h-3 w-3 rounded-full ${
                    task.status === 'overdue' ? 'bg-destructive' :
                    task.priority === 'high' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {t(`tasks.types.${task.type}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  {task.status === 'overdue' && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              {t('tasks.allDone')} 🎉
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
