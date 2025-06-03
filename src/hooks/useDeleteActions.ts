
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteLead = (franchiseeId?: string, includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      console.log('Starting lead deletion process for ID:', leadId);
      
      // First delete associated bookings and appointments
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('lead_id', leadId);

      if (bookingsError) {
        console.error('Error fetching bookings for lead:', bookingsError);
        throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
      }

      if (bookings && bookings.length > 0) {
        console.log('Found bookings to delete:', bookings.length);
        const bookingIds = bookings.map(b => b.id);
        
        // Delete appointments first
        const { error: appointmentsError, count: appointmentsCount } = await supabase
          .from('appointments')
          .delete()
          .in('booking_id', bookingIds)
          .select('*', { count: 'exact', head: true });

        if (appointmentsError) {
          console.error('Error deleting appointments:', appointmentsError);
          throw new Error(`Failed to delete appointments: ${appointmentsError.message}`);
        }
        console.log('Appointments deleted successfully, count:', appointmentsCount);

        // Delete bookings
        const { error: bookingDeleteError, count: bookingsDeleteCount } = await supabase
          .from('bookings')
          .delete()
          .eq('lead_id', leadId)
          .select('*', { count: 'exact', head: true });

        if (bookingDeleteError) {
          console.error('Error deleting bookings:', bookingDeleteError);
          throw new Error(`Failed to delete bookings: ${bookingDeleteError.message}`);
        }
        console.log('Bookings deleted successfully, count:', bookingsDeleteCount);
      }

      // Delete lead notes
      const { error: notesError, count: notesCount } = await supabase
        .from('lead_notes')
        .delete()
        .eq('lead_id', leadId)
        .select('*', { count: 'exact', head: true });

      if (notesError) {
        console.error('Error deleting lead notes:', notesError);
        throw new Error(`Failed to delete lead notes: ${notesError.message}`);
      }
      console.log('Lead notes deleted successfully, count:', notesCount);

      // Finally delete the lead
      const { error: leadError, count: leadCount } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .select('*', { count: 'exact', head: true });

      if (leadError) {
        console.error('Error deleting lead:', leadError);
        throw new Error(`Failed to delete lead: ${leadError.message}`);
      }

      if (leadCount === 0) {
        console.error('No lead was deleted - this may indicate a permissions issue');
        throw new Error('Lead could not be deleted. You may not have permission to delete this lead.');
      }
      
      console.log('Lead deleted successfully from database, count:', leadCount);
      return leadId;
    },
    onMutate: async (leadId: string) => {
      console.log('Starting optimistic update for lead deletion:', leadId);
      
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['leads', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['leads', franchiseeId, includeArchived]);
      
      // Optimistically update to remove the lead
      queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
        if (!old) return old;
        const filtered = old.filter((lead: any) => lead.id !== leadId);
        console.log('Optimistically removed lead, new count:', filtered.length);
        return filtered;
      });
      
      // Return a context object with the snapshotted value
      return { previousLeads };
    },
    onError: (err, leadId, context) => {
      console.error('Lead deletion failed, rolling back optimistic update:', err);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], context.previousLeads);
      }
      
      // Show specific error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      console.log('Lead deletion successful, invalidating related queries');
      
      // Only invalidate queries that we didn't optimistically update
      queryClient.invalidateQueries({ queryKey: ['lead-stats', franchiseeId] });
      
      // Invalidate bookings queries since they might reference this lead
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      toast.success('Lead deleted successfully');
    },
  });
};

export const useDeleteBooking = (franchiseeId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      console.log('Starting booking deletion process for appointment ID:', appointmentId);
      
      // Get the booking ID from the appointment
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('booking_id')
        .eq('id', appointmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching appointment:', fetchError);
        throw new Error(`Failed to fetch appointment: ${fetchError.message}`);
      }

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      console.log('Found booking ID:', appointment.booking_id);

      // Delete the appointment first
      const { error: appointmentError, count: appointmentCount } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .select('*', { count: 'exact', head: true });

      if (appointmentError) {
        console.error('Error deleting appointment:', appointmentError);
        throw new Error(`Failed to delete appointment: ${appointmentError.message}`);
      }

      if (appointmentCount === 0) {
        throw new Error('Appointment could not be deleted - it may not exist or you may not have permission');
      }
      console.log('Appointment deleted successfully, count:', appointmentCount);

      // Delete the associated booking
      const { error: bookingError, count: bookingCount } = await supabase
        .from('bookings')
        .delete()
        .eq('id', appointment.booking_id)
        .select('*', { count: 'exact', head: true });

      if (bookingError) {
        console.error('Error deleting booking:', bookingError);
        throw new Error(`Failed to delete booking: ${bookingError.message}`);
      }

      if (bookingCount === 0) {
        throw new Error('Booking could not be deleted - it may not exist or you may not have permission');
      }

      console.log('Booking deleted successfully from database, count:', bookingCount);
      return appointmentId;
    },
    onMutate: async (appointmentId: string) => {
      console.log('Starting optimistic update for booking deletion:', appointmentId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings', franchiseeId, false] });
      await queryClient.cancelQueries({ queryKey: ['bookings', franchiseeId, true] });
      
      // Snapshot the previous values
      const previousBookings = queryClient.getQueryData(['bookings', franchiseeId, false]);
      const previousArchivedBookings = queryClient.getQueryData(['bookings', franchiseeId, true]);
      
      // Optimistically update to remove the booking from both views
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
      console.error('Booking deletion failed, rolling back optimistic update:', err);
      
      // Roll back on error
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, false], context.previousBookings);
      }
      if (context?.previousArchivedBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, true], context.previousArchivedBookings);
      }
      
      // Show specific error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      toast.error(errorMessage);
    },
    onSuccess: () => {
      console.log('Booking deletion successful, invalidating related queries');
      
      // Only invalidate related queries, not the ones we optimistically updated
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
      
      toast.success('Booking deleted successfully');
    },
  });
};
