import React, { useState, useEffect } from 'react';
import { Container, Stack, Title, Text, Group, Button } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { AppDatePicker } from '@/components/mantine/DatePicker';
import { LocationCard } from '@/components/booking/LocationCard';
import { InteractiveMap } from '@/components/booking/InteractiveMap';
import { useLocations } from '@/hooks/useLocations';
import { notify } from '@/utils/notify';

dayjs.extend(utc);
dayjs.extend(timezone);

const BookingLanding: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const initialDate = searchParams.get('date');
    if (initialDate) {
      setSelectedDate(dayjs(initialDate).toDate());
    }
  }, [searchParams]);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      searchParams.set('date', dayjs(date).format('YYYY-MM-DD'));
    } else {
      searchParams.delete('date');
    }
    setSearchParams(searchParams);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    open();
  };

  const handleContinue = () => {
    if (!selectedDate) {
      notify('error', 'Please select a date');
      return;
    }

    if (!selectedLocation) {
      notify('error', 'Please select a location');
      return;
    }

    navigate(`/${slug}/booking/classes?date=${dayjs(selectedDate).format('YYYY-MM-DD')}&location=${selectedLocation.id}`);
  };

  const { data: locations } = useLocations(); // Remove argument

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="xs">
          <Title order={2} align="center">
            Book a Class
          </Title>
          <Text c="dimmed" align="center">
            Select a date and location to find available classes.
          </Text>
        </Stack>

        {/* Date and Location Selection */}
        <Stack gap="md">
          <AppDatePicker
            label="Select a Date"
            placeholder="Pick a date"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={dayjs().startOf('day').toDate()}
          />

          {selectedLocation && (
            <LocationCard
              location={selectedLocation}
              onEdit={() => setSelectedLocation(null)}
              onClear={() => setSelectedLocation(null)}
            />
          )}
        </Stack>

        {/* Map and Continue Button */}
        <Stack gap="md">
          <InteractiveMap
            locations={locations || []}
            onLocationSelect={handleLocationSelect}
          />

          <Group position="center">
            <Button size="md" onClick={handleContinue} disabled={!selectedDate || !selectedLocation}>
              Continue to Classes
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
};

export default BookingLanding;
