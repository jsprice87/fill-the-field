
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UpdateStatusParams, LeadStatus } from '@/types';

export const useStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entity, id, status }: UpdateStatusParams) => {
      console.log('Updating status:', { entity, id, status });
      
      if (entity === 'lead') {
        const { data, error } = await supabase
          .from('leads')
          .update({ 
            status, 
            status_manually_set: true,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('Lead status update error:', error);
          throw error;
        }
        
        console.log('Lead status updated successfully:', data);
        return data;
      } else {
        // For bookings, we still update the lead status since that's what's displayed
        // First get the booking to find the lead_id
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('lead_id')
          .eq('id', id)
          .single();

        if (bookingError) {
          console.error('Booking fetch error:', bookingError);
          throw bookingError;
        }

        const { data, error } = await supabase
          .from('leads')
          .update({ 
            status, 
            status_manually_set: true,
            updated_at: new Date().toISOString() 
          })
          .eq('id', booking.lead_id)
          .select()
          .maybeSingle();

        if (error) {
          console.error('Lead status update error:', error);
          throw error;
        }
        
        console.log('Lead status updated successfully via booking:', data);
        return data;
      }
    },
    onMutate: async ({ entity, id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lead-status'] });

      // Return a context object with the snapshotted value
      return { entity, id, status };
    },
    onSuccess: (data, variables) => {
      console.log('Status update mutation successful:', data);
      // Invalidate and refetch relevant queries for both leads and bookings
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
      queryClient.invalidateQueries({ queryKey: ['lead-status'] });
      toast.success('Status updated successfully');
    },
    onError: (error, variables, context) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['lead-status'] });
    }
  });
};
