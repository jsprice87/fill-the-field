
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  status: string;
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
          status,
          created_at,
          bookings!inner(
            lead_id,
            leads!inner(
              first_name,
              last_name,
              franchisee_id
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
        class_schedule_id: appointment.booking_id, // This might need adjustment based on your schema
        selected_date: appointment.selected_date,
        class_time: appointment.class_time,
        class_name: appointment.class_name,
        participant_name: appointment.participant_name,
        participant_age: appointment.participant_age,
        participant_birth_date: appointment.participant_birth_date,
        status: appointment.status,
        location_id: appointment.class_schedules?.classes?.location_id,
        location_name: appointment.class_schedules?.classes?.locations?.name,
        lead_first_name: appointment.bookings?.leads?.first_name,
        lead_last_name: appointment.bookings?.leads?.last_name,
        created_at: appointment.created_at
      }));

      return transformedData;
    },
    enabled: !!franchiseeId,
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, leadId, status }: { 
      bookingId: string; 
      leadId: string; 
      status: string; 
    }) => {
      // Update the appointment status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', bookingId);

      if (appointmentError) throw appointmentError;

      // Update the lead status to match
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

      if (leadError) throw leadError;

      return { bookingId, leadId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  });
};
