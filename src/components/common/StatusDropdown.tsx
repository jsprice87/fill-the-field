
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/hooks/useLeads';

interface StatusDropdownProps {
  status: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
  disabled?: boolean;
  showBadge?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ 
  status, 
  onStatusChange, 
  disabled = false,
  showBadge = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = (status: LeadStatus) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'booked_upcoming': 'bg-green-100 text-green-800',
      'booked_complete': 'bg-purple-100 text-purple-800',
      'no_show': 'bg-gray-100 text-gray-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-red-100 text-red-800',
      'closed_lost': 'bg-red-100 text-red-800',
      'closed_won': 'bg-green-100 text-green-800'
    };
    
    const labels = {
      'new': 'New',
      'booked_upcoming': 'Booked, Upcoming',
      'booked_complete': 'Booked, Complete',
      'no_show': 'No-Show',
      'follow_up': 'Follow-Up',
      'canceled': 'Canceled',
      'closed_lost': 'Closed Lost',
      'closed_won': 'Closed Won'
    };
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-2">
      {showBadge && getStatusBadge(status)}
      <Select
        value={status}
        onValueChange={(value) => {
          onStatusChange(value as LeadStatus);
          setIsOpen(false);
        }}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="text-xs w-full min-w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="booked_upcoming">Booked, Upcoming</SelectItem>
          <SelectItem value="booked_complete">Booked, Complete</SelectItem>
          <SelectItem value="no_show">No-Show</SelectItem>
          <SelectItem value="follow_up">Follow-Up</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
          <SelectItem value="closed_lost">Closed Lost</SelectItem>
          <SelectItem value="closed_won">Closed Won</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusDropdown;
