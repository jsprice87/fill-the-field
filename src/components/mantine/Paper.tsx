
import {
  Paper as MPaper,
  PaperProps as MPaperProps,
} from "@mantine/core";
import { forwardRef } from "react";

export type PaperProps = MPaperProps & {
  /** Enable interactive hover states */
  interactive?: boolean;
  /** Children content */
  children?: React.ReactNode;
};

export const Paper = forwardRef<HTMLDivElement, PaperProps>(
  ({ children, interactive, ...props }, ref) => {
    return (
      <MPaper 
        ref={ref} 
        {...props}
        style={{
          transition: interactive ? 'all 200ms cubic-bezier(0.4,0,0.2,1)' : undefined,
          cursor: interactive ? 'pointer' : undefined,
          ...props.style
        }}
      >
        {children}
      </MPaper>
    );
  },
);
Paper.displayName = "Paper";
