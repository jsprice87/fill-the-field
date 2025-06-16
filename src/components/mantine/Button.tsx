
import {
  Button as MButton,
  ButtonProps as MButtonProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type ButtonProps = MButtonProps & {
  /** put extra app-specific props here later */
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...mProps }, ref) => <MButton ref={ref} {...mProps}>{children}</MButton>,
);
Button.displayName = "Button";
