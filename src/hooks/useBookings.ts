
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Booking } from '@/types';

export const useBookings = (franchiseeId?: string, includeArchived: boolean = false) => {
  return useQuery({
    queryKey: ['bookings', franchiseeId, includeArchived],
    queryFn: async (): Promise<Booking[]> => {
      if (!franchiseeId) return [];
      
      let query = supabase
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
          archived_at,
          bookings!inner(
            id,
            lead_id,
            archived_at,
            booking_reference,
            parent_first_name,
            parent_last_name,
            parent_email,
            parent_phone,
            communication_permission,
            marketing_permission,
            waiver_accepted,
            leads!inner(
              first_name,
              last_name,
              franchisee_id,
              status,
              archived_at
            )
          ),
          class_schedules!inner(
            start_time,
            end_time,
            classes!inner(
              location_id,
              class_name,
              locations!inner(
                name
              )
            )
          )
        `)
        .eq('bookings.leads.franchisee_id', franchiseeId)
        .order('selected_date', { ascending: true });

      // Filter by archive status
      if (!includeArchived) {
        query = query.is('archived_at', null)
                    .is('bookings.archived_at', null)
                    .is('bookings.leads.archived_at', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      // Transform the data to match the canonical Booking type
      const transformedData: Booking[] = (data || []).map(appointment => ({
        id: appointment.id,
        created_at: appointment.created_at,
        updated_at: appointment.created_at,
        lead_id: appointment.bookings.lead_id,
        class_schedule_id: appointment.booking_id,
        waiver_accepted: appointment.bookings.waiver_accepted,
        waiver_accepted_at: null,
        confirmation_email_sent: null,
        communication_permission: appointment.bookings.communication_permission,
        marketing_permission: appointment.bookings.marketing_permission,
        child_speaks_english: null,
        archived_at: appointment.archived_at,
        parent_zip: null,
        parent_relationship: null,
        cancellation_reason: null,
        booking_reference: appointment.bookings.booking_reference,
        parent_first_name: appointment.bookings.parent_first_name,
        parent_last_name: appointment.bookings.parent_last_name,
        parent_email: appointment.bookings.parent_email,
        parent_phone: appointment.bookings.parent_phone,
        selected_date: appointment.selected_date,
        participants: [{
          id: appointment.id,
          first_name: appointment.participant_name,
          age: appointment.participant_age,
          computed_age: null
        }],
        class_schedules: appointment.class_schedules ? {
          start_time: appointment.class_schedules.start_time,
          end_time: appointment.class_schedules.end_time,
          classes: {
            name: appointment.class_schedules.classes.class_name,
            class_name: appointment.class_schedules.classes.class_name,
            locations: {
              name: appointment.class_schedules.classes.locations.name
            }
          }
        } : null,
        status: appointment.bookings?.leads?.status === 'booked_upcoming' ? 'booked_upcoming' :
                appointment.bookings?.leads?.status === 'booked_complete' ? 'attended' :
                appointment.bookings?.leads?.status === 'canceled' ? 'cancelled' : 'no_show'
      }));

      console.log('Fetched bookings data:', transformedData);
      return transformedData;
    },
    enabled: !!franchiseeId,
  });
};
