
import React, { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

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

interface MapContentProps {
  validLocations: Location[];
  centerLat: number;
  centerLng: number;
  onLocationSelect?: (location: any) => void;
  onMapReady: () => void;
  onMapError: (error: string) => void;
  addDebugLog: (message: string) => void;
}

// Component to handle map events with proper hooks
const MapEventHandler: React.FC<{ onError: (error: string) => void; addDebugLog: (message: string) => void }> = ({ onError, addDebugLog }) => {
  useMapEvents({
    tileerror: (e) => {
      addDebugLog('Tile loading error occurred');
      console.error('🗺️ MAP DEBUG: Tile loading error', e);
      onError('Map tiles failed to load');
    },
    error: (e) => {
      addDebugLog('Map error event occurred');
      console.error('🗺️ MAP DEBUG: Map error event', e);
      onError('Map failed to initialize');
    },
    load: () => {
      addDebugLog('Map load event fired');
    },
    zoomend: () => {
      addDebugLog('Map zoom ended');
    },
    moveend: () => {
      addDebugLog('Map move ended');
    }
  });
  return null;
};

const MapContent: React.FC<MapContentProps> = ({
  validLocations,
  centerLat,
  centerLng,
  onLocationSelect,
  onMapReady,
  onMapError,
  addDebugLog
}) => {
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [lastError, setLastError] = useState<string>('');

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

  // Progressive validation before rendering
  useEffect(() => {
    addDebugLog('MapContent: Starting progressive validation...');
    
    // Validate center coordinates
    if (isNaN(centerLat) || isNaN(centerLng) || !isFinite(centerLat) || !isFinite(centerLng)) {
      const error = `Invalid center coordinates: ${centerLat}, ${centerLng}`;
      addDebugLog(`❌ ${error}`);
      onMapError(error);
      return;
    }
    
    // Validate locations
    if (!validLocations || validLocations.length === 0) {
      const error = 'No valid locations provided';
      addDebugLog(`❌ ${error}`);
      onMapError(error);
      return;
    }
    
    // Check for location coordinate validity
    const invalidLocations = validLocations.filter(loc => 
      !loc.latitude || !loc.longitude || 
      isNaN(loc.latitude) || isNaN(loc.longitude) ||
      !isFinite(loc.latitude) || !isFinite(loc.longitude)
    );
    
    if (invalidLocations.length === validLocations.length) {
      const error = 'All locations have invalid coordinates';
      addDebugLog(`❌ ${error}`);
      onMapError(error);
      return;
    }
    
    addDebugLog('✅ Progressive validation passed');
  }, [centerLat, centerLng, validLocations, onMapError, addDebugLog]);

  addDebugLog(`Attempting to render MapContainer (attempt ${renderAttempts + 1}) with ${validLocations.length} markers at center: ${centerLat}, ${centerLng}`);

  try {
    return (
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => {
          addDebugLog('MapContainer whenReady callback fired');
          onMapReady();
        }}
        whenCreated={(mapInstance) => {
          addDebugLog('MapContainer created successfully');
          console.log('Map instance created:', mapInstance);
        }}
      >
        <MapEventHandler onError={onMapError} addDebugLog={addDebugLog} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            loading: () => addDebugLog('TileLayer loading started'),
            load: () => addDebugLog('TileLayer loaded successfully'),
            tileerror: (e) => {
              addDebugLog(`TileLayer tile error: ${e.error}`);
              console.error('TileLayer tile error:', e);
            }
          }}
        />
        {validLocations
          .filter(location => 
            location.latitude && location.longitude && 
            !isNaN(location.latitude) && !isNaN(location.longitude) &&
            isFinite(location.latitude) && isFinite(location.longitude)
          )
          .map((location) => {
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
    );
  } catch (renderError) {
    const errorMessage = `MapContent render error: ${renderError}`;
    addDebugLog(errorMessage);
    console.error('MapContent render error:', renderError);
    
    // Track render attempts and prevent infinite loops
    setRenderAttempts(prev => prev + 1);
    setLastError(errorMessage);
    
    if (renderAttempts < 3) {
      // Try to render again after a delay
      setTimeout(() => {
        addDebugLog(`Retrying MapContent render (attempt ${renderAttempts + 2})`);
      }, 1000);
    } else {
      addDebugLog('Max render attempts reached, failing over to fallback');
      onMapError(`Map rendering failed after ${renderAttempts + 1} attempts: ${renderError}`);
    }
    
    return null;
  }
};

export default MapContent;
