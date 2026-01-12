import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectivityStore } from '@/stores/connectivity';
import { formatDistanceToNow } from 'date-fns';

export function ConnectivityBanner() {
  const { t } = useTranslation();
  const { isOnline, lastSyncTime, pendingSyncCount } = useConnectivityStore();
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Show banner when offline or when there are pending items
    setShowBanner(!isOnline || pendingSyncCount > 0);
  }, [isOnline, pendingSyncCount]);
  
  if (!showBanner) return null;
  
  const lastSyncText = lastSyncTime 
    ? formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })
    : null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${isOnline ? 'bg-warning/90' : 'bg-muted'} backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-foreground" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">
              {isOnline ? t('common.online') : t('common.offline')}
            </span>
            {pendingSyncCount > 0 && (
              <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs">
                {pendingSyncCount} {t('common.pendingSync')}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {lastSyncText && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('common.lastSynced')}: {lastSyncText}
              </span>
            )}
            {isOnline && pendingSyncCount > 0 && (
              <button className="flex items-center gap-1 text-primary hover:underline">
                <RefreshCw className="h-3 w-3" />
                {t('common.sync')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
