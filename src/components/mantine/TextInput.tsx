
import { TextInput as MantineTextInput, TextInputProps } from '@mantine/core';
import { forwardRef } from 'react';

export interface InputProps extends Omit<TextInputProps, 'error'> {
  soccer?: boolean;
  error?: boolean;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, soccer = false, error = false, loading = false, disabled, rightSection, ...props }, ref) => {
    
    // Handle soccer variant (preserve for /free-trial/ compatibility)
    if (soccer) {
      return (
        <div className="relative">
          <input
            ref={ref}
            className={`
              flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-base
              font-poppins focus:border-brand-navy focus:ring-0 focus-visible:ring-0
              disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-ui
              min-h-[44px] interactive-input
              ${error ? 'border-red-500 focus:border-red-500' : ''}
              ${loading ? 'pr-10' : ''}
              ${className || ''}
            `}
            disabled={loading || disabled}
            {...props}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
            </div>
          )}
        </div>
      );
    }

    return (
      <MantineTextInput
        ref={ref}
        error={error}
        disabled={disabled || loading}
        rightSection={loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
        ) : rightSection}
        className={className}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
