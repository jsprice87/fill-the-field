
import React from 'react';
import { Select } from '@mantine/core';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusSelectProps {
  leadId: string;
  currentStatus: LeadStatus;
  disabled?: boolean;
}

const StatusSelect: React.FC<StatusSelectProps> = ({ leadId, currentStatus, disabled = false }) => {
  const queryClient = useQueryClient();

  // Query to get the actual current status from the database
  const { data: leadData } = useQuery({
    queryKey: ['lead-status', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use the database status if available, otherwise fall back to prop
  const actualStatus = leadData?.status || currentStatus;

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: LeadStatus) => {
      console.log('Updating lead status:', { leadId, newStatus });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus, 
          status_manually_set: true, // Mark as manually set to prevent automatic overrides
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Lead status update error:', error);
        throw error;
      }
      
      console.log('Lead status updated successfully:', data);
      return data;
    },
    onMutate: async (newStatus) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['lead-status', leadId] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData(['lead-status', leadId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['lead-status', leadId], { status: newStatus });

      // Return a context object with the snapshotted value
      return { previousStatus };
    },
    onSuccess: (data) => {
      console.log('Status update mutation successful:', data);
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
      queryClient.invalidateQueries({ queryKey: ['lead-status', leadId] });
      toast.success('Status updated successfully');
    },
    onError: (error, newStatus, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['lead-status', leadId], context?.previousStatus);
      console.error('Error updating lead status:', error);
      toast.error('Failed to update status');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['lead-status', leadId] });
    }
  });

  const handleStatusChange = (newStatus: LeadStatus) => {
    console.log('Status change requested:', { from: actualStatus, to: newStatus });
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Select
      value={actualStatus}
      onChange={handleStatusChange}
      disabled={disabled || updateStatusMutation.isPending}
      data={[
        { value: 'new', label: 'New' },
        { value: 'booked_upcoming', label: 'Booked Upcoming' },
        { value: 'booked_complete', label: 'Booked Complete' },
        { value: 'no_show', label: 'No Show' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'canceled', label: 'Canceled' },
        { value: 'closed_lost', label: 'Closed Lost' },
        { value: 'closed_won', label: 'Closed Won' }
      ]}
      w={140}
      withinPortal
    />
  );
};

export default StatusSelect;
