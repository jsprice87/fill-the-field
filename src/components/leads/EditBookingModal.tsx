import React, { useState, useEffect } from 'react';
import { Button, Stack, Group, Select, Text, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Modal } from '@/components/mantine/Modal';
import { useParams } from 'react-router-dom';
import { useLocations } from '@/hooks/useLocations';
import { useClasses } from '@/hooks/useClasses';
import { useClassSchedules } from '@/hooks/useClassSchedules';
import { useUpdateBooking } from '@/hooks/useUpdateBooking';
import { useFranchiseeBySlug } from '@/hooks/useFranchiseeBySlug';
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
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const { data: franchisee } = useFranchiseeBySlug(franchiseeSlug || '');
  
  const { data: locations, isLoading: locationsLoading } = useLocations(franchisee?.id);
  const { data: classes, isLoading: classesLoading } = useClasses(franchisee?.id);
  const { data: schedules, isLoading: schedulesLoading } = useClassSchedules(franchisee?.id);
  const updateBooking = useUpdateBooking();

  const form = useForm({
    initialValues: {
      location_id: '',
      class_id: '',
      booking_date: '',
    },
  });

  // Reset form when booking changes or modal opens
  useEffect(() => {
    if (opened && booking) {
      form.setValues({
        location_id: booking.class_schedules.classes.locations.id,
        class_id: booking.class_schedules.classes.id,
        booking_date: booking.class_schedules.id, // Will be updated to use actual booking date
      });
    }
  }, [opened, booking]);

  // Filter classes by selected location
  const filteredClasses = classes?.filter(
    (cls) => cls.location_id === form.values.location_id
  ) || [];

  // Filter schedules by selected class
  const filteredSchedules = schedules?.filter(
    (schedule) => schedule.class_id === form.values.class_id && schedule.is_active
  ) || [];

  // Generate available booking dates for the selected class
  const generateBookingDates = (schedule: any) => {
    const dates = [];
    const startDate = schedule.date_start ? new Date(schedule.date_start) : new Date();
    const endDate = schedule.date_end ? new Date(schedule.date_end) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    const dayOfWeek = schedule.day_of_week;

    // Find the first occurrence of the target day
    let currentDate = new Date(startDate);
    while (currentDate.getDay() !== dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate all dates for this day of week until end date
    while (currentDate <= endDate && dates.length < 52) { // Limit to 52 weeks
      if (currentDate >= new Date()) { // Only future dates
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 7); // Next week
    }

    return dates;
  };

  // Generate date options for all filtered schedules
  const dateOptions = filteredSchedules.flatMap((schedule) => {
    const dates = generateBookingDates(schedule);
    return dates.map((date) => {
      const startTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        value: `${schedule.id}_${date.toISOString().split('T')[0]}`, // schedule_id + date
        label: `${formattedDate} at ${startTime}`,
        scheduleId: schedule.id,
        date: date.toISOString().split('T')[0]
      };
    });
  });

  // Prepare dropdown options
  const locationOptions = locations?.map((location) => ({
    value: location.id,
    label: `${location.name} (${location.city}, ${location.state})`,
  })) || [];

  const classOptions = filteredClasses.map((cls) => ({
    value: cls.id,
    label: cls.class_name,
  }));

  // Handle location change
  const handleLocationChange = (locationId: string | null) => {
    if (locationId) {
      form.setFieldValue('location_id', locationId);
      
      // Reset class and booking date when location changes
      form.setFieldValue('class_id', '');
      form.setFieldValue('booking_date', '');
    }
  };

  // Handle class change
  const handleClassChange = (classId: string | null) => {
    if (classId) {
      form.setFieldValue('class_id', classId);
      
      // Reset booking date when class changes
      form.setFieldValue('booking_date', '');
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.booking_date) {
      return;
    }

    try {
      // Extract schedule ID from the booking_date value (format: "schedule_id_date")
      const [scheduleId] = values.booking_date.split('_');
      
      await updateBooking.mutateAsync({
        bookingId: booking.id,
        class_schedule_id: scheduleId,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const isLoading = locationsLoading || classesLoading || schedulesLoading;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Booking"
      size="md"
    >
      {isLoading ? (
        <Stack align="center" p="lg">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Loading booking data...</Text>
        </Stack>
      ) : (
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
              {...form.getInputProps('location_id')}
              onChange={handleLocationChange}
              required
              searchable={false}
              clearable={false}
              comboboxProps={{
                withinPortal: false,
                zIndex: 300
              }}
            />

            <Select
              label="Class"
              placeholder="Select a class"
              data={classOptions}
              {...form.getInputProps('class_id')}
              onChange={handleClassChange}
              disabled={!form.values.location_id}
              required
              searchable={false}
              clearable={false}
              comboboxProps={{
                withinPortal: false,
                zIndex: 300
              }}
            />

            <Select
              label="Booking Date"
              placeholder="Select a booking date"
              data={dateOptions}
              {...form.getInputProps('booking_date')}
              disabled={!form.values.class_id}
              required
              searchable={false}
              clearable={false}
              comboboxProps={{
                withinPortal: false,
                zIndex: 300
              }}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={updateBooking.isPending}
                disabled={!form.values.booking_date}
              >
                Update Booking
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};

export default EditBookingModal;