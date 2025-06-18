
import {
  Select as MSelect,
  SelectProps as MSelectProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type SelectProps = MSelectProps & {
  /** Soccer Stars branding styles */
  soccer?: boolean;
  /** Loading state */
  loading?: boolean;
};

export const Select = forwardRef<HTMLInputElement, SelectProps>(
  ({ soccer, loading, ...props }, ref) => {
    return (
      <MSelect 
        ref={ref} 
        disabled={loading || props.disabled}
        data-soccer={soccer}
        {...props} 
      />
    );
  },
);
Select.displayName = "Select";

export type { SelectProps };
