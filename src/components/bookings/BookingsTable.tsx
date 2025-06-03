import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Baby, Search, Archive, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';
import StatusSelect from '../leads/StatusSelect';
import StatusBadge from '../leads/StatusBadge';
import { useArchiveBooking, useUnarchiveBooking } from '@/hooks/useArchiveActions';
import { useDeleteBooking } from '@/hooks/useDeleteActions';
import DeleteConfirmationDialog from '@/components/shared/DeleteConfirmationDialog';
import type { Database } from '@/integrations/supabase/types';

type LeadStatus = Database['public']['Enums']['lead_status'];

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
  archived_at?: string | null;
}

interface BookingsTableProps {
  bookings: Booking[];
  searchQuery?: string;
  showArchived?: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, searchQuery, showArchived }) => {
  const [searchParams] = useSearchParams();
  const { data: franchiseeData } = useFranchiseeData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const includeArchived = searchParams.get('archived') === 'true';

  const archiveBooking = useArchiveBooking(franchiseeData?.id, includeArchived);
  const unarchiveBooking = useUnarchiveBooking(franchiseeData?.id, includeArchived);
  const deleteBooking = useDeleteBooking(franchiseeData?.id);

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

  const handleArchiveToggle = (booking: Booking) => {
    console.log('Archiving booking with ID:', booking.id, 'archived_at:', booking.archived_at);
    
    if (booking.archived_at) {
      unarchiveBooking.mutate(booking.id);
    } else {
      archiveBooking.mutate(booking.id);
    }
  };

  const handleDeleteClick = (booking: Booking) => {
    console.log('Delete clicked for booking ID:', booking.id);
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bookingToDelete) {
      console.log('Confirming delete for booking ID:', bookingToDelete.id);
      deleteBooking.mutate(bookingToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setBookingToDelete(null);
        }
      });
    }
  };

  if (bookings.length === 0) {
    if (searchQuery) {
      return (
        <div className="text-center p-8">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="font-agrandir text-xl text-brand-navy mb-2">No results for "{searchQuery}"</h3>
          <p className="font-poppins text-gray-600">
            Try adjusting your search terms or clear the search to see all bookings.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center p-8">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">
          {showArchived ? 'No Archived Bookings' : 'No Bookings Yet'}
        </h3>
        <p className="font-poppins text-gray-600">
          {showArchived 
            ? 'No bookings have been archived yet.'
            : 'When people book classes through your landing page, they\'ll appear here.'
          }
        </p>
      </div>
    );
  }

  return (
    <>
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
              <TableHead className="font-agrandir">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow 
                key={booking.id} 
                className={`hover:bg-muted/50 ${booking.archived_at ? 'opacity-60 bg-gray-50' : ''}`}
              >
                <TableCell>
                  <div className="font-agrandir font-medium text-brand-navy flex items-center gap-2">
                    {booking.lead_first_name} {booking.lead_last_name}
                    {booking.archived_at && (
                      <Badge variant="secondary" className="text-xs">Archived</Badge>
                    )}
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
                    <StatusBadge 
                      leadId={booking.lead_id}
                      bookingDate={booking.selected_date}
                      fallbackStatus={booking.status}
                    />
                    <StatusSelect 
                      leadId={booking.lead_id}
                      currentStatus={booking.status as LeadStatus}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleArchiveToggle(booking)}
                      disabled={archiveBooking.isPending || unarchiveBooking.isPending}
                      className="text-xs"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      {booking.archived_at ? 'Unarchive' : 'Archive'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(booking)}
                      disabled={deleteBooking.isPending}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Booking"
        description={bookingToDelete ? `Are you sure you want to delete the booking for ${bookingToDelete.participant_name}? This action cannot be undone.` : ''}
        isLoading={deleteBooking.isPending}
      />
    </>
  );
};

export default BookingsTable;
