
import { DateInput, DateInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

interface DateInputISOProps extends Omit<DateInputProps, 'value' | 'onChange'> {
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export const DateInputISO = forwardRef<HTMLInputElement, DateInputISOProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleDateChange = (d: Date | null) => {
      onChange?.(d ? d.toISOString() : null);
    };

    return (
      <DateInput
        ref={ref}
        {...props}
        value={value ? new Date(value) : null}
        onChange={handleDateChange}
      />
    );
  }
);

DateInputISO.displayName = 'DateInputISO';

export type { DateInputISOProps };
