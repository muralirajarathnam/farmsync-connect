import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Sprout, 
  MapPin, 
  Ruler, 
  ChevronRight,
  Leaf,
  CloudSun
} from 'lucide-react';
import { usePlots } from '@/hooks/use-api';
import { StatusBadge } from '@/components/StatusBadge';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';
import type { Plot } from '@/types/api';

const cropIcons: Record<string, string> = {
  'Rice': '🌾',
  'Wheat': '🌿',
  'Cotton': '☁️',
  'Sugarcane': '🎋',
  'Maize': '🌽',
};

export default function PlotsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: plots, isLoading, error } = usePlots();
  
  const handleAddPlot = () => {
    navigate('/plots/new');
  };
  
  const handleViewPlot = (plotId: string) => {
    navigate(`/plots/${plotId}`);
  };
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('plots.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {plots?.length || 0} {plots?.length === 1 ? 'plot' : 'plots'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AudioHelpButton size="md" />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddPlot}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="px-4 pb-6">
        {isLoading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            {t('errors.generic')}
          </div>
        ) : plots && plots.length > 0 ? (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {plots.map((plot) => (
              <PlotCard 
                key={plot.id} 
                plot={plot} 
                onClick={() => handleViewPlot(plot.id)} 
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Sprout}
            title={t('plots.noPlots')}
            description={t('plots.addFirstPlot')}
            action={{
              label: t('plots.addNew'),
              onClick: handleAddPlot,
            }}
          />
        )}
      </div>
    </div>
  );
}

function PlotCard({ plot, onClick }: { plot: Plot; onClick: () => void }) {
  const { t } = useTranslation();
  const cropEmoji = cropIcons[plot.cropType || ''] || '🌱';
  
  return (
    <motion.button
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full farm-card text-left"
    >
      <div className="flex items-start gap-4">
        {/* Crop Icon */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
          {cropEmoji}
        </div>
        
        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {plot.name}
            </h3>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
          </div>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {plot.area && (
              <span className="flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {plot.area} {t(`plots.${plot.areaUnit || 'hectares'}`)}
              </span>
            )}
            {plot.locationLabel && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {plot.locationLabel}
              </span>
            )}
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            {plot.cropType && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground">
                <Leaf className="h-3 w-3" />
                {plot.cropType}
              </span>
            )}
            {plot.syncStatus === 'pending' && (
              <StatusBadge status="pending">
                {t('common.pendingSync')}
              </StatusBadge>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
