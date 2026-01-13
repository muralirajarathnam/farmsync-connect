import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Plus, MapPin } from 'lucide-react';
import { usePlots } from '@/hooks/use-api';
import { PlotCard } from './PlotCard';
import { AddPlotCard } from './AddPlotCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { Button } from '@/components/ui/button';

export function PlotsGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: plots, isLoading, error } = usePlots();

  const hasPlots = plots && plots.length > 0;

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

      {isLoading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-40" />
        </div>
      ) : error ? (
        /* Error state */
        <div className="farm-card text-center py-8">
          <p className="text-destructive">{t('errors.generic')}</p>
        </div>
      ) : !hasPlots ? (
        /* Empty state - No plots yet */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="farm-card text-center py-10 px-6"
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('plots.noPlots')}</h3>
          <p className="text-muted-foreground mb-6">{t('plots.addFirstPlotDesc')}</p>
          <Button
            size="lg"
            className="h-14 px-8 text-lg font-semibold"
            onClick={() => navigate('/plots/new')}
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('plots.addFirstPlot')}
          </Button>
        </motion.div>
      ) : (
        /* Plots Grid + Add button */
        <div className="grid grid-cols-2 gap-3">
          {plots.map((plot, index) => (
            <PlotCard key={plot.id} plot={plot} index={index} />
          ))}
          <AddPlotCard index={plots.length} />
        </div>
      )}
    </motion.div>
  );
}
