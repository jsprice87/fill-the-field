import React, { useState, useEffect } from 'react';
import { Modal, Button, Stack, Group, Select, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useLocations } from '@/hooks/useLocations';
import { useClasses } from '@/hooks/useClasses';
import { useClassSchedules } from '@/hooks/useClassSchedules';
import { useUpdateBooking } from '@/hooks/useUpdateBooking';
import type { LeadBooking } from '@/hooks/useLeadBookings';

interface EditBookingModalProps {
  booking: LeadBooking;
  opened: boolean;
  onClose: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  booking,
  opened,
  onClose
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    booking.class_schedules.classes.locations.id
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(
    booking.class_schedules.classes.id
  );

  const { data: locations } = useLocations();
  const { data: classes } = useClasses();
  const { data: schedules } = useClassSchedules();
  const updateBooking = useUpdateBooking();

  const form = useForm({
    initialValues: {
      location_id: booking.class_schedules.classes.locations.id,
      class_id: booking.class_schedules.classes.id,
      class_schedule_id: booking.class_schedules.id,
    },
  });

  // Filter classes by selected location
  const filteredClasses = classes?.filter(
    (cls) => cls.location_id === selectedLocationId
  ) || [];

  // Filter schedules by selected class
  const filteredSchedules = schedules?.filter(
    (schedule) => schedule.class_id === selectedClassId && schedule.is_active
  ) || [];

  // Prepare dropdown options
  const locationOptions = locations?.map((location) => ({
    value: location.id,
    label: `${location.name} (${location.city}, ${location.state})`,
  })) || [];

  const classOptions = filteredClasses.map((cls) => ({
    value: cls.id,
    label: cls.class_name,
  }));

  const scheduleOptions = filteredSchedules.map((schedule) => {
    const startTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let label = `${startTime} - ${endTime}`;
    if (schedule.day_of_week !== null) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      label += ` (${days[schedule.day_of_week]}s)`;
    }
    if (schedule.date_start) {
      const startDate = new Date(schedule.date_start).toLocaleDateString();
      label += ` - Starts ${startDate}`;
    }

    return {
      value: schedule.id,
      label,
    };
  });

  // Handle location change
  const handleLocationChange = (locationId: string | null) => {
    if (locationId) {
      setSelectedLocationId(locationId);
      form.setFieldValue('location_id', locationId);
      
      // Reset class and schedule when location changes
      setSelectedClassId('');
      form.setFieldValue('class_id', '');
      form.setFieldValue('class_schedule_id', '');
    }
  };

  // Handle class change
  const handleClassChange = (classId: string | null) => {
    if (classId) {
      setSelectedClassId(classId);
      form.setFieldValue('class_id', classId);
      
      // Reset schedule when class changes
      form.setFieldValue('class_schedule_id', '');
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.class_schedule_id) {
      return;
    }

    try {
      await updateBooking.mutateAsync({
        bookingId: booking.id,
        class_schedule_id: values.class_schedule_id,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Booking"
      size="md"
      withinPortal={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">Current Booking:</Text>
            <Text size="sm" c="dimmed">
              {booking.class_schedules.classes.class_name} at {booking.class_schedules.classes.locations.name}
            </Text>
          </div>

          <Select
            label="Location"
            placeholder="Select a location"
            data={locationOptions}
            value={selectedLocationId}
            onChange={handleLocationChange}
            required
            searchable
            comboboxProps={{ withinPortal: false }}
          />

          <Select
            label="Class"
            placeholder="Select a class"
            data={classOptions}
            value={selectedClassId}
            onChange={handleClassChange}
            disabled={!selectedLocationId}
            required
            searchable
            comboboxProps={{ withinPortal: false }}
          />

          <Select
            label="Schedule"
            placeholder="Select a schedule"
            data={scheduleOptions}
            {...form.getInputProps('class_schedule_id')}
            disabled={!selectedClassId}
            required
            comboboxProps={{ withinPortal: false }}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={updateBooking.isPending}
              disabled={!form.values.class_schedule_id}
            >
              Update Booking
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditBookingModal;