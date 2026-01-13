import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  humidity: number;
  windSpeed: number;
  forecast: string;
}

// Mock weather data
const mockWeather: WeatherData = {
  temperature: 32,
  condition: 'sunny',
  humidity: 65,
  windSpeed: 12,
  forecast: 'Clear skies expected for the next 3 days',
};

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
};

export function WeatherWidget() {
  const { t } = useTranslation();
  const weather = mockWeather;
  const WeatherIcon = weatherIcons[weather.condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="farm-card bg-gradient-to-br from-info/20 via-info/10 to-transparent border-info/30"
    >
      <div className="flex items-center justify-between">
        {/* Main Weather Display */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/20">
              <WeatherIcon className="h-10 w-10 text-info" strokeWidth={1.5} />
            </div>
            {/* Animated glow */}
            <div className="absolute inset-0 rounded-2xl bg-info/20 blur-xl -z-10" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('dashboard.weather')}</p>
            <p className="text-4xl font-bold text-foreground">{weather.temperature}°C</p>
          </div>
        </div>

        {/* Weather Stats */}
        <div className="flex flex-col gap-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{weather.humidity}%</span>
            <Droplets className="h-4 w-4 text-info" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{weather.windSpeed} km/h</span>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="mt-4 pt-3 border-t border-info/20">
        <p className="text-sm text-muted-foreground">{t('dashboard.weatherDesc')}</p>
      </div>
    </motion.div>
  );
}
