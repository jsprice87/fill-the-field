
import React, { useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapErrorFallback from './MapErrorFallback';
import MapDebugger from './MapDebugger';
import BrowserEnvironmentChecker from './BrowserEnvironmentChecker';
import MapContainerWrapper from './MapContainerWrapper';
import MapContent from './MapContent';
import SimpleFallbackMap from './SimpleFallbackMap';
import MapErrorBoundary from './MapErrorBoundary';
import LeafletValidator from './LeafletValidator';
import MapDebugPanel from './MapDebugPanel';
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
  franchiseeSlug?: string;
  flowId?: string;
  onLocationSelect?: (location: any) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  locations, 
  height = "400px",
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

  const { handleMapError, retryMapLoad, handleLeafletValidation } = useMapErrorHandler({
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
    actions.addDebugLog('Map component mounted');
    actions.setInitializationStep('mounted');
    return () => {
      actions.addDebugLog('Map component unmounting');
      actions.isMountedRef.current = false;
    };
  }, [actions]);

  const handleMapReady = useCallback(() => {
    actions.addDebugLog('MapContainer ready callback triggered');
    actions.setMapInitialized(true);
    actions.setInitializationStep('map-ready');
  }, [actions]);

  const handleContainerReady = useCallback((ready: boolean) => {
    actions.addDebugLog(`Container ready status: ${ready}`);
    actions.setContainerReady(ready);
    actions.setInitializationStep(ready ? 'container-ready' : 'container-failed');
  }, [actions]);

  useEffect(() => {
    actions.addDebugLog('useEffect triggered for processLocations');
    processLocations();
  }, [processLocations, actions]);

  if (state.isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
          <div className="mt-2 text-xs text-gray-500">Step: {state.initializationStep}</div>
        </div>
      </div>
    );
  }

  if (state.error && !state.useFallbackMap) {
    return (
      <div className={className} style={{ height }}>
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
      <div className={className} style={{ height }}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <MapErrorFallback 
            error="No locations available to display on map"
            showRetry={false}
          />
        </div>
      </div>
    );
  }

  try {
    // Calculate map center
    const centerLat = state.validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / state.validLocations.length;
    const centerLng = state.validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / state.validLocations.length;

    actions.addDebugLog(`Calculated center: ${centerLat}, ${centerLng}`);

    // Validate calculated center
    if (isNaN(centerLat) || isNaN(centerLng) || !isFinite(centerLat) || !isFinite(centerLng)) {
      actions.addDebugLog(`Invalid center coordinates: lat=${centerLat}, lng=${centerLng}`);
      return (
        <div className={className} style={{ height }}>
          <MapErrorFallback 
            error="Unable to calculate map center"
            onRetry={retryMapLoad}
          />
        </div>
      );
    }

    return (
      <div className="relative">
        <BrowserEnvironmentChecker onReport={actions.addBrowserInfo} />
        <LeafletValidator onValidation={handleLeafletValidation} addDebugLog={actions.addDebugLog} />
        
        {state.useFallbackMap || !state.leafletValid ? (
          <div className={`border rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <div className="h-full w-full">
              <SimpleFallbackMap
                locations={state.validLocations}
                onLocationSelect={onLocationSelect}
                addDebugLog={actions.addDebugLog}
              />
            </div>
            <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-300 px-2 py-1 rounded text-xs">
              {!state.leafletValid ? `Leaflet Issues: ${state.validationIssues.join(', ')}` : 'Fallback Map Active'}
            </div>
          </div>
        ) : (
          <MapContainerWrapper
            height={height}
            className={className}
            onContainerReady={handleContainerReady}
            addDebugLog={actions.addDebugLog}
          >
            <MapErrorBoundary onError={handleMapError} addDebugLog={actions.addDebugLog}>
              <MapContent
                validLocations={state.validLocations}
                centerLat={centerLat}
                centerLng={centerLng}
                onLocationSelect={onLocationSelect}
                onMapReady={handleMapReady}
                onMapError={handleMapError}
                addDebugLog={actions.addDebugLog}
              />
            </MapErrorBoundary>
          </MapContainerWrapper>
        )}
        
        <MapDebugger
          debugInfo={state.debugInfo}
          browserInfo={state.browserInfo}
          validLocations={state.validLocations}
          locations={locations}
          containerReady={state.containerReady}
          mapInitialized={state.mapInitialized}
        />
        
        <MapDebugPanel
          debugInfo={state.debugInfo}
          browserInfo={state.browserInfo}
          validLocations={state.validLocations}
          locations={locations}
          containerReady={state.containerReady}
          mapInitialized={state.mapInitialized}
          initializationStep={state.initializationStep}
          leafletValid={state.leafletValid}
          useFallbackMap={state.useFallbackMap}
        />
      </div>
    );
  } catch (renderError) {
    actions.addDebugLog(`Render error: ${renderError}`);
    console.error('Error rendering map:', renderError);
    return (
      <div className={className} style={{ height }}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <MapErrorFallback 
            error="Map rendering failed"
            onRetry={retryMapLoad}
          />
          <div className="mt-4 text-xs text-gray-600 border-t pt-2">
            <div className="text-red-600">Render Error: {String(renderError)}</div>
            <div>Init Step: {state.initializationStep}</div>
          </div>
        </div>
      </div>
    );
  }
};

export default InteractiveMap;
