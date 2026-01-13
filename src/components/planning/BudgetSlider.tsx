import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface BudgetSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function BudgetSlider({ 
  value, 
  onChange, 
  min = 0, 
  max = 100000, 
  step = 1000 
}: BudgetSliderProps) {
  const { t } = useTranslation();
  
  // Format currency for display
  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    } else if (val >= 1000) {
      return `₹${(val / 1000).toFixed(0)}K`;
    }
    return `₹${val}`;
  };

  return (
    <div className="farm-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <IndianRupee className="h-5 w-5 text-success" />
          </div>
          <span className="font-medium text-foreground">{t('planning.budget')}</span>
        </div>
        
        {/* Large numeric display */}
        <motion.div
          key={value}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold text-success"
        >
          {formatCurrency(value)}
        </motion.div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
}
