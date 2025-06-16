
import { Button as MantineButton, ButtonProps } from '@mantine/core';
import { forwardRef } from 'react';

// Initial stub - re-exports Mantine Button with our theme
// TODO: Add variant mapping from shadcn to Mantine in Phase 2
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <MantineButton ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export type { ButtonProps };
