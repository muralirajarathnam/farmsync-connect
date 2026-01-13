import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

interface MoistureMeterProps {
  value: number; // 0-100 percentage
}

export function MoistureMeter({ value }: MoistureMeterProps) {
  const { t } = useTranslation();
  
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  // Determine status
  const getStatus = (): 'dry' | 'optimal' | 'wet' => {
    if (normalizedValue < 30) return 'dry';
    if (normalizedValue > 70) return 'wet';
    return 'optimal';
  };
  
  const status = getStatus();
  
  const statusLabels = {
    dry: 'Dry',
    optimal: 'Optimal',
    wet: 'Too Wet',
  };

  const statusColors = {
    dry: 'text-warning',
    optimal: 'text-success',
    wet: 'text-info',
  };

  // Generate droplet icons based on level
  const dropletCount = Math.ceil(normalizedValue / 20);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{t('soil.moisture')}</span>
        <span className={`text-sm font-semibold ${statusColors[status]}`}>
          {normalizedValue.toFixed(0)}% • {statusLabels[status]}
        </span>
      </div>
      
      {/* Droplet visualization */}
      <div className="flex items-end justify-center gap-1 h-16 bg-muted/50 rounded-xl p-3">
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = i <= dropletCount;
          const isCurrent = i === dropletCount;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isActive ? 1 : 0.2, 
                scale: isActive ? 1 : 0.8 
              }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <Droplets 
                className={`transition-colors ${
                  isActive 
                    ? status === 'dry' 
                      ? 'text-warning' 
                      : status === 'wet' 
                        ? 'text-info' 
                        : 'text-success'
                    : 'text-muted-foreground/30'
                }`}
                size={isCurrent ? 28 : 24}
                fill={isActive ? 'currentColor' : 'none'}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0% Dry</span>
        <span className="text-success">30-70% Optimal</span>
        <span>100% Wet</span>
      </div>
    </div>
  );
}
