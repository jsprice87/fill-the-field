
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  lead_id: string;
  class_schedule_id: string;
  selected_date: string;
  class_time: string;
  class_name: string;
  participant_name: string;
  participant_age: number;
  participant_birth_date: string;
  status: string; // This will come from the lead, not the booking
  location_id: string;
  location_name?: string;
  lead_first_name?: string;
  lead_last_name?: string;
  created_at: string;
}

export const useBookings = (franchiseeId?: string) => {
  return useQuery({
    queryKey: ['bookings', franchiseeId],
    queryFn: async () => {
      if (!franchiseeId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          booking_id,
          selected_date,
          class_time,
          class_name,
          participant_name,
          participant_age,
          participant_birth_date,
          created_at,
          bookings!inner(
            lead_id,
            leads!inner(
              first_name,
              last_name,
              franchisee_id,
              status
            )
          ),
          class_schedules!inner(
            classes!inner(
              location_id,
              locations!inner(
                name
              )
            )
          )
        `)
        .eq('bookings.leads.franchisee_id', franchiseeId)
        .order('selected_date', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      // Transform the data to flatten the nested structure
      const transformedData = (data || []).map(appointment => ({
        id: appointment.id,
        lead_id: appointment.bookings.lead_id,
        class_schedule_id: appointment.booking_id,
        selected_date: appointment.selected_date,
        class_time: appointment.class_time,
        class_name: appointment.class_name,
        participant_name: appointment.participant_name,
        participant_age: appointment.participant_age,
        participant_birth_date: appointment.participant_birth_date,
        status: appointment.bookings?.leads?.status || 'new', // Status comes from lead
        location_id: appointment.class_schedules?.classes?.location_id,
        location_name: appointment.class_schedules?.classes?.locations?.name,
        lead_first_name: appointment.bookings?.leads?.first_name,
        lead_last_name: appointment.bookings?.leads?.last_name,
        created_at: appointment.created_at
      }));

      console.log('Fetched bookings data:', transformedData);
      return transformedData;
    },
    enabled: !!franchiseeId,
  });
};
