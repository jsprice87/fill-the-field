
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  is_active: boolean;
}

export const useLocations = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['locations', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('franchisee_id', franchiseeId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching locations:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!franchiseeId,
  });
};
