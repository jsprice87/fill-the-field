
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      console.log('Deleting lead with ID:', leadId);
      
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
      
      console.log('Lead deleted successfully');
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
    mutationFn: async (appointmentId: string) => {
      console.log('Deleting appointment with ID:', appointmentId);
      
      // Get the booking ID from the appointment
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('booking_id')
        .eq('id', appointmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching appointment:', fetchError);
        throw fetchError;
      }

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      console.log('Found booking ID:', appointment.booking_id);

      // Delete the appointment first
      const { error: appointmentError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (appointmentError) {
        console.error('Error deleting appointment:', appointmentError);
        throw appointmentError;
      }

      // Delete the associated booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', appointment.booking_id);

      if (bookingError) {
        console.error('Error deleting booking:', bookingError);
        throw bookingError;
      }

      console.log('Appointment and booking deleted successfully');
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
