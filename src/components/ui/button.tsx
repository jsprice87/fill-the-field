
import { Button as MantineButton } from '@mantine/core';
import { forwardRef } from 'react';

/* broaden the prop type so TS accepts custom keys like variant="ghost" */
export type ButtonProps = React.ComponentProps<typeof MantineButton> & {
  variant?: string;
  size?: string;
  className?: string;
  onClick?: (...args: any[]) => void;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  // spread everything so extra props land on the element
  <MantineButton ref={ref} {...props} />
));

/* keep legacy helper alive */
export const buttonVariants = () => '';
