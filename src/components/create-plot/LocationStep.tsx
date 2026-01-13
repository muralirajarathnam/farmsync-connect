import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, WifiOff, Edit3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { PlotLocation } from '@/types/api';

// Dynamically import Leaflet to avoid SSR issues
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationStepProps {
  initialLocation?: PlotLocation;
  onSelect: (location: PlotLocation) => void;
  isOnline: boolean;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly to location
function FlyToLocation({ location }: { location: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 15, { duration: 1 });
    }
  }, [location, map]);
  
  return null;
}

export function LocationStep({ initialLocation, onSelect, isOnline }: LocationStepProps) {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<PlotLocation | null>(initialLocation || null);
  const [isManualMode, setIsManualMode] = useState(!isOnline);
  const [manualLat, setManualLat] = useState(initialLocation?.lat?.toString() || '');
  const [manualLng, setManualLng] = useState(initialLocation?.lng?.toString() || '');
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng] 
    : defaultCenter;

  const handleMapClick = (lat: number, lng: number) => {
    const location: PlotLocation = {
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      label: t('createPlot.selectedLocation'),
    };
    setSelectedLocation(location);
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('createPlot.locationNotSupported'));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: PlotLocation = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
          label: t('createPlot.myLocation'),
        };
        setSelectedLocation(location);
        setManualLat(location.lat.toString());
        setManualLng(location.lng.toString());
        setIsLocating(false);
        toast.success(t('createPlot.locationFound'));
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t('createPlot.locationDenied'));
        } else {
          toast.error(t('createPlot.locationError'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error(t('createPlot.invalidCoordinates'));
      return;
    }
    
    const location: PlotLocation = {
      lat,
      lng,
      label: t('createPlot.manualLocation'),
    };
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Offline Banner */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning/10 border border-warning/30 rounded-lg mx-4 mt-4 p-3 flex items-center gap-3"
        >
          <WifiOff className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning-foreground">
            {t('createPlot.offlineMapBanner')}
          </p>
        </motion.div>
      )}

      {/* Map or Manual Input */}
      <div className="flex-1 relative mt-4">
        {isOnline && !isManualMode ? (
          <div className="h-full mx-4 rounded-xl overflow-hidden border border-border">
            <MapContainer
              center={mapCenter}
              zoom={selectedLocation ? 15 : 5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {selectedLocation && (
                <>
                  <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                  <FlyToLocation location={selectedLocation} />
                </>
              )}
            </MapContainer>

            {/* Map overlay buttons */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="h-12 w-12 rounded-full shadow-lg bg-background"
              >
                <Navigation className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setIsManualMode(true)}
                className="h-12 w-12 rounded-full shadow-lg bg-background"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>

            {/* Tap instruction */}
            {!selectedLocation && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
                <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                  <p className="text-sm font-medium">{t('createPlot.tapToSelect')}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Manual Input Mode */
          <div className="px-4 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t('createPlot.enterCoordinates')}</h3>
                  <p className="text-sm text-muted-foreground">{t('createPlot.manualEntry')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('createPlot.latitude')}</label>
                  <Input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="15.3173"
                    className="text-lg h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('createPlot.longitude')}</label>
                  <Input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="75.7139"
                    className="text-lg h-12"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleUseMyLocation}
                  disabled={isLocating || !isOnline}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('createPlot.useMyLocation')}
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleManualSubmit}
                  disabled={!manualLat || !manualLng}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('createPlot.setLocation')}
                </Button>
              </div>

              {isOnline && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsManualMode(false)}
                >
                  {t('createPlot.showMap')}
                </Button>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Selected Location Card & Continue Button */}
      <div className="p-4 space-y-3 border-t border-border bg-background">
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary">{selectedLocation.label || t('createPlot.selectedLocation')}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold"
          onClick={handleConfirm}
          disabled={!selectedLocation}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
