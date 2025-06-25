import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateBookingParams {
  bookingId: string;
  class_schedule_id: string;
}

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, class_schedule_id }: UpdateBookingParams) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          class_schedule_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['leadBookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.lead_id] });
      
      toast.success('Booking updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    },
  });
};