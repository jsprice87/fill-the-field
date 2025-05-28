
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, Baby } from 'lucide-react';
import { useUpdateLeadStatus } from '@/hooks/useLeads';
import StatusDropdown from '@/components/common/StatusDropdown';

interface Booking {
  id: string;
  lead_id: string;
  class_schedule_id: string;
  selected_date: string;
  class_time: string;
  class_name: string;
  participant_name: string;
  participant_age: number;
  participant_birth_date: string;
  status: string;
  location_id: string;
  location_name?: string;
  lead_first_name?: string;
  lead_last_name?: string;
  created_at: string;
}

interface BookingsTableProps {
  bookings: Booking[];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings }) => {
  const updateStatusMutation = useUpdateLeadStatus();

  const formatAge = (birthDateString: string, ageNumber: number) => {
    if (birthDateString) {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return months > 0 ? `${years}Y ${months}M` : `${years}Y`;
      } else {
        return `${months}M`;
      }
    }
    return `${ageNumber}Y`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (leadId: string, newStatus: any) => {
    console.log('Status change triggered:', { leadId, newStatus });
    try {
      await updateStatusMutation.mutateAsync({
        leadId,
        status: newStatus
      });
      console.log('Status change completed successfully');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center p-8">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">No Bookings Yet</h3>
        <p className="font-poppins text-gray-600">
          When people book classes through your landing page, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-agrandir">Lead</TableHead>
            <TableHead className="font-agrandir">Participant</TableHead>
            <TableHead className="font-agrandir hidden md:table-cell">Location</TableHead>
            <TableHead className="font-agrandir hidden lg:table-cell">Class</TableHead>
            <TableHead className="font-agrandir">Date/Time</TableHead>
            <TableHead className="font-agrandir">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="font-agrandir font-medium text-brand-navy">
                  {booking.lead_first_name} {booking.lead_last_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{booking.participant_name}</div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Baby className="h-3 w-3 mr-1" />
                    {formatAge(booking.participant_birth_date, booking.participant_age)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="text-sm">{booking.location_name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-sm">{booking.class_name}</div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">{formatDate(booking.selected_date)}</div>
                  <div className="text-xs text-gray-600">{booking.class_time}</div>
                  <div className="md:hidden text-xs text-gray-600 mt-1">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location_name}
                    </div>
                    <div className="lg:hidden mt-1">{booking.class_name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusDropdown
                  status={booking.status as any}
                  onStatusChange={(status) => handleStatusChange(booking.lead_id, status)}
                  disabled={updateStatusMutation.isPending}
                  showBadge={true}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingsTable;
