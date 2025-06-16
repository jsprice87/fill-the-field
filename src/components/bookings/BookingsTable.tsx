
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Archive, ArchiveRestore, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useArchiveBooking, useUnarchiveBooking } from '@/hooks/useArchiveActions';
import { useDeleteBooking } from '@/hooks/useDeleteActions';
import { useStatusMutation } from '@/hooks/useStatusMutation';
import { toast } from 'sonner';
import DateTimeCell from './DateTimeCell';
import ParticipantCell from './ParticipantCell';
import StatusCell from './StatusCell';
import BookingsTableEmpty from './BookingsTableEmpty';

interface Booking {
  id: string;
  booking_reference: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  waiver_accepted: boolean | null;
  communication_permission: boolean | null;
  marketing_permission: boolean | null;
  created_at: string;
  selected_date: string | null;
  archived_at: string | null;
  location_id: string;
  class_schedule_id: string;
  participants: Array<{
    id: string;
    first_name: string;
    age: number;
    computed_age: string | null;
  }>;
  class_schedules: {
    start_time: string;
    end_time: string;
    classes: {
      name: string;
      class_name: string;
      locations: {
        name: string;
      };
    };
  } | null;
  status: 'booked_upcoming' | 'attended' | 'no_show' | 'cancelled';
}

interface BookingsTableProps {
  bookings: Booking[];
  searchQuery?: string;
  showArchived?: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, searchQuery, showArchived = false }) => {
  const archiveBooking = useArchiveBooking();
  const unarchiveBooking = useUnarchiveBooking();
  const deleteBooking = useDeleteBooking();
  const statusMutation = useStatusMutation();
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (!bookings || bookings.length === 0) {
    return <BookingsTableEmpty searchQuery={searchQuery} showArchived={showArchived} />;
  }

  const handleBookingSelection = (bookingId: string, selected: boolean) => {
    const newSelection = new Set(selectedBookings);
    if (selected) {
      newSelection.add(bookingId);
    } else {
      newSelection.delete(bookingId);
    }
    setSelectedBookings(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedBookings.size === bookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map(booking => booking.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedBookings.size === 0) return;
    
    try {
      const promises = Array.from(selectedBookings).map(id => 
        showArchived ? unarchiveBooking.mutateAsync(id) : archiveBooking.mutateAsync(id)
      );
      await Promise.all(promises);
      
      toast.success(`${selectedBookings.size} booking${selectedBookings.size > 1 ? 's' : ''} ${showArchived ? 'unarchived' : 'archived'} successfully`);
      setSelectedBookings(new Set());
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      toast.error(`Failed to ${showArchived ? 'unarchive' : 'archive'} bookings`);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await statusMutation.mutateAsync({
        leadId: bookingId,
        status: newStatus as any,
        bookingDate: bookings.find(b => b.id === bookingId)?.selected_date || ''
      });
      toast.success('Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleArchiveToggle = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      if (booking.archived_at) {
        await unarchiveBooking.mutateAsync(bookingId);
        toast.success('Booking unarchived successfully');
      } else {
        await archiveBooking.mutateAsync(bookingId);
        toast.success('Booking archived successfully');
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update booking');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBooking.mutateAsync(bookingId);
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="space-y-4">
      {selectedBookings.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span className="text-body-sm font-medium">
            {selectedBookings.size} booking{selectedBookings.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            className="ui-hover"
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Unarchive' : 'Archive'} Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedBookings.size === bookings.length && bookings.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Class & Location</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow 
              key={booking.id} 
              interactive
              className={`
                ${selectedBookings.has(booking.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${hoveredRow === booking.id ? 'bg-gray-50 dark:bg-gray-800' : ''}
                ${booking.archived_at ? 'opacity-60' : ''}
              `}
              onMouseEnter={() => setHoveredRow(booking.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedBookings.has(booking.id)}
                  onChange={(e) => handleBookingSelection(booking.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {booking.booking_reference || 'N/A'}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {booking.parent_first_name} {booking.parent_last_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.parent_email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {booking.participants.map((participant, index) => (
                    <div key={participant.id} className="text-sm">
                      <span className="font-medium">{participant.first_name}</span>
                      <span className="text-muted-foreground ml-2">({participant.age})</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {booking.class_schedules?.classes?.class_name || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.class_schedules?.classes?.locations?.name || 'N/A'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {booking.selected_date ? new Date(booking.selected_date).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {booking.class_schedules?.start_time && booking.class_schedules?.end_time
                      ? `${booking.class_schedules.start_time} - ${booking.class_schedules.end_time}`
                      : 'Time not set'
                    }
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusCell 
                  leadId={booking.id}
                  bookingDate={booking.selected_date || ''}
                  fallbackStatus={booking.status}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-xs">
                  <div>📧 {booking.communication_permission ? '✓' : '✗'}</div>
                  <div>📱 {booking.marketing_permission ? '✓' : '✗'}</div>
                  <div>📄 {booking.waiver_accepted ? '✓' : '✗'}</div>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ui-hover">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Booking
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveToggle(booking.id)}>
                      {booking.archived_at ? (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingsTable;
