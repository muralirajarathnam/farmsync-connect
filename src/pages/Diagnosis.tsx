import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  WifiOff,
  Trash2,
  RefreshCw,
  Mic,
  Leaf,
  CloudUpload,
  Wifi,
  AlertTriangle,
  X
} from 'lucide-react';
import { useConnectivityStore } from '@/stores/connectivity';
import { 
  addPendingDiagnosis, 
  getPendingDiagnoses, 
  removePendingDiagnosis,
  updatePendingDiagnosis
} from '@/lib/offline-storage';
import { useInitUpload, useDiagnosis } from '@/hooks/use-api';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ContextParametersIndicator } from '@/components/diagnosis/ContextParametersIndicator';
import { toast } from 'sonner';
import type { DiagnosisResult, PendingDiagnosis } from '@/types/api';

const MAX_FILE_SIZE_MB = 5;
const WARN_FILE_SIZE_MB = 2;

export default function DiagnosisPage() {
  const { t } = useTranslation();
  const { isOnline } = useConnectivityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingDiagnosis[]>([]);
  const [wifiOnlyUpload, setWifiOnlyUpload] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  const initUpload = useInitUpload();
  const diagnosis = useDiagnosis();
  
  // Load pending diagnoses
  useEffect(() => {
    loadPendingUploads();
  }, []);
  
  // Auto-upload when back online
  useEffect(() => {
    if (isOnline && pendingUploads.length > 0 && !wifiOnlyUpload) {
      // Auto-process pending uploads
      processNextPending();
    }
  }, [isOnline, pendingUploads.length, wifiOnlyUpload]);
  
  const loadPendingUploads = async () => {
    const pending = await getPendingDiagnoses();
    setPendingUploads(pending);
  };
  
  const processNextPending = async () => {
    const next = pendingUploads.find(p => p.status === 'pending');
    if (next && !isUploading) {
      await handleRetryPending(next);
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        toast.error(t('diagnosis.fileTooLarge'));
        return;
      }
      setFileSize(sizeMB);
      processFile(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };
  
  const handleCameraCapture = () => {
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
      toast.info(t('common.savedLocally'));
      setSelectedImage(null);
      setSelectedBlob(null);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const uploadResponse = await initUpload.mutateAsync();
      const diagnosisResult = await diagnosis.mutateAsync({ 
        fileId: uploadResponse.fileId 
      });
      setResult(diagnosisResult);
      toast.success(t('diagnosis.diagnosisReady'));
    } catch (error) {
      console.error('Diagnosis failed:', error);
      await addPendingDiagnosis(selectedBlob);
      await loadPendingUploads();
      toast.error(t('errors.uploadError'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleRemovePending = async (id: string) => {
    await removePendingDiagnosis(id);
    await loadPendingUploads();
    toast.info(t('common.delete'));
  };
  
  const handleRetryPending = async (pending: PendingDiagnosis) => {
    if (!isOnline) {
      toast.error(t('errors.network'));
      return;
    }
    
    setIsUploading(pending.id);
    
    try {
      await updatePendingDiagnosis(pending.id, { status: 'uploading' });
      await loadPendingUploads();
      
      const uploadResponse = await initUpload.mutateAsync();
      const diagnosisResult = await diagnosis.mutateAsync({ 
        fileId: uploadResponse.fileId 
      });
      
      await removePendingDiagnosis(pending.id);
      await loadPendingUploads();
      setResult(diagnosisResult);
      toast.success(t('diagnosis.diagnosisReady'));
    } catch (error) {
      await updatePendingDiagnosis(pending.id, { status: 'error' });
      await loadPendingUploads();
      toast.error(t('errors.uploadError'));
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleVoiceAsk = () => {
    toast.info(t('common.comingSoon'));
  };
  
  const handlePlayAudio = () => {
    toast.info(t('common.audioPlaying'));
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!selectedImage && !result ? (
          // Main capture interface
          <MainCaptureView
            key="capture"
            onCameraCapture={handleCameraCapture}
            onGallerySelect={handleGallerySelect}
            onVoiceAsk={handleVoiceAsk}
            pendingUploads={pendingUploads}
            isOnline={isOnline}
            wifiOnlyUpload={wifiOnlyUpload}
            setWifiOnlyUpload={setWifiOnlyUpload}
            onRemovePending={handleRemovePending}
            onRetryPending={handleRetryPending}
            isUploading={isUploading}
          />
        ) : selectedImage && !result ? (
          // Image preview
          <ImagePreviewView
            key="preview"
            imageUrl={selectedImage}
            fileSize={fileSize}
            isOnline={isOnline}
            isAnalyzing={isAnalyzing}
            onCancel={() => {
              setSelectedImage(null);
              setSelectedBlob(null);
            }}
            onAnalyze={handleAnalyze}
          />
        ) : result ? (
          // Diagnosis result
          <DiagnosisResultView
            key="result"
            result={result}
            onNewScan={() => {
              setResult(null);
              setSelectedImage(null);
              setSelectedBlob(null);
            }}
            onPlayAudio={handlePlayAudio}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Main capture view with big button
function MainCaptureView({
  onCameraCapture,
  onGallerySelect,
  onVoiceAsk,
  pendingUploads,
  isOnline,
  wifiOnlyUpload,
  setWifiOnlyUpload,
  onRemovePending,
  onRetryPending,
  isUploading,
}: {
  onCameraCapture: () => void;
  onGallerySelect: () => void;
  onVoiceAsk: () => void;
  pendingUploads: PendingDiagnosis[];
  isOnline: boolean;
  wifiOnlyUpload: boolean;
  setWifiOnlyUpload: (v: boolean) => void;
  onRemovePending: (id: string) => void;
  onRetryPending: (pending: PendingDiagnosis) => void;
  isUploading: string | null;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('diagnosis.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('diagnosis.subtitle')}</p>
        </div>
        <AudioHelpButton size="md" />
      </div>

      {/* HUGE Primary Action Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onCameraCapture}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 shadow-xl"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0 animate-pulse" />
        
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Leaf className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-foreground">
              {t('diagnosis.checkHealth')}
            </p>
            <p className="text-primary-foreground/80 mt-1">
              {t('diagnosis.tapToScan')}
            </p>
          </div>
        </div>
      </motion.button>

      {/* Secondary actions row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onGallerySelect}
          className="farm-card flex items-center justify-center gap-3 py-4"
        >
          <Upload className="h-6 w-6 text-primary" />
          <span className="font-medium text-foreground">{t('diagnosis.uploadPhoto')}</span>
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onVoiceAsk}
          className="farm-card flex items-center justify-center gap-3 py-4 opacity-70"
        >
          <Mic className="h-6 w-6 text-info" />
          <span className="font-medium text-foreground">{t('diagnosis.askVoice')}</span>
        </motion.button>
      </div>

      {/* Wi-Fi Only Toggle with Context Parameters */}
      <div className="farm-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">{t('diagnosis.wifiOnly')}</p>
              <p className="text-sm text-muted-foreground">{t('diagnosis.wifiOnlyDesc')}</p>
            </div>
          </div>
          <Switch
            checked={wifiOnlyUpload}
            onCheckedChange={setWifiOnlyUpload}
          />
        </div>
        
        {/* Context Parameters Indicator */}
        <div className="border-t border-border pt-4">
          <ContextParametersIndicator />
        </div>
      </div>

      {/* Pending Uploads */}
      {pendingUploads.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-warning" />
              {t('diagnosis.pendingUploads')} ({pendingUploads.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {pendingUploads.map((pending) => (
              <PendingUploadCard
                key={pending.id}
                pending={pending}
                onRemove={() => onRemovePending(pending.id)}
                onRetry={() => onRetryPending(pending)}
                isOnline={isOnline}
                isUploading={isUploading === pending.id}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* History placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="farm-card"
      >
        <h3 className="font-semibold text-foreground mb-3">{t('diagnosis.history')}</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Leaf className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('diagnosis.noDiagnosis')}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Image preview with file size warning
function ImagePreviewView({
  imageUrl,
  fileSize,
  isOnline,
  isAnalyzing,
  onCancel,
  onAnalyze,
}: {
  imageUrl: string;
  fileSize: number;
  isOnline: boolean;
  isAnalyzing: boolean;
  onCancel: () => void;
  onAnalyze: () => void;
}) {
  const { t } = useTranslation();
  const showWarning = fileSize > WARN_FILE_SIZE_MB;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="px-4 py-6 space-y-4"
    >
      {/* Image preview */}
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <img 
          src={imageUrl} 
          alt="Crop to diagnose"
          className="w-full aspect-[4/3] object-cover"
        />
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Offline banner */}
        {!isOnline && (
          <div className="absolute inset-x-0 bottom-0 bg-warning/90 px-4 py-3 flex items-center justify-center gap-2">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">{t('diagnosis.uploadWhenOnline')}</span>
          </div>
        )}
      </div>

      {/* File size warning */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30"
        >
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="font-medium text-warning">{t('diagnosis.largeFile')}</p>
            <p className="text-sm text-muted-foreground">
              {fileSize.toFixed(1)} MB • {t('diagnosis.mayTakeLonger')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          size="lg"
          className="flex-1 h-14 gap-2"
          onClick={onAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('diagnosis.analyzing')}
            </>
          ) : (
            <>
              <Leaf className="h-5 w-5" />
              {isOnline ? t('diagnosis.analyze') : t('diagnosis.saveForLater')}
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// Diagnosis result with confidence bar
function DiagnosisResultView({
  result,
  onNewScan,
  onPlayAudio,
}: {
  result: DiagnosisResult;
  onNewScan: () => void;
  onPlayAudio: () => void;
}) {
  const { t } = useTranslation();
  const confidencePercent = Math.round(result.confidence * 100);
  
  const getConfidenceColor = () => {
    if (confidencePercent >= 80) return 'text-success';
    if (confidencePercent >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStepIcon = (hint: string) => {
    const icons: Record<string, string> = {
      scissors: '✂️',
      spray: '🧴',
      droplet: '💧',
      eye: '👁️',
      hand: '✋',
      clock: '⏰',
    };
    return icons[hint] || '📋';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="px-4 py-6 space-y-4"
    >
      {/* Result header */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="farm-card border-warning/30 bg-gradient-to-br from-warning/10 to-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/20">
            <AlertCircle className="h-7 w-7 text-warning" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{result.label}</h2>
            <p className="text-muted-foreground mt-1">{t('diagnosis.result')}</p>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('diagnosis.confidence')}</span>
            <span className={`font-bold ${getConfidenceColor()}`}>
              {confidencePercent}%
            </span>
          </div>
          <Progress 
            value={confidencePercent} 
            className="h-3"
          />
        </div>

        {/* Summary */}
        <p className="mt-4 text-foreground leading-relaxed">
          {result.summary}
        </p>

        {/* Audio button */}
        {result.audioAvailable && (
          <Button
            variant="outline"
            className="w-full mt-4 gap-2 h-12"
            onClick={onPlayAudio}
          >
            <Volume2 className="h-5 w-5 text-primary" />
            {t('diagnosis.playAudio')}
          </Button>
        )}
      </motion.div>

      {/* Treatment Steps */}
      <div className="farm-card">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          {t('diagnosis.steps')}
        </h3>
        
        <div className="space-y-4">
          {result.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              {/* Step number with icon */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl">
                  {getStepIcon(step.iconHint)}
                </div>
                <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <button
                    onClick={onPlayAudio}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {step.details}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New scan button */}
      <Button
        size="lg"
        className="w-full h-14 gap-2"
        onClick={onNewScan}
      >
        <Camera className="h-5 w-5" />
        {t('diagnosis.scanAnother')}
      </Button>
    </motion.div>
  );
}

// Pending upload card with status
function PendingUploadCard({
  pending,
  onRemove,
  onRetry,
  isOnline,
  isUploading,
}: {
  pending: PendingDiagnosis;
  onRemove: () => void;
  onRetry: () => void;
  isOnline: boolean;
  isUploading: boolean;
}) {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    const url = URL.createObjectURL(pending.imageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending.imageBlob]);

  const getStatusBadge = () => {
    if (isUploading) {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          {t('diagnosis.uploading')}
        </span>
      );
    }
    if (pending.status === 'error') {
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">
          <AlertCircle className="h-3 w-3" />
          {t('common.syncFailed')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">
        <WifiOff className="h-3 w-3" />
        {t('diagnosis.queued')}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="farm-card flex items-center gap-3 p-3"
    >
      {/* Thumbnail */}
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
        {imageUrl && (
          <img src={imageUrl} alt="Pending" className="h-full w-full object-cover" />
        )}
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(pending.createdAt).toLocaleTimeString()}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex gap-1">
        {isOnline && !isUploading && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onRetry}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          disabled={isUploading}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
