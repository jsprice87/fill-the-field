
import { DateInput as MantineDateInput, DateInputProps as MantineDateInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

export type DateInputProps = MantineDateInputProps<Date | null>;

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => {
    return <MantineDateInput ref={ref} {...props} />;
  }
);

DateInput.displayName = 'DateInput';
