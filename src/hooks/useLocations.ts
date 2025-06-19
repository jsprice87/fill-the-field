
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
}

export const useLocations = (franchiseeId?: string, hideInactive: boolean = false) => {
  return useQuery({
    queryKey: ['locations', franchiseeId, hideInactive],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      let query = supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('name');

      // Filter by active status if hideInactive is true
      if (hideInactive) {
        query = query.neq('is_active', false); // Hide inactive locations (only show active ones)
      }
      // If hideInactive is false, show all locations (no filtering)

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId,
  });
};
