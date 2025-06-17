
import React from 'react';
import { Menu, Badge, ActionIcon } from '@mantine/core';
import { ChevronDown, Check } from 'lucide-react';
import { useStatusMutation } from '@/hooks/useStatusMutation';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusBadgeSelectorProps {
  id: string;
  entity: 'booking' | 'lead';
  status: LeadStatus;
  className?: string;
}

// Status color mapping with Mantine colors and variants
const STATUS_COLOR_MAP: Record<LeadStatus, { color: string; variant: 'light' | 'filled' }> = {
  'new': { color: 'gray', variant: 'light' },
  'booked_upcoming': { color: 'blue', variant: 'light' },
  'booked_complete': { color: 'green', variant: 'light' },
  'no_show': { color: 'yellow', variant: 'light' },
  'follow_up': { color: 'orange', variant: 'light' },
  'canceled': { color: 'red', variant: 'light' },
  'closed_lost': { color: 'red', variant: 'filled' },
  'closed_won': { color: 'teal', variant: 'filled' }
} as const;

// Status labels
const STATUS_LABELS: Record<LeadStatus, string> = {
  'new': 'NEW',
  'booked_upcoming': 'BOOKED UPCOMING',
  'booked_complete': 'BOOKED COMPLETE',
  'no_show': 'NO SHOW',
  'follow_up': 'FOLLOW UP',
  'canceled': 'CANCELED',
  'closed_lost': 'CLOSED LOST',
  'closed_won': 'CLOSED WON'
} as const;

const StatusBadgeSelector: React.FC<StatusBadgeSelectorProps> = ({ 
  id, 
  entity, 
  status, 
  className 
}) => {
  const statusMutation = useStatusMutation();
  
  const currentStatusConfig = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.new;
  const currentLabel = STATUS_LABELS[status] || STATUS_LABELS.new;
  
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === status) return;
    
    statusMutation.mutate({
      entity,
      id,
      status: newStatus
    });
  };

  return (
    <Menu 
      withArrow 
      position="bottom-start" 
      disabled={statusMutation.isPending}
      radius="sm"
      shadow="md"
    >
      <Menu.Target>
        <Badge
          variant={currentStatusConfig.variant}
          color={currentStatusConfig.color}
          style={{ cursor: 'pointer' }}
          className={className}
          rightSection={
            statusMutation.isPending ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
            ) : (
              <ChevronDown size={12} />
            )
          }
        >
          {currentLabel}
        </Badge>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.entries(STATUS_COLOR_MAP).map(([statusKey, config]) => (
          <Menu.Item
            key={statusKey}
            onClick={() => handleStatusChange(statusKey as LeadStatus)}
            disabled={statusMutation.isPending}
            rightSection={status === statusKey ? <Check size={16} /> : null}
            leftSection={
              <Badge
                variant={config.variant}
                color={config.color}
                size="sm"
              >
                {STATUS_LABELS[statusKey as LeadStatus]}
              </Badge>
            }
          >
            {STATUS_LABELS[statusKey as LeadStatus]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default StatusBadgeSelector;

