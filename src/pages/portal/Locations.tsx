
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import LocationCard, { LocationProps } from '@/components/locations/LocationCard';
import LocationForm, { LocationFormData } from '@/components/locations/LocationForm';
import { supabase } from "@/integrations/supabase/client";

const PortalLocations: React.FC = () => {
  const [locations, setLocations] = useState<LocationProps[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationFormData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { franchiseeId } = useParams<{ franchiseeId: string }>();

  // Get the current franchisee ID either from the URL or from the auth session
  const getCurrentFranchiseeId = async (): Promise<string> => {
    // If we have a franchiseeId in the URL, use that
    if (franchiseeId) {
      console.log("Using franchiseeId from URL:", franchiseeId);
      return franchiseeId;
    }

    // For test users, get the franchiseeId from localStorage
    const testAuthData = localStorage.getItem('supabase.auth.token');
    if (testAuthData && (import.meta.env.DEV || window.location.hostname === 'localhost')) {
      try {
        const parsedData = JSON.parse(testAuthData);
        const userId = parsedData?.currentSession?.user?.id;
        if (userId) {
          console.log("Using franchiseeId from test auth:", userId);
          return userId;
        }
      } catch (error) {
        console.error("Error parsing test auth data:", error);
      }
    }

    // For real users, get the user ID from Supabase auth
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (userId) {
        console.log("Using franchiseeId from Supabase auth:", userId);
        return userId;
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }

    // Fallback to default ID for development
    console.warn("No franchiseeId found, using default");
    return "franchise-001";
  };

  // Load locations from Supabase
  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const currentFranchiseeId = await getCurrentFranchiseeId();
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', currentFranchiseeId);
      
      if (error) {
        throw error;
      }
      
      console.log("Loaded locations:", data);
      setLocations(data || []);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  // Load locations when the component mounts
  useEffect(() => {
    loadLocations();
  }, [franchiseeId]);

  const handleAddLocation = () => {
    setCurrentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleEditLocation = (id: string) => {
    const locationToEdit = locations.find(loc => loc.id === id);
    if (locationToEdit) {
      setCurrentLocation({
        ...locationToEdit,
        isActive: locationToEdit.isActive ?? true
      });
      setIsFormOpen(true);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) {
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
    try {
      const currentFranchiseeId = await getCurrentFranchiseeId();
      
      if (data.id) {
        // Update existing location
        const { error } = await supabase
          .from('locations')
          .update({
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone || null,
            email: data.email || null,
            is_active: data.isActive
          })
          .eq('id', data.id);
        
        if (error) {
          throw error;
        }
        
        setLocations(locations.map(loc => 
          loc.id === data.id ? { ...data, id: data.id } : loc
        ));
        toast.success('Location updated successfully');
      } else {
        // Add new location
        const { data: newLocation, error } = await supabase
          .from('locations')
          .insert({
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone || null,
            email: data.email || null,
            is_active: data.isActive,
            franchisee_id: currentFranchiseeId
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setLocations([...locations, newLocation]);
        toast.success('Location added successfully');
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
        <Button onClick={handleAddLocation}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : locations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard 
              key={location.id} 
              {...location}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="p-6 flex items-center justify-center">
            <p className="text-muted-foreground">No locations found. Add your first location to get started.</p>
          </div>
        </div>
      )}

      <LocationForm 
        open={isFormOpen}
        initialData={currentLocation}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PortalLocations;
