
import { Button as MantineButton, ButtonProps as MantineProps } from '@mantine/core';
import { forwardRef } from 'react';

/* export the real Mantine prop type so other files can do React.ComponentProps<typeof Button> */
export type { MantineProps as ButtonProps };

/* keep the old symbol name */
export const Button = forwardRef<HTMLButtonElement, MantineProps>((props, ref) => (
  <MantineButton ref={ref} {...props} />
));

/* stub for legacy helpers – accept any object so TS stops complaining */
export const buttonVariants = (_?: any) => '';
