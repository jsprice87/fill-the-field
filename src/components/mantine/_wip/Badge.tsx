
import { Badge as MantineBadge, BadgeProps as MantineBadgeProps } from '@mantine/core';
import { forwardRef } from 'react';

const variantMap = {
  default: 'filled',
  secondary: 'light',
  destructive: 'filled',
  outline: 'outline'
} as const;

export interface BadgeProps extends Omit<MantineBadgeProps, 'variant'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', color, ...props }, ref) => {
    return (
      <MantineBadge
        ref={ref}
        variant={variantMap[variant]}
        color={variant === 'destructive' ? 'red' : color || 'brand'}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
