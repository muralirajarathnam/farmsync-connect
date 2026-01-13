import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wheat, Sprout, Leaf, TreePine, Flower2, CircleDot, Check } from 'lucide-react';
import type { Plot } from '@/types/api';

interface PlotSelectorProps {
  plots: Plot[];
  selectedPlotId: string | null;
  onSelect: (plotId: string | null) => void;
}

const cropIcons: Record<string, typeof Wheat> = {
  Rice: Sprout,
  Wheat: Wheat,
  Cotton: Flower2,
  Corn: Leaf,
  Sugarcane: TreePine,
  default: CircleDot,
};

export function PlotSelector({ plots, selectedPlotId, onSelect }: PlotSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground">{t('plots.title')}</h3>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {/* All Plots option */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[90px] ${
            selectedPlotId === null
              ? 'border-primary bg-primary/10'
              : 'border-transparent bg-muted/50 hover:bg-muted'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            selectedPlotId === null ? 'bg-primary/20' : 'bg-muted'
          }`}>
            <Sprout className={`h-6 w-6 ${selectedPlotId === null ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <span className={`text-xs font-medium text-center ${
            selectedPlotId === null ? 'text-primary' : 'text-foreground'
          }`}>
            {t('common.all')}
          </span>
        </motion.button>

        {/* Individual plots */}
        {plots.map((plot, index) => {
          const isSelected = selectedPlotId === plot.id;
          const CropIcon = cropIcons[plot.cropType || 'default'] || cropIcons.default;
          
          return (
            <motion.button
              key={plot.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(plot.id)}
              className={`relative flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all min-w-[90px] ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isSelected ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <CropIcon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-xs font-medium text-center line-clamp-1 max-w-[70px] ${
                isSelected ? 'text-primary' : 'text-foreground'
              }`}>
                {plot.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
