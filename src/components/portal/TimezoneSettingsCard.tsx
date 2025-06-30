import React from 'react';
import { Card, Select, Text, Title } from '@mantine/core';
import { Clock } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
];

const TimezoneSettingsCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();

  const currentTimezone = settings?.timezone || 'America/New_York';

  const handleTimezoneChange = (value: string) => {
    updateSetting.mutate({
      key: 'timezone',
      value: value
    });
  };

  return (
    <Card>
      <Card.Section>
        <Card.Section className="flex items-center gap-2 p-4 border-b">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Timezone Settings</h3>
        </Card.Section>
      </Card.Section>
      <Card.Section className="space-y-4 p-4">
        <div className="space-y-2">
          <Text size="sm" fw={500}>Business Timezone</Text>
          <Select
            value={currentTimezone}
            onChange={handleTimezoneChange}
            disabled={updateSetting.isPending}
            placeholder="Select timezone"
            data={TIMEZONE_OPTIONS}
            withinPortal
          />
          <Text size="xs" c="dimmed">
            This timezone will be used for all class scheduling and booking operations.
          </Text>
        </div>

        <Card bg="blue.0" p="md">
          <Title order={4} c="blue.9" mb="xs">How it works:</Title>
          <Text size="sm" c="blue.8">
            • All class times will be displayed in this timezone<br/>
            • Booking dates will be calculated using this timezone<br/>
            • Changes affect how customers see available dates and times
          </Text>
        </Card>
      </Card.Section>
    </Card>
  );
};

export default TimezoneSettingsCard;
