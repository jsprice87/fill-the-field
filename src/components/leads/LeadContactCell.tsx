
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface LeadContactCellProps {
  email: string;
  phone: string;
}

const LeadContactCell: React.FC<LeadContactCellProps> = ({ email, phone }) => {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center text-gray-600">
        <Mail className="h-3 w-3 mr-1" />
        {email}
      </div>
      <div className="flex items-center text-gray-600">
        <Phone className="h-3 w-3 mr-1" />
        {phone}
      </div>
    </div>
  );
};

export default LeadContactCell;
