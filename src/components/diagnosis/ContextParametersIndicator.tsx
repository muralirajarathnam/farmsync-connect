import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Cloud, 
  Sprout, 
  FlaskConical, 
  Wheat,
  Check,
  AlertCircle,
  X,
  ChevronDown,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlots } from '@/hooks/use-api';

type ParameterStatus = 'used' | 'update-needed' | 'not-available';

interface Parameter {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  status: ParameterStatus;
  linkTo?: string;
}

// Placeholder data per plot - in real implementation this would come from API
const getPlotData = (plotId: string | null) => {
  if (!plotId) {
    return {
      locationAvailable: false,
      weatherAvailable: false,
      soilAvailable: false,
      inputsAvailable: false,
      cropProfileAvailable: false,
    };
  }
  // Simulated data - different plots have different data availability
  return {
    locationAvailable: true,
    weatherAvailable: true,
    soilAvailable: plotId !== 'demo-1', // Some plots missing soil data
    inputsAvailable: false, // Inputs generally not tracked yet
    cropProfileAvailable: true,
  };
};

function getStatusIcon(status: ParameterStatus) {
  switch (status) {
    case 'used':
      return <Check className="h-3.5 w-3.5 text-success" />;
    case 'update-needed':
      return <AlertCircle className="h-3.5 w-3.5 text-warning" />;
    case 'not-available':
      return <X className="h-3.5 w-3.5 text-destructive" />;
  }
}

function getStatusColor(status: ParameterStatus) {
  switch (status) {
    case 'used':
      return 'border-success/30 bg-success/10';
    case 'update-needed':
      return 'border-warning/30 bg-warning/10';
    case 'not-available':
      return 'border-destructive/30 bg-destructive/10';
  }
}

function ParameterIcon({ 
  param, 
  isActive,
  selectedPlotId,
}: { 
  param: Parameter; 
  isActive: boolean;
  selectedPlotId: string | null;
}) {
  const { t } = useTranslation();
  const isInteractive = param.status !== 'used' && param.linkTo && isActive;
  
  // Build link with plot context if available
  const linkWithContext = param.linkTo && selectedPlotId 
    ? `${param.linkTo}/${selectedPlotId}` 
    : param.linkTo;
  
  const content = (
    <motion.div
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 min-w-[72px] transition-all',
        isActive ? getStatusColor(param.status) : 'border-muted/30 bg-muted/10 opacity-50',
        isInteractive && 'cursor-pointer active:opacity-80'
      )}
    >
      <div className="relative">
        {param.icon}
        {isActive && (
          <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
            {getStatusIcon(param.status)}
          </div>
        )}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
        {t(param.labelKey)}
      </span>
    </motion.div>
  );

  if (isInteractive && linkWithContext) {
    return <Link to={linkWithContext}>{content}</Link>;
  }

  return content;
}

interface ContextParametersIndicatorProps {
  className?: string;
  onPlotChange?: (plotId: string | null) => void;
}

export function ContextParametersIndicator({ className, onPlotChange }: ContextParametersIndicatorProps) {
  const { t } = useTranslation();
  const { data: plots = [], isLoading: plotsLoading } = usePlots();
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  const isActive = selectedPlotId !== null;
  const plotData = useMemo(() => getPlotData(selectedPlotId), [selectedPlotId]);

  // Build parameters based on selected plot's data
  const parameters: Parameter[] = [
    {
      id: 'location',
      icon: <MapPin className="h-5 w-5 text-primary" />,
      labelKey: 'diagnosis.params.location',
      status: plotData.locationAvailable ? 'used' : 'not-available',
      linkTo: '/plots',
    },
    {
      id: 'weather',
      icon: <Cloud className="h-5 w-5 text-info" />,
      labelKey: 'diagnosis.params.weather',
      status: plotData.weatherAvailable ? 'used' : 'update-needed',
    },
    {
      id: 'soil',
      icon: <Sprout className="h-5 w-5 text-success" />,
      labelKey: 'diagnosis.params.soil',
      status: plotData.soilAvailable ? 'used' : 'update-needed',
      linkTo: '/plots',
    },
    {
      id: 'inputs',
      icon: <FlaskConical className="h-5 w-5 text-warning" />,
      labelKey: 'diagnosis.params.inputs',
      status: plotData.inputsAvailable ? 'used' : 'not-available',
      linkTo: '/planning',
    },
    {
      id: 'crop',
      icon: <Wheat className="h-5 w-5 text-accent-foreground" />,
      labelKey: 'diagnosis.params.crop',
      status: plotData.cropProfileAvailable ? 'used' : 'update-needed',
      linkTo: '/plots',
    },
  ];

  const allGreen = isActive && parameters.every(p => p.status === 'used');
  const hasMissing = isActive && parameters.some(p => p.status !== 'used');

  const handlePlotChange = (value: string) => {
    const newPlotId = value === 'generic' ? null : value;
    setSelectedPlotId(newPlotId);
    onPlotChange?.(newPlotId);
  };

  const selectedPlot = plots.find(p => p.id === selectedPlotId);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Plot Selector Dropdown */}
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          value={selectedPlotId || 'generic'}
          onValueChange={handlePlotChange}
        >
          <SelectTrigger className="flex-1 h-9 bg-background">
            <SelectValue placeholder={t('diagnosis.selectPlot')} />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="generic">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🌍</span>
                <span>{t('diagnosis.genericMode')}</span>
              </div>
            </SelectItem>
            {plots.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
                  {t('diagnosis.yourPlots')}
                </div>
                {plots.map((plot) => (
                  <SelectItem key={plot.id} value={plot.id}>
                    <div className="flex items-center gap-2">
                      <span>🌾</span>
                      <span>{plot.name}</span>
                      {plot.cropType && (
                        <span className="text-xs text-muted-foreground">
                          ({plot.cropType})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
            {plots.length === 0 && !plotsLoading && (
              <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                {t('diagnosis.noPlotsYet')}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Status text for selected mode */}
      <div className="text-xs text-muted-foreground">
        {isActive ? (
          <span className="text-primary font-medium">
            {t('diagnosis.usingPlotData', { plotName: selectedPlot?.name || '' })}
          </span>
        ) : (
          <span>{t('diagnosis.genericModeDesc')}</span>
        )}
      </div>

      {/* Parameter Icons - only show when a plot is selected */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {parameters.map((param) => (
                <ParameterIcon 
                  key={param.id} 
                  param={param} 
                  isActive={isActive}
                  selectedPlotId={selectedPlotId}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-xs px-3 py-2 rounded-lg flex items-center gap-2 mt-2',
              allGreen 
                ? 'bg-success/10 text-success border border-success/20' 
                : 'bg-warning/10 text-warning border border-warning/20'
            )}
          >
            {allGreen ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>{t('diagnosis.allDataUsed')}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{t('diagnosis.missingData')}</span>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
