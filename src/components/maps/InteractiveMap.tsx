
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { batchGeocodeWithMapbox } from '@/utils/batchMapboxGeocoding';
import { supabase } from '@/integrations/supabase/client';

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [geocodedLocations, setGeocodedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    loadMapboxToken();
  }, []);

  useEffect(() => {
    if (mapboxToken && locations.length > 0) {
      processLocations();
    }
  }, [mapboxToken, locations]);

  const loadMapboxToken = async () => {
    try {
      // Use the edge function to get the global setting
      const { data, error } = await supabase.functions.invoke('get-global-setting', {
        body: { setting_name: 'mapbox_public_token' }
      });

      if (error) {
        // Fallback: try direct query if edge function doesn't work
        console.log('Edge function failed, trying direct query...');
        const { data: directData, error: directError } = await supabase
          .from('global_settings' as any)
          .select('setting_value')
          .eq('setting_key', 'mapbox_public_token')
          .single();

        if (directError && directError.code !== 'PGRST116') {
          console.error('Error loading Mapbox token:', directError);
          setError('Failed to load map configuration');
          setIsLoading(false);
          return;
        }

        if (directData?.setting_value) {
          setMapboxToken(String(directData.setting_value));
        } else {
          setError('Mapbox token not configured. Please configure it in admin settings.');
          setIsLoading(false);
        }
        return;
      }

      if (data) {
        setMapboxToken(String(data));
      } else {
        setError('Mapbox token not configured. Please configure it in admin settings.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading Mapbox token:', error);
      setError('Failed to load map configuration');
      setIsLoading(false);
    }
  };

  const processLocations = async () => {
    setIsLoading(true);
    setError('');
    setProgress({ current: 0, total: locations.length });

    try {
      // Format locations for geocoding
      const formattedLocations = locations.map(location => ({
        id: location.id,
        address: `${location.address}, ${location.city}, ${location.state} ${location.zip}`.trim()
      }));

      console.log('Processing locations for geocoding:', formattedLocations);

      const results = await batchGeocodeWithMapbox(formattedLocations, mapboxToken, (current, total) => {
        setProgress({ current, total });
      });

      console.log('Geocoding results:', results);

      // Merge geocoding results with original location data
      const updatedLocations = locations.map(location => {
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

      const validLocations = updatedLocations.filter(loc => loc.latitude && loc.longitude);
      
      if (validLocations.length === 0) {
        setError(`Unable to find coordinates for any of the ${locations.length} locations. Please check that the addresses are complete and valid.`);
      } else if (validLocations.length < locations.length) {
        console.warn(`Only ${validLocations.length} out of ${locations.length} locations could be geocoded`);
      }

      setGeocodedLocations(validLocations);
    } catch (error) {
      console.error('Error processing locations:', error);
      setError('Failed to process location coordinates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerClick = (location: Location) => {
    if (onLocationSelect) {
      onLocationSelect({
        id: location.id,
        name: location.name,
        address: `${location.address}, ${location.city}, ${location.state}`
      });
    }
  };

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

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Not Available</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (geocodedLocations.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Locations to Display</h3>
          <p className="text-gray-600">No valid coordinates found for the locations.</p>
        </div>
      </div>
    );
  }

  // Calculate map center and zoom
  const centerLat = geocodedLocations.reduce((sum, loc) => sum + (loc.latitude || 0), 0) / geocodedLocations.length;
  const centerLng = geocodedLocations.reduce((sum, loc) => sum + (loc.longitude || 0), 0) / geocodedLocations.length;

  return (
    <div style={{ height }} className={`rounded-lg overflow-hidden border ${className}`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geocodedLocations.map((location) => (
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
};

export default InteractiveMap;
