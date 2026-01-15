import { useState, useEffect, useRef } from 'react';
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
  Calendar,
  Check,
  Loader2,
  Sun,
  CloudRain,
  Snowflake,
  ChevronDown,
  ChevronRight,
  Info,
  Mic,
  Edit2,
  Sparkles,
  AlertTriangle,
  Grid3X3,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePlot, useUpdatePlot } from '@/hooks/use-api';
import { useConnectivityStore } from '@/stores/connectivity';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  scoreCrops, 
  getPlantingWindow, 
  isDateInWindow, 
  getFallbackCrops, 
  getContextWarnings,
  CROP_CATALOG,
  type PlotContext,
  type CropScore 
} from '@/lib/crop-recommendations';

// Icon mapping
const cropIcons: Record<string, LucideIcon> = {
  rice: Sprout,
  wheat: Wheat,
  maize: Leaf,
  cotton: Flower,
  tomato: Apple,
  potato: Carrot,
  sugarcane: TreePine,
  groundnut: CircleDot,
  other: CircleDot,
};

const cropColors: Record<string, string> = {
  rice: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  wheat: 'bg-amber-100 text-amber-700 border-amber-300',
  maize: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  cotton: 'bg-pink-100 text-pink-700 border-pink-300',
  tomato: 'bg-red-100 text-red-700 border-red-300',
  potato: 'bg-orange-100 text-orange-700 border-orange-300',
  sugarcane: 'bg-green-100 text-green-700 border-green-300',
  groundnut: 'bg-amber-100 text-amber-700 border-amber-300',
  other: 'bg-slate-100 text-slate-700 border-slate-300',
};

const SEASONS = [
  { id: 'monsoon' as const, icon: CloudRain, labelKey: 'planCrop.seasons.monsoon', color: 'bg-blue-100 text-blue-700 border-blue-300', period: 'Jun–Oct' },
  { id: 'winter' as const, icon: Snowflake, labelKey: 'planCrop.seasons.winter', color: 'bg-cyan-100 text-cyan-700 border-cyan-300', period: 'Oct–Mar' },
  { id: 'summer' as const, icon: Sun, labelKey: 'planCrop.seasons.summer', color: 'bg-orange-100 text-orange-700 border-orange-300', period: 'Mar–Jun' },
] as const;

