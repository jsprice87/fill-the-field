import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Stack, Group, Title, Text } from '@mantine/core';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PortalShell } from '@/layout/PortalShell';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import LocationDetailsForm from '@/components/locations/LocationDetailsForm';
import LocationClasses from '@/components/locations/LocationClasses';
import LocationMap from '@/components/locations/LocationMap';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  franchisee_id: string;
  created_at: string;
  updated_at: string;
}

const LocationDetail: React.FC = () => {
  const { locationId, franchiseeSlug } = useParams<{ locationId: string; franchiseeSlug: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use impersonation-aware franchisee data
  const { data: franchiseeData } = useFranchiseeData();
  const franchiseeId = franchiseeData?.id;

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId || !franchiseeId) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('id', locationId)
          .eq('franchisee_id', franchiseeId)
          .single();

        if (error) {
          console.error('Error fetching location:', error);
          toast.error('Failed to load location details');
          navigate('../locations', { replace: true });
          return;
        }

        if (!data) {
          toast.error('Location not found');
          navigate('../locations', { replace: true });
          return;
        }

        setLocation(data);
      } catch (error) {
        console.error('Error fetching location:', error);
        toast.error('Failed to load location details');
        navigate('../locations', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [locationId, franchiseeId, navigate]);

  const handleBack = () => {
    navigate('../locations');
  };

  const handleLocationUpdated = (updatedLocation: Location) => {
    setLocation(updatedLocation);
  };

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <Text size="sm" c="dimmed">Loading location details...</Text>
        </Stack>
      </PortalShell>
    );
  }

  if (!location) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <Text size="lg" c="dimmed">Location not found</Text>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Button>
        </Stack>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Stack gap="lg" p="md">
        {/* Header with breadcrumb */}
        <Group justify="space-between" align="center">
          <Group align="center" gap="md">
            <Button variant="subtle" onClick={handleBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Locations
            </Button>
            <div>
              <Group align="center" gap="xs">
                <MapPin className="h-5 w-5 text-gray-500" />
                <Title order={1} size="24px" fw={600}>
                  {location.name}
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                {location.address}, {location.city}, {location.state} {location.zip}
              </Text>
            </div>
          </Group>
        </Group>

        {/* Main Content */}
        <Stack gap="xl">
          {/* Location Information Section */}
          <div>
            <Title order={2} size="18px" fw={500} mb="md">
              Location Information
            </Title>
            <LocationDetailsForm 
              location={location} 
              onLocationUpdated={handleLocationUpdated}
            />
          </div>

          {/* Classes Section */}
          <div>
            <Title order={2} size="18px" fw={500} mb="md">
              Classes at this Location
            </Title>
            <LocationClasses 
              locationId={location.id} 
              locationName={location.name}
            />
          </div>

          {/* Map Section */}
          <div>
            <Title order={2} size="18px" fw={500} mb="md">
              Location Map
            </Title>
            <LocationMap location={location} />
          </div>
        </Stack>
      </Stack>
    </PortalShell>
  );
};

export default LocationDetail;