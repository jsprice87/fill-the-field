
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

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
  status_manually_set: boolean;
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
              status,
              status_manually_set
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
      const transformedData = (data || []).map(appointment => {
        const leadStatus = appointment.bookings?.leads?.status || 'new';
        const isManuallySet = appointment.bookings?.leads?.status_manually_set || false;
        const bookingDate = new Date(appointment.selected_date || '');
        const today = new Date();
        
        // Auto-update status based on booking date if not manually set
        let finalStatus = leadStatus;
        
        // If lead has a booking and status is still 'new', it should be 'booked_upcoming'
        if (!isManuallySet && leadStatus === 'new') {
          finalStatus = 'booked_upcoming';
        }
        
        // If booking date has passed and status is 'booked_upcoming', it should be 'booked_complete'
        if (!isManuallySet && leadStatus === 'booked_upcoming' && bookingDate < today) {
          finalStatus = 'booked_complete';
        }

        return {
          id: appointment.id,
          lead_id: appointment.bookings.lead_id,
          class_schedule_id: appointment.booking_id,
          selected_date: appointment.selected_date,
          class_time: appointment.class_time,
          class_name: appointment.class_name,
          participant_name: appointment.participant_name,
          participant_age: appointment.participant_age,
          participant_birth_date: appointment.participant_birth_date,
          status: finalStatus,
          status_manually_set: isManuallySet,
          location_id: appointment.class_schedules?.classes?.location_id,
          location_name: appointment.class_schedules?.classes?.locations?.name,
          lead_first_name: appointment.bookings?.leads?.first_name,
          lead_last_name: appointment.bookings?.leads?.last_name,
          created_at: appointment.created_at
        };
      });

      console.log('Fetched bookings data with corrected statuses:', transformedData);
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
      status: LeadStatus; 
    }) => {
      console.log('Starting status update mutation:', { bookingId, leadId, status });
      
      // Update the lead status and mark as manually set
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .update({ 
          status,
          status_manually_set: true // Mark as manually set since this is coming from user interaction
        })
        .eq('id', leadId)
        .select();

      if (leadError) {
        console.error('Error updating lead:', leadError);
        throw leadError;
      }

      console.log('Lead updated successfully:', leadData);
      return { bookingId, leadId, status, leadData };
    },
    onSuccess: (data, variables) => {
      console.log('Mutation successful, invalidating and refetching queries...', data);
      
      // Force refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead-status', variables.leadId] });
      
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
      toast.error('Failed to update status');
    }
  });
};
