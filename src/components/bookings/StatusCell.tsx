
import React from 'react';
import StatusSelect from '../leads/StatusSelect';
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
    <div className="space-y-2">
      <StatusBadge 
        leadId={leadId}
        bookingDate={bookingDate}
        fallbackStatus={fallbackStatus}
      />
      <StatusSelect 
        leadId={leadId}
        currentStatus={fallbackStatus as LeadStatus}
      />
    </div>
  );
};

export default StatusCell;
