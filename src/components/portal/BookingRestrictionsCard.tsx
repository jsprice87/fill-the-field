import React from 'react';
import { Card, Stack, Group, Flex, Title, Text, NumberInput } from '@mantine/core';
import { Calendar, Clock } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { TextInput } from '@/components/mantine/TextInput';

const BookingRestrictionsCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  const maxBookingDaysAhead = parseInt(settings?.max_booking_days_ahead || '7');

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 365) {
      updateSetting.mutate({
        key: 'max_booking_days_ahead',
        value: value.toString()
      });
    }
  };

  return (
    <Card>
      <Card.Section withBorder>
        <Flex align="center" gap="sm" p="sm">
          <Calendar size={20} />
          <Title order={3}>Booking Restrictions</Title>
        </Flex>
      </Card.Section>
      <Card.Section p="sm">
        <Stack gap="lg">
          <div>
            <TextInput
              label={
                <Flex align="center" gap={8}>
                  <Clock size={16} />
                  <span>Maximum Days Ahead for Booking</span>
                </Flex>
              }
              type="number"
              min={1}
              max={365}
              value={maxBookingDaysAhead.toString()}
              onChange={(e) => handleDaysChange(e as any)}
              disabled={updateSetting.isPending}
              style={{ width: '128px' }}
              description="Maximum number of days from today that customers can book classes (1-365 days)"
            />
          </div>

          <Card bg="blue.0" p="md">
            <Title order={4} c="blue.9" mb="xs">How it works:</Title>
            <Text size="sm" c="blue.8">
              • Customers can book classes up to {maxBookingDaysAhead} days from today
              <br />
              • Only dates within this range and matching class schedules will be available
              <br />
              • Class start/end dates and exception dates are always respected
              <br />
              • Only dates matching the class day of the week are bookable
            </Text>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default BookingRestrictionsCard;
