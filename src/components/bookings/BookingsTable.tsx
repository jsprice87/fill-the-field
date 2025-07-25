import React, { useState } from 'react';
import { ScrollArea, Text, Table, Menu, ActionIcon } from '@mantine/core';
import { TableBody, TableHead, TableHeader, TableRow } from '@/components/mantine';
import { Button } from '@/components/mantine';
import { IconDotsVertical, IconPencil, IconTrash, IconArchive, IconRestore, IconEye } from '@tabler/icons-react';
import { Archive, ArchiveRestore } from 'lucide-react';
import { useArchiveBooking, useUnarchiveBooking } from '@/hooks/useArchiveActions';
import { useDeleteBooking } from '@/hooks/useDeleteActions';
import { useStatusMutation } from '@/hooks/useStatusMutation';
import { notify } from '@/utils/notify';
import DateTimeCell from './DateTimeCell';
import ParticipantCell from './ParticipantCell';
import StatusCell from './StatusCell';
import BookingsTableEmpty from './BookingsTableEmpty';
import { EnhancedPagination } from '@/components/common/EnhancedPagination';
import { usePagination } from '@/hooks/usePagination';
import type { Booking } from '@/types';

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

  // Add pagination
  const pagination = usePagination({
    data: bookings,
    initialPageSize: 25, // Reduce initial page size to minimize whitespace
    initialPage: 1
  });

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
      
      notify('success', `${selectedBookings.size} booking${selectedBookings.size > 1 ? 's' : ''} ${showArchived ? 'unarchived' : 'archived'} successfully`);
      setSelectedBookings(new Set());
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      notify('error', `Failed to ${showArchived ? 'unarchive' : 'archive'} bookings`);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await statusMutation.mutateAsync({
        entity: 'booking',
        id: bookingId,
        status: newStatus as any
      });
      notify('success', 'Booking status updated successfully');
    } catch (error) {
      console.error('Error updating booking status:', error);
      notify('error', 'Failed to update booking status');
    }
  };

  const handleArchiveToggle = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      if (booking.archived_at) {
        await unarchiveBooking.mutateAsync(bookingId);
        notify('success', 'Booking unarchived successfully');
      } else {
        await archiveBooking.mutateAsync(bookingId);
        notify('success', 'Booking archived successfully');
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      notify('error', 'Failed to update booking');
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBooking.mutateAsync(bookingId);
      notify('success', 'Booking deleted successfully');
    } catch (error) {
      console.error('Error deleting booking:', error);
      notify('error', 'Failed to delete booking');
    }
  };

  return (
    <div className="space-y-4">
      {selectedBookings.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Text size="sm" fw={500}>
            {selectedBookings.size} booking{selectedBookings.size > 1 ? 's' : ''} selected
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Unarchive' : 'Archive'} Selected
          </Button>
        </div>
      )}

      <ScrollArea h="calc(100vh - 240px)">
        <Table.ScrollContainer minWidth={900}>
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '48px' }}>
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
                <TableHead style={{ width: '48px' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.currentData.map((booking) => (
                <TableRow 
                  key={booking.id} 
                  interactive
                  style={{
                    backgroundColor: selectedBookings.has(booking.id) ? 'var(--mantine-color-primary-1)' : 
                                    hoveredRow === booking.id ? 'var(--mantine-color-gray-1)' : 'transparent',
                    opacity: booking.archived_at ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredRow(booking.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedBookings.has(booking.id)}
                      onChange={(e) => handleBookingSelection(booking.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text size="xs" ff="monospace">
                      {booking.booking_reference || 'N/A'}
                    </Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="space-y-1">
                      <Text size="sm" fw={500}>
                        {booking.parent_first_name} {booking.parent_last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {booking.parent_email}
                      </Text>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="space-y-1">
                      {booking.participants.map((participant, index) => (
                        <div key={participant.id}>
                          <Text size="sm" fw={500} span>{participant.first_name}</Text>
                          <Text size="sm" c="dimmed" span> ({participant.age})</Text>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="space-y-1">
                      <Text size="sm" fw={500}>
                        {booking.class_schedules?.classes?.class_name || 'N/A'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {booking.class_schedules?.classes?.locations?.name || 'N/A'}
                      </Text>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="space-y-1">
                      <Text size="sm" fw={500}>
                        {booking.selected_date ? new Date(booking.selected_date).toLocaleDateString() : 'N/A'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {booking.class_schedules?.start_time && booking.class_schedules?.end_time
                          ? `${booking.class_schedules.start_time} - ${booking.class_schedules.end_time}`
                          : 'Time not set'
                        }
                      </Text>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusCell 
                      leadId={booking.lead_id}
                      bookingDate={booking.selected_date || ''}
                      fallbackStatus={booking.status}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="space-y-1">
                      <Text size="xs">📧 {booking.communication_permission ? '✓' : '✗'}</Text>
                      <Text size="xs">📱 {booking.marketing_permission ? '✓' : '✗'}</Text>
                      <Text size="xs">📄 {booking.waiver_accepted ? '✓' : '✗'}</Text>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Menu shadow="md" withinPortal position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" size="sm">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />}>
                          View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconPencil size={14} />}>
                          Edit Booking
                        </Menu.Item>
                        <Menu.Item 
                          leftSection={booking.archived_at ? <IconRestore size={14} /> : <IconArchive size={14} />}
                          onClick={() => handleArchiveToggle(booking.id)}
                        >
                          {booking.archived_at ? 'Unarchive' : 'Archive'}
                        </Menu.Item>
                        <Menu.Item 
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDelete(booking.id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Table.ScrollContainer>
      </ScrollArea>
      
      {/* Enhanced Pagination */}
      <EnhancedPagination
        totalItems={pagination.totalItems}
        currentPage={pagination.currentPage}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setCurrentPage}
        onPageSizeChange={pagination.setPageSize}
        itemName="bookings"
        sticky={true}
      />
    </div>
  );
};

export default BookingsTable;
