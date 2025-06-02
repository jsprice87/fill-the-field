import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import LocationMarker from './LocationMarker';
import MapboxTokenInput from './MapboxTokenInput';
import mapConfig from '@/assets/map-style.json';
import { supabase } from '@/integrations/supabase/client';
import { geocodeLocationsWithMapbox, getGeocodingCacheStats } from '@/utils/mapboxGeocoding';
import 'leaflet/dist/leaflet.css';

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
  franchiseeSlug: string;
  flowId?: string;
  onLocationSelect: (location: any) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  locations,
  franchiseeSlug,
  flowId,
  onLocationSelect,
  className = ""
}) => {
  const mapRef = useRef<any>(null);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [locationData, setLocationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsMapboxToken, setNeedsMapboxToken] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [franchiseeId, setFranchiseeId] = useState<string | null>(null);

  useEffect(() => {
    if (locations.length > 0) {
      loadLocationData();
    } else {
      setIsLoading(false);
    }
  }, [locations, mapboxToken]);

  const loadLocationData = async () => {
    setIsLoading(true);
    
    try {
      // Get franchisee ID first
      const { data: franchisee } = await supabase
        .from('franchisees')
        .select('id')
        .eq('slug', franchiseeSlug)
        .single();

      if (!franchisee) {
        console.error('Franchisee not found');
        setIsLoading(false);
        return;
      }

      const currentFranchiseeId = franchisee.id;
      setFranchiseeId(currentFranchiseeId);

      // Check cache stats
      const cacheStats = getGeocodingCacheStats(currentFranchiseeId);
      console.log('Geocoding cache stats:', cacheStats);

      // Get classes and schedules for these locations
      const locationIds = locations.map(loc => loc.id);
      const { data: classes } = await supabase
        .from('classes')
        .select(`
          *,
          class_schedules(*)
        `)
        .in('location_id', locationIds)
        .eq('is_active', true);

      // Try to geocode locations using existing coordinates or Mapbox
      const locationsToGeocode = locations.map(loc => ({
        address: loc.address,
        city: loc.city,
        state: loc.state,
        zip: loc.zip
      }));

      // First, check if we have any locations that need geocoding and don't have cached results
      const hasUngeocodedLocations = locations.some(loc => {
        const hasCoordinates = loc.latitude && loc.longitude && 
          !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude));
        return !hasCoordinates;
      });

      let geocodedResults: (any | null)[] = [];

      if (hasUngeocodedLocations) {
        // Try geocoding with Mapbox (will use cache if available)
        geocodedResults = await geocodeLocationsWithMapbox(
          locationsToGeocode, 
          currentFranchiseeId, 
          mapboxToken || undefined
        );

        // Check if we need a Mapbox token for remaining locations
        const stillNeedGeocoding = geocodedResults.some((result, index) => {
          const location = locations[index];
          const hasExistingCoords = location.latitude && location.longitude && 
            !isNaN(Number(location.latitude)) && !isNaN(Number(location.longitude));
          return !hasExistingCoords && !result;
        });

        if (stillNeedGeocoding && !mapboxToken) {
          setNeedsMapboxToken(true);
          setIsLoading(false);
          return;
        }
      }

      // Process each location and enrich with class data
      const enrichedLocations = [];
      
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const geocoded = geocodedResults[i];
        
        // Use existing coordinates or geocoded coordinates
        let latitude: number | null = null;
        let longitude: number | null = null;

        if (location.latitude && location.longitude && 
            !isNaN(Number(location.latitude)) && !isNaN(Number(location.longitude))) {
          latitude = Number(location.latitude);
          longitude = Number(location.longitude);
        } else if (geocoded) {
          latitude = geocoded.latitude;
          longitude = geocoded.longitude;
        }

        if (!latitude || !longitude) {
          console.warn(`Skipping location ${location.name} - no coordinates available`);
          continue;
        }
        
        // Get class information for this location
        const locationClasses = classes?.filter(c => c.location_id === location.id) || [];
        
        // Extract class days and times
        const allSchedules = locationClasses.flatMap(c => c.class_schedules || []);
        const classDays = [...new Set(allSchedules.map(s => getDayName(s.day_of_week)))].filter(Boolean);
        
        // Determine time of day
        const timeOfDay = getTimeOfDay(allSchedules);
        
        // Calculate age range
        const ageRange = getAgeRange(locationClasses);

        enrichedLocations.push({
          id: location.id,
          name: location.name,
          latitude,
          longitude,
          address: `${location.address}, ${location.city}, ${location.state}`,
          classDays,
          timeOfDay,
          ageRange
        });
      }

      console.log(`Successfully processed ${enrichedLocations.length} out of ${locations.length} locations`);
      setLocationData(enrichedLocations);
      
      // Calculate map bounds for successfully geocoded locations
      if (enrichedLocations.length > 0) {
        calculateMapBounds(enrichedLocations);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      setLocationData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapboxTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setNeedsMapboxToken(false);
    // This will trigger useEffect to reload data with the token
  };

  const getDayName = (dayNumber?: number) => {
    if (dayNumber === undefined || dayNumber === null) return '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNumber] || '';
  };

  const getTimeOfDay = (schedules: any[]) => {
    if (!schedules || schedules.length === 0) return '';
    
    const times = schedules.map(s => s.start_time).filter(Boolean);
    if (times.length === 0) return '';

    const timeCategories = new Set();
    times.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      if (hour < 12) timeCategories.add('Morning');
      else if (hour < 17) timeCategories.add('Afternoon');
      else timeCategories.add('Evening');
    });

    return Array.from(timeCategories).join(', ');
  };

  const getAgeRange = (classes: any[]) => {
    if (!classes || classes.length === 0) return '';
    
    const ages = classes.flatMap(c => [c.min_age, c.max_age]).filter(age => age !== null && age !== undefined);
    if (ages.length === 0) return '';

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    return minAge === maxAge ? `Age ${minAge}` : `Ages ${minAge}-${maxAge}`;
  };

  const calculateMapBounds = (locations: any[]) => {
    if (locations.length === 0) return;

    const latitudes = locations.map(loc => loc.latitude);
    const longitudes = locations.map(loc => loc.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    const bounds = new LatLngBounds(
      [minLat - latPadding, minLng - lngPadding],
      [maxLat + latPadding, maxLng + lngPadding]
    );

    setMapBounds(bounds);
  };

  const resetView = () => {
    if (mapRef.current && mapBounds) {
      mapRef.current.fitBounds(mapBounds);
    }
  };

  if (locations.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 font-poppins">
            <p className="text-lg mb-2">No Locations Available</p>
            <p className="text-sm">No active locations found for this franchisee</p>
          </div>
        </div>
      </div>
    );
  }

  if (needsMapboxToken) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <MapboxTokenInput onTokenSubmit={handleMapboxTokenSubmit} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600 text-lg mb-2">Loading map...</p>
          <p className="font-poppins text-gray-500 text-sm">
            {mapboxToken ? 'Geocoding locations...' : 'Checking cached locations...'}
          </p>
        </div>
      </div>
    );
  }

  if (locationData.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 font-poppins">
            <p className="text-lg mb-2">Map Not Available</p>
            <p className="text-sm">Unable to find coordinates for the locations</p>
            <p className="text-xs mt-2 text-gray-400">
              Locations may have incomplete address information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!mapBounds) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy mx-auto mb-2"></div>
          <p className="font-poppins text-gray-600 text-sm">Calculating map bounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        ref={mapRef}
        bounds={mapBounds}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          url={mapConfig.tileLayer.url}
          attribution={mapConfig.tileLayer.attribution}
          maxZoom={mapConfig.tileLayer.maxZoom}
          minZoom={mapConfig.tileLayer.minZoom}
        />
        
        {locationData.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            franchiseeSlug={franchiseeSlug}
            flowId={flowId}
            onLocationSelect={onLocationSelect}
          />
        ))}
      </MapContainer>

      <Button
        onClick={resetView}
        variant="outline"
        size="sm"
        className="absolute bottom-4 left-4 z-[1000] bg-white/95 hover:bg-white font-poppins shadow-lg"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Reset View
      </Button>
      
      {/* Show success message if some locations were geocoded */}
      {locationData.length > 0 && locationData.length < locations.length && (
        <div className="absolute top-4 left-4 z-[1000] bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg">
          <p className="font-poppins text-yellow-800 text-sm">
            Showing {locationData.length} of {locations.length} locations on map
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
