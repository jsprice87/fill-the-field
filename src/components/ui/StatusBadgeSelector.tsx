
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { useStatusMutation } from '@/hooks/useStatusMutation';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusBadgeSelectorProps {
  id: string;
  entity: 'booking' | 'lead';
  status: LeadStatus;
  className?: string;
}

// Status theme configuration
const STATUS_THEME = {
  'new': {
    label: 'NEW',
    classes: 'bg-blue-100 text-blue-800'
  },
  'booked_upcoming': {
    label: 'BOOKED UPCOMING',
    classes: 'bg-green-100 text-green-800'
  },
  'booked_complete': {
    label: 'BOOKED COMPLETE',
    classes: 'bg-purple-100 text-purple-800'
  },
  'no_show': {
    label: 'NO SHOW',
    classes: 'bg-red-100 text-red-800'
  },
  'follow_up': {
    label: 'FOLLOW UP',
    classes: 'bg-yellow-100 text-yellow-800'
  },
  'canceled': {
    label: 'CANCELED',
    classes: 'bg-gray-100 text-gray-800'
  },
  'closed_lost': {
    label: 'CLOSED LOST',
    classes: 'bg-red-100 text-red-800'
  },
  'closed_won': {
    label: 'CLOSED WON',
    classes: 'bg-emerald-100 text-emerald-800'
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors
            hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            max-w-fit
            ${currentTheme.classes}
            ${className || ''}
          `}
          disabled={statusMutation.isPending}
          aria-label={`Change status, current: ${currentTheme.label}`}
        >
          {statusMutation.isPending ? (
            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
          ) : null}
          {currentTheme.label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {Object.entries(STATUS_THEME).map(([statusKey, theme]) => (
          <DropdownMenuItem
            key={statusKey}
            onClick={() => handleStatusChange(statusKey as LeadStatus)}
            className="flex items-center justify-between cursor-pointer"
            disabled={statusMutation.isPending}
          >
            <span className="text-sm">{theme.label}</span>
            {status === statusKey && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusBadgeSelector;
