
import React from 'react';
import { DateInput, DateInputProps } from '@mantine/dates';

export interface DateInputISOProps extends Omit<DateInputProps, 'value' | 'onChange'> {
  value: string | null;
  onChange: (value: string | null) => void;
}

export const DateInputISO: React.FC<DateInputISOProps> = ({ value, onChange, ...props }) => {
  const dateValue = value ? new Date(value) : null;
  
  const handleChange = (date: Date | null) => {
    onChange(date ? date.toISOString() : null);
  };

  return (
    <DateInput
      {...props}
      value={dateValue}
      onChange={handleChange}
    />
  );
};
