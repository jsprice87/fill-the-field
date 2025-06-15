
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone } from 'lucide-react';

interface LeadInfoCellProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  archivedAt?: string | null;
}

const LeadInfoCell: React.FC<LeadInfoCellProps> = ({ 
  firstName, 
  lastName, 
  email, 
  phone, 
  notes, 
  archivedAt 
}) => {
  return (
    <div className="space-y-1">
      <div className="font-agrandir font-medium text-brand-navy flex items-center gap-2">
        {firstName} {lastName}
        {archivedAt && (
          <Badge variant="secondary" className="text-xs">Archived</Badge>
        )}
      </div>
      <div className="md:hidden text-sm text-gray-600 space-y-1">
        <div className="flex items-center">
          <Mail className="h-3 w-3 mr-1" />
          {email}
        </div>
        <div className="flex items-center">
          <Phone className="h-3 w-3 mr-1" />
          {phone}
        </div>
      </div>
      {notes && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1">
          {notes}
        </div>
      )}
    </div>
  );
};

export default LeadInfoCell;
