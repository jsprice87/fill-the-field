
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteLead = (franchiseeId?: string, includeArchived: boolean = false) => {
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
      return leadId;
    },
    onMutate: async (leadId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['leads', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['leads', franchiseeId, includeArchived]);
      
      // Optimistically update to remove the lead
      queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
        if (!old) return old;
        return old.filter((lead: any) => lead.id !== leadId);
      });
      
      // Return a context object with the snapshotted value
      return { previousLeads };
    },
    onError: (err, leadId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], context.previousLeads);
      }
      console.error('Error deleting lead:', err);
      toast.error('Failed to delete lead');
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats', franchiseeId] });
      toast.success('Lead deleted successfully');
    },
  });
};

export const useDeleteBooking = (franchiseeId?: string) => {
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
      return appointmentId;
    },
    onMutate: async (appointmentId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings', franchiseeId] });
      
      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData(['bookings', franchiseeId, false]);
      const previousArchivedBookings = queryClient.getQueryData(['bookings', franchiseeId, true]);
      
      // Optimistically update to remove the booking
      queryClient.setQueryData(['bookings', franchiseeId, false], (old: any) => {
        if (!old) return old;
        return old.filter((booking: any) => booking.id !== appointmentId);
      });
      
      queryClient.setQueryData(['bookings', franchiseeId, true], (old: any) => {
        if (!old) return old;
        return old.filter((booking: any) => booking.id !== appointmentId);
      });
      
      return { previousBookings, previousArchivedBookings };
    },
    onError: (err, appointmentId, context) => {
      // Roll back on error
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, false], context.previousBookings);
      }
      if (context?.previousArchivedBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, true], context.previousArchivedBookings);
      }
      console.error('Error deleting booking:', err);
      toast.error('Failed to delete booking');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
      toast.success('Booking deleted successfully');
    },
  });
};
