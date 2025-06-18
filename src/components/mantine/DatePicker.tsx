
import { DatePickerInput, DatePickerInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

export type AppDatePickerProps = DatePickerInputProps;

export const AppDatePicker = forwardRef<HTMLButtonElement, AppDatePickerProps>(
  (props, ref) => {
    return (
      <DatePickerInput
        ref={ref}
        maxDate={new Date()}
        popoverProps={{ withinPortal: true }}
        {...props}
      />
    );
  }
);

AppDatePicker.displayName = 'AppDatePicker';
