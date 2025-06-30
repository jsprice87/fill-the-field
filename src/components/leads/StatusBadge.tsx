
import React from 'react';
import { Badge, Menu } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusBadgeProps {
  leadId: string;
  currentStatus?: LeadStatus;
  bookingDate?: string;
  fallbackStatus?: string;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean; // New prop to control dropdown functionality
}

// Status color mapping based on the feature requirements
const getStatusColor = (status: LeadStatus | string): string => {
  switch (status) {
    case 'new':
      return 'blue'; // Blue - Fresh leads
    case 'booked_upcoming':
      return 'green'; // Green - Success state
    case 'booked_complete':
      return 'green'; // Green - Success state (completed booking)
    case 'follow_up':
      return 'orange'; // Orange - Needs attention
    case 'no_show':
      return 'red'; // Red - Closed negative
    case 'canceled':
      return 'red'; // Red - Closed negative
    case 'closed_lost':
      return 'red'; // Red - Closed negative
    case 'closed_won':
      return 'green'; // Green - Success state
    case 'needs_status':
      return 'orange'; // Orange - Needs attention
    default:
      return 'gray'; // Gray - Default/Unknown
  }
};

// Status label mapping for display
const getStatusLabel = (status: LeadStatus | string): string => {
  switch (status) {
    case 'new':
      return 'New';
    case 'booked_upcoming':
      return 'Upcoming';
    case 'booked_complete':
      return 'Complete';
    case 'no_show':
      return 'No-Show';
    case 'follow_up':
      return 'Follow-up';
    case 'canceled':
      return 'Canceled';
    case 'closed_lost':
      return 'Closed Lost';
    case 'closed_won':
      return 'Closed Won';
    case 'needs_status':
      return 'Needs Status';
    default:
      return status;
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  leadId, 
  currentStatus,
  bookingDate,
  fallbackStatus,
  disabled = false, 
  size = 'sm',
  interactive = true
}) => {
  const queryClient = useQueryClient();

  // Query to get the actual current status from the database
  const { data: leadData } = useQuery({
    queryKey: ['lead-status', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('id', leadId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!leadId,
    refetchInterval: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use the database status if available, otherwise fall back to props
  const actualStatus = leadData?.status || currentStatus || fallbackStatus || 'new';

  // Auto-determine status for past dates (existing logic)
  const today = new Date();
  const date = bookingDate ? new Date(bookingDate) : null;
  const isPast = date && date < today;
  const displayStatus = (actualStatus === 'booked_upcoming' && isPast) ? 'needs_status' : actualStatus;

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
    console.log('Status change requested:', { from: displayStatus, to: newStatus });
    updateStatusMutation.mutate(newStatus);
  };

  const statusColor = getStatusColor(displayStatus);
  const statusLabel = getStatusLabel(displayStatus);

  const statusOptions = [
    { value: 'new' as LeadStatus, label: 'New' },
    { value: 'booked_upcoming' as LeadStatus, label: 'Booked Upcoming' },
    { value: 'booked_complete' as LeadStatus, label: 'Booked Complete' },
    { value: 'no_show' as LeadStatus, label: 'No Show' },
    { value: 'follow_up' as LeadStatus, label: 'Follow-up' },
    { value: 'canceled' as LeadStatus, label: 'Canceled' },
    { value: 'closed_lost' as LeadStatus, label: 'Closed Lost' },
    { value: 'closed_won' as LeadStatus, label: 'Closed Won' }
  ];

  // If not interactive or disabled, just show the badge without dropdown functionality
  if (!interactive || disabled) {
    return (
      <Badge
        color={statusColor}
        variant="filled"
        size={size}
        style={{ cursor: 'default' }}
      >
        {statusLabel}
      </Badge>
    );
  }

  return (
    <Menu position="bottom-start" withinPortal>
      <Menu.Target>
        <Badge
          color={statusColor}
          variant="filled"
          size={size}
          style={{ 
            cursor: updateStatusMutation.isPending ? 'not-allowed' : 'pointer',
            opacity: updateStatusMutation.isPending ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {statusLabel}
          <ChevronDown size={12} />
        </Badge>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Change Status</Menu.Label>
        {statusOptions.map((option) => (
          <Menu.Item
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={updateStatusMutation.isPending || option.value === displayStatus}
            style={{
              backgroundColor: option.value === displayStatus ? `var(--mantine-color-${getStatusColor(option.value)}-1)` : undefined
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: `var(--mantine-color-${getStatusColor(option.value)}-6)`
                }}
              />
              {option.label}
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default StatusBadge;
