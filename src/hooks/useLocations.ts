
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
  archived_at?: string;
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

      // Filter by archive status
      if (showArchived) {
        query = query.not('archived_at', 'is', null);
      } else {
        query = query.is('archived_at', null);
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
