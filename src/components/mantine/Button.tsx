
import { Button as MantineButton, ActionIcon, ButtonProps as MantineButtonProps, ActionIconProps } from '@mantine/core';
import { forwardRef } from 'react';
import { Slot } from "@radix-ui/react-slot";

// Map shadcn variants to Mantine variants
const variantMap = {
  default: 'filled',
  destructive: 'filled',
  outline: 'outline',
  secondary: 'light',
  ghost: 'subtle',
  link: 'subtle'
} as const;

const sizeMap = {
  default: 'md',
  sm: 'sm',
  lg: 'lg',
  icon: 'md'
} as const;

export interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'soccer_primary' | 'soccer_secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'soccer';
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, loading = false, children, disabled, color, ...props }, ref) => {
    
    // Handle icon size separately
    if (size === 'icon') {
      return (
        <ActionIcon
          ref={ref}
          variant={variantMap[variant] || 'filled'}
          size={sizeMap[size]}
          color={variant === 'destructive' ? 'red' : color || 'brand'}
          disabled={disabled || loading}
          loading={loading}
          className={className}
          {...(props as ActionIconProps)}
        >
          {children}
        </ActionIcon>
      );
    }

    // Handle soccer variants (preserve for /free-trial/ compatibility)
    if (variant === 'soccer_primary' || variant === 'soccer_secondary') {
      const Comp = asChild ? Slot : "button";
      return (
        <Comp
          ref={ref}
          className={`
            ${variant === 'soccer_primary' 
              ? 'bg-brand-red text-white hover:bg-brand-blue' 
              : 'bg-transparent border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
            }
            ${size === 'soccer' ? 'h-12 px-6 py-3 text-base' : 'h-10 px-4 py-2'}
            font-poppins font-medium hover:shadow-lg transition-all duration-200 ease-ui rounded-md
            ${className || ''}
          `}
          disabled={disabled || loading}
          {...props}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          )}
          {children}
        </Comp>
      );
    }

    const Comp = asChild ? Slot : MantineButton;
    
    return (
      <Comp
        ref={ref}
        variant={variantMap[variant] || 'filled'}
        size={sizeMap[size] || 'md'}
        color={variant === 'destructive' ? 'red' : color || 'brand'}
        disabled={disabled || loading}
        loading={loading}
        className={className}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export type { ButtonProps };
