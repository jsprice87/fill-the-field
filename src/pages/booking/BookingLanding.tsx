import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Clock, Star, ArrowRight, Phone, Mail } from 'lucide-react';
import { Button } from '@mantine/core';
import { supabase } from '@/integrations/supabase/client';
import { useGeocodedLocations } from '@/hooks/useGeocodedLocations';
import { toast } from 'sonner';
import LocationsMap from '@/components/maps/LocationsMap';
import { MetaPixelProvider } from '@/components/booking/MetaPixelProvider';
import { Loader } from '@/components/ui/Loader';

interface ClassInfo {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
  min_age: number;
  max_age: number;
}

interface LocationInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
}

const BookingLanding: React.FC = () => {
  const { franchiseeSlug } = useParams();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);
  const [availableLocations, setAvailableLocations] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [showMapTokenInput, setShowMapTokenInput] = useState(false);
  const { geocodedLocations, isLoading: isGeocoding, error: geocodingError, retryGeocode } = useGeocodedLocations(availableLocations, mapboxToken);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch franchisee profile
        const { data: franchisee, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('id')
          .eq('slug', franchiseeSlug)
          .single();

        if (franchiseeError) {
          console.error("Error fetching franchisee:", franchiseeError);
          setError("Unable to find franchisee. Please check the URL.");
          return;
        }

        const franchiseeId = franchisee.id;

        // Fetch classes
        const { data: classes, error: classesError } = await (supabase
          .from('classes')
          .select('*')
          .eq('franchisee_id', franchiseeId)
          .eq('is_active', true) as any);

        if (classesError) {
          console.error("Error fetching classes:", classesError);
          setError("Failed to load classes. Please try again.");
          return;
        }
        setAvailableClasses(classes || []);

        // Fetch locations
        const { data: locations, error: locationsError } = await (supabase
          .from('locations')
          .select('*')
          .eq('franchisee_id', franchiseeId)
          .eq('is_active', true) as any);

        if (locationsError) {
          console.error("Error fetching locations:", locationsError);
          setError("Failed to load locations. Please try again.");
          return;
        }
        setAvailableLocations(locations || []);

        // Fetch global settings for Mapbox token with type casting
        const { data: globalSettings, error: globalSettingsError } = await supabase
          .from('global_settings')
          .select('setting_value')
          .eq('setting_key', 'mapbox_public_token')
          .single();

        if (globalSettingsError) {
          console.error("Error fetching Mapbox token:", globalSettingsError);
        }

        const settingsData = globalSettings as any;
        if (settingsData && settingsData.setting_value) {
          setMapboxToken(String(settingsData.setting_value));
        } else {
          setShowMapTokenInput(true);
        }

      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [franchiseeSlug]);

  const handleClassSelect = (classItem: ClassInfo) => {
    setSelectedClass(classItem);
  };

  const handleLocationSelect = (location: LocationInfo) => {
    setSelectedLocation(location);
  };

  const handleContinue = () => {
    if (!selectedClass || !selectedLocation) {
      toast.error("Please select a class and a location to continue.");
      return;
    }

    navigate(`/${franchiseeSlug}/booking/class?classId=${selectedClass.id}&locationId=${selectedLocation.id}`);
  };

  const handleMapboxTokenSubmit = (token: string) => {
    setMapboxToken(token);
    setShowMapTokenInput(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <MetaPixelProvider franchiseeSlug={franchiseeSlug}>
      <div className="container mx-auto mt-8 p-4 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Book a Free Trial Class</CardTitle>
            <Badge variant="secondary">Free Trial</Badge>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Choose a Class</h3>
                <div className="space-y-2">
                  {availableClasses.map((classItem) => (
                    <Card key={classItem.id}
                      className={`border-2 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedClass?.id === classItem.id ? 'border-brand-blue' : 'border-gray-200'
                        }`}
                    >
                      <CardContent className="p-3 cursor-pointer" onClick={() => handleClassSelect(classItem)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{classItem.name}</h4>
                            <p className="text-sm text-gray-500">{classItem.description}</p>
                          </div>
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{classItem.min_age}-{classItem.max_age} years</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{classItem.duration_minutes} minutes</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableClasses.length === 0 && (
                    <div className="text-gray-500">No classes available.</div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">2. Choose a Location</h3>
                <div className="space-y-2">
                  {availableLocations.map((location) => (
                    <Card key={location.id}
                      className={`border-2 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 ${selectedLocation?.id === location.id ? 'border-brand-blue' : 'border-gray-200'
                        }`}
                    >
                      <CardContent className="p-3 cursor-pointer" onClick={() => handleLocationSelect(location)}>
                        <h4 className="font-semibold text-lg">{location.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{location.address}, {location.city}, {location.state} {location.zip}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-4 w-4" />
                          <span>{location.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-4 w-4" />
                          <span>{location.email}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {availableLocations.length === 0 && (
                    <div className="text-gray-500">No locations available.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-md">
              {mapboxToken ? (
                <LocationsMap
                  locations={geocodedLocations}
                  loading={isGeocoding}
                  error={geocodingError}
                  onRetry={retryGeocode}
                  selectedLocationId={selectedLocation?.id}
                />
              ) : (
                <div className="p-6 text-center">
                  {showMapTokenInput ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        A valid Mapbox token is required to display the map.
                      </p>
                      {/*  MapboxTokenInput component here if needed */}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Loading map...</p>
                  )}
                </div>
              )}
            </div>

            <Button
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins"
              onClick={handleContinue}
              disabled={!selectedClass || !selectedLocation}
            >
              Continue to Booking <ArrowRight className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </MetaPixelProvider>
  );
};

export default BookingLanding;
