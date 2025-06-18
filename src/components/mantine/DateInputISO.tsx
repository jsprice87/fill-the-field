
import { DateInput, DateInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

interface DateInputISOProps extends Omit<DateInputProps, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

export const DateInputISO = forwardRef<HTMLInputElement, DateInputISOProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <DateInput
        ref={ref}
        {...props}
        value={value ? new Date(value) : null}
        onChange={(d: Date | null) => onChange?.(d ? d.toISOString() : '')}
      />
    );
  }
);

DateInputISO.displayName = 'DateInputISO';

export type { DateInputISOProps };
