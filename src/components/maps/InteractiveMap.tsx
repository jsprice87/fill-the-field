
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import LocationMarker from './LocationMarker';
import mapConfig from '@/assets/map-style.json';
import { supabase } from '@/integrations/supabase/client';
import 'leaflet/dist/leaflet.css';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
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

  // Filter locations with valid coordinates
  const validLocations = locations.filter(loc => 
    loc.latitude && loc.longitude && 
    !isNaN(Number(loc.latitude)) && !isNaN(Number(loc.longitude))
  );

  useEffect(() => {
    if (validLocations.length > 0) {
      loadLocationClassData();
      calculateMapBounds();
    }
  }, [validLocations]);

  const loadLocationClassData = async () => {
    setIsLoading(true);
    try {
      const locationIds = validLocations.map(loc => loc.id);
      
      // Get classes and schedules for these locations
      const { data: classes } = await supabase
        .from('classes')
        .select(`
          *,
          class_schedules(*)
        `)
        .in('location_id', locationIds)
        .eq('is_active', true);

      const enrichedLocations = validLocations.map(location => {
        const locationClasses = classes?.filter(c => c.location_id === location.id) || [];
        
        // Extract class days and times
        const allSchedules = locationClasses.flatMap(c => c.class_schedules || []);
        const classDays = [...new Set(allSchedules.map(s => getDayName(s.day_of_week)))].filter(Boolean);
        
        // Determine time of day
        const timeOfDay = getTimeOfDay(allSchedules);
        
        // Calculate age range
        const ageRange = getAgeRange(locationClasses);

        return {
          id: location.id,
          name: location.name,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
          address: `${location.address}, ${location.city}, ${location.state}`,
          classDays,
          timeOfDay,
          ageRange
        };
      });

      setLocationData(enrichedLocations);
    } catch (error) {
      console.error('Error loading location class data:', error);
      // Fallback to basic location data
      setLocationData(validLocations.map(loc => ({
        id: loc.id,
        name: loc.name,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        address: `${loc.address}, ${loc.city}, ${loc.state}`,
        classDays: [],
        timeOfDay: '',
        ageRange: ''
      })));
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

  const calculateMapBounds = () => {
    if (validLocations.length === 0) return;

    const latitudes = validLocations.map(loc => Number(loc.latitude));
    const longitudes = validLocations.map(loc => Number(loc.longitude));

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

  if (validLocations.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 font-poppins">
            <p className="text-lg mb-2">Map Not Available</p>
            <p className="text-sm">No locations have coordinates set for mapping</p>
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
          <p className="font-poppins text-gray-600 text-sm">Loading map...</p>
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
    </div>
  );
};

export default InteractiveMap;
