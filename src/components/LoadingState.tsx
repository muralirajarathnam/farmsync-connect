import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingState({ message, fullscreen = false }: LoadingStateProps) {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="text-lg font-medium text-foreground">{displayMessage}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="h-8 w-8 text-primary" />
      </motion.div>
      <p className="text-muted-foreground font-medium">{displayMessage}</p>
    </motion.div>
  );
}

// Inline spinner for buttons
export function ButtonSpinner({ className = '' }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Loader2 className="h-5 w-5" />
    </motion.div>
  );
}
