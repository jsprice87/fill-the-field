
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

interface SimpleFallbackMapProps {
  locations: Location[];
  onLocationSelect?: (location: any) => void;
  addDebugLog: (message: string) => void;
}

const SimpleFallbackMap: React.FC<SimpleFallbackMapProps> = ({
  locations,
  onLocationSelect,
  addDebugLog
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    addDebugLog('Initializing simple fallback map');

    try {
      // Calculate center
      const validLocations = locations.filter(l => l.latitude && l.longitude);
      if (validLocations.length === 0) {
        addDebugLog('No valid locations for fallback map');
        return;
      }

      const centerLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validLocations.length;
      const centerLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validLocations.length;

      addDebugLog(`Creating Leaflet map at ${centerLat}, ${centerLng}`);

      // Create map
      const map = L.map(mapRef.current).setView([centerLat, centerLng], 10);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      addDebugLog('Tile layer added to fallback map');

      // Add markers
      validLocations.forEach(location => {
        const marker = L.marker([location.latitude!, location.longitude!])
          .addTo(map)
          .bindPopup(`
            <div>
              <h3>${location.name}</h3>
              <p>${location.address}<br>${location.city}, ${location.state} ${location.zip}</p>
              <button onclick="window.selectLocation('${location.id}')">Select Location</button>
            </div>
          `);

        marker.on('click', () => {
          addDebugLog(`Fallback map marker clicked: ${location.name}`);
          if (onLocationSelect) {
            onLocationSelect({
              id: location.id,
              name: location.name,
              address: `${location.address}, ${location.city}, ${location.state}`
            });
          }
        });
      });

      addDebugLog(`Added ${validLocations.length} markers to fallback map`);

    } catch (error) {
      addDebugLog(`Fallback map error: ${error}`);
      console.error('Fallback map error:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        addDebugLog('Cleaning up fallback map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locations, onLocationSelect, addDebugLog]);

  return (
    <div className="h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
};

export default SimpleFallbackMap;
