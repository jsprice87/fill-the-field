
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapErrorFallback from './MapErrorFallback';
import MapDebugger from './MapDebugger';
import MapDebugPanel from './MapDebugPanel';
import BrowserEnvironmentChecker from './BrowserEnvironmentChecker';
import EnhancedMapLoader from './EnhancedMapLoader';
import { useMapState } from './MapStateManager';
import { useMapDataProcessor } from './MapDataProcessor';
import { useMapErrorHandler } from './MapErrorHandler';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface InteractiveMapProps {
  locations: Location[];
  height?: string;
  aspectRatio?: number; // New prop for aspect ratio control
  franchiseeSlug?: string;
  flowId?: string;
  onLocationSelect?: (location: any) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  locations, 
  height = "400px",
  aspectRatio, // Default undefined means use height
  onLocationSelect,
  className = ""
}) => {
  const { state, actions } = useMapState();
  
  const { processLocations } = useMapDataProcessor({
    locations,
    addDebugLog: actions.addDebugLog,
    safeSetState: actions.safeSetState,
    setValidLocations: actions.setValidLocations,
    setIsLoading: actions.setIsLoading,
    setError: actions.setError,
    setInitializationStep: actions.setInitializationStep
  });

  const { handleMapError, retryMapLoad } = useMapErrorHandler({
    addDebugLog: actions.addDebugLog,
    safeSetState: actions.safeSetState,
    setMapError: actions.setMapError,
    setUseFallbackMap: actions.setUseFallbackMap,
    setInitializationStep: actions.setInitializationStep,
    setError: actions.setError,
    setMapInitialized: actions.setMapInitialized,
    setContainerReady: actions.setContainerReady,
    setLeafletValid: actions.setLeafletValid,
    setValidationIssues: actions.setValidationIssues,
    processLocations
  });

  // Cleanup on unmount
  useEffect(() => {
    actions.addDebugLog('InteractiveMap component mounted');
    actions.setInitializationStep('mounted');
    return () => {
      actions.addDebugLog('InteractiveMap component unmounting');
      actions.isMountedRef.current = false;
    };
  }, [actions]);

  useEffect(() => {
    actions.addDebugLog('Processing locations...');
    processLocations();
  }, [processLocations, actions]);

  if (state.isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} 
           style={{ height: aspectRatio ? undefined : height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
          <div className="mt-2 text-xs text-gray-500">Step: {state.initializationStep}</div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={className} style={{ height: aspectRatio ? undefined : height }}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <MapErrorFallback 
            error={state.error} 
            onRetry={retryMapLoad}
          />
        </div>
      </div>
    );
  }

  if (!state.validLocations || state.validLocations.length === 0) {
    return (
      <div className={className} style={{ height: aspectRatio ? undefined : height }}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <MapErrorFallback 
            error="No locations available to display on map"
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <BrowserEnvironmentChecker onReport={actions.addBrowserInfo} />
      
      <EnhancedMapLoader
        locations={state.validLocations}
        height={height}
        aspectRatio={aspectRatio}
        className={className}
        onLocationSelect={onLocationSelect}
        addDebugLog={actions.addDebugLog}
        onMapError={handleMapError}
      />
      
    </div>
  );
};

export default InteractiveMap;
