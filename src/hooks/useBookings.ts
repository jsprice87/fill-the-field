
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
        status: appointment.bookings?.leads?.status || 'new',
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

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, leadId, status }: { 
      bookingId: string; 
      leadId: string; 
      status: LeadStatus; 
    }) => {
      console.log('Starting status update mutation:', { bookingId, leadId, status });
      
      // Update the lead status directly since we removed status from appointments
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId)
        .select();

      if (leadError) {
        console.error('Error updating lead:', leadError);
        throw leadError;
      }

      console.log('Lead updated successfully:', leadData);
      return { bookingId, leadId, status, leadData };
    },
    onMutate: async ({ bookingId, leadId, status }) => {
      console.log('Optimistic update starting for:', { bookingId, leadId, status });
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      
      // Snapshot the previous values
      const previousBookings = queryClient.getQueryData(['bookings']);
      const previousLeads = queryClient.getQueryData(['leads']);
      
      // Optimistically update bookings
      queryClient.setQueryData(['bookings'], (old: any) => {
        if (!old) return old;
        return old.map((booking: any) => 
          booking.id === bookingId ? { ...booking, status } : booking
        );
      });
      
      // Optimistically update leads
      queryClient.setQueryData(['leads'], (old: any) => {
        if (!old) return old;
        return old.map((lead: any) => 
          lead.id === leadId ? { ...lead, status } : lead
        );
      });
      
      console.log('Optimistic updates applied');
      return { previousBookings, previousLeads };
    },
    onSuccess: (data, variables) => {
      console.log('Mutation successful, invalidating and refetching queries...', data);
      
      // Force refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['bookings'] });
      queryClient.refetchQueries({ queryKey: ['leads'] });
      queryClient.refetchQueries({ queryKey: ['lead-stats'] });
      
      toast.success('Status updated successfully');
    },
    onError: (error, variables, context) => {
      console.error('Mutation failed:', error);
      
      // Rollback optimistic updates
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      
      toast.error('Failed to update status');
    }
  });
};
