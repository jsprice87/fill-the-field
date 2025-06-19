
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@mantine/core';
import { Calendar, MapPin, Users, Clock, Star, ChevronRight } from 'lucide-react';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeData';
import { useLocations } from '@/hooks/useLocations';
import InteractiveMap from '@/components/maps/InteractiveMap';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ClassType {
  id: string;
  name: string;
}

interface LocationType {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

const BookingLanding: React.FC = () => {
  const navigate = useNavigate();
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [availableClassTypes, setAvailableClassTypes] = useState<ClassType[]>([]);
  const [mapToken, setMapToken] = useState<string | null>(null);

  const { data: franchisee, isLoading: isFranchiseeLoading, isError: isFranchiseeError } = useFranchiseeBySlug(franchiseeSlug as string);
  const { data: locations, isLoading: isLocationsLoading, isError: isLocationsError } = useLocations(franchisee?.id as string);

  useEffect(() => {
    if (franchisee) {
      setMapToken(franchisee.map_token || null);
    }
  }, [franchisee]);

  useEffect(() => {
    // Mock class types data
    setAvailableClassTypes([
      { id: '1', name: 'Lil Kickers (Ages 3-5)' },
      { id: '2', name: 'Skills Training (Ages 6-10)' },
      { id: '3', name: 'Advanced Academy (Ages 11-14)' },
    ]);
  }, []);

  const handleClassTypeSelect = (classType: ClassType) => {
    setSelectedClassType(classType);
  };

  const handleLocationSelect = (location: LocationType) => {
    setSelectedLocation(location);
  };

  const handleFindClasses = () => {
    if (!selectedLocation) {
      toast.error('Please select a location to find classes.');
      return;
    }

    navigate(`/booking/${franchiseeSlug}/location/${selectedLocation.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-brand-blue">
            {franchisee?.company_name || 'Your Soccer Academy'}
          </a>
          <nav>
            <a href="#" className="text-gray-600 hover:text-brand-blue mx-3">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-brand-blue mx-3">
              Programs
            </a>
            <a href="#" className="text-gray-600 hover:text-brand-blue mx-3">
              Contact
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Your Soccer Classes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find and book soccer classes for kids of all ages and skill levels. Professional coaching in a fun, supportive environment.
          </p>
          <Button
            size="lg"
            onClick={handleFindClasses}
            className="bg-brand-blue text-white hover:bg-brand-blue/90 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Find Classes Near You
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Class Types Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Explore Our Classes
            </h2>
            <div className="space-y-4">
              {availableClassTypes.map((classType) => (
                <Card
                  key={classType.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 ${selectedClassType?.id === classType.id ? 'border-2 border-brand-blue' : ''}`}
                  onClick={() => handleClassTypeSelect(classType)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">{classType.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Brief description of the class and age group.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Location Selection Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Choose a Location
            </h2>
            {mapToken && locations ? (
              <InteractiveMap
                locations={locations}
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                mapToken={mapToken}
              />
            ) : (
              <Card className="h-80 flex items-center justify-center">
                <CardContent className="text-center">
                  {isFranchiseeLoading || isLocationsLoading ? (
                    <p>Loading locations...</p>
                  ) : isFranchiseeError || isLocationsError ? (
                    <p>Error loading locations.</p>
                  ) : (
                    <p>No locations available.</p>
                  )}
                </CardContent>
              </Card>
            )}
            {selectedLocation && (
              <div className="mt-4">
                <Badge className="bg-brand-blue text-white">
                  Selected: {selectedLocation.name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingLanding;
