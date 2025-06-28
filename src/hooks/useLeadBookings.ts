import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadBooking {
  id: string;
  lead_id: string;
  class_schedule_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  booking_reference: string | null;
  cancellation_reason: string | null;
  child_speaks_english: boolean | null;
  communication_permission: boolean | null;
  confirmation_email_sent: boolean | null;
  marketing_permission: boolean | null;
  parent_email: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_phone: string | null;
  parent_relationship: string | null;
  parent_zip: string | null;
  waiver_accepted: boolean | null;
  waiver_accepted_at: string | null;
  class_schedules: {
    id: string;
    start_time: string;
    end_time: string;
    date_start: string | null;
    date_end: string | null;
    day_of_week: number | null;
    classes: {
      id: string;
      name: string;
      class_name: string;
      description: string | null;
      duration_minutes: number;
      min_age: number | null;
      max_age: number | null;
      max_capacity: number;
      locations: {
        id: string;
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
      };
    };
  };
  appointments: Array<{
    id: string;
    participant_name: string;
    participant_age: number;
    participant_birth_date: string | null;
    health_conditions: string | null;
    class_name: string;
    class_time: string;
    selected_date: string | null;
  }>;
}

export const useLeadBookings = (leadId: string) => {
  return useQuery({
    queryKey: ['leadBookings', leadId],
    queryFn: async () => {
      // First, get the bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          class_schedules!inner (
            id,
            start_time,
            end_time,
            date_start,
            date_end,
            day_of_week,
            classes!inner (
              id,
              name,
              class_name,
              description,
              duration_minutes,
              min_age,
              max_age,
              max_capacity,
              locations!inner (
                id,
                name,
                address,
                city,
                state,
                zip
              )
            )
          )
        `)
        .eq('lead_id', leadId)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching lead bookings:', bookingsError);
        throw bookingsError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Then, get appointments for each booking separately to avoid data duplication
      const bookingsWithAppointments: LeadBooking[] = await Promise.all(
        bookingsData.map(async (booking) => {
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('appointments')
            .select(`
              id,
              participant_name,
              participant_age,
              participant_birth_date,
              health_conditions,
              class_name,
              class_time,
              selected_date
            `)
            .eq('booking_id', booking.id)
            .is('archived_at', null)
            .order('participant_name');

          if (appointmentsError) {
            console.error('Error fetching appointments for booking:', booking.id, appointmentsError);
            // Don't throw here, just return empty appointments
          }

          return {
            ...booking,
            appointments: appointmentsData || []
          } as LeadBooking;
        })
      );

      return bookingsWithAppointments;
    },
    enabled: !!leadId,
  });
};