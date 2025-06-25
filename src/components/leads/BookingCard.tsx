import React from 'react';
import { Card, Text, Group, Stack, Button, Badge } from '@mantine/core';
import { Calendar, MapPin, User, Clock, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import type { LeadBooking } from '@/hooks/useLeadBookings';

interface BookingCardProps {
  booking: LeadBooking;
  onEdit: (booking: LeadBooking) => void;
  onCancel: (bookingId: string) => void;
  isProcessing?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onEdit, 
  onCancel, 
  isProcessing = false 
}) => {
  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d, yyyy');
  };

  const getBookingStatus = () => {
    if (booking.cancellation_reason) return 'canceled';
    if (booking.archived_at) return 'archived';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'canceled': return 'red';
      case 'archived': return 'gray';
      default: return 'blue';
    }
  };

  const bookingStatus = getBookingStatus();

  return (
    <Card withBorder>
      <Card.Section p="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="xs" align="center" mb="xs">
              <Calendar size={16} />
              <Text fw={600} size="sm">
                {booking.class_schedules.classes.class_name}
              </Text>
              <Badge color={getStatusColor(bookingStatus)} variant="light" size="sm">
                {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
              </Badge>
            </Group>
            
            <Stack gap="xs">
              <Group gap="xs" align="center">
                <MapPin size={14} />
                <Text size="sm" c="dimmed">
                  {booking.class_schedules.classes.locations.name}
                </Text>
                <Text size="sm" c="dimmed">
                  • {booking.class_schedules.classes.locations.city}, {booking.class_schedules.classes.locations.state}
                </Text>
              </Group>

              <Group gap="xs" align="center">
                <Clock size={14} />
                <Text size="sm" c="dimmed">
                  {formatTime(booking.class_schedules.start_time)} - {formatTime(booking.class_schedules.end_time)}
                </Text>
                {booking.class_schedules.date_start && (
                  <Text size="sm" c="dimmed">
                    • Starting {formatDate(booking.class_schedules.date_start)}
                  </Text>
                )}
              </Group>
            </Stack>
          </div>

          {bookingStatus === 'active' && (
            <Group gap="xs">
              <Button
                variant="outline"
                size="xs"
                leftSection={<Edit size={14} />}
                onClick={() => onEdit(booking)}
                disabled={isProcessing}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                color="red"
                size="xs"
                leftSection={<X size={14} />}
                onClick={() => onCancel(booking.id)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </Group>
          )}
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <Stack gap="sm">
          {booking.appointments && booking.appointments.length > 0 && (
            <div>
              <Text size="sm" fw={500} mb="xs">Participants:</Text>
              {booking.appointments.map((appointment) => (
                <Group key={appointment.id} gap="xs" align="center">
                  <User size={14} />
                  <Text size="sm">
                    {appointment.participant_name} (Age {appointment.participant_age})
                  </Text>
                </Group>
              ))}
            </div>
          )}

          {booking.parent_first_name && booking.parent_last_name && (
            <Group gap="xs" align="center">
              <User size={14} />
              <Text size="sm" c="dimmed">
                Parent: {booking.parent_first_name} {booking.parent_last_name}
              </Text>
            </Group>
          )}

          {booking.cancellation_reason && (
            <div>
              <Text size="sm" fw={500} c="red" mb="xs">Cancellation Reason:</Text>
              <Text size="sm" c="dimmed">{booking.cancellation_reason}</Text>
            </div>
          )}

          <Group gap="xs" align="center">
            <Calendar size={14} />
            <Text size="xs" c="dimmed">
              Booked {formatDate(booking.created_at)}
            </Text>
          </Group>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default BookingCard;