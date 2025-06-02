
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // First delete associated bookings and appointments
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('lead_id', leadId);

      if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map(b => b.id);
        
        // Delete appointments first
        await supabase
          .from('appointments')
          .delete()
          .in('booking_id', bookingIds);

        // Delete bookings
        await supabase
          .from('bookings')
          .delete()
          .eq('lead_id', leadId);
      }

      // Delete lead notes
      await supabase
        .from('lead_notes')
        .delete()
        .eq('lead_id', leadId);

      // Finally delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    },
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      // Delete appointment first
      await supabase
        .from('appointments')
        .delete()
        .eq('booking_id', bookingId);

      // Delete the booking
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Booking deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    },
  });
};
