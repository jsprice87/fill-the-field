
import React, { useCallback } from 'react';
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
    ready: () => {
      addDebugLog('Map ready event fired');
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

  addDebugLog(`Attempting to render MapContainer with ${validLocations.length} markers at center: ${centerLat}, ${centerLng}`);

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
      >
        <MapEventHandler onError={onMapError} addDebugLog={addDebugLog} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          onLoading={() => addDebugLog('TileLayer loading started')}
          onLoad={() => addDebugLog('TileLayer loaded successfully')}
          onTileError={(e) => {
            addDebugLog(`TileLayer error: ${e.error}`);
            console.error('TileLayer error:', e);
          }}
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
    );
  } catch (renderError) {
    addDebugLog(`MapContent render error: ${renderError}`);
    console.error('MapContent render error:', renderError);
    onMapError(`Map rendering failed: ${renderError}`);
    return null;
  }
};

export default MapContent;
