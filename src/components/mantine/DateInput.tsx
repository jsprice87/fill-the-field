
import { DateInput as MantineDateInput, DateInputProps } from '@mantine/dates';
import { forwardRef } from 'react';

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => {
    return <MantineDateInput ref={ref} {...props} />;
  }
);

DateInput.displayName = 'DateInput';

export type { DateInputProps };
