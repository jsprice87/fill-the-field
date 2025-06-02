
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { batchGeocodeWithMapbox } from '@/utils/batchMapboxGeocoding';
import { supabase } from '@/integrations/supabase/client';
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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [geocodedLocations, setGeocodedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [mapError, setMapError] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
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

  const loadMapboxToken = useCallback(async () => {
    try {
      console.log('Loading Mapbox token...');
      
      // Use the edge function to get the global setting
      const { data, error } = await supabase.functions.invoke('get-global-setting', {
        body: { setting_name: 'mapbox_public_token' }
      });

      if (error) {
        console.log('Edge function failed, trying direct query...', error);
        
        // Fallback: try direct query if edge function doesn't work
        const { data: directData, error: directError } = await supabase
          .from('global_settings' as any)
          .select('setting_value')
          .eq('setting_key', 'mapbox_public_token')
          .single();

        if (directError && directError.code !== 'PGRST116') {
          console.error('Error loading Mapbox token:', directError);
          safeSetState(() => {
            setError('Failed to load map configuration');
            setIsLoading(false);
          });
          return;
        }

        if (directData && 'setting_value' in directData && directData.setting_value) {
          safeSetState(() => setMapboxToken(String(directData.setting_value)));
        } else {
          safeSetState(() => {
            setError('Mapbox token not configured. Please configure it in admin settings.');
            setIsLoading(false);
          });
        }
        return;
      }

      if (data) {
        console.log('Mapbox token loaded successfully');
        safeSetState(() => setMapboxToken(String(data)));
      } else {
        safeSetState(() => {
          setError('Mapbox token not configured. Please configure it in admin settings.');
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error('Error loading Mapbox token:', error);
      safeSetState(() => {
        setError('Failed to load map configuration');
        setIsLoading(false);
      });
    }
  }, [safeSetState]);

  const processLocations = useCallback(async () => {
    if (!locations || locations.length === 0) {
      console.log('No locations to process');
      safeSetState(() => {
        setGeocodedLocations([]);
        setIsLoading(false);
      });
      return;
    }

    console.log('Processing locations for geocoding:', locations.length);
    safeSetState(() => {
      setIsLoading(true);
      setError('');
      setProgress({ current: 0, total: locations.length });
    });

    try {
      // Validate location data
      const validLocations = locations.filter(location => 
        location && 
        typeof location.id === 'string' && 
        typeof location.address === 'string' &&
        typeof location.city === 'string' &&
        typeof location.state === 'string' &&
        typeof location.zip === 'string'
      );

      if (validLocations.length === 0) {
        safeSetState(() => {
          setError('No valid location data found');
          setIsLoading(false);
        });
        return;
      }

      // Format locations for geocoding
      const formattedLocations = validLocations.map(location => ({
        id: location.id,
        address: `${location.address}, ${location.city}, ${location.state} ${location.zip}`.trim()
      }));

      console.log('Processing locations for geocoding:', formattedLocations);

      const results = await batchGeocodeWithMapbox(formattedLocations, mapboxToken, (current, total) => {
        safeSetState(() => setProgress({ current, total }));
      });

      console.log('Geocoding results:', results);

      // Merge geocoding results with original location data
      const updatedLocations = validLocations.map(location => {
        const geocoded = results.find(r => r.id === location.id);
        if (geocoded && geocoded.coordinates) {
          return {
            ...location,
            latitude: geocoded.coordinates.lat,
            longitude: geocoded.coordinates.lng
          };
        }
        return location;
      });

      const validGeocodedLocations = updatedLocations.filter(loc => 
        loc.latitude && 
        loc.longitude && 
        !isNaN(loc.latitude) && 
        !isNaN(loc.longitude) &&
        isFinite(loc.latitude) &&
        isFinite(loc.longitude)
      );
      
      if (validGeocodedLocations.length === 0) {
        safeSetState(() => {
          setError(`Unable to find coordinates for any of the ${locations.length} locations. Please check that the addresses are complete and valid.`);
          setGeocodedLocations([]);
        });
      } else if (validGeocodedLocations.length < locations.length) {
        console.warn(`Only ${validGeocodedLocations.length} out of ${locations.length} locations could be geocoded`);
        safeSetState(() => setGeocodedLocations(validGeocodedLocations));
      } else {
        safeSetState(() => setGeocodedLocations(validGeocodedLocations));
      }
    } catch (error) {
      console.error('Error processing locations:', error);
      safeSetState(() => setError('Failed to process location coordinates'));
    } finally {
      safeSetState(() => setIsLoading(false));
    }
  }, [locations, mapboxToken, safeSetState]);

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
    if (mapboxToken && locations.length > 0) {
      processLocations();
    } else {
      loadMapboxToken();
    }
  }, [mapboxToken, locations, processLocations, loadMapboxToken, safeSetState]);

  useEffect(() => {
    loadMapboxToken();
  }, [loadMapboxToken]);

  useEffect(() => {
    if (mapboxToken && locations && locations.length > 0) {
      processLocations();
    }
  }, [mapboxToken, locations, processLocations]);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
          {progress.total > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Processing locations: {progress.current} / {progress.total}
            </p>
          )}
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

  if (!geocodedLocations || geocodedLocations.length === 0) {
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
    // Calculate map center with safety checks
    const validLocations = geocodedLocations.filter(loc => 
      loc.latitude && loc.longitude && 
      !isNaN(loc.latitude) && !isNaN(loc.longitude)
    );

    if (validLocations.length === 0) {
      return (
        <div className={className} style={{ height }}>
          <MapErrorFallback 
            error="No valid coordinates found for locations"
            onRetry={retryMapLoad}
          />
        </div>
      );
    }

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
