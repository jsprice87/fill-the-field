import React, { useState } from 'react';
import { Card, Text, Stack, Button, Group } from '@mantine/core';
import { Calendar, Plus } from 'lucide-react';
import { useLeadBookings, type LeadBooking } from '@/hooks/useLeadBookings';
import BookingCard from './BookingCard';
import EditBookingModal from './EditBookingModal';
import { useCancelBooking } from '@/hooks/useBookingActions';

interface LeadBookingsSectionProps {
  leadId: string;
}

const LeadBookingsSection: React.FC<LeadBookingsSectionProps> = ({ leadId }) => {
  const { data: bookings, isLoading, error } = useLeadBookings(leadId);
  const [selectedBooking, setSelectedBooking] = useState<LeadBooking | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const cancelBooking = useCancelBooking();

  const handleEditBooking = (booking: LeadBooking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking.mutateAsync(bookingId);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
  };

  if (isLoading) {
    return (
      <Card withBorder>
        <Card.Section p="md" withBorder>
          <Group gap="xs" align="center">
            <Calendar size={20} />
            <Text size="lg" fw={600}>Bookings</Text>
          </Group>
        </Card.Section>
        <Card.Section p="md">
          <Text size="sm" c="dimmed">Loading bookings...</Text>
        </Card.Section>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder>
        <Card.Section p="md" withBorder>
          <Group gap="xs" align="center">
            <Calendar size={20} />
            <Text size="lg" fw={600}>Bookings</Text>
          </Group>
        </Card.Section>
        <Card.Section p="md">
          <Text size="sm" c="red">Error loading bookings</Text>
        </Card.Section>
      </Card>
    );
  }

  return (
    <>
      <Card withBorder>
        <Card.Section p="md" withBorder>
          <Group justify="space-between" align="center">
            <Group gap="xs" align="center">
              <Calendar size={20} />
              <Text size="lg" fw={600}>Bookings</Text>
              {bookings && bookings.length > 0 && (
                <Text size="sm" c="dimmed">({bookings.length})</Text>
              )}
            </Group>
          </Group>
        </Card.Section>

        <Card.Section p="md">
          {!bookings || bookings.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No bookings found for this lead.
            </Text>
          ) : (
            <Stack gap="md">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={handleEditBooking}
                  onCancel={handleCancelBooking}
                  isProcessing={cancelBooking.isPending}
                />
              ))}
            </Stack>
          )}
        </Card.Section>
      </Card>

      {selectedBooking && (
        <EditBookingModal
          booking={selectedBooking}
          opened={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}
    </>
  );
};

export default LeadBookingsSection;