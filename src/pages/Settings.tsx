import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
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
  Clock,
  User,
  List,
  Image,
  Database,
  AlertTriangle,
  X,
  RotateCcw
} from 'lucide-react';
import { supportedLanguages } from '@/i18n';
import { useConnectivityStore } from '@/stores/connectivity';
import { useAuthStore } from '@/stores/auth';
import { 
  getSyncQueue, 
  clearSyncQueue, 
  getPendingDiagnoses,
  getStorageEstimate,
  clearCache,
  removePendingDiagnosis,
  removeFromSyncQueue,
  updateSyncQueueItem
} from '@/lib/offline-storage';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SyncQueueItem, PendingDiagnosis } from '@/types/api';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { isOnline, lastSyncTime, pendingSyncCount, setLastSyncTime, setPendingSyncCount } = useConnectivityStore();
  const { logout: localLogout } = useAuthStore();
  const { logout: auth0Logout } = useAuth0();
  
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSyncQueueModal, setShowSyncQueueModal] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [pendingDiagnoses, setPendingDiagnoses] = useState<PendingDiagnosis[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageAvailable, setStorageAvailable] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Confirm dialogs
  const [confirmClearCache, setConfirmClearCache] = useState(false);
  const [confirmClearUploads, setConfirmClearUploads] = useState(false);
  const [confirmClearQueue, setConfirmClearQueue] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  
  const loadSyncData = useCallback(async () => {
    const queue = await getSyncQueue();
    setSyncQueue(queue);
    
    const pendingDiag = await getPendingDiagnoses();
    setPendingDiagnoses(pendingDiag);
    
    const storage = await getStorageEstimate();
    setStorageUsed(storage.used);
    setStorageAvailable(storage.available);
    
    setPendingSyncCount(queue.length + pendingDiag.length);
  }, [setPendingSyncCount]);
  
  useEffect(() => {
    loadSyncData();
  }, [loadSyncData]);
  
  const handleClearQueue = async () => {
    await clearSyncQueue();
    setConfirmClearQueue(false);
    await loadSyncData();
  };
  
  const handleClearCache = async () => {
    await clearCache();
    setConfirmClearCache(false);
    await loadSyncData();
  };
  
  const handleClearUploads = async () => {
    const diagnoses = await getPendingDiagnoses();
    for (const diag of diagnoses) {
      await removePendingDiagnosis(diag.id);
    }
    setConfirmClearUploads(false);
    await loadSyncData();
  };
  
  const handleSyncNow = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    // Mock sync - in real app would process queue
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastSyncTime(new Date().toISOString());
    setIsSyncing(false);
    await loadSyncData();
  };
  
  const handleRetryItem = async (id: string) => {
    await updateSyncQueueItem(id, { retryCount: 0 });
    await loadSyncData();
  };
  
  const handleRemoveQueueItem = async (id: string) => {
    await removeFromSyncQueue(id);
    await loadSyncData();
  };
  
  const handleRemoveDiagnosis = async (id: string) => {
    await removePendingDiagnosis(id);
    await loadSyncData();
  };
  
  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };
  
  const handleLogout = () => {
    // Clear local auth state
    localLogout();
    setConfirmLogout(false);
    // Logout from Auth0 and redirect to login
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin + '/login' 
      } 
    });
  };
  
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };
  
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t('common.daysAgo', { count: diffDays });
  };
  
  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  const pendingTotal = syncQueue.length + pendingDiagnoses.length;
  const failedItems = syncQueue.filter(item => item.retryCount >= 3);
  
  // Sample preview terms for language preview
  const previewTerms = [
    { key: 'common.home', label: 'Home' },
    { key: 'common.save', label: 'Save' },
    { key: 'common.cancel', label: 'Cancel' },
  ];
  
  return (
    <div className="min-h-screen pb-24">
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
        {/* Account/Profile */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.account')}
          </h3>
          <div className="farm-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t('settings.farmer')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.profilePlaceholder')}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* Language */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.language')}
          </h3>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLanguageModal(true)}
            className="w-full farm-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{currentLang.nativeName}</p>
                  <p className="text-sm text-muted-foreground">{currentLang.name}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {/* Language preview */}
            <div className="flex gap-2 flex-wrap">
              {previewTerms.map((term) => (
                <span 
                  key={term.key}
                  className="px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground"
                >
                  {t(term.key)}
                </span>
              ))}
            </div>
          </motion.button>
        </section>
        
        {/* Offline & Sync */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.offlineSync')}
          </h3>
          <div className="farm-card space-y-4">
            {/* Connection status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  isOnline ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  {isOnline ? (
                    <RefreshCw className={`h-5 w-5 text-success ${isSyncing ? 'animate-spin' : ''}`} />
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
                      {t('settings.lastSync')}: {formatRelativeTime(lastSyncTime)}
                    </p>
                  )}
                </div>
              </div>
              
              {isOnline && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {isSyncing ? t('settings.syncing') : t('settings.syncNow')}
                </motion.button>
              )}
            </div>
            
            {/* Pending changes */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('settings.pendingChanges')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    pendingTotal > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                  }`}>
                    {pendingTotal}
                  </span>
                </div>
                
                {pendingTotal > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSyncQueueModal(true)}
                    className="text-sm text-primary font-medium flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    {t('settings.viewQueue')}
                  </motion.button>
                )}
              </div>
              
              {/* Failed items warning */}
              {failedItems.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{t('settings.failedItems', { count: failedItems.length })}</span>
                </div>
              )}
              
              {/* Queue breakdown */}
              {pendingTotal > 0 && (
                <div className="space-y-2 text-sm">
                  {syncQueue.length > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        {t('settings.dataChanges')}
                      </span>
                      <span>{syncQueue.length}</span>
                    </div>
                  )}
                  {pendingDiagnoses.length > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        {t('settings.pendingUploads')}
                      </span>
                      <span>{pendingDiagnoses.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Clear actions */}
            {pendingTotal > 0 && (
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmClearQueue(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/50 py-3 text-destructive font-medium text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('settings.clearQueue')}
                </motion.button>
              </div>
            )}
          </div>
        </section>
        
        {/* Storage */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            {t('settings.storage')}
          </h3>
          <div className="farm-card space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <HardDrive className="h-5 w-5 text-info" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{t('settings.localStorage')}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(storageUsed)} {storageAvailable > 0 && `/ ${formatBytes(storageAvailable)}`}
                </p>
              </div>
            </div>
            
            {/* Storage bar */}
            {storageAvailable > 0 && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((storageUsed / storageAvailable) * 100, 100)}%` }}
                  className="h-full bg-info rounded-full"
                />
              </div>
            )}
            
            {/* Storage breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('settings.cachedData')}</span>
                </div>
                <p className="font-semibold text-foreground">{formatBytes(storageUsed * 0.3)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('settings.photos')}</span>
                </div>
                <p className="font-semibold text-foreground">{formatBytes(storageUsed * 0.7)}</p>
              </div>
            </div>
            
            {/* Clear buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setConfirmClearCache(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-foreground font-medium text-sm"
              >
                <Trash2 className="h-4 w-4" />
                {t('settings.clearCache')}
              </motion.button>
              
              {pendingDiagnoses.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setConfirmClearUploads(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/50 py-3 text-destructive font-medium text-sm"
                >
                  <Image className="h-4 w-4" />
                  {t('settings.clearUploads')}
                </motion.button>
              )}
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
          onClick={() => setConfirmLogout(true)}
          className="w-full farm-card flex items-center justify-center gap-2 text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">{t('settings.logout')}</span>
        </motion.button>
      </div>
      
      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <LanguageModal 
            currentLang={i18n.language}
            onSelect={handleChangeLanguage}
            onClose={() => setShowLanguageModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sync Queue Modal */}
      <AnimatePresence>
        {showSyncQueueModal && (
          <SyncQueueModal
            syncQueue={syncQueue}
            pendingDiagnoses={pendingDiagnoses}
            onRetry={handleRetryItem}
            onRemoveQueue={handleRemoveQueueItem}
            onRemoveDiagnosis={handleRemoveDiagnosis}
            onClose={() => setShowSyncQueueModal(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Confirm Dialogs */}
      <AlertDialog open={confirmClearCache} onOpenChange={setConfirmClearCache}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.clearCache')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.clearCacheConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache}>{t('common.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={confirmClearUploads} onOpenChange={setConfirmClearUploads}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.clearUploads')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.clearUploadsConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearUploads} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={confirmClearQueue} onOpenChange={setConfirmClearQueue}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.clearQueue')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.clearQueueConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearQueue} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.logout')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('settings.logoutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('settings.logout')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          <h2 className="text-xl font-bold">{t('settings.selectLanguage')}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
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

function SyncQueueModal({
  syncQueue,
  pendingDiagnoses,
  onRetry,
  onRemoveQueue,
  onRemoveDiagnosis,
  onClose,
}: {
  syncQueue: SyncQueueItem[];
  pendingDiagnoses: PendingDiagnosis[];
  onRetry: (id: string) => void;
  onRemoveQueue: (id: string) => void;
  onRemoveDiagnosis: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  
  const getStatusColor = (item: SyncQueueItem) => {
    if (item.retryCount >= 3) return 'text-destructive bg-destructive/10';
    return 'text-warning bg-warning/10';
  };
  
  const getDiagStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-info bg-info/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-warning bg-warning/10';
    }
  };
  
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
        className="w-full max-w-lg max-h-[80vh] rounded-t-3xl bg-card safe-bottom flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4 flex items-center justify-between border-b border-border">
          <h2 className="text-xl font-bold">{t('settings.syncQueue')}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {syncQueue.length === 0 && pendingDiagnoses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('settings.noQueuedItems')}
            </div>
          )}
          
          {/* Data changes */}
          {syncQueue.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t('settings.dataChanges')}
              </h3>
              <div className="space-y-2">
                {syncQueue.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.type} - {item.action}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item)}`}>
                          {item.retryCount >= 3 ? t('common.failed') : t('common.pending')}
                        </span>
                        {item.retryCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {t('settings.retries', { count: item.retryCount })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.retryCount >= 3 && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRetry(item.id)}
                          className="p-2 rounded-lg hover:bg-background"
                        >
                          <RotateCcw className="h-4 w-4 text-primary" />
                        </motion.button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveQueue(item.id)}
                        className="p-2 rounded-lg hover:bg-background"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pending uploads */}
          {pendingDiagnoses.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                {t('settings.pendingUploads')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pendingDiagnoses.map((diag) => (
                  <div 
                    key={diag.id}
                    className="relative rounded-xl overflow-hidden bg-muted"
                  >
                    {diag.imageBlob && (
                      <img 
                        src={URL.createObjectURL(diag.imageBlob)}
                        alt="Pending upload"
                        className="w-full h-24 object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDiagStatusColor(diag.status)}`}>
                        {t(`diagnosis.status.${diag.status}`)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveDiagnosis(diag.id)}
                        className="p-1.5 rounded-lg bg-background/80 hover:bg-background"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
