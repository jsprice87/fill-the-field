
import { Button as MantineButton, ButtonProps as MantineButtonProps } from '@mantine/core';
import * as React from 'react';

/* temporary shims so existing code compiles */
export type ButtonProps = MantineButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'soccer_primary' | 'soccer_secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'soccer';
};

/* accept any keys while we migrate */
type AnyProps = Record<string, unknown>;
export const buttonVariants = (_?: AnyProps) => '';

export { MantineButton as Button };
