
import React, { useState } from 'react';
import { Button, Box } from '@mantine/core';
import { Plus, MapPin, Building, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { useParams, useSearchParams } from "react-router-dom";
import { Title, SimpleGrid, Stack, Group } from '@mantine/core';
import { StickyHeader } from '@/components/mantine';
import { MetricCard } from '@/components/mantine/MetricCard';
import { PortalShell } from '@/layout/PortalShell';
import ArchiveToggle from '@/components/shared/ArchiveToggle';
import LocationsTable from '@/components/locations/LocationsTable';
import LocationForm, { LocationFormData } from '@/components/locations/LocationForm';
import { useLocations } from '@/hooks/useLocations';
import { useUpdateLocation, useCreateLocation } from '@/hooks/useLocationActions';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

const PortalLocations: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationFormData | undefined>();
  const [searchParams] = useSearchParams();
  
  const hideInactive = searchParams.get('hideInactive') === 'true';
  const updateLocationMutation = useUpdateLocation();
  const createLocationMutation = useCreateLocation();
  
  // Use impersonation-aware franchisee data
  const { data: franchiseeData } = useFranchiseeData();
  const franchiseeId = franchiseeData?.id;

  const { data: locations = [], isLoading } = useLocations(franchiseeId || undefined, hideInactive);

  // Get all locations for metrics (unfiltered)
  const { data: allLocations = [] } = useLocations(franchiseeId || undefined, false);

  const handleAddLocation = () => {
    setCurrentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEditLocation = (id: string) => {
    const locationToEdit = allLocations.find(loc => loc.id === id);
    if (locationToEdit) {
      setCurrentLocation({
        ...locationToEdit,
        isActive: locationToEdit.is_active ?? true,
        autoCalculateCoordinates: true // Default to auto-calculate for editing
      });
      setIsFormOpen(true);
    }
  };

  const handleFormSubmit = async (data: LocationFormData) => {
    if (!franchiseeId) {
      toast.error("Franchisee information not available");
      return;
    }

    try {
      if (data.id) {
        // Update existing location using the mutation hook
        await updateLocationMutation.mutateAsync(data);
      } else {
        // Create new location using the mutation hook
        await createLocationMutation.mutateAsync(data);
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location. Please try again.");
    }
  };

  // Calculate metrics using all locations (unfiltered) to show static counts
  const activeLocations = allLocations.filter(loc => loc.is_active !== false).length;
  const totalLocations = allLocations.length;
  const archivedCount = allLocations.filter(loc => loc.is_active === false).length;

  if (isLoading) {
    return (
      <PortalShell>
        <Stack h="100vh" justify="center" align="center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </Stack>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Stack h="100vh" gap={0} w="100%">
        {/* Sticky Header with Metrics */}
        <StickyHeader>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={1} size="30px" lh="36px" fw={600}>
                Locations
              </Title>
              <Group gap="md">
                <ArchiveToggle />
                <Button onClick={handleAddLocation} disabled={!franchiseeId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              <MetricCard
                label="Total Locations"
                value={totalLocations}
                icon={MapPin}
                description="All locations"
              />
              <MetricCard
                label="Active Locations"
                value={activeLocations}
                icon={Building}
                description="Currently accepting bookings"
              />
              <MetricCard
                label="Total Classes"
                value={0}
                icon={Users}
                description="Across all locations"
              />
              <MetricCard
                label="Avg. Classes/Location"
                value="0"
                icon={Clock}
                description="Classes per location"
              />
            </SimpleGrid>
          </Stack>
        </StickyHeader>

        {/* Table Content */}
        <Box w="100%" style={{ overflowX: 'auto' }}>
          <LocationsTable 
            locations={locations}
            onEdit={handleEditLocation}
            hideInactive={hideInactive}
          />
        </Box>
      </Stack>

      <LocationForm 
        open={isFormOpen}
        initialData={currentLocation}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </PortalShell>
  );
};

export default PortalLocations;
