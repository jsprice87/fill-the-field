
import React from 'react';
import { Card, Stack, Group, Text, Checkbox } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import LocationSelector from './LocationSelector';
import MultiDatePicker from './MultiDatePicker';
import { useFranchiseeData } from '@/hooks/useFranchiseeData';

export interface ProgramData {
  locationId: string;
  daysOfWeek: number[];
  dateStart: Date | null;
  dateEnd: Date | null;
  overrideDates: string[];
}

interface ProgramDetailsCardProps {
  data: ProgramData;
  onChange: (data: ProgramData) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const ProgramDetailsCard: React.FC<ProgramDetailsCardProps> = ({ data, onChange }) => {
  const { data: franchiseeData } = useFranchiseeData();

  const handleLocationChange = (locationId: string) => {
    onChange({ ...data, locationId });
  };

  const handleDayToggle = (dayValue: number) => {
    const newDays = data.daysOfWeek.includes(dayValue)
      ? data.daysOfWeek.filter(d => d !== dayValue)
      : [...data.daysOfWeek, dayValue].sort();
    onChange({ ...data, daysOfWeek: newDays });
  };

  const handleDateStartChange = (date: Date | null) => {
    onChange({ ...data, dateStart: date });
  };

  const handleDateEndChange = (date: Date | null) => {
    onChange({ ...data, dateEnd: date });
  };

  const handleOverrideDatesChange = (dates: string[]) => {
    onChange({ ...data, overrideDates: dates });
  };

  return (
    <Card withBorder>
      <Card.Section withBorder inheritPadding py="sm">
        <Text fw={500} size="lg">Program Details</Text>
        <Text size="sm" c="dimmed">
          Shared settings for all classes in this program
        </Text>
      </Card.Section>

      <Stack gap="md" mt="md">
        <LocationSelector
          franchiseeId={franchiseeData?.id || null}
          selectedLocationId={data.locationId}
          onLocationChange={handleLocationChange}
        />

        <div>
          <Text fw={500} size="sm" mb="xs">
            Days of Week <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
          </Text>
          <Group gap="xs">
            {DAYS_OF_WEEK.map((day) => (
              <Checkbox
                key={day.value}
                label={day.label}
                checked={data.daysOfWeek.includes(day.value)}
                onChange={() => handleDayToggle(day.value)}
              />
            ))}
          </Group>
        </div>

        <Group grow>
          <DatePickerInput
            label="Program Start Date"
            placeholder="Select start date"
            value={data.dateStart}
            onChange={handleDateStartChange}
            clearable
          />
          <DatePickerInput
            label="Program End Date"
            placeholder="Select end date"
            value={data.dateEnd}
            onChange={handleDateEndChange}
            clearable
            minDate={data.dateStart || undefined}
          />
        </Group>

        <div>
          <Text fw={500} size="sm" mb="xs">Override Dates (Optional)</Text>
          <MultiDatePicker
            selectedDates={data.overrideDates}
            onDatesChange={handleOverrideDatesChange}
          />
        </div>
      </Stack>
    </Card>
  );
};

export default ProgramDetailsCard;
