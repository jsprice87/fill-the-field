
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [validLocations, setValidLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mapError, setMapError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [browserInfo, setBrowserInfo] = useState<string[]>([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [containerReady, setContainerReady] = useState(false);
  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [leafletValid, setLeafletValid] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [initializationStep, setInitializationStep] = useState<string>('starting');
  const isMountedRef = useRef(true);

  // Add debug logging function
  const addDebugLog = useCallback((message: string) => {
    console.log(`🗺️ MAP DEBUG: ${message}`);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Add browser info logging
  const addBrowserInfo = useCallback((message: string) => {
    console.log(`🌐 BROWSER DEBUG: ${message}`);
    setBrowserInfo(prev => [...prev.slice(-9), message]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    addDebugLog('Map component mounted');
    setInitializationStep('mounted');
    return () => {
      addDebugLog('Map component unmounting');
      isMountedRef.current = false;
    };
  }, [addDebugLog]);

  // Safe state update function
  const safeSetState = useCallback((updateFn: () => void) => {
    if (isMountedRef.current) {
      updateFn();
    }
  }, []);

  // Handle Leaflet validation
  const handleLeafletValidation = useCallback((isValid: boolean, issues: string[]) => {
    addDebugLog(`Leaflet validation result: ${isValid ? 'VALID' : 'INVALID'}`);
    if (issues.length > 0) {
      addDebugLog(`Validation issues: ${issues.join(', ')}`);
    }
    
    setLeafletValid(isValid);
    setValidationIssues(issues);
    setInitializationStep(isValid ? 'leaflet-valid' : 'leaflet-invalid');
    
    if (!isValid) {
      // If Leaflet validation fails, switch to fallback immediately
      addDebugLog('Leaflet validation failed, switching to fallback map');
      setUseFallbackMap(true);
      setError(`Leaflet validation failed: ${issues.join(', ')}`);
    }
  }, [addDebugLog]);

  const processLocations = useCallback(() => {
    addDebugLog(`Processing ${locations?.length || 0} locations`);
    setInitializationStep('processing-locations');
    
    if (!locations || locations.length === 0) {
      addDebugLog('No locations to process');
      safeSetState(() => {
        setValidLocations([]);
        setIsLoading(false);
        setInitializationStep('no-locations');
      });
      return;
    }

    addDebugLog(`Input locations: ${JSON.stringify(locations.map(l => ({ id: l.id, name: l.name, lat: l.latitude, lng: l.longitude })))}`);
    
    safeSetState(() => {
      setIsLoading(true);
      setError('');
    });

    // Filter locations that have valid coordinates
    const locationsWithCoords = locations.filter(location => {
      const isValid = location && 
        typeof location.id === 'string' && 
        typeof location.name === 'string' && 
        typeof location.address === 'string' &&
        typeof location.city === 'string' &&
        typeof location.state === 'string' &&
        typeof location.zip === 'string' &&
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        !isNaN(location.latitude) &&
        !isNaN(location.longitude) &&
        isFinite(location.latitude) &&
        isFinite(location.longitude);
      
      if (!isValid) {
        addDebugLog(`Invalid location: ${location?.name || 'unknown'} - lat: ${location?.latitude}, lng: ${location?.longitude}`);
      }
      
      return isValid;
    });

    addDebugLog(`Found ${locationsWithCoords.length} valid locations out of ${locations.length} total`);

    if (locationsWithCoords.length === 0) {
      const errorMsg = `No locations have coordinates yet. Please edit your locations to refresh their addresses.`;
      addDebugLog(`Setting error: ${errorMsg}`);
      safeSetState(() => {
        setError(errorMsg);
        setValidLocations([]);
        setIsLoading(false);
        setInitializationStep('no-valid-locations');
      });
      return;
    }

    safeSetState(() => {
      setValidLocations(locationsWithCoords);
      setIsLoading(false);
      setInitializationStep('locations-processed');
    });
  }, [locations, safeSetState, addDebugLog]);

  const handleMapError = useCallback((errorMessage: string) => {
    addDebugLog(`Map error occurred: ${errorMessage}`);
    console.error('Map error:', errorMessage);
    addDebugLog('Switching to fallback map');
    safeSetState(() => {
      setMapError(errorMessage);
      setUseFallbackMap(true);
      setInitializationStep('fallback-active');
    });
  }, [safeSetState, addDebugLog]);

  const retryMapLoad = useCallback(() => {
    addDebugLog('Retrying map load');
    safeSetState(() => {
      setMapError('');
      setError('');
      setUseFallbackMap(false);
      setMapInitialized(false);
      setContainerReady(false);
      setLeafletValid(false);
      setValidationIssues([]);
      setInitializationStep('retrying');
    });
    processLocations();
  }, [processLocations, safeSetState, addDebugLog]);

  const handleMapReady = useCallback(() => {
    addDebugLog('MapContainer ready callback triggered');
    setMapInitialized(true);
    setInitializationStep('map-ready');
  }, [addDebugLog]);

  const handleContainerReady = useCallback((ready: boolean) => {
    addDebugLog(`Container ready status: ${ready}`);
    setContainerReady(ready);
    setInitializationStep(ready ? 'container-ready' : 'container-failed');
  }, [addDebugLog]);

  useEffect(() => {
    addDebugLog('useEffect triggered for processLocations');
    processLocations();
  }, [processLocations]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
          <div className="mt-2 text-xs text-gray-500">Step: {initializationStep}</div>
        </div>
      </div>
    );
  }

  if (error && !useFallbackMap) {
    return (
      <div className={className} style={{ height }}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <MapErrorFallback 
            error={error} 
            onRetry={retryMapLoad}
          />
        </div>
      </div>
    );
  }

  if (!validLocations || validLocations.length === 0) {
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
    const centerLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validLocations.length;
    const centerLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validLocations.length;

    addDebugLog(`Calculated center: ${centerLat}, ${centerLng}`);

    // Validate calculated center
    if (isNaN(centerLat) || isNaN(centerLng) || !isFinite(centerLat) || !isFinite(centerLng)) {
      addDebugLog(`Invalid center coordinates: lat=${centerLat}, lng=${centerLng}`);
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
        <BrowserEnvironmentChecker onReport={addBrowserInfo} />
        <LeafletValidator onValidation={handleLeafletValidation} addDebugLog={addDebugLog} />
        
        {useFallbackMap || !leafletValid ? (
          <div className={`border rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <div className="h-full w-full">
              <SimpleFallbackMap
                locations={validLocations}
                onLocationSelect={onLocationSelect}
                addDebugLog={addDebugLog}
              />
            </div>
            <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-300 px-2 py-1 rounded text-xs">
              {!leafletValid ? `Leaflet Issues: ${validationIssues.join(', ')}` : 'Fallback Map Active'}
            </div>
          </div>
        ) : (
          <MapContainerWrapper
            height={height}
            className={className}
            onContainerReady={handleContainerReady}
            addDebugLog={addDebugLog}
          >
            <MapErrorBoundary onError={handleMapError} addDebugLog={addDebugLog}>
              <MapContent
                validLocations={validLocations}
                centerLat={centerLat}
                centerLng={centerLng}
                onLocationSelect={onLocationSelect}
                onMapReady={handleMapReady}
                onMapError={handleMapError}
                addDebugLog={addDebugLog}
              />
            </MapErrorBoundary>
          </MapContainerWrapper>
        )}
        
        <MapDebugger
          debugInfo={debugInfo}
          browserInfo={browserInfo}
          validLocations={validLocations}
          locations={locations}
          containerReady={containerReady}
          mapInitialized={mapInitialized}
        />
        
        {/* Enhanced debug info overlay */}
        <div className="absolute bottom-16 left-2 bg-blue-900 bg-opacity-90 text-white text-xs p-2 rounded max-w-xs">
          <div className="font-bold">🔧 Init Status:</div>
          <div>Step: {initializationStep}</div>
          <div>Leaflet: {leafletValid ? '✅' : '❌'}</div>
          <div>Container: {containerReady ? '✅' : '❌'}</div>
          <div>Map: {mapInitialized ? '✅' : '❌'}</div>
          <div>Fallback: {useFallbackMap ? '🔄' : '❌'}</div>
        </div>
      </div>
    );
  } catch (renderError) {
    addDebugLog(`Render error: ${renderError}`);
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
            <div>Init Step: {initializationStep}</div>
          </div>
        </div>
      </div>
    );
  }
};

export default InteractiveMap;
