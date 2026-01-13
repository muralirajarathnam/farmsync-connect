import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';
import { usePlots } from '@/hooks/use-api';
import { PlotCard } from './PlotCard';
import { AddPlotCard } from './AddPlotCard';
import { SkeletonCard } from '@/components/SkeletonCard';

export function PlotsGrid() {
  const { t } = useTranslation();
  const { data: plots, isLoading, error } = usePlots();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-4"
    >
      {/* Header */}
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Sprout className="h-5 w-5 text-primary" />
        {t('plots.title')}
      </h2>

      {/* Plots Grid */}
      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          // Loading skeletons
          <>
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-40" />
          </>
        ) : error ? (
          // Error state
          <div className="col-span-2 farm-card text-center py-8">
            <p className="text-destructive">{t('errors.generic')}</p>
          </div>
        ) : (
          // Plots + Add button
          <>
            {plots?.map((plot, index) => (
              <PlotCard key={plot.id} plot={plot} index={index} />
            ))}
            <AddPlotCard index={plots?.length || 0} />
          </>
        )}
      </div>
    </motion.div>
  );
}
