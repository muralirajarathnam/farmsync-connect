import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface SoilLevelBarProps {
  label: string;
  value: number;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
  unit?: string;
  colorScheme?: 'nitrogen' | 'phosphorus' | 'potassium';
}

const colorSchemes = {
  nitrogen: {
    low: 'bg-warning',
    ok: 'bg-success',
    high: 'bg-info',
  },
  phosphorus: {
    low: 'bg-warning',
    ok: 'bg-success',
    high: 'bg-destructive',
  },
  potassium: {
    low: 'bg-warning',
    ok: 'bg-success',
    high: 'bg-info',
  },
};

export function SoilLevelBar({
  label,
  value,
  min,
  max,
  optimalMin,
  optimalMax,
  unit = '',
  colorScheme = 'nitrogen',
}: SoilLevelBarProps) {
  const { t } = useTranslation();
  
  // Calculate percentage position
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  
  // Determine status
  const getStatus = (): 'low' | 'ok' | 'high' => {
    if (value < optimalMin) return 'low';
    if (value > optimalMax) return 'high';
    return 'ok';
  };
  
  const status = getStatus();
  const colors = colorSchemes[colorScheme];
  
  const statusLabels = {
    low: t('soil.low') || 'Low',
    ok: t('soil.healthy'),
    high: t('soil.high') || 'High',
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{label}</span>
        <span className={`text-sm font-semibold ${
          status === 'ok' ? 'text-success' : status === 'low' ? 'text-warning' : 'text-info'
        }`}>
          {value.toFixed(1)}{unit} • {statusLabels[status]}
        </span>
      </div>
      
      {/* Bar container */}
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        {/* Optimal range indicator */}
        <div
          className="absolute h-full bg-success/20 rounded-full"
          style={{
            left: `${((optimalMin - min) / (max - min)) * 100}%`,
            width: `${((optimalMax - optimalMin) / (max - min)) * 100}%`,
          }}
        />
        
        {/* Current value bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`absolute h-full rounded-full ${colors[status]}`}
        />
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span className="text-success/70">Optimal: {optimalMin}-{optimalMax}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
