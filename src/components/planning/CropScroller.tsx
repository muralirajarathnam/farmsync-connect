import { motion } from 'framer-motion';
import { Wheat, Sprout, Leaf, TreePine, Flower2, CircleDot, Check } from 'lucide-react';

interface CropScrollerProps {
  selectedCrop: string | null;
  onSelect: (crop: string) => void;
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

export function CropScroller({ selectedCrop, onSelect }: CropScrollerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      {crops.map((crop, index) => {
        const isSelected = selectedCrop === crop.name;
        const CropIcon = crop.icon;
        
        return (
          <motion.button
            key={crop.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(crop.name)}
            className={`relative flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-transparent bg-muted/50 hover:bg-muted'
            }`}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
              >
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </motion.div>
            )}
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${crop.color}`}>
              <CropIcon className="h-4 w-4" />
            </div>
            <span className={`text-sm font-medium ${
              isSelected ? 'text-primary' : 'text-foreground'
            }`}>
              {crop.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
