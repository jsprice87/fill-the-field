import { forwardRef } from 'react';
import { DateInput, DateInputProps } from '@mantine/dates';

// ── props: keep external API string-based ────────────────────────────
interface DateInputISOProps
  extends Omit<DateInputProps, 'value' | 'onChange'> {
  /** ISO string (e.g. '2025-06-18T00:00:00.000Z') or null/'' */
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export const DateInputISO = forwardRef<HTMLInputElement, DateInputISOProps>(
  ({ value, onChange, ...props }, ref) => {
    // convert incoming ISO-string to Date | null for Mantine
    const dateValue = value ? new Date(value) : null;

    // convert Mantine’s Date | null back to ISO-string for the form
    const handleChange = (d: Date | null) => {
      onChange?.(d ? d.toISOString() : null);
    };

    return (
      <DateInput
        ref={ref}
        {...props}
        value={dateValue}
        onChange={handleChange}      // ✅ correct signature
        clearable
      />
    );
  }
);
DateInputISO.displayName = 'DateInputISO';
