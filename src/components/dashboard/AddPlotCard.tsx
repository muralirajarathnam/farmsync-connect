import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddPlotCardProps {
  index: number;
}

export function AddPlotCard({ index }: AddPlotCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/plots/new');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="farm-card cursor-pointer border-dashed border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all duration-200 active:scale-[0.98] flex flex-col items-center justify-center min-h-[160px]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 mb-3">
        <Plus className="h-7 w-7 text-primary" strokeWidth={2.5} />
      </div>
      <span className="font-semibold text-primary text-lg">
        {t('plots.addNew')}
      </span>
    </motion.div>
  );
}
