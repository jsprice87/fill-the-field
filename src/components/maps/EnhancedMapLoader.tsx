import React, { useState, useEffect, useCallback } from 'react';
import MapboxMap from './MapboxMap';
import ProgressiveMapLoader from './ProgressiveMapLoader';
import MapboxTokenInput from './MapboxTokenInput';
import { Card } from '@mantine/core';
import { useGlobalSetting } from '@/hooks/useGlobalSettings';

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
  const [useLeafletFallback, setUseLeafletFallback] = useState(false);
  const [mapboxError, setMapboxError] = useState<string>('');
  const [finalMapboxToken, setFinalMapboxToken] = useState<string>('');
  
  // Fetch the mapbox token from global settings
  const { data: globalMapboxToken, isLoading: isLoadingGlobalToken, error: globalTokenError } = useGlobalSetting('mapbox_public_token');

  // Determine which token to use
  useEffect(() => {
    if (!isLoadingGlobalToken) {
      if (globalMapboxToken) {
        addDebugLog('Using Mapbox token from global settings');
        setFinalMapboxToken(globalMapboxToken);
      } else {
        // Fallback to localStorage if no global setting exists
        const storedToken = localStorage.getItem('mapbox_token');
        if (storedToken) {
          addDebugLog('Using Mapbox token from localStorage (fallback)');
          setFinalMapboxToken(storedToken);
        } else {
          addDebugLog('No Mapbox token found in global settings or localStorage');
        }
      }
    }
  }, [globalMapboxToken, isLoadingGlobalToken, addDebugLog]);

  const handleTokenSubmit = useCallback((token: string) => {
    addDebugLog('Mapbox token submitted manually');
    localStorage.setItem('mapbox_token', token);
    setFinalMapboxToken(token);
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

  // Show loading state while fetching global token
  if (isLoadingGlobalToken) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} 
           style={{ height: aspectRatio ? undefined : height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading map configuration...</p>
      </div>
    );
  }

  // Show error if global settings failed to load but continue with fallback
  if (globalTokenError) {
    addDebugLog(`Failed to load global settings: ${globalTokenError.message}`);
  }

  // Show token input if no token available anywhere
  if (!finalMapboxToken && !useLeafletFallback) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`} 
           style={{ height: aspectRatio ? undefined : height }}>
        <Card className="max-w-md w-full">
          <Card.Section className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mapbox Configuration Required</h3>
              <p className="text-sm text-gray-600 mb-4">
                No Mapbox token found in system settings. Please contact your administrator to configure the Mapbox token in the admin settings, or enter one below.
              </p>
            </div>
            <MapboxTokenInput onTokenSubmit={handleTokenSubmit} />
            <div className="mt-4 text-center">
              <button
                onClick={handleUseLeaflet}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Skip Mapbox and use basic map instead
              </button>
            </div>
          </Card.Section>
        </Card>
      </div>
    );
  }

  // Use Leaflet fallback if requested or if Mapbox failed
  if (useLeafletFallback) {
    return (
      <div className="relative">
        {mapboxError && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <Card.Section className="p-4">
              <p className="text-yellow-800 text-sm">
                Mapbox unavailable ({mapboxError}). Using basic map instead.
              </p>
            </Card.Section>
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
        mapboxToken={finalMapboxToken}
        addDebugLog={addDebugLog}
      />
      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-gray-600">
        Mapbox Map {globalMapboxToken ? '(Global)' : '(Local)'}
      </div>
    </div>
  );
};

export default EnhancedMapLoader;
