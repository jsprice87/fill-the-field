
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useArchiveLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead archived successfully');
    },
    onError: (error) => {
      console.error('Error archiving lead:', error);
      toast.error('Failed to archive lead');
    },
  });
};

export const useUnarchiveLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .update({ archived_at: null })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      toast.success('Lead unarchived successfully');
    },
    onError: (error) => {
      console.error('Error unarchiving lead:', error);
      toast.error('Failed to unarchive lead');
    },
  });
};

export const useArchiveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      // Archive the booking and its associated appointment
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ archived_at: new Date().toISOString() })
        .eq('booking_id', bookingId);

      if (appointmentError) throw appointmentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking archived successfully');
    },
    onError: (error) => {
      console.error('Error archiving booking:', error);
      toast.error('Failed to archive booking');
    },
  });
};

export const useUnarchiveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      // Unarchive the booking and its associated appointment
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ archived_at: null })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ archived_at: null })
        .eq('booking_id', bookingId);

      if (appointmentError) throw appointmentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking unarchived successfully');
    },
    onError: (error) => {
      console.error('Error unarchiving booking:', error);
      toast.error('Failed to unarchive booking');
    },
  });
};
