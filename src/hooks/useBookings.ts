
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getEffectiveFranchiseeId, isImpersonating } from '@/utils/impersonationHelpers';
import type { Booking } from '@/types';

export const useBookings = (franchiseeId?: string, includeArchived: boolean = false) => {
  return useQuery({
    queryKey: ['bookings', franchiseeId, includeArchived, isImpersonating() ? localStorage.getItem('impersonation-session') : null],
    queryFn: async (): Promise<Booking[]> => {
      const effectiveFranchiseeId = franchiseeId || await getEffectiveFranchiseeId();
      if (!effectiveFranchiseeId) return [];
      
      // Use left joins instead of inner joins to avoid missing data
      // Simplified query with better performance
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
          bookings(
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
            leads(
              first_name,
              last_name,
              franchisee_id,
              status,
              archived_at
            )
          ),
          class_schedules(
            id,
            start_time,
            end_time,
            classes(
              id,
              location_id,
              class_name,
              locations(
                id,
                name,
                city,
                state
              )
            )
          )
        `)
        .not('bookings', 'is', null)
        .eq('bookings.leads.franchisee_id', effectiveFranchiseeId)
        .order('selected_date', { ascending: false }); // Show newest first

      // Apply archive filtering at database level for better performance
      if (!includeArchived) {
        query = query
          .is('archived_at', null)
          .is('bookings.archived_at', null)
          .is('bookings.leads.archived_at', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      if (!data) return [];

      // Optimized transformation with null checks
      const transformedData: Booking[] = data
        .filter(appointment => appointment.bookings) // Ensure we have booking data
        .map(appointment => {
          const booking = appointment.bookings!;
          const lead = booking.leads;
          const schedule = appointment.class_schedules;
          const classData = schedule?.classes;
          const location = classData?.locations;
          
          return {
            id: appointment.id,
            created_at: appointment.created_at,
            updated_at: appointment.created_at,
            lead_id: booking.lead_id,
            class_schedule_id: appointment.booking_id,
            waiver_accepted: booking.waiver_accepted,
            waiver_accepted_at: null,
            confirmation_email_sent: null,
            communication_permission: booking.communication_permission,
            marketing_permission: booking.marketing_permission,
            child_speaks_english: null,
            archived_at: appointment.archived_at,
            parent_zip: null,
            parent_relationship: null,
            cancellation_reason: null,
            booking_reference: booking.booking_reference,
            parent_first_name: booking.parent_first_name,
            parent_last_name: booking.parent_last_name,
            parent_email: booking.parent_email,
            parent_phone: booking.parent_phone,
            selected_date: appointment.selected_date,
            participants: [{
              id: appointment.id,
              first_name: appointment.participant_name || '',
              age: appointment.participant_age,
              computed_age: null
            }],
            class_schedules: schedule ? {
              id: schedule.id,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              classes: {
                id: classData?.id || '',
                name: classData?.class_name || appointment.class_name || 'Unknown Class',
                class_name: classData?.class_name || appointment.class_name || 'Unknown Class',
                location_id: classData?.location_id || '',
                locations: {
                  id: location?.id || '',
                  name: location?.name || 'Unknown Location',
                  city: location?.city || '',
                  state: location?.state || ''
                }
              }
            } : null,
            // Improved status mapping with fallbacks
            status: lead?.status === 'booked_upcoming' ? 'booked_upcoming' :
                    lead?.status === 'booked_complete' ? 'attended' :
                    lead?.status === 'canceled' ? 'cancelled' : 
                    lead?.status === 'no_show' ? 'no_show' : 'booked_upcoming' // Default fallback
          };
        });

      return transformedData;
    },
    enabled: !!franchiseeId || isImpersonating(),
    staleTime: 30000, // Cache for 30 seconds to reduce re-fetches
    gcTime: 300000, // Keep in cache for 5 minutes
  });
};
