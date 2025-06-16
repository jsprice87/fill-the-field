
import { Textarea as MantineTextarea, TextareaProps } from '@mantine/core';
import { forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    return <MantineTextarea ref={ref} {...props} />;
  }
);

Textarea.displayName = 'Textarea';

export type { TextareaProps };
