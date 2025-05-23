
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="space-y-2">
      <Label htmlFor="location-select" className="text-base font-medium">
        Location <span className="text-red-500">*</span>
      </Label>
      <Select
        value={selectedLocationId}
        onValueChange={onLocationChange}
        disabled={isLoading || locations.length === 0}
      >
        <SelectTrigger id="location-select" className="w-full">
          <SelectValue 
            placeholder={
              isLoading 
                ? "Loading locations..." 
                : locations.length === 0 
                  ? "No active locations found" 
                  : "Select a location"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex flex-col">
                <span className="font-medium">{location.name}</span>
                <span className="text-sm text-muted-foreground">
                  {location.address}, {location.city}, {location.state}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {locations.length === 0 && !isLoading && (
        <p className="text-sm text-amber-600">
          No active locations found. Please add a location first.
        </p>
      )}
    </div>
  );
};

export default LocationSelector;
