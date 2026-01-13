import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wheat, Sprout, Leaf, TreePine, FlowerIcon, CircleDot } from 'lucide-react';
import type { Plot } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface PlotCardProps {
  plot: Plot;
  index: number;
}

// Map crop types to icons
const cropIcons: Record<string, typeof Wheat> = {
  Rice: Sprout,
  Wheat: Wheat,
  Cotton: FlowerIcon,
  Corn: Leaf,
  Sugarcane: TreePine,
  default: CircleDot,
};

// Soil health status based on some criteria (mock for now)
function getSoilHealth(plot: Plot): 'healthy' | 'warning' | 'critical' {
  // In a real app, this would come from soil data
  const hash = plot.id.charCodeAt(0) % 3;
  return ['healthy', 'warning', 'critical'][hash] as 'healthy' | 'warning' | 'critical';
}

export function PlotCard({ plot, index }: PlotCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const CropIcon = cropIcons[plot.cropType || 'default'] || cropIcons.default;
  const soilHealth = getSoilHealth(plot);
  
  const healthColors = {
    healthy: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    critical: 'bg-destructive text-destructive-foreground',
  };

  const healthLabels = {
    healthy: t('soil.healthy'),
    warning: t('soil.needsAttention'),
    critical: t('soil.critical'),
  };

  const handleClick = () => {
    navigate(`/plots/${plot.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="farm-card cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 active:scale-[0.98]"
    >
      {/* Crop Icon */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CropIcon className="h-6 w-6 text-primary" />
        </div>
        
        {/* Soil Health Badge */}
        <span className={`status-badge ${healthColors[soilHealth]} text-xs px-2 py-1 rounded-full`}>
          {healthLabels[soilHealth]}
        </span>
      </div>

      {/* Plot Name */}
      <h3 className="font-semibold text-foreground text-lg mb-1 truncate">
        {plot.name}
      </h3>

      {/* Crop Type & Area */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {plot.cropType && (
          <span className="font-medium text-foreground/80">{plot.cropType}</span>
        )}
        {plot.cropType && plot.area && <span>•</span>}
        {plot.area && (
          <span>
            {plot.area} {t(`plots.${plot.areaUnit || 'hectares'}`)}
          </span>
        )}
      </div>

      {/* Last Updated */}
      <p className="text-xs text-muted-foreground">
        {t('common.lastSynced')}: {formatDistanceToNow(new Date(plot.updatedAt), { addSuffix: true })}
      </p>
    </motion.div>
  );
}
