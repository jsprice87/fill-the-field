import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Title, SimpleGrid, Stack, Group, ScrollArea, rem } from '@mantine/core';
import { StickyHeader } from '@/components/mantine';
import LocationCard, { LocationProps } from '@/components/locations/LocationCard';
import LocationForm, { LocationFormData } from '@/components/locations/LocationForm';
import { supabase } from "@/integrations/supabase/client";

const PortalLocations: React.FC = () => {
  const [locations, setLocations] = useState<LocationProps[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationFormData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [franchiseeId, setFranchiseeId] = useState<string | null>(null);
  const { franchiseeId: slugParam } = useParams<{ franchiseeId: string }>();

  // Get franchisee ID and load locations
  useEffect(() => {
    const getFranchiseeAndLoadLocations = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast.error("Authentication required");
          return;
        }

        console.log("Current user ID:", session.user.id);
        
        // Get the franchisee record for this user
        const { data: franchisee, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (franchiseeError || !franchisee) {
          console.error("Error fetching franchisee:", franchiseeError);
          toast.error("Unable to find franchisee account. Please contact support.");
          return;
        }
        
        console.log("Found franchisee ID:", franchisee.id);
        setFranchiseeId(franchisee.id);
        
        // Load locations for this franchisee
        await loadLocations(franchisee.id);
      } catch (error) {
        console.error("Error getting franchisee:", error);
        toast.error("Failed to authenticate. Please try again.");
      }
    };

    getFranchiseeAndLoadLocations();
  }, []);

  // Load locations from Supabase
  const loadLocations = async (franchiseeId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching locations for franchisee ID:", franchiseeId);
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchiseeId);
      
      if (error) {
        console.error("Database error loading locations:", error);
        throw error;
      }
      
      console.log("Successfully loaded locations:", data);
      setLocations(data || []);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = () => {
    setCurrentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEditLocation = (id: string) => {
    const locationToEdit = locations.find(loc => loc.id === id);
    if (locationToEdit) {
      setCurrentLocation({
        ...locationToEdit,
        isActive: locationToEdit.is_active ?? true
      });
      setIsFormOpen(true);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!franchiseeId) {
      toast.error("Franchisee information not available");
      return;
    }

    try {
      console.log("Deleting location:", id);
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Database error deleting location:", error);
        throw error;
      }
      
      setLocations(locations.filter(loc => loc.id !== id));
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  const handleFormSubmit = async (data: LocationFormData) => {
    if (!franchiseeId) {
      toast.error("Franchisee information not available");
      return;
    }

    try {
      console.log("Saving location with franchisee ID:", franchiseeId);
      
      if (data.id) {
        // Update existing location
        console.log("Updating existing location:", data.id);
        const updateData = {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone || null,
          email: data.email || null,
          is_active: data.isActive,
          ...(data.latitude && data.longitude && {
            latitude: data.latitude,
            longitude: data.longitude
          })
        };

        const { error } = await supabase
          .from('locations')
          .update(updateData)
          .eq('id', data.id);
        
        if (error) {
          console.error("Database error updating location:", error);
          throw error;
        }
        
        setLocations(locations.map(loc => 
          loc.id === data.id ? { 
            ...loc, 
            name: data.name, 
            address: data.address, 
            city: data.city, 
            state: data.state, 
            zip: data.zip, 
            phone: data.phone, 
            email: data.email, 
            is_active: data.isActive,
            latitude: data.latitude,
            longitude: data.longitude
          } : loc
        ));
        toast.success('Location updated successfully');
      } else {
        // Add new location
        console.log("Creating new location with data:", {
          ...data,
          franchisee_id: franchiseeId
        });
        
        const insertData = {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          phone: data.phone || null,
          email: data.email || null,
          is_active: data.isActive,
          franchisee_id: franchiseeId,
          ...(data.latitude && data.longitude && {
            latitude: data.latitude,
            longitude: data.longitude
          })
        };

        const { data: newLocation, error } = await supabase
          .from('locations')
          .insert(insertData)
          .select();
        
        if (error) {
          console.error("Database error creating location:", error);
          throw error;
        }
        
        console.log("New location created successfully:", newLocation);
        if (newLocation && newLocation.length > 0) {
          setLocations([...locations, newLocation[0]]);
        }
        toast.success('Location added successfully');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Stack h="100vh" justify="center" align="center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </Stack>
    );
  }

  return (
    <Stack h="100vh" gap={0}>
      {/* Sticky Header */}
      <StickyHeader>
        <Group justify="space-between">
          <Title order={1} size="30px" lh="36px" fw={600}>
            Locations
          </Title>
          <Button onClick={handleAddLocation} disabled={!franchiseeId}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </Group>
      </StickyHeader>

      {/* Scrollable Content Area */}
      <ScrollArea
        scrollbarSize={8}
        offsetScrollbars
        type="scroll"
        h={`calc(100vh - ${rem(100)})`}
        px="md"
        pb="md"
      >
        {locations.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mt="md">
            {locations.map((location) => (
              <LocationCard 
                key={location.id} 
                {...location}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Stack align="center" justify="center" h="400px" mt="md">
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center">
              <p className="text-muted-foreground">No locations found. Add your first location to get started.</p>
            </div>
          </Stack>
        )}
      </ScrollArea>

      <LocationForm 
        open={isFormOpen}
        initialData={currentLocation}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </Stack>
  );
};

export default PortalLocations;
