import { useState, useEffect } from 'react';
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
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Placeholder booleans - replace with real data later
const PLACEHOLDER_DATA = {
  locationAvailable: true,
  weatherAvailable: true,
  soilAvailable: false,
  inputsAvailable: false,
  cropProfileAvailable: true,
};

type ParameterStatus = 'used' | 'update-needed' | 'not-available';

interface Parameter {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  status: ParameterStatus;
  linkTo?: string;
}

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
  farmAwareMode 
}: { 
  param: Parameter; 
  farmAwareMode: boolean;
}) {
  const { t } = useTranslation();
  const isInteractive = param.status !== 'used' && param.linkTo && farmAwareMode;
  
  const content = (
    <motion.div
      whileTap={isInteractive ? { scale: 0.95 } : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 min-w-[72px] transition-all',
        farmAwareMode ? getStatusColor(param.status) : 'border-muted/30 bg-muted/10 opacity-50',
        isInteractive && 'cursor-pointer active:opacity-80'
      )}
    >
      <div className="relative">
        {param.icon}
        {farmAwareMode && (
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

  if (isInteractive && param.linkTo) {
    return <Link to={param.linkTo}>{content}</Link>;
  }

  return content;
}

interface ContextParametersIndicatorProps {
  // For future: pass actual data availability
  className?: string;
}

export function ContextParametersIndicator({ className }: ContextParametersIndicatorProps) {
  const { t } = useTranslation();
  const [farmAwareMode, setFarmAwareMode] = useState(true);
  const [isGenericQuery, setIsGenericQuery] = useState(false);

  // Build parameters with placeholder data
  const parameters: Parameter[] = [
    {
      id: 'location',
      icon: <MapPin className="h-5 w-5 text-primary" />,
      labelKey: 'diagnosis.params.location',
      status: PLACEHOLDER_DATA.locationAvailable ? 'used' : 'not-available',
      linkTo: '/plots',
    },
    {
      id: 'weather',
      icon: <Cloud className="h-5 w-5 text-info" />,
      labelKey: 'diagnosis.params.weather',
      status: PLACEHOLDER_DATA.weatherAvailable ? 'used' : 'update-needed',
    },
    {
      id: 'soil',
      icon: <Sprout className="h-5 w-5 text-success" />,
      labelKey: 'diagnosis.params.soil',
      status: PLACEHOLDER_DATA.soilAvailable ? 'used' : 'update-needed',
      linkTo: '/plots',
    },
    {
      id: 'inputs',
      icon: <FlaskConical className="h-5 w-5 text-warning" />,
      labelKey: 'diagnosis.params.inputs',
      status: PLACEHOLDER_DATA.inputsAvailable ? 'used' : 'not-available',
      linkTo: '/planning',
    },
    {
      id: 'crop',
      icon: <Wheat className="h-5 w-5 text-accent-foreground" />,
      labelKey: 'diagnosis.params.crop',
      status: PLACEHOLDER_DATA.cropProfileAvailable ? 'used' : 'update-needed',
      linkTo: '/plots',
    },
  ];

  const allGreen = farmAwareMode && parameters.every(p => p.status === 'used');
  const hasMissing = farmAwareMode && parameters.some(p => p.status !== 'used');

  // Simulate generic query detection (placeholder)
  useEffect(() => {
    // In real implementation, this would be based on user input analysis
    // For demo, we keep it false
    setIsGenericQuery(false);
  }, []);

  // Auto-switch mode based on query type
  useEffect(() => {
    if (isGenericQuery) {
      setFarmAwareMode(false);
    }
  }, [isGenericQuery]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setFarmAwareMode(!farmAwareMode)}
          className="flex items-center gap-2 text-sm"
        >
          {farmAwareMode ? (
            <ToggleRight className="h-5 w-5 text-primary" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
          )}
          <span className={cn(
            'font-medium',
            farmAwareMode ? 'text-primary' : 'text-muted-foreground'
          )}>
            {t('diagnosis.farmAwareMode')}
          </span>
        </button>
        <span className="text-xs text-muted-foreground">
          {farmAwareMode ? t('diagnosis.modeActive') : t('diagnosis.modeGeneric')}
        </span>
      </div>

      {/* Generic query detected message */}
      {isGenericQuery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
        >
          {t('diagnosis.genericDetected')}
        </motion.div>
      )}

      {/* Parameter Icons */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {parameters.map((param) => (
            <ParameterIcon 
              key={param.id} 
              param={param} 
              farmAwareMode={farmAwareMode}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Status Bar */}
      {farmAwareMode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-xs px-3 py-2 rounded-lg flex items-center gap-2',
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
      )}
    </div>
  );
}
