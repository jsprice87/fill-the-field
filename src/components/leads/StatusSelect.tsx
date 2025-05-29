
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: LeadStatus) => {
      console.log('Updating lead status:', { leadId, newStatus });
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', leadId)
        .select()
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows

      if (error) {
        console.error('Lead status update error:', error);
        throw error;
      }
      
      console.log('Lead status updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Status update mutation successful:', data);
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lead-detail'] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update status');
    }
  });

  const handleStatusChange = (newStatus: LeadStatus) => {
    console.log('Status change requested:', { from: currentStatus, to: newStatus });
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={disabled || updateStatusMutation.isPending}
    >
      <SelectTrigger className="w-full min-w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="booked_upcoming">Booked Upcoming</SelectItem>
        <SelectItem value="booked_complete">Booked Complete</SelectItem>
        <SelectItem value="no_show">No Show</SelectItem>
        <SelectItem value="follow_up">Follow-up</SelectItem>
        <SelectItem value="canceled">Canceled</SelectItem>
        <SelectItem value="closed_lost">Closed Lost</SelectItem>
        <SelectItem value="closed_won">Closed Won</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelect;
