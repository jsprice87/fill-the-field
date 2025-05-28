
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, User, Baby } from 'lucide-react';
import { useUpdateBookingStatus } from '@/hooks/useBookings';

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
  const updateStatusMutation = useUpdateBookingStatus();

  const getStatusBadge = (status: string, bookingDate: string) => {
    const today = new Date();
    const date = new Date(bookingDate);
    const isPast = date < today;
    
    // Auto-determine status for past dates
    const displayStatus = (status === 'confirmed' && isPast) ? 'needs_status' : status;
    
    const variants = {
      'confirmed': 'bg-green-100 text-green-800',
      'needs_status': 'bg-orange-100 text-orange-800',
      'rescheduled': 'bg-blue-100 text-blue-800',
      'canceled': 'bg-red-100 text-red-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'no_show': 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      'confirmed': 'Upcoming',
      'needs_status': 'Needs Status',
      'rescheduled': 'Rescheduled',
      'canceled': 'Canceled',
      'follow_up': 'Follow-up',
      'no_show': 'No-Show'
    };
    
    return (
      <Badge className={variants[displayStatus as keyof typeof variants] || variants.confirmed}>
        {labels[displayStatus as keyof typeof labels] || 'Upcoming'}
      </Badge>
    );
  };

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

  const handleStatusChange = async (bookingId: string, leadId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        bookingId,
        leadId,
        status: newStatus
      });
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
                <div className="space-y-2">
                  {getStatusBadge(booking.status, booking.selected_date)}
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusChange(booking.id, booking.lead_id, value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="text-xs w-full min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Upcoming</SelectItem>
                      <SelectItem value="needs_status">Needs Status</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="no_show">No-Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingsTable;
