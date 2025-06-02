import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Button } from '@/components/ui/button';
import { RotateCcw, MapPin, AlertTriangle } from 'lucide-react';
import LocationMarker from './LocationMarker';
import MapErrorBoundary from './MapErrorBoundary';
import mapConfig from '@/assets/map-style.json';
import { supabase } from '@/integrations/supabase/client';
import { geocodeLocations, getGeocodingCacheStats } from '@/utils/freeGeocoding';
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
  const [franchiseeId, setFranchiseeId] = useState<string | null>(null);
  const [geocodingProgress, setGeocodingProgress] = useState({ completed: 0, total: 0 });
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [hasPartialResults, setHasPartialResults] = useState(false);

  // Cleanup function to cancel ongoing requests
  useEffect(() => {
    return () => {
      // Cancel any ongoing geocoding requests when component unmounts
      console.log('InteractiveMap: Component unmounting, cleaning up...');
    };
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      loadLocationData();
    } else {
      setIsLoading(false);
    }
  }, [locations]);

  const loadLocationData = async () => {
    setIsLoading(true);
    setGeocodingError(null);
    setHasPartialResults(false);
    
    try {
      // Validate locations array
      if (!Array.isArray(locations) || locations.length === 0) {
        setLocationData([]);
        setIsLoading(false);
        return;
      }

      // Get franchisee ID first
      const { data: franchisee } = await supabase
        .from('franchisees')
        .select('id')
        .eq('slug', franchiseeSlug)
        .single();

      if (!franchisee) {
        throw new Error('Franchisee not found');
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

      // Check if we have existing coordinates
      const hasExistingCoordinates = locations.some(loc => {
        const hasCoordinates = loc.latitude && loc.longitude && 
          !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude));
        return hasCoordinates;
      });

      // Process locations with existing coordinates first
      const enrichedLocations = [];
      
      // First pass: Add locations that already have coordinates
      for (const location of locations) {
        if (location.latitude && location.longitude && 
            !isNaN(Number(location.latitude)) && !isNaN(Number(location.longitude))) {
          
          const latitude = Number(location.latitude);
          const longitude = Number(location.longitude);
          
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
      }

      // Show partial results immediately if we have some coordinates
      if (enrichedLocations.length > 0) {
        console.log(`Showing ${enrichedLocations.length} locations with existing coordinates`);
        setLocationData(enrichedLocations);
        setHasPartialResults(enrichedLocations.length < locations.length);
        calculateMapBounds(enrichedLocations);
        
        // If we have all coordinates, we're done
        if (enrichedLocations.length === locations.length) {
          setIsLoading(false);
          return;
        }
      }

      // Prepare locations that need geocoding
      const locationsToGeocode = locations
        .filter(loc => {
          const hasCoordinates = loc.latitude && loc.longitude && 
            !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude));
          return !hasCoordinates;
        })
        .map(loc => ({
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zip: loc.zip
        }));

      if (locationsToGeocode.length > 0) {
        console.log(`Need to geocode ${locationsToGeocode.length} locations`);
        
        // Initialize progress
        setGeocodingProgress({ completed: 0, total: locationsToGeocode.length });
        
        // Geocode with progress callback
        const geocodedResults = await geocodeLocations(
          locationsToGeocode, 
          currentFranchiseeId,
          (completed, total) => {
            setGeocodingProgress({ completed, total });
          }
        );

        // Process geocoded results
        let geocodeIndex = 0;
        for (let i = 0; i < locations.length; i++) {
          const location = locations[i];
          
          // Skip if we already processed this location
          if (location.latitude && location.longitude && 
              !isNaN(Number(location.latitude)) && !isNaN(Number(location.longitude))) {
            continue;
          }
          
          const geocoded = geocodedResults[geocodeIndex];
          geocodeIndex++;
          
          if (!geocoded) {
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
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            address: `${location.address}, ${location.city}, ${location.state}`,
            classDays,
            timeOfDay,
            ageRange
          });
        }
      }

      console.log(`Successfully processed ${enrichedLocations.length} out of ${locations.length} locations`);
      setLocationData(enrichedLocations);
      
      // Calculate map bounds for all successfully processed locations
      if (enrichedLocations.length > 0) {
        calculateMapBounds(enrichedLocations);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      setGeocodingError(error instanceof Error ? error.message : 'Unknown error occurred');
      // Don't completely fail - show what we can
      if (locationData.length > 0) {
        setHasPartialResults(true);
      } else {
        setLocationData([]);
      }
    } finally {
      setIsLoading(false);
    }
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

    // Validate coordinates before calculating bounds
    const validLocations = locations.filter(loc => 
      typeof loc.latitude === 'number' && 
      typeof loc.longitude === 'number' &&
      !isNaN(loc.latitude) && 
      !isNaN(loc.longitude)
    );

    if (validLocations.length === 0) return;

    const latitudes = validLocations.map(loc => loc.latitude);
    const longitudes = validLocations.map(loc => loc.longitude);

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

  // Error state
  if (geocodingError && locationData.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200 ${className}`}>
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="font-agrandir text-xl text-red-800 mb-2">Map Loading Failed</h3>
          <p className="font-poppins text-red-600 mb-4 max-w-md">
            {geocodingError}
          </p>
          <Button onClick={loadLocationData} variant="outline" className="font-poppins">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No locations state
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

  // Loading state
  if (isLoading && locationData.length === 0) {
    const isGeocoding = geocodingProgress.total > 0;
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy mx-auto mb-4"></div>
          <p className="font-poppins text-gray-600 text-lg mb-2">
            {isGeocoding ? 'Finding location coordinates...' : 'Loading map...'}
          </p>
          {isGeocoding && (
            <>
              <p className="font-poppins text-gray-500 text-sm mb-3">
                Using free geocoding services (OpenStreetMap & LocationIQ)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-brand-blue h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${geocodingProgress.total > 0 ? (geocodingProgress.completed / geocodingProgress.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <p className="font-poppins text-gray-500 text-xs">
                {geocodingProgress.completed} of {geocodingProgress.total} locations processed
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // No geocoded locations state
  if (locationData.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 font-poppins">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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

  // No bounds calculated state
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
    <MapErrorBoundary>
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
        
        {/* Show partial results warning */}
        {hasPartialResults && (
          <div className="absolute top-4 left-4 z-[1000] bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg">
            <p className="font-poppins text-yellow-800 text-sm">
              Showing {locationData.length} of {locations.length} locations on map
            </p>
          </div>
        )}
        
        {/* Show geocoding error if there is one but we have partial results */}
        {geocodingError && locationData.length > 0 && (
          <div className="absolute top-4 right-4 z-[1000] bg-red-100 border border-red-400 rounded-lg p-3 shadow-lg max-w-xs">
            <p className="font-poppins text-red-800 text-xs">
              Some locations couldn't be geocoded: {geocodingError}
            </p>
          </div>
        )}
        
        {/* Show free service indicator */}
        {!geocodingError && (
          <div className="absolute top-4 right-4 z-[1000] bg-green-100 border border-green-400 rounded-lg p-2 shadow-lg">
            <p className="font-poppins text-green-800 text-xs">
              🌍 Free OpenStreetMap
            </p>
          </div>
        )}
      </div>
    </MapErrorBoundary>
  );
};

export default InteractiveMap;
