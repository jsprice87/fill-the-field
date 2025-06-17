
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

export const useLocations = (franchiseeId?: string, showArchived: boolean = false) => {
  return useQuery({
    queryKey: ['locations', franchiseeId, showArchived],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      let query = supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .order('name');

      // Filter by active status - archived means is_active = false
      if (showArchived) {
        query = query.eq('is_active', false);
      } else {
        query = query.neq('is_active', false); // Show active locations (true or null)
      }

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
