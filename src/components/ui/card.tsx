
import { Card as MantineCard, CardProps } from '@mantine/core';
import { forwardRef } from 'react';

/** thin adapter for legacy booking pages */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return <MantineCard ref={ref} {...props} />;
  }
);

Card.displayName = 'Card';

// Create simple wrapper components for Card subcomponents
export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`p-6 ${className || ''}`} {...props} />;
  }
);

CardContent.displayName = 'CardContent';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className || ''}`} {...props} />;
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`} {...props} />;
  }
);

CardTitle.displayName = 'CardTitle';

export type { CardProps };
