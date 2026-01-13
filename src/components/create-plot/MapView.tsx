import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  center: [number, number];
  zoom: number;
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Use vanilla Leaflet instead of react-leaflet to avoid React 18 compatibility issues
export default function MapView({ center, zoom, selectedLocation, onLocationSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    setIsReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isReady) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if location selected
    if (selectedLocation) {
      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(mapInstanceRef.current);
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 15, { duration: 1 });
    }
  }, [selectedLocation, isReady]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}
