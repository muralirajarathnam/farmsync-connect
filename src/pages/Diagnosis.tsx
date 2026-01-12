import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ChevronRight,
  WifiOff,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useConnectivityStore } from '@/stores/connectivity';
import { 
  addPendingDiagnosis, 
  getPendingDiagnoses, 
  removePendingDiagnosis 
} from '@/lib/offline-storage';
import { useInitUpload, useDiagnosis } from '@/hooks/use-api';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { IconActionCard } from '@/components/IconActionCard';
import { StatusBadge } from '@/components/StatusBadge';
import type { DiagnosisResult, PendingDiagnosis } from '@/types/api';

export default function DiagnosisPage() {
  const { t } = useTranslation();
  const { isOnline } = useConnectivityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingDiagnosis[]>([]);
  
  const initUpload = useInitUpload();
  const diagnosis = useDiagnosis();
  
  // Load pending diagnoses
  useEffect(() => {
    loadPendingUploads();
  }, []);
  
  const loadPendingUploads = async () => {
    const pending = await getPendingDiagnoses();
    setPendingUploads(pending);
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleCameraCapture = () => {
    // Trigger file input with camera capture
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };
  
  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  const processFile = (file: File) => {
    setSelectedBlob(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setResult(null);
  };
  
  const handleAnalyze = async () => {
    if (!selectedBlob) return;
    
    if (!isOnline) {
      // Save for later upload
      await addPendingDiagnosis(selectedBlob);
      await loadPendingUploads();
      setSelectedImage(null);
      setSelectedBlob(null);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // In real app: upload to GCS, then get diagnosis
      const uploadResponse = await initUpload.mutateAsync();
      const diagnosisResult = await diagnosis.mutateAsync({ 
        fileId: uploadResponse.fileId 
      });
      setResult(diagnosisResult);
    } catch (error) {
      console.error('Diagnosis failed:', error);
      // Save locally on failure
      await addPendingDiagnosis(selectedBlob);
      await loadPendingUploads();
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleRemovePending = async (id: string) => {
    await removePendingDiagnosis(id);
    await loadPendingUploads();
  };
  
  const handleRetryPending = async (pending: PendingDiagnosis) => {
    if (!isOnline) return;
    
    // Convert blob to image and process
    const url = URL.createObjectURL(pending.imageBlob);
    setSelectedImage(url);
    setSelectedBlob(pending.imageBlob);
    await handleRemovePending(pending.id);
  };
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('diagnosis.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('diagnosis.noPhoto')}
              </p>
            </div>
          </div>
          <AudioHelpButton size="md" />
        </div>
      </header>
      
      <div className="px-4 pb-6 space-y-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Action buttons */}
        {!selectedImage && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <IconActionCard
              icon={Camera}
              label={t('diagnosis.takePhoto')}
              onClick={handleCameraCapture}
              variant="primary"
              size="lg"
            />
            <IconActionCard
              icon={Upload}
              label={t('diagnosis.uploadPhoto')}
              onClick={handleGallerySelect}
              variant="default"
              size="lg"
            />
          </motion.div>
        )}
        
        {/* Selected image preview */}
        {selectedImage && !result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="relative overflow-hidden rounded-2xl bg-muted">
              <img 
                src={selectedImage} 
                alt="Crop to diagnose"
                className="w-full aspect-[4/3] object-cover"
              />
              {!isOnline && (
                <div className="absolute inset-x-0 top-0 bg-warning/90 px-4 py-2 flex items-center justify-center gap-2">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">{t('diagnosis.uploadWhenOnline')}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedBlob(null);
                }}
                className="flex-1 rounded-xl border border-border py-4 font-medium transition-colors hover:bg-muted"
              >
                {t('common.cancel')}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 rounded-xl bg-primary py-4 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('diagnosis.analyzing')}
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    {isOnline ? t('diagnosis.analyzing').replace('...', '') : t('common.save')}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Diagnosis Result */}
        {result && (
          <DiagnosisResultCard result={result} onNewScan={() => {
            setResult(null);
            setSelectedImage(null);
            setSelectedBlob(null);
          }} />
        )}
        
        {/* Pending Uploads */}
        {pendingUploads.length > 0 && !selectedImage && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-muted-foreground" />
              {t('diagnosis.pendingUpload')}
            </h3>
            
            {pendingUploads.map((pending) => (
              <PendingUploadCard
                key={pending.id}
                pending={pending}
                onRemove={() => handleRemovePending(pending.id)}
                onRetry={() => handleRetryPending(pending)}
                isOnline={isOnline}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DiagnosisResultCard({ result, onNewScan }: { result: DiagnosisResult; onNewScan: () => void }) {
  const { t } = useTranslation();
  
  const getIconForHint = (hint: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      scissors: () => <span className="text-lg">✂️</span>,
      spray: () => <span className="text-lg">🧴</span>,
      droplet: () => <span className="text-lg">💧</span>,
      eye: () => <span className="text-lg">👁️</span>,
    };
    const Icon = icons[hint] || (() => <span className="text-lg">📋</span>);
    return <Icon />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main result */}
      <div className="farm-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/20">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{result.label}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {t('diagnosis.confidence')}:
                </span>
                <StatusBadge status={result.confidence > 0.8 ? 'healthy' : 'warning'}>
                  {Math.round(result.confidence * 100)}%
                </StatusBadge>
              </div>
            </div>
          </div>
          {result.audioAvailable && (
            <AudioHelpButton size="lg" />
          )}
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {result.summary}
        </p>
      </div>
      
      {/* Treatment Steps */}
      <div className="farm-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          {t('diagnosis.steps')}
        </h3>
        
        <div className="space-y-4">
          {result.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                {getIconForHint(step.iconHint)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{step.title}</h4>
                  <AudioHelpButton size="sm" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* New scan button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNewScan}
        className="w-full rounded-xl bg-primary py-4 font-medium text-primary-foreground shadow-sm"
      >
        {t('diagnosis.takePhoto')}
      </motion.button>
    </motion.div>
  );
}

function PendingUploadCard({ 
  pending, 
  onRemove, 
  onRetry, 
  isOnline 
}: { 
  pending: PendingDiagnosis; 
  onRemove: () => void;
  onRetry: () => void;
  isOnline: boolean;
}) {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    const url = URL.createObjectURL(pending.imageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending.imageBlob]);
  
  return (
    <div className="farm-card flex items-center gap-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {imageUrl && (
          <img src={imageUrl} alt="Pending" className="h-full w-full object-cover" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{t('diagnosis.pendingUpload')}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(pending.createdAt).toLocaleString()}
        </p>
        <StatusBadge status="pending" className="mt-1">
          {pending.status === 'error' ? t('common.syncFailed') : t('common.pendingSync')}
        </StatusBadge>
      </div>
      
      <div className="flex gap-2">
        {isOnline && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onRetry}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <RefreshCw className="h-5 w-5" />
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
        >
          <Trash2 className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
}
