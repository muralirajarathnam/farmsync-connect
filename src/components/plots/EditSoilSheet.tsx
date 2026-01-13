import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, Droplets, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { SoilData } from '@/types/api';

interface EditSoilSheetProps {
  soil: SoilData;
  onSave: (soil: Partial<SoilData>) => void;
  onCancel: () => void;
}

export function EditSoilSheet({ soil, onSave, onCancel }: EditSoilSheetProps) {
  const { t } = useTranslation();
  
  const [values, setValues] = useState({
    ph: soil.ph,
    n: soil.n,
    p: soil.p,
    k: soil.k,
    moisture: soil.moisture || 50,
  });

  const handleSave = () => {
    onSave(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-card border-t rounded-t-3xl shadow-xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            {t('soil.updateSoil')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-6">
          {/* pH Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" />
                {t('soil.ph')}
              </label>
              <span className="text-lg font-bold text-primary">{values.ph.toFixed(1)}</span>
            </div>
            <div 
              className="h-3 rounded-full mb-2"
              style={{
                background: 'linear-gradient(to right, hsl(0 80% 55%), hsl(40 80% 55%), hsl(120 60% 45%), hsl(200 70% 50%), hsl(270 60% 55%))',
              }}
            />
            <Slider
              value={[values.ph]}
              onValueChange={([v]) => setValues(prev => ({ ...prev, ph: v }))}
              min={0}
              max={14}
              step={0.1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 Acidic</span>
              <span className="text-success">6-7.5 Optimal</span>
              <span>14 Alkaline</span>
            </div>
          </div>

          {/* Nitrogen Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">
                {t('soil.nitrogen')}
              </label>
              <span className="text-lg font-bold text-success">{values.n.toFixed(0)} kg/ha</span>
            </div>
            <Slider
              value={[values.n]}
              onValueChange={([v]) => setValues(prev => ({ ...prev, n: v }))}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="text-success">25-50 Optimal</span>
              <span>100</span>
            </div>
          </div>

          {/* Phosphorus Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">
                {t('soil.phosphorus')}
              </label>
              <span className="text-lg font-bold text-warning">{values.p.toFixed(0)} kg/ha</span>
            </div>
            <Slider
              value={[values.p]}
              onValueChange={([v]) => setValues(prev => ({ ...prev, p: v }))}
              min={0}
              max={80}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="text-success">15-30 Optimal</span>
              <span>80</span>
            </div>
          </div>

          {/* Potassium Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground">
                {t('soil.potassium')}
              </label>
              <span className="text-lg font-bold text-info">{values.k.toFixed(0)} kg/ha</span>
            </div>
            <Slider
              value={[values.k]}
              onValueChange={([v]) => setValues(prev => ({ ...prev, k: v }))}
              min={0}
              max={300}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className="text-success">150-250 Optimal</span>
              <span>300</span>
            </div>
          </div>

          {/* Moisture Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-foreground flex items-center gap-2">
                <Droplets className="h-4 w-4 text-info" />
                {t('soil.moisture')}
              </label>
              <span className="text-lg font-bold text-info">{values.moisture.toFixed(0)}%</span>
            </div>
            <Slider
              value={[values.moisture]}
              onValueChange={([v]) => setValues(prev => ({ ...prev, moisture: v }))}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% Dry</span>
              <span className="text-success">30-70% Optimal</span>
              <span>100% Wet</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t p-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
