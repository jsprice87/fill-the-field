
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useArchiveLead = (franchiseeId?: string, includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      return leadId;
    },
    onMutate: async (leadId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['leads', franchiseeId, includeArchived]);
      
      // If we're in the non-archived view, remove the lead immediately
      if (!includeArchived) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.filter((lead: any) => lead.id !== leadId);
        });
      } else {
        // If we're in the archived view, update the lead to show as archived
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.map((lead: any) => 
            lead.id === leadId 
              ? { ...lead, archived_at: new Date().toISOString() }
              : lead
          );
        });
      }
      
      return { previousLeads };
    },
    onError: (err, leadId, context) => {
      // Roll back on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], context.previousLeads);
      }
      console.error('Error archiving lead:', err);
      toast.error('Failed to archive lead');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats', franchiseeId] });
    },
  });
};

export const useUnarchiveLead = (franchiseeId?: string, includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads')
        .update({ archived_at: null })
        .eq('id', leadId);

      if (error) throw error;
      return leadId;
    },
    onMutate: async (leadId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['leads', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['leads', franchiseeId, includeArchived]);
      
      // If we're in the archived view, remove the lead immediately
      if (includeArchived) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.filter((lead: any) => lead.id !== leadId);
        });
      } else {
        // If we're in the non-archived view, update the lead to show as unarchived
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.map((lead: any) => 
            lead.id === leadId 
              ? { ...lead, archived_at: null }
              : lead
          );
        });
      }
      
      return { previousLeads };
    },
    onError: (err, leadId, context) => {
      // Roll back on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads', franchiseeId, includeArchived], context.previousLeads);
      }
      console.error('Error unarchiving lead:', err);
      toast.error('Failed to unarchive lead');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats', franchiseeId] });
    },
  });
};

export const useArchiveBooking = (franchiseeId?: string, includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      console.log('Archiving appointment with ID:', appointmentId);
      
      // Archive the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (appointmentError) {
        console.error('Error archiving appointment:', appointmentError);
        throw appointmentError;
      }

      console.log('Appointment archived successfully');
      return appointmentId;
    },
    onMutate: async (appointmentId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData(['bookings', franchiseeId, includeArchived]);
      
      // If we're in the non-archived view, remove the booking immediately
      if (!includeArchived) {
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.filter((booking: any) => booking.id !== appointmentId);
        });
      } else {
        // If we're in the archived view, update the booking to show as archived
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.map((booking: any) => 
            booking.id === appointmentId 
              ? { ...booking, archived_at: new Date().toISOString() }
              : booking
          );
        });
      }
      
      return { previousBookings };
    },
    onError: (err, appointmentId, context) => {
      // Roll back on error
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], context.previousBookings);
      }
      console.error('Error archiving booking:', err);
      toast.error('Failed to archive booking');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
    },
  });
};

export const useUnarchiveBooking = (franchiseeId?: string, includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      console.log('Unarchiving appointment with ID:', appointmentId);
      
      // Unarchive the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({ archived_at: null })
        .eq('id', appointmentId);

      if (appointmentError) {
        console.error('Error unarchiving appointment:', appointmentError);
        throw appointmentError;
      }

      console.log('Appointment unarchived successfully');
      return appointmentId;
    },
    onMutate: async (appointmentId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookings', franchiseeId, includeArchived] });
      
      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData(['bookings', franchiseeId, includeArchived]);
      
      // If we're in the archived view, remove the booking immediately
      if (includeArchived) {
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.filter((booking: any) => booking.id !== appointmentId);
        });
      } else {
        // If we're in the non-archived view, update the booking to show as unarchived
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], (old: any) => {
          if (!old) return old;
          return old.map((booking: any) => 
            booking.id === appointmentId 
              ? { ...booking, archived_at: null }
              : booking
          );
        });
      }
      
      return { previousBookings };
    },
    onError: (err, appointmentId, context) => {
      // Roll back on error
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings', franchiseeId, includeArchived], context.previousBookings);
      }
      console.error('Error unarchiving booking:', err);
      toast.error('Failed to unarchive booking');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', franchiseeId] });
      queryClient.invalidateQueries({ queryKey: ['leads', franchiseeId] });
    },
  });
};

// Legacy exports for backwards compatibility
export const useArchiveActions = () => {
  const archiveLead = useArchiveLead();
  const unarchiveLead = useUnarchiveLead();
  const archiveBooking = useArchiveBooking();
  const unarchiveBooking = useUnarchiveBooking();

  return {
    archiveLead: archiveLead.mutateAsync,
    unarchiveLead: unarchiveLead.mutateAsync,
    archiveBooking: archiveBooking.mutateAsync,
    unarchiveBooking: unarchiveBooking.mutateAsync,
  };
};
