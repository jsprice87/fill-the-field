
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

// Status theme configuration with Mantine color mapping
const STATUS_THEME = {
  'new': {
    label: 'NEW',
    color: 'gray'
  },
  'booked_upcoming': {
    label: 'BOOKED UPCOMING', 
    color: 'blue'
  },
  'booked_complete': {
    label: 'BOOKED COMPLETE',
    color: 'green'
  },
  'no_show': {
    label: 'NO SHOW',
    color: 'red'
  },
  'follow_up': {
    label: 'FOLLOW UP',
    color: 'yellow'
  },
  'canceled': {
    label: 'CANCELED',
    color: 'red'
  },
  'closed_lost': {
    label: 'CLOSED LOST',
    color: 'red'
  },
  'closed_won': {
    label: 'CLOSED WON',
    color: 'violet'
  }
} as const;

const StatusBadgeSelector: React.FC<StatusBadgeSelectorProps> = ({ 
  id, 
  entity, 
  status, 
  className 
}) => {
  const statusMutation = useStatusMutation();
  
  const currentTheme = STATUS_THEME[status] || STATUS_THEME.new;
  
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === status) return;
    
    statusMutation.mutate({
      entity,
      id,
      status: newStatus
    });
  };

  return (
    <Menu withArrow position="bottom-start" disabled={statusMutation.isPending}>
      <Menu.Target>
        <Badge
          variant="filled"
          color={currentTheme.color}
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
          {currentTheme.label}
        </Badge>
      </Menu.Target>

      <Menu.Dropdown>
        {Object.entries(STATUS_THEME).map(([statusKey, theme]) => (
          <Menu.Item
            key={statusKey}
            onClick={() => handleStatusChange(statusKey as LeadStatus)}
            disabled={statusMutation.isPending}
            rightSection={status === statusKey ? <Check size={16} /> : null}
          >
            {theme.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default StatusBadgeSelector;
