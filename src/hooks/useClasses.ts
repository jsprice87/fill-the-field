
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClassData {
  id: string;
  name: string;
  class_name: string;
  description: string;
  duration_minutes: number;
  max_capacity: number;
  min_age: number;
  max_age: number;
  location_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  locations: {
    id: string;
    name: string;
    city: string;
    state: string;
    franchisee_id: string;
  };
  class_schedules: Array<{
    id: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
    date_start: string | null;
    date_end: string | null;
    current_bookings: number;
    is_active: boolean;
  }>;
}

export const useClasses = (
  franchiseeId: string | undefined,
  locationId?: string | null,
  search?: string
) => {
  return useQuery({
    queryKey: ['classes', franchiseeId, locationId ?? 'ALL', search ?? ''],
    queryFn: async () => {
      if (!franchiseeId) throw new Error('Franchisee ID is required');

      let query = supabase
        .from('classes')
        .select(`
          id,
          name,
          class_name,
          description,
          duration_minutes,
          max_capacity,
          min_age,
          max_age,
          location_id,
          is_active,
          created_at,
          updated_at,
          locations!inner (
            id,
            name,
            city,
            state,
            franchisee_id
          ),
          class_schedules (
            id,
            start_time,
            end_time,
            day_of_week,
            date_start,
            date_end,
            current_bookings,
            is_active
          )
        `)
        .eq('locations.franchisee_id', franchiseeId);

      // Filter by location if specified (and not 'ALL')
      if (locationId && locationId !== 'ALL') {
        query = query.eq('location_id', locationId);
      }

      // Filter by search term if specified
      if (search) {
        query = query.or(`name.ilike.%${search}%,class_name.ilike.%${search}%,locations.name.ilike.%${search}%`);
      }

      const { data, error } = await query.order('name');

      // Debug logging
      console.log('useClasses after rewrite', { 
        locationId, 
        rows: data?.length || 0,
        franchiseeId
      });
      
      if (error) throw error;
      return data as ClassData[];
    },
    enabled: !!franchiseeId
  });
};
