
import React from 'react';
import { Text, Select, Stack } from '@mantine/core';

interface GlobalDayPickerProps {
  selectedDay: number;
  onDayChange: (day: number) => void;
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

const GlobalDayPicker: React.FC<GlobalDayPickerProps> = ({
  selectedDay,
  onDayChange,
}) => {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Default Day of Week
      </Text>
      <Select
        value={selectedDay.toString()}
        onChange={(value) => value && onDayChange(parseInt(value))}
        placeholder="Select day of week"
        data={DAYS_OF_WEEK.map((day) => ({
          value: day.value.toString(),
          label: day.label
        }))}
        w={256}
      />
      <Text size="xs" c="dimmed">
        This day will be pre-filled for new rows (can be changed per row)
      </Text>
    </Stack>
  );
};

export default GlobalDayPicker;
