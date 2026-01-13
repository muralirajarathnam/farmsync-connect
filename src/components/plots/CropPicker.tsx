import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wheat, 
  Sprout, 
  Leaf, 
  TreePine, 
  Flower2, 
  CircleDot,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CropPickerProps {
  currentCrop?: string;
  onSelect: (crop: string) => void;
  onCancel: () => void;
}

const crops = [
  { name: 'Rice', icon: Sprout, color: 'bg-success/20 text-success' },
  { name: 'Wheat', icon: Wheat, color: 'bg-warning/20 text-warning' },
  { name: 'Cotton', icon: Flower2, color: 'bg-info/20 text-info' },
  { name: 'Corn', icon: Leaf, color: 'bg-primary/20 text-primary' },
  { name: 'Sugarcane', icon: TreePine, color: 'bg-success/20 text-success' },
  { name: 'Vegetables', icon: Sprout, color: 'bg-success/20 text-success' },
  { name: 'Pulses', icon: CircleDot, color: 'bg-warning/20 text-warning' },
  { name: 'Other', icon: CircleDot, color: 'bg-muted text-muted-foreground' },
];

export function CropPicker({ currentCrop, onSelect, onCancel }: CropPickerProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(currentCrop || '');

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-card border rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            {t('plots.cropType')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Crop Grid */}
        <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto max-h-[50vh]">
          {crops.map((crop) => {
            const isSelected = selected === crop.name;
            const CropIcon = crop.icon;
            
            return (
              <motion.button
                key={crop.name}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(crop.name)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${crop.color}`}>
                  <CropIcon className="h-6 w-6" />
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {crop.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleConfirm}
            disabled={!selected}
          >
            {t('common.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
