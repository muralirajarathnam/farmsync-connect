import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PhSliderProps {
  value: number;
}

export function PhSlider({ value }: PhSliderProps) {
  const { t } = useTranslation();
  
  // pH scale: 0-14, with 7 being neutral
  const percentage = Math.max(0, Math.min(100, (value / 14) * 100));
  
  // Determine pH status
  const getPhStatus = (): 'acidic' | 'neutral' | 'alkaline' => {
    if (value < 6.0) return 'acidic';
    if (value > 7.5) return 'alkaline';
    return 'neutral';
  };
  
  const status = getPhStatus();
  
  const statusLabels = {
    acidic: 'Acidic',
    neutral: 'Neutral',
    alkaline: 'Alkaline',
  };

  const statusColors = {
    acidic: 'text-warning',
    neutral: 'text-success',
    alkaline: 'text-info',
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{t('soil.ph')}</span>
        <span className={`text-sm font-semibold ${statusColors[status]}`}>
          {value.toFixed(1)} • {statusLabels[status]}
        </span>
      </div>
      
      {/* pH Gradient Bar */}
      <div className="relative h-4 w-full rounded-full overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(to right, hsl(0 80% 55%), hsl(40 80% 55%), hsl(120 60% 45%), hsl(200 70% 50%), hsl(270 60% 55%))',
          }}
        />
        
        {/* Optimal range overlay */}
        <div
          className="absolute h-full border-2 border-white/80 rounded-sm"
          style={{
            left: `${(6.0 / 14) * 100}%`,
            width: `${((7.5 - 6.0) / 14) * 100}%`,
          }}
        />
        
        {/* Current value indicator */}
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-white border-2 border-foreground shadow-lg" />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-1.5 py-0.5 rounded">
              {value.toFixed(1)}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 (Acidic)</span>
        <span className="text-success">6-7.5 Optimal</span>
        <span>14 (Alkaline)</span>
      </div>
    </div>
  );
}
