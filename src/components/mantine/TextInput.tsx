
import {
  TextInput as MTextInput,
  TextInputProps as MTextInputProps,
} from "@mantine/core";
import { forwardRef } from "react";

export const TextInput = forwardRef<HTMLInputElement, MTextInputProps>(
  (props, ref) => <MTextInput ref={ref} {...props} />,
);
TextInput.displayName = "TextInput";

// Export with Input alias for compatibility
export { TextInput as Input };
export type { MTextInputProps as InputProps };
