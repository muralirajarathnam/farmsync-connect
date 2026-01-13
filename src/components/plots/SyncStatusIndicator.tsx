import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: 'synced' | 'pending' | 'error';
  className?: string;
}

export function SyncStatusIndicator({ status, className = '' }: SyncStatusIndicatorProps) {
  const { t } = useTranslation();

  const statusConfig = {
    synced: {
      icon: Cloud,
      label: t('common.synced'),
      color: 'text-success bg-success/10',
      animate: false,
    },
    pending: {
      icon: RefreshCw,
      label: t('common.savedLocally'),
      color: 'text-warning bg-warning/10',
      animate: true,
    },
    error: {
      icon: AlertCircle,
      label: t('common.syncFailed'),
      color: 'text-destructive bg-destructive/10',
      animate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === 'synced') {
    return null; // Don't show when synced
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color} ${className}`}
    >
      <Icon 
        className={`h-4 w-4 ${config.animate ? 'animate-spin' : ''}`} 
        style={config.animate ? { animationDuration: '3s' } : undefined}
      />
      <span className="text-sm font-medium">{config.label}</span>
      {status === 'pending' && (
        <span className="text-xs opacity-70">• {t('common.willSyncWhenOnline')}</span>
      )}
    </motion.div>
  );
}
