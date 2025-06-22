import {
  DateInput as MantineDateInput,
  DateInputProps as MantineBaseProps,
} from '@mantine/dates';
import { forwardRef } from 'react';

export interface DateInputProps
  extends Omit<MantineBaseProps, 'value' | 'onChange'> {
  value: Date | null;
  onChange: (value: Date | null) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => <MantineDateInput ref={ref} {...(props as MantineBaseProps)} />
);

DateInput.displayName = 'DateInput';
