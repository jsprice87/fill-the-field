
import { Title, Text, Code, TitleProps, TextProps, CodeProps } from '@mantine/core';
import { forwardRef } from 'react';

// Heading Components
export const H1 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={1} size="30px" lh="36px" fw={600} {...props} />
  )
);
H1.displayName = 'H1';

export const H2 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={2} size="24px" lh="32px" fw={600} {...props} />
  )
);
H2.displayName = 'H2';

export const H3 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={3} size="20px" lh="28px" fw={600} {...props} />
  )
);
H3.displayName = 'H3';

export const H4 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={4} size="18px" lh="26px" fw={600} {...props} />
  )
);
H4.displayName = 'H4';

export const H5 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={5} size="16px" lh="24px" fw={600} {...props} />
  )
);
H5.displayName = 'H5';

export const H6 = forwardRef<HTMLHeadingElement, TitleProps>(
  (props, ref) => (
    <Title ref={ref} order={6} size="14px" lh="20px" fw={600} {...props} />
  )
);
H6.displayName = 'H6';

// Body Text Components
export const BodyLg = forwardRef<HTMLParagraphElement, TextProps>(
  (props, ref) => (
    <Text ref={ref} size="16px" lh="24px" fw={400} {...props} />
  )
);
BodyLg.displayName = 'BodyLg';

export const BodySm = forwardRef<HTMLParagraphElement, TextProps>(
  (props, ref) => (
    <Text ref={ref} size="14px" lh="20px" fw={400} {...props} />
  )
);
BodySm.displayName = 'BodySm';

// Code Component
export const CodeText = forwardRef<HTMLElement, CodeProps>(
  (props, ref) => (
    <Code ref={ref} fz="13px" lh="20px" fw={500} {...props} />
  )
);
CodeText.displayName = 'CodeText';

// Export types
export type { TitleProps as HeadingProps, TextProps as BodyProps, CodeProps as CodeTextProps };
