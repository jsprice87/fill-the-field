
import React, { useState, useEffect } from 'react';
import { Select, Text } from '@mantine/core';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
}

interface LocationSelectorProps {
  franchiseeId: string | null;
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  franchiseeId,
  selectedLocationId,
  onLocationChange,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (franchiseeId) {
      loadLocations();
    }
  }, [franchiseeId]);

  const loadLocations = async () => {
    if (!franchiseeId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address, city, state')
        .eq('franchisee_id', franchiseeId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error("Error loading locations:", error);
        throw error;
      }

      setLocations(data || []);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  const locationOptions = locations.map((location) => ({
    value: location.id,
    label: `${location.name} - ${location.city}, ${location.state}`
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Text size="sm" fw={500}>
        Location <span style={{ color: 'red' }}>*</span>
      </Text>
      <Select
        value={selectedLocationId}
        onChange={onLocationChange}
        placeholder={
          isLoading 
            ? "Loading locations..." 
            : locations.length === 0 
              ? "No active locations found" 
              : "Select a location"
        }
        data={locationOptions}
        disabled={isLoading || locations.length === 0}
        searchable={false}
        clearable={false}
        withinPortal
      />
      {locations.length === 0 && !isLoading && (
        <Text size="sm" c="orange">
          No active locations found. Please add a location first.
        </Text>
      )}
    </div>
  );
};

export default LocationSelector;