export default function PlanCrop() {
  const { id: plotId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOnline } = useConnectivityStore();
  const recommendationsRef = useRef<HTMLDivElement>(null);
  
  const { data: plot, isLoading: isLoadingPlot } = usePlot(plotId || '');
  const updatePlot = useUpdatePlot();

  // State
  const [selectedSeason, setSelectedSeason] = useState<'monsoon' | 'winter' | 'summer' | null>(
    plot?.season || null
  );
  const [selectedCrop, setSelectedCrop] = useState<string | null>(plot?.cropType || null);
  const [cropSource, setCropSource] = useState<'recommended' | 'manual'>('recommended');
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    plot?.targetDate ? new Date(plot.targetDate) : undefined
  );
  const [recommendations, setRecommendations] = useState<CropScore[]>([]);
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);
  const [contextWarnings, setContextWarnings] = useState<string[]>([]);

  // Build plot context from available data
  const buildContext = (season: 'monsoon' | 'winter' | 'summer'): PlotContext => {
    const context: PlotContext = {
      season,
      location: plot?.location,
      irrigation: plot?.irrigationType,
      soil: plot?.soilType ? { type: plot.soilType } : undefined,
      equipment: [], // Would come from plot data if stored
      organicInputs: [], // Would come from plot data if stored
      previousCrops: plot?.cropType ? [plot.cropType] : [],
    };
    return context;
  };

  // Handle season selection
  const handleSeasonSelect = (season: 'monsoon' | 'winter' | 'summer') => {
    setSelectedSeason(season);
    setSelectedCrop(null);
    setCropSource('recommended');
    
    const context = buildContext(season);
    const scores = scoreCrops(context);
    setRecommendations(scores);
    setContextWarnings(getContextWarnings(context));

    // Smooth scroll to recommendations
    setTimeout(() => {
      recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle crop selection from recommendations
  const handleCropSelect = (cropId: string, source: 'recommended' | 'manual') => {
    setSelectedCrop(cropId);
    setCropSource(source);
    setShowAllCrops(false);
  };

  // Get planting window text
  const getPlantingWindowText = (): string | null => {
    if (!selectedSeason || !selectedCrop) return null;
    const window = getPlantingWindow(selectedCrop, selectedSeason);
    if (!window) return null;
    return `${window.start} – ${window.end}`;
  };

  // Check if selected date is outside window
  const isDateOutsideWindow = (): boolean => {
    if (!targetDate || !selectedCrop || !selectedSeason) return false;
    const window = getPlantingWindow(selectedCrop, selectedSeason);
    if (!window) return false;
    return !isDateInWindow(targetDate, window);
  };

  // Save handler
  const handleSave = async () => {
    if (!plotId) return;

    try {
      await updatePlot.mutateAsync({
        plotId,
        updates: {
          cropType: selectedCrop || undefined,
          season: selectedSeason || undefined,
          targetDate: targetDate?.toISOString(),
        },
      });

      if (!isOnline) {
        toast.success(t('common.savedLocally'), {
          description: t('common.willSyncWhenOnline'),
        });
      } else {
        toast.success(t('planCrop.saved'));
      }

      navigate(`/plots/${plotId}`);
    } catch (error) {
      toast.error(t('errors.generic'));
    }
  };

  // Skip handler (saves season only)
  const handleSkip = async () => {
    if (!plotId || !selectedSeason) {
      navigate(-1);
      return;
    }

    try {
      await updatePlot.mutateAsync({
        plotId,
        updates: {
          season: selectedSeason,
        },
      });
      navigate(`/plots/${plotId}`);
    } catch (error) {
      navigate(-1);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const selectedCropData = CROP_CATALOG.find(c => c.id === selectedCrop);
  const plantingWindowText = getPlantingWindowText();
  const dateOutsideWindow = isDateOutsideWindow();

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
          
          <h1 className="text-lg font-semibold">{t('planCrop.title')}</h1>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="touch-target">
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
            <AudioHelpButton size="md" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6 pb-32">
        {/* Page Subtitle */}
        <p className="text-muted-foreground text-center text-sm">
          {t('planCrop.subtitle')}
        </p>

        {/* Section A: Season Selection */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('planCrop.selectSeason')}
          </h3>
          
          <div className="grid grid-cols-3 gap-2">
            {SEASONS.map((season) => {
              const Icon = season.icon;
              const isSelected = selectedSeason === season.id;
              
              return (
                <motion.button
                  key={season.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSeasonSelect(season.id)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border-2 transition-all relative",
                    isSelected 
                      ? `${season.color} border-primary ring-2 ring-primary/20` 
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                  <Icon className={cn("h-6 w-6 mb-1", isSelected ? '' : 'text-muted-foreground')} />
                  <span className="text-xs font-medium">{t(season.labelKey)}</span>
                  <span className="text-[10px] text-muted-foreground">{season.period}</span>
                </motion.button>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {t('planCrop.seasonHelper')}
          </p>
        </Card>

        {/* Context Warnings */}
        <AnimatePresence>
          {contextWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {contextWarnings.map((warning, idx) => (
                <Card key={idx} className="p-3 bg-amber-50 border-amber-200 flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{warning}</p>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section B: AI Crop Recommendations */}
        <AnimatePresence>
          {selectedSeason && (
            <motion.div
              ref={recommendationsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t('planCrop.recommendedCrops')}
                </h3>

                {/* Top 3 Recommendations */}
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec, index) => {
                    const CropIcon = cropIcons[rec.cropId] || CircleDot;
                    const isSelected = selectedCrop === rec.cropId;
                    const isExpanded = expandedReasonId === rec.cropId;
                    
                    return (
                      <motion.div
                        key={rec.cropId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={cn(
                          "p-4 border-2 transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}>
                          <div className="flex items-start gap-3">
                            {/* Crop Icon & Score */}
                            <div className={cn(
                              "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                              cropColors[rec.cropId] || cropColors.other
                            )}>
                              <CropIcon className="h-6 w-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold">{t(`crops.types.${rec.cropId}`)}</h4>
                                <span className={cn(
                                  "text-sm font-medium px-2 py-0.5 rounded-full",
                                  rec.score >= 80 ? "bg-green-100 text-green-700" :
                                  rec.score >= 60 ? "bg-yellow-100 text-yellow-700" :
                                  "bg-orange-100 text-orange-700"
                                )}>
                                  {rec.score}% {t('planCrop.suitable')}
                                </span>
                              </div>
                              
                              {/* Reasons */}
                              <div className="mt-2 space-y-1">
                                {rec.reasons.slice(0, 3).map((reason, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-sm">
                                    <Check className={cn(
                                      "h-3.5 w-3.5 shrink-0",
                                      reason.positive ? "text-green-600" : "text-amber-600"
                                    )} />
                                    <span className="text-muted-foreground">{reason.text}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Expandable Why Section */}
                              <Collapsible open={isExpanded} onOpenChange={() => setExpandedReasonId(isExpanded ? null : rec.cropId)}>
                                <CollapsibleTrigger asChild>
                                  <button className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline">
                                    <Info className="h-3 w-3" />
                                    {t('planCrop.whyThis')}
                                    <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 p-2 bg-muted/50 rounded-lg text-xs space-y-1"
                                  >
                                    <div className="grid grid-cols-2 gap-1">
                                      <span>Soil Fit: {rec.factors.soilFit}%</span>
                                      <span>Water Fit: {rec.factors.waterFit}%</span>
                                      <span>Climate Fit: {rec.factors.climateFit}%</span>
                                      <span>Inputs Fit: {rec.factors.inputsFit}%</span>
                                      <span>Equipment: {rec.factors.equipmentFit}%</span>
                                      <span>Market: {rec.factors.marketFit}%</span>
                                    </div>
                                  </motion.div>
                                </CollapsibleContent>
                              </Collapsible>

                              {/* Choose Button */}
                              <Button
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className="mt-3"
                                onClick={() => handleCropSelect(rec.cropId, 'recommended')}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="h-4 w-4 mr-1" />
                                    {t('planCrop.chosen')}
                                  </>
                                ) : (
                                  t('planCrop.chooseCrop')
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Browse All Crops Button */}
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setShowAllCrops(!showAllCrops)}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  {t('planCrop.browseAll')}
                  <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", showAllCrops && "rotate-90")} />
                </Button>

                {/* All Crops Grid (Collapsible) */}
                <AnimatePresence>
                  {showAllCrops && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t mt-4">
                        <p className="text-sm text-muted-foreground mb-3">{t('planCrop.allCropsDesc')}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {CROP_CATALOG.map((crop) => {
                            const CropIcon = cropIcons[crop.id] || CircleDot;
                            const isSelected = selectedCrop === crop.id;
                            const isRecommended = recommendations.slice(0, 3).some(r => r.cropId === crop.id);
                            
                            return (
                              <motion.button
                                key={crop.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCropSelect(crop.id, isRecommended ? 'recommended' : 'manual')}
                                className={cn(
                                  "relative p-3 rounded-xl border-2 transition-all text-center",
                                  isSelected 
                                    ? `${cropColors[crop.id] || cropColors.other} border-primary ring-2 ring-primary/20` 
                                    : "border-border bg-background hover:border-primary/30"
                                )}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                  >
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                  </motion.div>
                                )}
                                
                                <div className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2",
                                  isSelected ? 'bg-white/50' : 'bg-muted'
                                )}>
                                  <CropIcon className={cn("h-5 w-5", isSelected ? '' : 'text-muted-foreground')} />
                                </div>
                                
                                <span className="text-xs font-medium block">
                                  {t(`crops.types.${crop.id}`)}
                                </span>
                              </motion.button>
                            );
                          })}
                          
                          {/* Other option */}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCropSelect('other', 'manual')}
                            className={cn(
                              "relative p-3 rounded-xl border-2 transition-all text-center",
                              selectedCrop === 'other'
                                ? `${cropColors.other} border-primary ring-2 ring-primary/20` 
                                : "border-border bg-background hover:border-primary/30"
                            )}
                          >
                            {selectedCrop === 'other' && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                              >
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </motion.div>
                            )}
                            
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2",
                              selectedCrop === 'other' ? 'bg-white/50' : 'bg-muted'
                            )}>
                              <CircleDot className={cn("h-5 w-5", selectedCrop === 'other' ? '' : 'text-muted-foreground')} />
                            </div>
                            
                            <span className="text-xs font-medium block">
                              {t('crops.types.other')}
                            </span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section C: Planting Date */}
        <AnimatePresence>
          {selectedSeason && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t('planCrop.targetDate')}
                  <span className="text-muted-foreground font-normal text-sm">({t('common.optional')})</span>
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
                      {targetDate ? format(targetDate, "PPP") : t('planCrop.pickDate')}
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

                {/* Recommended Window */}
                {plantingWindowText && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('planCrop.recommendedWindow')}: {plantingWindowText}
                  </p>
                )}

                {/* Warning if outside window */}
                {dateOutsideWindow && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{t('planCrop.outsideWindow')}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Section D: Summary & Save Footer */}
      <AnimatePresence>
        {selectedSeason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border"
          >
            {/* Summary Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSeason && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {SEASONS.find(s => s.id === selectedSeason)?.icon && (
                    <span>
                      {(() => {
                        const Icon = SEASONS.find(s => s.id === selectedSeason)?.icon;
                        return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
                      })()}
                    </span>
                  )}
                  {t(`planCrop.seasons.${selectedSeason}`)}
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
              
              {selectedCrop && (
                <button
                  onClick={() => recommendationsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {(() => {
                    const Icon = cropIcons[selectedCrop] || CircleDot;
                    return <Icon className="h-3.5 w-3.5" />;
                  })()}
                  {t(`crops.types.${selectedCrop}`)}
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
              
              {targetDate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(targetDate, "MMM d")}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={handleSkip}
              >
                {t('planCrop.skipForNow')}
              </Button>
              
              <Button
                size="lg"
                className="flex-[2] h-12"
                onClick={handleSave}
                disabled={updatePlot.isPending}
              >
                {updatePlot.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    {t('planCrop.savePlan')}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
