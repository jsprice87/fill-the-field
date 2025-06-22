
import {
  DateInput as MantineDateInput,
  DateInputProps as MantineGenericProps,
} from '@mantine/dates';
import { forwardRef } from 'react';

type MantineDateProps = MantineGenericProps<Date | null>;

export interface DateInputProps
  extends Omit<MantineDateProps, 'value' | 'onChange'> {
  value: Date | null;
  onChange: (value: Date | null) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (props, ref) => (
    <MantineDateInput
      ref={ref}
      {...(props as unknown as MantineDateProps)}
    />
  )
);

DateInput.displayName = 'DateInput';
