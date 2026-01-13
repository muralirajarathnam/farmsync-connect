import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Sprout, 
  Wheat, 
  Leaf, 
  Flower, 
  Apple, 
  Carrot,
  TreePine,
  CircleDot,
  HelpCircle,
  Calendar,
  Check,
  Loader2,
  Sun,
  CloudRain,
  Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlot, useUpdatePlot } from '@/hooks/use-api';
import { useConnectivityStore } from '@/stores/connectivity';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Crop data with icons
const CROPS = [
  { id: 'rice', name: 'Rice', icon: Sprout, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'wheat', name: 'Wheat', icon: Wheat, color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'maize', name: 'Maize', icon: Leaf, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { id: 'cotton', name: 'Cotton', icon: Flower, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { id: 'tomato', name: 'Tomato', icon: Apple, color: 'bg-red-100 text-red-700 border-red-300' },
  { id: 'potato', name: 'Potato', icon: Carrot, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { id: 'sugarcane', name: 'Sugarcane', icon: TreePine, color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'other', name: 'Other', icon: CircleDot, color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const SEASONS = [
  { id: 'kharif', icon: CloudRain, labelKey: 'crops.seasons.kharif', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'rabi', icon: Snowflake, labelKey: 'crops.seasons.rabi', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  { id: 'zaid', icon: Sun, labelKey: 'crops.seasons.zaid', color: 'bg-orange-100 text-orange-700 border-orange-300' },
] as const;

export default function CropSelection() {
  const { id: plotId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOnline } = useConnectivityStore();
  
  const { data: plot, isLoading: isLoadingPlot } = usePlot(plotId || '');
  const updatePlot = useUpdatePlot();

  const [selectedCrop, setSelectedCrop] = useState<string | null>(plot?.cropType || null);
  const [selectedSeason, setSelectedSeason] = useState<'kharif' | 'rabi' | 'zaid' | null>(plot?.season || null);
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    plot?.targetDate ? new Date(plot.targetDate) : undefined
  );
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const handleCropSelect = (cropId: string) => {
    setSelectedCrop(cropId);
    setShowSeasonPicker(true);
  };

  const handleSave = async () => {
    if (!plotId || !selectedCrop) return;

    try {
      await updatePlot.mutateAsync({
        plotId,
        updates: {
          cropType: selectedCrop,
          season: selectedSeason || undefined,
          targetDate: targetDate?.toISOString(),
        },
      });

      if (!isOnline) {
        toast.success(t('common.savedLocally'), {
          description: t('common.willSyncWhenOnline'),
        });
      } else {
        toast.success(t('crops.saved'));
      }

      navigate(`/plots/${plotId}`);
    } catch (error) {
      toast.error(t('errors.generic'));
    }
  };

  const handleBack = () => {
    if (showSeasonPicker && !selectedSeason) {
      setShowSeasonPicker(false);
    } else {
      navigate(-1);
    }
  };

  const selectedCropData = CROPS.find(c => c.id === selectedCrop);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-lg font-semibold">{t('crops.selectCrop')}</h1>
          
          <AudioHelpButton size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!showSeasonPicker ? (
            /* Crop Selection Grid */
            <motion.div
              key="crops"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground text-center mb-6">
                {t('crops.selectCropDesc')}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {CROPS.map((crop) => {
                  const Icon = crop.icon;
                  const isSelected = selectedCrop === crop.id;
                  
                  return (
                    <motion.button
                      key={crop.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCropSelect(crop.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left",
                        isSelected 
                          ? `${crop.color} border-primary ring-2 ring-primary/20` 
                          : "border-border bg-background hover:border-primary/30"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                      
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center mb-3",
                        isSelected ? 'bg-white/50' : 'bg-muted'
                      )}>
                        <Icon className={cn("h-6 w-6", isSelected ? '' : 'text-muted-foreground')} />
                      </div>
                      
                      <span className="font-semibold block">
                        {t(`crops.types.${crop.id}`)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Not Sure Helper */}
              <Card className="p-4 mt-6 bg-muted/50">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('crops.notSure')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('crops.notSureDesc')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            /* Season & Date Selection */
            <motion.div
              key="season"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Selected Crop Card */}
              {selectedCropData && (
                <Card className={cn("p-4", selectedCropData.color)}>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/50 flex items-center justify-center">
                      <selectedCropData.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold">{t(`crops.types.${selectedCrop}`)}</p>
                      <p className="text-sm opacity-80">{t('crops.selectedCrop')}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Season Selection */}
              <div>
                <h3 className="font-semibold mb-3">{t('crops.selectSeason')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {SEASONS.map((season) => {
                    const Icon = season.icon;
                    const isSelected = selectedSeason === season.id;
                    
                    return (
                      <motion.button
                        key={season.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSeason(isSelected ? null : season.id)}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                          isSelected 
                            ? `${season.color} border-primary` 
                            : "border-border bg-background hover:border-primary/30"
                        )}
                      >
                        <Icon className={cn("h-6 w-6 mb-2", isSelected ? '' : 'text-muted-foreground')} />
                        <span className="text-sm font-medium">{t(season.labelKey)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Target Date (Optional) */}
              <div>
                <h3 className="font-semibold mb-3">
                  {t('crops.targetDate')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
                </h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, "PPP") : t('crops.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save Button */}
      {showSeasonPicker && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border bg-background"
        >
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold"
            onClick={handleSave}
            disabled={updatePlot.isPending || !selectedCrop}
          >
            {updatePlot.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                {t('common.save')}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
