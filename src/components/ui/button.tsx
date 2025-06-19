
import { Button as MantineButton, ButtonProps as MantineBtnProps } from '@mantine/core';
import { forwardRef } from 'react';

/* Re-export Mantine props so React.ComponentProps<typeof Button> resolves correctly */
export type ButtonProps = MantineBtnProps;

/* Wrap MantineButton to keep the old symbol name */
export const Button = forwardRef<HTMLButtonElement, MantineBtnProps>((props, ref) => (
  <MantineButton ref={ref} {...props} />
));

/* Keep legacy helper alive until import swap is done */
export const buttonVariants = (_?: Record<string, unknown>) => '';
