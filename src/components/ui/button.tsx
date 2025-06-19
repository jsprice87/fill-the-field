
import { Button as MantineButton } from '@mantine/core';
import { forwardRef } from 'react';

/* accept any extras so TS stays quiet while we migrate */
export type ButtonProps = React.ComponentProps<typeof MantineButton> & {
  [key: string]: unknown;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((p, ref) => (
  <MantineButton ref={ref} {...(p as any)} />
));

export const buttonVariants = () => ''; // stub
