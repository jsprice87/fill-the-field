
import React, { useState, useEffect, useCallback } from 'react';
import SimpleMapContainer from './SimpleMapContainer';
import MapContent from './MapContent';
import SimpleFallbackMap from './SimpleFallbackMap';
import EnhancedLeafletValidator from './EnhancedLeafletValidator';
import MapErrorBoundary from './MapErrorBoundary';

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

interface ProgressiveMapLoaderProps {
  validLocations: Location[];
  height: string;
  className?: string;
  onLocationSelect?: (location: any) => void;
  addDebugLog: (message: string) => void;
  onMapError: (error: string) => void;
}

const ProgressiveMapLoader: React.FC<ProgressiveMapLoaderProps> = ({
  validLocations,
  height,
  className = "",
  onLocationSelect,
  addDebugLog,
  onMapError
}) => {
  const [loadingStep, setLoadingStep] = useState<string>('initializing');
  const [containerReady, setContainerReady] = useState(false);
  const [leafletValid, setLeafletValid] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [useFallback, setUseFallback] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const handleContainerReady = useCallback((ready: boolean) => {
    addDebugLog(`Container ready: ${ready}`);
    setContainerReady(ready);
    if (!ready) {
      addDebugLog('Container failed, switching to fallback');
      setUseFallback(true);
      setLoadingStep('fallback-container');
    } else {
      setLoadingStep('container-ready');
    }
  }, [addDebugLog]);

  const handleLeafletValidation = useCallback((isValid: boolean, issues: string[]) => {
    addDebugLog(`Leaflet validation: ${isValid ? 'VALID' : 'INVALID'}`);
    setLeafletValid(isValid);
    setValidationIssues(issues);
    
    if (!isValid) {
      addDebugLog(`Leaflet validation failed: ${issues.join(', ')}`);
      setUseFallback(true);
      setLoadingStep('fallback-validation');
    } else {
      setLoadingStep('leaflet-ready');
    }
  }, [addDebugLog]);

  const handleMapReady = useCallback(() => {
    addDebugLog('Map fully initialized and ready');
    setMapReady(true);
    setLoadingStep('map-ready');
  }, [addDebugLog]);

  const handleMapError = useCallback((error: string) => {
    addDebugLog(`Map error: ${error}`);
    setUseFallback(true);
    setLoadingStep('fallback-error');
    onMapError(error);
  }, [addDebugLog, onMapError]);

  // Calculate map center
  const calculateCenter = useCallback(() => {
    if (!validLocations || validLocations.length === 0) {
      return { lat: 39.7392, lng: -104.9903 }; // Default to Denver
    }

    const validCoords = validLocations.filter(loc => 
      loc.latitude && loc.longitude && 
      !isNaN(loc.latitude) && !isNaN(loc.longitude)
    );

    if (validCoords.length === 0) {
      return { lat: 39.7392, lng: -104.9903 };
    }

    const centerLat = validCoords.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validCoords.length;
    const centerLng = validCoords.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validCoords.length;

    if (isNaN(centerLat) || isNaN(centerLng)) {
      return { lat: 39.7392, lng: -104.9903 };
    }

    return { lat: centerLat, lng: centerLng };
  }, [validLocations]);

  const center = calculateCenter();

  useEffect(() => {
    addDebugLog('ProgressiveMapLoader initializing...');
    setLoadingStep('validating-environment');
  }, [addDebugLog]);

  // Show loading state
  if (loadingStep === 'initializing' || loadingStep === 'validating-environment') {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing map...</p>
          <div className="mt-2 text-xs text-gray-500">Step: {loadingStep}</div>
        </div>
        <EnhancedLeafletValidator 
          onValidation={handleLeafletValidation}
          addDebugLog={addDebugLog}
        />
      </div>
    );
  }

  // Use fallback map if anything failed
  if (useFallback || !leafletValid) {
    return (
      <div className={`border rounded-lg overflow-hidden ${className}`} style={{ height }}>
        <SimpleFallbackMap
          locations={validLocations}
          onLocationSelect={onLocationSelect}
          addDebugLog={addDebugLog}
        />
        {validationIssues.length > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-300 px-2 py-1 rounded text-xs">
            Issues: {validationIssues.join(', ')}
          </div>
        )}
      </div>
    );
  }

  // Render the full Leaflet map
  return (
    <SimpleMapContainer
      height={height}
      className={className}
      onContainerReady={handleContainerReady}
      addDebugLog={addDebugLog}
    >
      <MapErrorBoundary onError={handleMapError} addDebugLog={addDebugLog}>
        <MapContent
          validLocations={validLocations}
          centerLat={center.lat}
          centerLng={center.lng}
          onLocationSelect={onLocationSelect}
          onMapReady={handleMapReady}
          onMapError={handleMapError}
          addDebugLog={addDebugLog}
        />
      </MapErrorBoundary>
    </SimpleMapContainer>
  );
};

export default ProgressiveMapLoader;
