import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets,
  Sprout,
  ArrowRight,
  WifiOff,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeather } from '@/hooks/use-api';
import type { PlotLocation, WeatherData } from '@/types/api';

interface WeatherStepProps {
  location?: PlotLocation;
  plotName: string;
  isOnline: boolean;
  onChooseCrop: () => void;
  onSkip: () => void;
}

const WEATHER_ICONS: Record<WeatherData['condition'], typeof Sun> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudRain,
  windy: Wind,
};

export function WeatherStep({ location, plotName, isOnline, onChooseCrop, onSkip }: WeatherStepProps) {
  const { t } = useTranslation();
  const { data: weather, isLoading, error } = useWeather(location?.lat, location?.lng);

  const WeatherIcon = weather ? WEATHER_ICONS[weather.condition] : Cloud;

  return (
    <div className="h-full flex flex-col px-4 py-6">
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold">{t('createPlot.plotCreated')}</h2>
        <p className="text-muted-foreground mt-1">{plotName}</p>
      </motion.div>

      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-sky-200 dark:border-sky-800">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-5 w-5 text-sky-600" />
            <h3 className="font-semibold text-sky-900 dark:text-sky-100">{t('createPlot.weatherPreview')}</h3>
          </div>

          {!isOnline ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <WifiOff className="h-5 w-5" />
              <p>{t('createPlot.weatherOffline')}</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ) : error ? (
            <p className="text-muted-foreground">{t('createPlot.weatherError')}</p>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                  <WeatherIcon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-sky-900 dark:text-sky-100">
                    {weather.temperature}°C
                  </p>
                  <p className="text-sm text-sky-700 dark:text-sky-300 capitalize">
                    {t(`weather.${weather.condition}`)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{weather.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{weather.humidity}%</span>
                </div>
              </div>

              <p className="text-sm text-sky-700 dark:text-sky-300">
                {weather.forecast}
              </p>
            </div>
          ) : null}
        </Card>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={onChooseCrop}
        >
          <Sprout className="h-5 w-5 mr-2" />
          {t('createPlot.chooseCrop')}
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full h-12"
          onClick={onSkip}
        >
          {t('createPlot.skipForNow')}
        </Button>
      </motion.div>
    </div>
  );
}
