
import React from 'react';
import { Menu, Badge, ActionIcon } from '@mantine/core';
import { IconChevronDown, IconCheck, IconX, IconClock, IconAlertTriangle, IconArchive } from '@tabler/icons-react';
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

// Status icons mapping
const STATUS_ICONS: Record<LeadStatus, React.ReactNode> = {
  'new': <IconClock size={16} />,
  'booked_upcoming': <IconCheck size={16} />,
  'booked_complete': <IconCheck size={16} />,
  'no_show': <IconX size={16} />,
  'follow_up': <IconClock size={16} />,
  'canceled': <IconX size={16} />,
  'closed_lost': <IconX size={16} />,
  'closed_won': <IconCheck size={16} />
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
      withinPortal
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
              <IconChevronDown size={12} />
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
            rightSection={status === statusKey ? <IconCheck size={16} /> : null}
            leftSection={STATUS_ICONS[statusKey as LeadStatus]}
          >
            {STATUS_LABELS[statusKey as LeadStatus]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default StatusBadgeSelector;
