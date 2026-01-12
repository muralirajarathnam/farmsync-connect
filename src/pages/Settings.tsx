import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Globe, 
  RefreshCw, 
  Trash2, 
  Info, 
  LogOut,
  ChevronRight,
  Check,
  HardDrive,
  WifiOff,
  Clock
} from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import { useConnectivityStore } from '@/stores/connectivity';
import { 
  getSyncQueue, 
  clearSyncQueue, 
  getPendingDiagnoses,
  getStorageEstimate 
} from '@/lib/offline-storage';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import type { SyncQueueItem } from '@/types/api';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { isOnline, lastSyncTime, pendingSyncCount } = useConnectivityStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [pendingDiagCount, setPendingDiagCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  
  useEffect(() => {
    loadSyncData();
  }, []);
  
  const loadSyncData = async () => {
    const queue = await getSyncQueue();
    setSyncQueue(queue);
    
    const pendingDiag = await getPendingDiagnoses();
    setPendingDiagCount(pendingDiag.length);
    
    const storage = await getStorageEstimate();
    setStorageUsed(storage.used);
  };
  
  const handleClearQueue = async () => {
    await clearSyncQueue();
    await loadSyncData();
  };
  
  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };
  
  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('settings.title')}</h1>
            </div>
          </div>
          <AudioHelpButton size="md" />
        </div>
      </header>
      
      <div className="px-4 pb-6 space-y-6">
        {/* Language */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.language')}
          </h3>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLanguageModal(true)}
            className="w-full farm-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{t('settings.language')}</p>
                <p className="text-sm text-muted-foreground">{currentLang.nativeName}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </section>
        
        {/* Sync Queue */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.syncQueue')}
          </h3>
          <div className="farm-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isOnline ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  {isOnline ? (
                    <RefreshCw className="h-5 w-5 text-success" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isOnline ? t('common.online') : t('common.offline')}
                  </p>
                  {lastSyncTime && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t('common.lastSynced')}: {new Date(lastSyncTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('settings.pendingItems')}</span>
                <span className="font-semibold text-foreground">
                  {syncQueue.length + pendingDiagCount}
                </span>
              </div>
              
              {(syncQueue.length > 0 || pendingDiagCount > 0) && (
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearQueue}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/50 py-3 text-destructive font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('settings.clearQueue')}
                  </motion.button>
                  
                  {isOnline && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground font-medium"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('settings.syncNow')}
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Storage */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.storage')}
          </h3>
          <div className="farm-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <HardDrive className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('settings.storage')}</p>
                <p className="text-sm text-muted-foreground">{formatBytes(storageUsed)}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.about')}
          </h3>
          <div className="farm-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">SWAFarms</p>
                <p className="text-sm text-muted-foreground">{t('settings.version')} 1.0.0</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full farm-card flex items-center justify-center gap-2 text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">{t('settings.logout')}</span>
        </motion.button>
      </div>
      
      {/* Language Modal */}
      {showLanguageModal && (
        <LanguageModal 
          currentLang={i18n.language}
          onSelect={handleChangeLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </div>
  );
}

function LanguageModal({ 
  currentLang, 
  onSelect, 
  onClose 
}: { 
  currentLang: string; 
  onSelect: (code: string) => void; 
  onClose: () => void;
}) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl bg-card p-6 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('settings.language')}</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          {supportedLanguages.map((lang) => (
            <motion.button
              key={lang.code}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(lang.code)}
              className={`w-full flex items-center justify-between rounded-xl p-4 transition-colors ${
                currentLang === lang.code
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div className="text-left">
                <p className="font-semibold text-foreground">{lang.nativeName}</p>
                <p className="text-sm text-muted-foreground">{lang.name}</p>
              </div>
              {currentLang === lang.code && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
