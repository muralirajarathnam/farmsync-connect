import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, FileText, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioHelpButton } from '@/components/AudioHelpButton';
import { useCreatePlot } from '@/hooks/use-api';
import { useConnectivityStore } from '@/stores/connectivity';
import { toast } from 'sonner';
import type { Plot, PlotLocation } from '@/types/api';

import { LocationStep } from '@/components/create-plot/LocationStep';
import { DetailsStep } from '@/components/create-plot/DetailsStep';
import { WeatherStep } from '@/components/create-plot/WeatherStep';

interface PlotDraft {
  name: string;
  location?: PlotLocation;
  area?: number;
  areaUnit: 'hectares' | 'acres';
  soilType?: 'sandy' | 'clay' | 'loam' | 'silt';
  irrigationType?: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
}

const STEPS = [
  { id: 1, icon: MapPin, labelKey: 'createPlot.steps.location' },
  { id: 2, icon: FileText, labelKey: 'createPlot.steps.details' },
  { id: 3, icon: Cloud, labelKey: 'createPlot.steps.weather' },
];

export default function CreatePlot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isOnline } = useConnectivityStore();
  const createPlot = useCreatePlot();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [plotDraft, setPlotDraft] = useState<PlotDraft>({
    name: '',
    areaUnit: 'acres',
  });
  const [createdPlot, setCreatedPlot] = useState<Plot | null>(null);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handleLocationSelect = (location: PlotLocation) => {
    setPlotDraft(prev => ({ ...prev, location }));
    setCurrentStep(2);
  };

  const handleDetailsComplete = async (details: Partial<PlotDraft>) => {
    const finalDraft = { ...plotDraft, ...details };
    setPlotDraft(finalDraft);
    
    // Create the plot
    try {
      const plotData: Omit<Plot, 'id' | 'updatedAt' | 'syncStatus'> = {
        name: finalDraft.name || `Plot ${Date.now()}`,
        area: finalDraft.area,
        areaUnit: finalDraft.areaUnit,
        location: finalDraft.location,
        locationLabel: finalDraft.location?.label,
        soilType: finalDraft.soilType,
        irrigationType: finalDraft.irrigationType,
      };
      
      const newPlot = await createPlot.mutateAsync(plotData);
      setCreatedPlot(newPlot);
      
      if (!isOnline) {
        toast.success(t('common.savedLocally'), {
          description: t('common.willSyncWhenOnline'),
        });
      } else {
        toast.success(t('createPlot.success'));
      }
      
      setCurrentStep(3);
    } catch (error) {
      toast.error(t('errors.generic'));
    }
  };

  const handleFinish = () => {
    if (createdPlot) {
      navigate(`/plots/${createdPlot.id}/crop`);
    } else {
      navigate('/');
    }
  };

  const handleSkipCrop = () => {
    navigate('/');
  };

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
          
          <h1 className="text-lg font-semibold">{t('createPlot.title')}</h1>
          
          <AudioHelpButton size="md" />
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted 
                          ? 'hsl(var(--primary))' 
                          : isActive 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--muted))',
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-primary-foreground" />
                      ) : (
                        <Icon className={`h-6 w-6 ${isActive || isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      )}
                    </motion.div>
                    <span className={`text-xs font-medium text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {t(step.labelKey)}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <LocationStep
                initialLocation={plotDraft.location}
                onSelect={handleLocationSelect}
                isOnline={isOnline}
              />
            </motion.div>
          )}
          
          {currentStep === 2 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <DetailsStep
                initialData={plotDraft}
                onComplete={handleDetailsComplete}
                isLoading={createPlot.isPending}
              />
            </motion.div>
          )}
          
          {currentStep === 3 && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <WeatherStep
                location={plotDraft.location}
                plotName={createdPlot?.name || plotDraft.name}
                isOnline={isOnline}
                onChooseCrop={handleFinish}
                onSkip={handleSkipCrop}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
