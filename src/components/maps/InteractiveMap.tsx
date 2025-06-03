
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
      console.error('Map tile loading error');
      onError('Map tiles failed to load');
    },
    error: () => {
      console.error('Map error event');
      onError('Map failed to initialize');
    }
  });
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
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe state update function
  const safeSetState = useCallback((updateFn: () => void) => {
    if (isMountedRef.current) {
      updateFn();
    }
  }, []);

  const processLocations = useCallback(() => {
    if (!locations || locations.length === 0) {
      console.log('No locations to process');
      safeSetState(() => {
        setValidLocations([]);
        setIsLoading(false);
      });
      return;
    }

    console.log('Processing locations:', locations.length);
    safeSetState(() => {
      setIsLoading(true);
      setError('');
    });

    // Filter locations that have valid coordinates
    const locationsWithCoords = locations.filter(location => 
      location && 
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
      isFinite(location.longitude)
    );

    console.log(`Found ${locationsWithCoords.length} locations with valid coordinates out of ${locations.length} total`);

    if (locationsWithCoords.length === 0) {
      safeSetState(() => {
        setError(`No locations have coordinates yet. Please edit your locations to refresh their addresses.`);
        setValidLocations([]);
        setIsLoading(false);
      });
      return;
    }

    if (locationsWithCoords.length < locations.length) {
      const missingCount = locations.length - locationsWithCoords.length;
      console.warn(`${missingCount} locations are missing coordinates`);
    }

    safeSetState(() => {
      setValidLocations(locationsWithCoords);
      setIsLoading(false);
    });
  }, [locations, safeSetState]);

  const handleMarkerClick = useCallback((location: Location) => {
    try {
      if (onLocationSelect && location) {
        onLocationSelect({
          id: location.id,
          name: location.name,
          address: `${location.address}, ${location.city}, ${location.state}`
        });
      }
    } catch (error) {
      console.error('Error handling marker click:', error);
    }
  }, [onLocationSelect]);

  const handleMapError = useCallback((errorMessage: string) => {
    console.error('Map error:', errorMessage);
    safeSetState(() => setMapError(errorMessage));
  }, [safeSetState]);

  const retryMapLoad = useCallback(() => {
    safeSetState(() => {
      setMapError('');
      setError('');
    });
    processLocations();
  }, [processLocations, safeSetState]);

  useEffect(() => {
    processLocations();
  }, [processLocations]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className={className} style={{ height }}>
        <MapErrorFallback 
          error={error || mapError} 
          onRetry={retryMapLoad}
        />
      </div>
    );
  }

  if (!validLocations || validLocations.length === 0) {
    return (
      <div className={className} style={{ height }}>
        <MapErrorFallback 
          error="No locations available to display on map"
          showRetry={false}
        />
      </div>
    );
  }

  try {
    // Calculate map center
    const centerLat = validLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / validLocations.length;
    const centerLng = validLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / validLocations.length;

    // Validate calculated center
    if (isNaN(centerLat) || isNaN(centerLng) || !isFinite(centerLat) || !isFinite(centerLng)) {
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
      <div style={{ height }} className={`rounded-lg overflow-hidden border ${className}`}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <MapEventHandler onError={handleMapError} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validLocations.map((location) => (
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
          ))}
        </MapContainer>
      </div>
    );
  } catch (renderError) {
    console.error('Error rendering map:', renderError);
    return (
      <div className={className} style={{ height }}>
        <MapErrorFallback 
          error="Map rendering failed"
          onRetry={retryMapLoad}
        />
      </div>
    );
  }
};

export default InteractiveMap;
