
import React from 'react';
import StatusBadge from '../leads/StatusBadge';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

interface StatusCellProps {
  leadId: string;
  bookingDate: string;
  fallbackStatus: string;
}

const StatusCell: React.FC<StatusCellProps> = ({ leadId, bookingDate, fallbackStatus }) => {
  return (
    <StatusBadge 
      leadId={leadId}
      currentStatus={fallbackStatus as LeadStatus}
      interactive={true}
      size="sm"
    />
  );
};

export default StatusCell;
