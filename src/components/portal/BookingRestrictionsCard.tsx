import React, { useState, useEffect } from 'react';
import { Card, Stack, Group, Flex, Title, Text, Radio } from '@mantine/core';
import { Calendar, Clock, Target } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { TextInput } from '@/components/mantine/TextInput';

const BookingRestrictionsCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  const [restrictionType, setRestrictionType] = useState<'next_available' | 'max_days'>('max_days');
  const [maxDays, setMaxDays] = useState(7);

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      const type = settings.booking_restriction_type || 'max_days';
      const days = parseInt(settings.max_booking_days_ahead || '7');
      setRestrictionType(type as 'next_available' | 'max_days');
      setMaxDays(days);
    }
  }, [settings]);

  const handleRestrictionTypeChange = (value: string) => {
    const newType = value as 'next_available' | 'max_days';
    setRestrictionType(newType);
    updateSetting.mutate({
      key: 'booking_restriction_type',
      value: newType
    });
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 365) {
      setMaxDays(value);
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
            <Text fw={500} mb="sm">Choose how customers can book classes:</Text>
            <Radio.Group
              value={restrictionType}
              onChange={handleRestrictionTypeChange}
            >
              <Stack gap="md">
                <Radio
                  value="next_available"
                  label={
                    <Group gap="xs">
                      <Target size={16} />
                      <div>
                        <Text fw={500}>Next Available Only</Text>
                        <Text size="xs" c="dimmed">
                          Customers can only book the earliest available class for their location
                        </Text>
                      </div>
                    </Group>
                  }
                  disabled={updateSetting.isPending}
                />
                
                <Radio
                  value="max_days"
                  label={
                    <Group gap="xs">
                      <Clock size={16} />
                      <div>
                        <Text fw={500}>Maximum Number of Days Away</Text>
                        <Text size="xs" c="dimmed">
                          Customers can book any available class within a specified number of days
                        </Text>
                      </div>
                    </Group>
                  }
                  disabled={updateSetting.isPending}
                />
              </Stack>
            </Radio.Group>
          </div>

          {restrictionType === 'max_days' && (
            <div>
              <TextInput
                label="Maximum Days Ahead"
                type="number"
                min={1}
                max={365}
                value={maxDays.toString()}
                onChange={handleDaysChange}
                disabled={updateSetting.isPending}
                style={{ width: '128px' }}
                description="Number of days from today that customers can book classes (1-365 days)"
              />
            </div>
          )}

          <Card bg="blue.0" p="md">
            <Title order={4} c="blue.9" mb="xs">How it works:</Title>
            <Text size="sm" c="blue.8">
              {restrictionType === 'next_available' ? (
                <>
                  • Customers will only see the next available class for their location
                  <br />
                  • Automatically handles holiday gaps and scheduling breaks
                  <br />
                  • Ensures earliest possible booking for consistent scheduling
                  <br />
                  • Perfect for programs with limited capacity or sequential content
                </>
              ) : (
                <>
                  • Customers can book classes up to {maxDays} days from today
                  <br />
                  • All available dates within this range will be shown
                  <br />
                  • Provides flexibility for customers to choose preferred dates
                  <br />
                  • Class start/end dates and exception dates are always respected
                </>
              )}
            </Text>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default BookingRestrictionsCard;
