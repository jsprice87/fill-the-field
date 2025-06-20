
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClassSchedule {
  id: string;
  class_id: string;
  start_time: string;
  end_time: string;
  date_start: string | null;
  date_end: string | null;
  day_of_week: number;
  current_bookings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  classes: {
    name: string;
    class_name: string;
    description: string;
    duration_minutes: number;
    max_capacity: number;
    min_age: number;
    max_age: number;
    location_id: string;
    locations: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

export const useClasses = (
  franchiseeId: string | undefined,
  locationId?: string | null,
  search?: string
) => {
  return useQuery({
    queryKey: ['classes', franchiseeId, locationId ?? 'all', search ?? ''],
    queryFn: async () => {
      if (!franchiseeId) throw new Error('Franchisee ID is required');

      let query = supabase
        .from('class_schedules')
        .select(`
          id,
          class_id,
          start_time,
          end_time,
          date_start,
          date_end,
          day_of_week,
          current_bookings,
          is_active,
          created_at,
          updated_at,
          classes (
            name,
            class_name,
            description,
            duration_minutes,
            max_capacity,
            min_age,
            max_age,
            location_id,
            locations!inner (
              name,
              address,
              city,
              state,
              zip,
              franchisee_id
            )
          )
        `)
        .eq('classes.locations.franchisee_id', franchiseeId);

      // Filter by location if specified
      if (locationId && locationId !== 'all') {
        query = query.eq('classes.location_id', locationId);
      }

      // Filter by search term if specified
      if (search) {
        query = query.or(`classes.name.ilike.%${search}%,classes.class_name.ilike.%${search}%,classes.locations.name.ilike.%${search}%`);
      }

      const { data, error } = await query.order('start_time');
      
      if (error) throw error;
      return data as ClassSchedule[];
    },
    enabled: !!franchiseeId
  });
};
