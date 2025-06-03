
import React, { useState, useEffect, useCallback } from 'react';
import MapboxMap from './MapboxMap';
import ProgressiveMapLoader from './ProgressiveMapLoader';
import MapboxTokenInput from './MapboxTokenInput';
import { Card, CardContent } from '@/components/ui/card';

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

interface EnhancedMapLoaderProps {
  locations: Location[];
  height?: string;
  aspectRatio?: number;
  className?: string;
  onLocationSelect?: (location: any) => void;
  addDebugLog: (message: string) => void;
  onMapError: (error: string) => void;
}

const EnhancedMapLoader: React.FC<EnhancedMapLoaderProps> = ({
  locations,
  height = "400px",
  aspectRatio,
  className = "",
  onLocationSelect,
  addDebugLog,
  onMapError
}) => {
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);
  const [mapboxError, setMapboxError] = useState<string>('');

  // Check for Mapbox token in localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      addDebugLog('Found stored Mapbox token');
      setMapboxToken(storedToken);
    } else {
      addDebugLog('No Mapbox token found, will show token input');
    }
  }, [addDebugLog]);

  const handleTokenSubmit = useCallback((token: string) => {
    addDebugLog('Mapbox token submitted');
    localStorage.setItem('mapbox_token', token);
    setMapboxToken(token);
    setMapboxError('');
    setUseLeafletFallback(false);
  }, [addDebugLog]);

  const handleMapboxError = useCallback((error: string) => {
    addDebugLog(`Mapbox failed: ${error}, falling back to Leaflet`);
    setMapboxError(error);
    setUseLeafletFallback(true);
    onMapError(error);
  }, [addDebugLog, onMapError]);

  const handleUseLeaflet = useCallback(() => {
    addDebugLog('User chose to use Leaflet instead of Mapbox');
    setUseLeafletFallback(true);
  }, [addDebugLog]);

  // Show token input if no token available
  if (!mapboxToken && !useLeafletFallback) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} 
           style={{ height: aspectRatio ? undefined : height }}>
        <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />
        <div className="mt-4">
          <button
            onClick={handleUseLeaflet}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Skip Mapbox and use basic map instead
          </button>
        </div>
      </div>
    );
  }

  // Use Leaflet fallback if requested or if Mapbox failed
  if (useLeafletFallback) {
    return (
      <div className="relative">
        {mapboxError && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-yellow-800 text-sm">
                Mapbox unavailable ({mapboxError}). Using basic map instead.
              </p>
            </CardContent>
          </Card>
        )}
        <ProgressiveMapLoader
          validLocations={locations}
          height={height}
          className={className}
          onLocationSelect={onLocationSelect}
          addDebugLog={addDebugLog}
          onMapError={onMapError}
        />
      </div>
    );
  }

  // Use Mapbox if token is available
  return (
    <div className="relative">
      <MapboxMap
        locations={locations}
        onLocationSelect={onLocationSelect}
        className={className}
        aspectRatio={aspectRatio}
        mapboxToken={mapboxToken}
        addDebugLog={addDebugLog}
      />
      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-gray-600">
        Mapbox Map
      </div>
    </div>
  );
};

export default EnhancedMapLoader;
