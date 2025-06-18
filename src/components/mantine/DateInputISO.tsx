
import React, { forwardRef } from 'react';
import { DateInput, DateInputProps } from '@mantine/dates';

export interface DateInputISOProps extends Omit<DateInputProps, 'value' | 'onChange'> {
  /** ISO-8601 string or null */
  value?: string | null;
  onChange?: (iso: string | null) => void;
}

export const DateInputISO = forwardRef<HTMLInputElement, DateInputISOProps>(
  ({ value, onChange, ...rest }, ref) => {
    const dateValue = value ? new Date(value) : null;

    const handleChange = (date: Date | null) => {
      onChange?.(date ? date.toISOString() : null);
    };

    return (
      <DateInput
        ref={ref}
        value={dateValue}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);

DateInputISO.displayName = 'DateInputISO';
