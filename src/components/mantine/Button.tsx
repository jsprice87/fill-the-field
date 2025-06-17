
import {
  Button as MButton,
  ButtonProps as MButtonProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type ButtonProps = MButtonProps & {
  /** Soccer Stars branding variant */
  variant?: MButtonProps['variant'] | 'soccer_primary' | 'soccer_secondary';
  /** Soccer Stars branding size */
  size?: MButtonProps['size'] | 'soccer';
  /** Loading state */
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, loading, ...mProps }, ref) => {
    // Handle Soccer Stars custom variants
    const mantineVariant = variant === 'soccer_primary' || variant === 'soccer_secondary' 
      ? 'filled' 
      : variant;
    
    const mantineSize = size === 'soccer' ? 'md' : size;

    return (
      <MButton 
        ref={ref} 
        variant={mantineVariant}
        size={mantineSize}
        loading={loading}
        data-variant={variant}
        data-size={size}
        {...mProps}
      >
        {children}
      </MButton>
    );
  },
);
Button.displayName = "Button";
