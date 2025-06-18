
import { DatePickerInput, DatePickerInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

export type AppDatePickerProps = Omit<DatePickerInputProps, 'allowFreeInput'>;

export const AppDatePicker = forwardRef<HTMLButtonElement, AppDatePickerProps>(
  (props, ref) => {
    return (
      <DatePickerInput
        ref={ref}
        maxDate={new Date()}
        popoverProps={{ withinPortal: true }}
        allowFreeInput={false}
        {...props}
      />
    );
  }
);

AppDatePicker.displayName = 'AppDatePicker';
