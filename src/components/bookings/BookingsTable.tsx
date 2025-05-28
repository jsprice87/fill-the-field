
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      day: 'numeric',
      year: 'numeric'
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
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="font-agrandir text-xl text-brand-navy mb-2">No Bookings Yet</h3>
          <p className="font-poppins text-gray-600">
            When people book classes through your landing page, they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-agrandir text-lg text-brand-navy">
                    {booking.lead_first_name} {booking.lead_last_name}
                  </h3>
                  {getStatusBadge(booking.status, booking.selected_date)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 text-brand-blue" />
                    <div>
                      <span className="font-poppins font-medium">Participant:</span>
                      <br />
                      <span className="font-poppins">{booking.participant_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Baby className="h-4 w-4 mr-2 text-brand-blue" />
                    <div>
                      <span className="font-poppins font-medium">Age:</span>
                      <br />
                      <span className="font-poppins">
                        {formatAge(booking.participant_birth_date, booking.participant_age)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-brand-blue" />
                    <div>
                      <span className="font-poppins font-medium">Location:</span>
                      <br />
                      <span className="font-poppins">{booking.location_name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
                    <div>
                      <span className="font-poppins font-medium">Class:</span>
                      <br />
                      <span className="font-poppins">{booking.class_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-poppins">
                    <strong>Date:</strong> {formatDate(booking.selected_date)}
                  </span>
                  <span className="font-poppins">
                    <strong>Time:</strong> {booking.class_time}
                  </span>
                </div>
              </div>
              
              <div className="ml-4 min-w-[140px]">
                <Select
                  value={booking.status}
                  onValueChange={(value) => handleStatusChange(booking.id, booking.lead_id, value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="text-xs">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingsTable;
