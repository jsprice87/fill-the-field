
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapErrorFallback from './MapErrorFallback';

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

// Component to handle map events
const MapEventHandler: React.FC<{ onError: (error: string) => void }> = ({ onError }) => {
  useMapEvents({
    tileerror: () => {
      console.error('🗺️ MAP DEBUG: Tile loading error');
      onError('Map tiles failed to load');
    },
    error: () => {
      console.error('🗺️ MAP DEBUG: Map error event');
      onError('Map failed to initialize');
    }
  });
  return null;
};

// Browser environment debugging component
const BrowserEnvDebugger: React.FC<{ onReport: (info: string) => void }> = ({ onReport }) => {
  useEffect(() => {
    // Check if we're in browser environment
    const isBrowser = typeof window !== 'undefined';
    onReport(`Browser environment: ${isBrowser}`);
    
    if (isBrowser) {
      // Check Leaflet availability
      onReport(`Leaflet available: ${typeof L !== 'undefined'}`);
      onReport(`Leaflet version: ${L.version || 'unknown'}`);
      
      // Check React-Leaflet components
      onReport(`MapContainer available: ${typeof MapContainer !== 'undefined'}`);
      onReport(`TileLayer available: ${typeof TileLayer !== 'undefined'}`);
      
      // Check CSS loading
      const leafletCSS = document.querySelector('link[href*="leaflet"]');
      onReport(`Leaflet CSS loaded: ${!!leafletCSS}`);
      
      // Check window dimensions
      onReport(`Window size: ${window.innerWidth}x${window.innerHeight}`);
      
      // Check if container will have dimensions
      setTimeout(() => {
        const mapContainers = document.querySelectorAll('.leaflet-container');
        onReport(`Map containers found: ${mapContainers.length}`);
        mapContainers.forEach((container, index) => {
          const rect = container.getBoundingClientRect();
          onReport(`Container ${index} dimensions: ${rect.width}x${rect.height}`);
        });
      }, 100);
    }
  }, [onReport]);
  
  return null;
};

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
  const isMountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Check container dimensions
  useEffect(() => {
    const checkContainer = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        addDebugLog(`Container dimensions: ${rect.width}x${rect.height}`);
        addDebugLog(`Container computed style height: ${getComputedStyle(containerRef.current).height}`);
        setContainerReady(rect.width > 0 && rect.height > 0);
      }
    };

    checkContainer();
    const timer = setTimeout(checkContainer, 100);
    return () => clearTimeout(timer);
  }, [addDebugLog]);

  // Cleanup on unmount
  useEffect(() => {
    addDebugLog('Map component mounted');
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

  const processLocations = useCallback(() => {
    addDebugLog(`Processing ${locations?.length || 0} locations`);
    
    if (!locations || locations.length === 0) {
      addDebugLog('No locations to process');
      safeSetState(() => {
        setValidLocations([]);
        setIsLoading(false);
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
      });
      return;
    }

    if (locationsWithCoords.length < locations.length) {
      const missingCount = locations.length - locationsWithCoords.length;
      addDebugLog(`Warning: ${missingCount} locations are missing coordinates`);
    }

    safeSetState(() => {
      setValidLocations(locationsWithCoords);
      setIsLoading(false);
    });
  }, [locations, safeSetState, addDebugLog]);

  const handleMarkerClick = useCallback((location: Location) => {
    try {
      addDebugLog(`Marker clicked for location: ${location.name}`);
      if (onLocationSelect && location) {
        onLocationSelect({
          id: location.id,
          name: location.name,
          address: `${location.address}, ${location.city}, ${location.state}`
        });
      }
    } catch (error) {
      addDebugLog(`Error handling marker click: ${error}`);
      console.error('Error handling marker click:', error);
    }
  }, [onLocationSelect, addDebugLog]);

  const handleMapError = useCallback((errorMessage: string) => {
    addDebugLog(`Map error occurred: ${errorMessage}`);
    console.error('Map error:', errorMessage);
    safeSetState(() => setMapError(errorMessage));
  }, [safeSetState, addDebugLog]);

  const retryMapLoad = useCallback(() => {
    addDebugLog('Retrying map load');
    safeSetState(() => {
      setMapError('');
      setError('');
      setDebugInfo([]);
      setBrowserInfo([]);
      setMapInitialized(false);
      setContainerReady(false);
    });
    processLocations();
  }, [processLocations, safeSetState, addDebugLog]);

  const handleMapReady = useCallback(() => {
    addDebugLog('MapContainer ready callback triggered');
    setMapInitialized(true);
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
          <div className="mt-4 text-xs text-gray-500">
            <div>Debug info:</div>
            {debugInfo.map((info, i) => <div key={i}>{info}</div>)}
          </div>
        </div>
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className={className} style={{ height }}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <MapErrorFallback 
            error={error || mapError} 
            onRetry={retryMapLoad}
          />
          <div className="mt-4 text-xs text-gray-600 border-t pt-2">
            <div className="font-semibold">Debug Information:</div>
            {debugInfo.map((info, i) => <div key={i}>{info}</div>)}
            <div className="mt-2 font-semibold">Browser Information:</div>
            {browserInfo.map((info, i) => <div key={i}>{info}</div>)}
            <div className="mt-2">Valid locations found: {validLocations.length}</div>
            <div>Total locations received: {locations?.length || 0}</div>
            <div>Container ready: {containerReady ? 'Yes' : 'No'}</div>
            <div>Map initialized: {mapInitialized ? 'Yes' : 'No'}</div>
          </div>
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
          <div className="mt-4 text-xs text-gray-600 border-t pt-2">
            <div className="font-semibold">Debug Information:</div>
            {debugInfo.map((info, i) => <div key={i}>{info}</div>)}
          </div>
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

    addDebugLog(`Attempting to render MapContainer with ${validLocations.length} markers`);

    return (
      <div style={{ height }} className={`rounded-lg overflow-hidden border ${className}`}>
        <BrowserEnvDebugger onReport={addBrowserInfo} />
        <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
          {containerReady ? (
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              whenReady={handleMapReady}
            >
              <MapEventHandler onError={handleMapError} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validLocations.map((location) => {
                addDebugLog(`Rendering marker for: ${location.name} at ${location.latitude}, ${location.longitude}`);
                return (
                  <Marker
                    key={location.id}
                    position={[location.latitude!, location.longitude!]}
                    eventHandlers={{
                      click: () => handleMarkerClick(location)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-gray-600">
                          {location.address}<br />
                          {location.city}, {location.state} {location.zip}
                        </p>
                        {onLocationSelect && (
                          <button 
                            onClick={() => handleMarkerClick(location)}
                            className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Select Location
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Preparing map container...</p>
                <div className="mt-2 text-xs text-gray-500">
                  Container ready: {containerReady ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Enhanced Debug overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-90 text-white text-xs p-3 rounded max-w-sm max-h-48 overflow-y-auto">
          <div className="font-bold mb-1">🗺️ Map Debug Status:</div>
          <div>Container Ready: {containerReady ? '✅' : '❌'}</div>
          <div>Map Initialized: {mapInitialized ? '✅' : '❌'}</div>
          <div>Locations: {validLocations.length}</div>
          <div className="mt-2 font-bold">Recent Logs:</div>
          {debugInfo.slice(-3).map((info, i) => <div key={i} className="truncate">{info}</div>)}
          <div className="mt-2 font-bold">Browser:</div>
          {browserInfo.slice(-2).map((info, i) => <div key={i} className="truncate">{info}</div>)}
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
            <div className="font-semibold">Debug Information:</div>
            {debugInfo.map((info, i) => <div key={i}>{info}</div>)}
            <div className="mt-2 font-semibold">Browser Information:</div>
            {browserInfo.map((info, i) => <div key={i}>{info}</div>)}
            <div className="mt-2 text-red-600">Render Error: {String(renderError)}</div>
            <div>Container ready: {containerReady ? 'Yes' : 'No'}</div>
            <div>Map initialized: {mapInitialized ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    );
  }
};

export default InteractiveMap;
