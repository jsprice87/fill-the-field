import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Group, Stack, Text, Title, Loader } from '@mantine/core';
import { MapPin, Clock, Users, Map, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import InteractiveMap from '@/components/maps/InteractiveMap';
interface BookingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}
function BookingError() {
  return (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <Text className="font-poppins text-gray-600 mb-4">Map component failed to load</Text>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    </div>
  );
}
const FindClasses: React.FC = () => {
  const {
    franchiseeSlug
  } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flow');
  const {
    flowData,
    loadFlow,
    updateFlow,
    isLoading: flowLoading
  } = useBookingFlow(flowId || undefined, franchiseeSlug);
  const [locations, setLocations] = useState<BookingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [franchiseeData, setFranchiseeData] = useState<any>(null);
  const [flowLoaded, setFlowLoaded] = useState(false);
  useEffect(() => {
    if (!flowId) {
      navigate(`/${franchiseeSlug}/free-trial`);
      return;
    }
    loadData();
  }, [franchiseeSlug, flowId]);
  const loadData = async () => {
    if (!franchiseeSlug || !flowId) {
      setError('Missing required parameters');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Load flow data first
      await loadFlow(flowId);
      setFlowLoaded(true);

      // Get franchisee by slug
      const {
        data: franchisee,
        error: franchiseeError
      } = await supabase.from('franchisees').select('*').eq('slug', franchiseeSlug).single();
      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }
      setFranchiseeData(franchisee);

      // Load locations for this franchisee
      const {
        data: locationsData,
        error: locationsError
      } = await supabase.from('locations').select('*').eq('franchisee_id', franchisee.id).eq('is_active', true).order('name');
      if (locationsError) {
        throw locationsError;
      }

      // Convert database locations to BookingLocation format with validation
      const convertedLocations: BookingLocation[] = (locationsData || []).filter(loc => {
        return loc && loc.id && loc.name && loc.address && loc.city && loc.state && loc.zip;
      }).map(loc => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        phone: loc.phone,
        email: loc.email,
        latitude: loc.latitude ? parseFloat(loc.latitude.toString()) : undefined,
        longitude: loc.longitude ? parseFloat(loc.longitude.toString()) : undefined
      })).filter(loc => {
        return typeof loc.id === 'string' && typeof loc.name === 'string' && typeof loc.address === 'string';
      });
      setLocations(convertedLocations);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      toast.error('Failed to load locations');
      // If flow loading fails, redirect to start over
      navigate(`/${franchiseeSlug}/free-trial`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLocationSelect = async (location: BookingLocation) => {
    if (!flowId) {
      toast.error('Session expired. Please start over.');
      return;
    }
    if (!location || !location.id || !location.name) {
      toast.error('Invalid location data. Please try again.');
      return;
    }
    try {
      // Update flow with selected location
      await updateFlow({
        selectedLocation: {
          id: location.id,
          name: location.name,
          address: `${location.address}, ${location.city}, ${location.state}`
        }
      });
      navigate(`/${franchiseeSlug}/free-trial/classes?flow=${flowId}`);
    } catch (error) {
      console.error('Error updating flow:', error);
      toast.error('Failed to select location. Please try again.');
    }
  };
  const handleRequestLocation = () => {
    // TODO: Implement location request modal
    toast.info('Location request feature coming soon');
  };
  const handleMapError = () => {
    setViewMode('list');
    toast.info('Map is unavailable, showing list view');
  };

  // Show loading state while data is being loaded
  if (isLoading || flowLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader color="var(--brand-navy)" size="lg" className="mx-auto mb-4" />
          <Text className="font-poppins text-gray-600">Loading locations...</Text>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Title order={2} className="font-agrandir text-2xl text-brand-navy mb-4">Unable to Load Locations</Title>
          <Text className="font-poppins text-gray-600 mb-6">{error}</Text>
          <Button onClick={() => navigate(`/${franchiseeSlug}/free-trial`)} className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
            Start Over
          </Button>
        </div>
      </div>
    );
  }
  const currentLeadData = flowData?.leadData;
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-6">
        <div className="container mx-auto px-4">
          <Title order={1} className="font-anton text-3xl mb-2 font-medium">SOCCER STARS</Title>
          <Title order={2} className="font-agrandir text-xl">Find Classes Near You</Title>
          {currentLeadData && (
            <Text className="font-poppins text-sm opacity-90 mt-2 text-slate-400">
              Hello {currentLeadData.firstName}, let's find classes near {currentLeadData.zip}
            </Text>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Group position="apart" align="flex-start" mb="xl">
          <div>
            <Title order={3} className="font-agrandir text-2xl text-brand-navy mb-2">Available Locations</Title>
            {franchiseeData && (
              <Text className="font-poppins text-gray-600">
                {franchiseeData.company_name} - {locations.length} location{locations.length !== 1 ? 's' : ''} found
              </Text>
            )}
          </div>
          
          <Group spacing="xs">
            <Button 
              variant={viewMode === 'list' ? 'filled' : 'outline'} 
              onClick={() => setViewMode('list')} 
              className="font-poppins"
              leftSection={<List className="h-4 w-4" />}
            >
              List
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'filled' : 'outline'} 
              onClick={() => setViewMode('map')} 
              className="font-poppins"
              leftSection={<Map className="h-4 w-4" />}
            >
              Map
            </Button>
          </Group>
        </Group>

        {/* Responsive layout: Desktop side-by-side, Mobile stacked */}
        <div className={`${viewMode === 'map' ? 'lg:grid lg:grid-cols-5 lg:gap-8' : ''}`}>
          {/* Map View - Now with proper aspect ratio */}
          {viewMode === 'map' && <div className="lg:col-span-3 mb-8 lg:mb-0">
              <div className="relative">
                <ErrorBoundary fallback={BookingError} onReset={handleMapError}>
                  <InteractiveMap locations={locations} aspectRatio={4 / 3} // 4:3 aspect ratio for better display
              franchiseeSlug={franchiseeSlug || ''} flowId={flowId || undefined} onLocationSelect={handleLocationSelect} className="w-full" />
                </ErrorBoundary>
              </div>
            </div>}
          
          {/* Locations List - Now takes remaining space */}
          <div className={viewMode === 'map' ? 'lg:col-span-2' : ''}>
            <Stack spacing="md">
              {locations.length > 0 ? locations.map(location => (
                <Card 
                  key={location.id} 
                  className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-blue"
                  padding="lg"
                  radius="md"
                  withBorder
                >
                  <Group position="apart" align="flex-start">
                    <div className="flex-1">
                      <Title order={4} className="font-agrandir text-xl text-brand-navy mb-3">
                        {location.name}
                      </Title>
                      <Stack spacing="xs">
                        <Group align="flex-start" spacing="xs">
                          <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                          <Text className="font-poppins text-gray-600">
                            {location.address}<br />
                            {location.city}, {location.state} {location.zip}
                          </Text>
                        </Group>
                        {location.phone && (
                          <Text className="font-poppins text-sm text-gray-600">
                            📞 {location.phone}
                          </Text>
                        )}
                        {location.email && (
                          <Text className="font-poppins text-sm text-gray-600">
                            ✉️ {location.email}
                          </Text>
                        )}
                      </Stack>
                    </div>
                    <div className="ml-6">
                      <Button 
                        onClick={() => handleLocationSelect(location)} 
                        className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins" 
                        size="lg"
                      >
                        Select Location
                      </Button>
                    </div>
                  </Group>
                </Card>
              )) : (
                <Card className="text-center border-l-4 border-l-brand-red" padding="xl" radius="md" withBorder>
                  <Stack spacing="md" align="center">
                    <MapPin className="h-16 w-16 text-gray-400" />
                    <Title order={3} className="font-agrandir text-xl text-brand-navy">
                      No Locations Found Near You
                    </Title>
                    <Text className="font-poppins text-gray-600 max-w-md" ta="center">
                      We don't currently have any locations within 50km of your area ({currentLeadData?.zip}).
                      Would you like us to notify you when programs become available in your area?
                    </Text>
                    <Button 
                      onClick={handleRequestLocation} 
                      className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins" 
                      size="lg"
                    >
                      Request Programs in My Area
                    </Button>
                  </Stack>
                </Card>
              )}
            </Stack>
          </div>
        </div>

        {/* Navigation hint */}
        {locations.length > 0 && (
          <Card className="mt-8 bg-blue-50 border border-blue-200" padding="md" radius="md">
            <Text className="font-poppins text-blue-800 text-center">
              💡 Select a location above to view available classes and book your free trial
            </Text>
          </Card>
        )}
      </div>
    </div>
  );
};
export default FindClasses;