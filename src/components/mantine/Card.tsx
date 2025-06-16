
import { Card as MantineCard, CardProps } from '@mantine/core';
import { forwardRef } from 'react';

// Initial stub - re-exports Mantine Card with our theme
// TODO: Add CardHeader, CardContent, CardTitle mapping in Phase 2
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return <MantineCard ref={ref} {...props} />;
  }
);

Card.displayName = 'Card';

export type { CardProps };
