
import {
  TextInput as MTextInput,
  TextInputProps as MTextInputProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type TextInputProps = MTextInputProps & {
  /** Soccer Stars branding styles */
  soccer?: boolean;
  /** Error state */
  error?: boolean;
  /** Loading state */
  loading?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ soccer, error, loading, ...props }, ref) => {
    return (
      <MTextInput 
        ref={ref} 
        error={error}
        disabled={loading || props.disabled}
        data-soccer={soccer}
        data-error={error}
        {...props} 
      />
    );
  },
);
TextInput.displayName = "TextInput";

// Export with Input alias for compatibility
export { TextInput as Input };
export type { TextInputProps as InputProps };
