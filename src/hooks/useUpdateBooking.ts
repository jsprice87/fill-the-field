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
      console.log('🔧 useUpdateBooking mutationFn called with:', { bookingId, class_schedule_id });
      
      // First check if booking exists
      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id, lead_id')
        .eq('id', bookingId)
        .single();
      
      console.log('🔍 Existing booking check:', { existingBooking, checkError });
      
      if (checkError) {
        console.error('❌ Booking not found or not accessible:', checkError);
        throw new Error(`Booking not found: ${checkError.message}`);
      }

      // Proceed with update
      const { data, error, count } = await supabase
        .from('bookings')
        .update({ 
          class_schedule_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select();

      console.log('📊 Update result:', { data, error, count });

      if (error) {
        console.error('❌ Error updating booking:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated - booking may not exist or access denied');
      }

      return data[0];
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