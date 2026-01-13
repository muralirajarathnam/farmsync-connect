import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Ruler,
  Wheat,
  Edit2,
  FlaskConical,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlots, useSoilData, useUpdateSoil, useUpdatePlot, useTasks } from '@/hooks/use-api';
import { useConnectivityStore } from '@/stores/connectivity';
import { SoilLevelBar } from '@/components/plots/SoilLevelBar';
import { PhSlider } from '@/components/plots/PhSlider';
import { MoistureMeter } from '@/components/plots/MoistureMeter';
import { CropPicker } from '@/components/plots/CropPicker';
import { EditSoilSheet } from '@/components/plots/EditSoilSheet';
import { SyncStatusIndicator } from '@/components/plots/SyncStatusIndicator';
import { TaskPreviewCard } from '@/components/dashboard/TaskPreviewCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { toast } from 'sonner';
import type { SoilData } from '@/types/api';

export default function PlotDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isOnline } = useConnectivityStore();
  
  const { data: plots, isLoading: plotsLoading } = usePlots();
  const { data: soilData, isLoading: soilLoading } = useSoilData(id || '');
  const { data: tasks } = useTasks(id);
  const updateSoil = useUpdateSoil();
  const updatePlot = useUpdatePlot();
  
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [showEditSoil, setShowEditSoil] = useState(false);
  const [localSyncStatus, setLocalSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  
  const plot = plots?.find(p => p.id === id);
  
  // Handle crop change
  const handleCropChange = async (crop: string) => {
    if (!plot) return;
    
    try {
      setLocalSyncStatus('pending');
      await updatePlot.mutateAsync({ plotId: plot.id, updates: { cropType: crop } });
      
      if (isOnline) {
        setLocalSyncStatus('synced');
        toast.success(t('common.synced'));
      } else {
        toast.info(t('common.savedLocally'));
      }
    } catch (error) {
      setLocalSyncStatus('error');
      toast.error(t('errors.syncError'));
    }
    
    setShowCropPicker(false);
  };
  
  // Handle soil update
  const handleSoilUpdate = async (updates: Partial<SoilData>) => {
    if (!id) return;
    
    try {
      setLocalSyncStatus('pending');
      await updateSoil.mutateAsync({ plotId: id, soil: updates });
      
      if (isOnline) {
        setLocalSyncStatus('synced');
        toast.success(t('common.synced'));
      } else {
        toast.info(t('common.savedLocally'));
      }
    } catch (error) {
      setLocalSyncStatus('error');
      toast.error(t('errors.syncError'));
    }
    
    setShowEditSoil(false);
  };
  
  // Update sync status when connectivity changes
  useEffect(() => {
    if (isOnline && localSyncStatus === 'pending') {
      // Attempt to sync pending changes
      setLocalSyncStatus('synced');
    }
  }, [isOnline, localSyncStatus]);

  if (plotsLoading || !plot) {
    return (
      <div className="px-4 py-6 space-y-4">
        <SkeletonCard className="h-20" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-60" />
      </div>
    );
  }

  const plotTasks = tasks?.filter(task => task.status !== 'completed').slice(0, 3);

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{plot.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {plot.locationLabel || 'No location set'}
            </p>
          </div>
        </div>
        
        {/* Sync Status */}
        <SyncStatusIndicator status={localSyncStatus} className="mx-4 mb-3" />
      </motion.div>

      <div className="px-4 py-6 space-y-6">
        {/* Plot Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="farm-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Area */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('plots.area')}</p>
                  <p className="font-semibold text-foreground">
                    {plot.area} {t(`plots.${plot.areaUnit || 'hectares'}`)}
                  </p>
                </div>
              </div>
            </div>

            {/* Crop Type */}
            <button
              onClick={() => setShowCropPicker(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 hover:bg-success/20 transition-colors"
            >
              <Wheat className="h-5 w-5 text-success" />
              <span className="font-medium text-success">{plot.cropType || 'Select Crop'}</span>
              <Edit2 className="h-4 w-4 text-success/60" />
            </button>
          </div>
        </motion.div>

        {/* Soil Data Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {t('soil.title')}
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditSoil(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              {t('common.edit')}
            </Button>
          </div>

          {soilLoading ? (
            <SkeletonCard className="h-80" />
          ) : soilData ? (
            <div className="farm-card space-y-6">
              {/* pH Slider */}
              <PhSlider value={soilData.ph} />
              
              <div className="border-t pt-4" />
              
              {/* NPK Level Bars */}
              <SoilLevelBar
                label={t('soil.nitrogen')}
                value={soilData.n}
                min={0}
                max={100}
                optimalMin={25}
                optimalMax={50}
                unit=" kg/ha"
                colorScheme="nitrogen"
              />
              
              <SoilLevelBar
                label={t('soil.phosphorus')}
                value={soilData.p}
                min={0}
                max={80}
                optimalMin={15}
                optimalMax={30}
                unit=" kg/ha"
                colorScheme="phosphorus"
              />
              
              <SoilLevelBar
                label={t('soil.potassium')}
                value={soilData.k}
                min={0}
                max={300}
                optimalMin={150}
                optimalMax={250}
                unit=" kg/ha"
                colorScheme="potassium"
              />
              
              <div className="border-t pt-4" />
              
              {/* Moisture Meter */}
              {soilData.moisture !== undefined && (
                <MoistureMeter value={soilData.moisture} />
              )}
            </div>
          ) : (
            <div className="farm-card text-center py-8">
              <p className="text-muted-foreground">{t('common.noData')}</p>
            </div>
          )}
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              {t('tasks.title')}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/planning')}
              className="text-primary"
            >
              {t('common.viewAll')}
            </Button>
          </div>

          <div className="space-y-2">
            {plotTasks && plotTasks.length > 0 ? (
              plotTasks.map((task, index) => (
                <TaskPreviewCard key={task.id} task={task} index={index} />
              ))
            ) : (
              <div className="farm-card text-center py-6">
                <p className="text-muted-foreground">{t('tasks.noTasks')}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCropPicker && (
          <CropPicker
            currentCrop={plot.cropType}
            onSelect={handleCropChange}
            onCancel={() => setShowCropPicker(false)}
          />
        )}
        
        {showEditSoil && soilData && (
          <EditSoilSheet
            soil={soilData}
            onSave={handleSoilUpdate}
            onCancel={() => setShowEditSoil(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
