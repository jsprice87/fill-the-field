
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  class_count?: number;
}

export const useLocations = (franchiseeId?: string, hideInactive: boolean = false) => {
  return useQuery({
    queryKey: ['locations', franchiseeId, hideInactive],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      // First get all locations for this franchisee
      let locationsQuery = supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('name');

      // Filter by active status if hideInactive is true
      if (hideInactive) {
        locationsQuery = locationsQuery.neq('is_active', false);
      }

      const { data: locations, error: locationsError } = await locationsQuery;

      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }

      if (!locations || locations.length === 0) {
        return [];
      }

      // Get class counts for each location
      const locationIds = locations.map(loc => loc.id);
      const { data: classCounts, error: classCountError } = await supabase
        .from('classes')
        .select('location_id')
        .in('location_id', locationIds)
        .eq('is_active', true);

      if (classCountError) {
        console.error('Error fetching class counts:', classCountError);
        // Don't throw error, just proceed without counts
      }

      // Count classes per location
      const countMap = new Map<string, number>();
      if (classCounts) {
        classCounts.forEach(cls => {
          const currentCount = countMap.get(cls.location_id) || 0;
          countMap.set(cls.location_id, currentCount + 1);
        });
      }

      // Add class counts to location data
      const locationsWithCounts = locations.map(location => ({
        ...location,
        class_count: countMap.get(location.id) || 0
      }));

      return locationsWithCounts;
    },
    enabled: !!franchiseeId,
  });
};
