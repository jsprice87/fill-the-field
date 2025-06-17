
import {
  Button as MButton,
  ButtonProps as MButtonProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type ButtonProps = MButtonProps & 
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Soccer Stars branding variant */
  variant?: MButtonProps['variant'] | 'soccer_primary' | 'soccer_secondary';
  /** Soccer Stars branding size */
  size?: MButtonProps['size'] | 'soccer';
  /** Loading state */
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant, size, loading, ...props }, ref) => {
    // Handle Soccer Stars custom variants
    const mantineVariant = variant === 'soccer_primary' || variant === 'soccer_secondary' 
      ? 'filled' 
      : variant;
    
    const mantineSize = size === 'soccer' ? 'md' : size;

    // Separate Mantine props from DOM props
    const { 
      onClick, onSubmit, onFocus, onBlur, disabled, className, style,
      ...mantineProps 
    } = props;

    return (
      <MButton 
        ref={ref} 
        variant={mantineVariant}
        size={mantineSize}
        loading={loading}
        onClick={onClick}
        onSubmit={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        className={className}
        style={style}
        data-variant={variant}
        data-size={size}
        {...mantineProps}
      >
        {children}
      </MButton>
    );
  },
);
Button.displayName = "Button";
