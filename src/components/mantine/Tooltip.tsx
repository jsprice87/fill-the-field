
import React from 'react';
import { Tooltip as MantineTooltip, TooltipProps } from '@mantine/core';

interface TooltipWrapperProps extends TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipWrapperProps> = ({
  transitionProps = { duration: 150, transition: 'fade' },
  position = 'top',
  withArrow = true,
  radius = 'md',
  children,
  ...props
}) => {
  return (
    <MantineTooltip
      transitionProps={transitionProps}
      position={position}
      withArrow={withArrow}
      radius={radius}
      {...props}
    >
      {children}
    </MantineTooltip>
  );
};
