
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClass = (classId: string | undefined) => {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      console.time('useClass-fetch');
      
      if (!classId) throw new Error('Class ID is required');

      const selectQuery = `
        id,
        name,
        class_name,
        description,
        duration_minutes,
        max_capacity,
        min_age,
        max_age,
        is_active,
        location_id,
        created_at,
        updated_at,
        locations (
          id,
          name,
          address,
          city,
          state,
          zip,
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
          is_active,
          schedule_exceptions (
            id,
            exception_date,
            is_cancelled
          )
        )
      `;

      console.log('Supabase select query:', selectQuery);

      const { data, error } = await supabase
        .from('classes')
        .select(selectQuery)
        .eq('id', classId)
        .maybeSingle();

      console.timeEnd('useClass-fetch');
      
      console.log('useClass-fetch', { data, error });
      
      if (data) {
        console.table(data);
      }
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      return data;
    },
    enabled: !!classId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      classId, 
      updates 
    }: { 
      classId: string; 
      updates: {
        name: string;
        class_name: string;
        description?: string;
        duration_minutes: number;
        max_capacity: number;
        min_age?: number;
        max_age?: number;
        is_active: boolean;
      }
    }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch class queries
      queryClient.invalidateQueries({ queryKey: ['class', data.id] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};
