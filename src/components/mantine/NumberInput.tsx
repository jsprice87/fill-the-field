
import { NumberInput as MantineNumberInput, NumberInputProps } from '@mantine/core';
import { forwardRef } from 'react';

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (props, ref) => {
    return <MantineNumberInput ref={ref} {...props} />;
  }
);

NumberInput.displayName = 'NumberInput';

export type { NumberInputProps };
