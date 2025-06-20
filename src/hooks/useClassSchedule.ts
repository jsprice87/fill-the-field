
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
    id: string;
    name: string;
    class_name: string;
    description: string | null;
    duration_minutes: number;
    max_capacity: number;
    min_age: number | null;
    max_age: number | null;
    location_id: string;
    locations: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
    };
  };
}

export const useClassSchedule = (classScheduleId: string) => {
  return useQuery({
    queryKey: ['class-schedule', classScheduleId],
    queryFn: async (): Promise<ClassSchedule | null> => {
      if (!classScheduleId) {
        return null;
      }

      console.log('Fetching class schedule:', classScheduleId);

      const { data, error } = await supabase
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
            id,
            name,
            class_name,
            description,
            duration_minutes,
            max_capacity,
            min_age,
            max_age,
            location_id,
            locations (
              id,
              name,
              address,
              city,
              state,
              zip
            )
          )
        `)
        .eq('id', classScheduleId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching class schedule:', error);
        throw new Error(`Failed to fetch class schedule: ${error.message}`);
      }

      console.log('Class schedule data:', data);
      return data;
    },
    enabled: !!classScheduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
