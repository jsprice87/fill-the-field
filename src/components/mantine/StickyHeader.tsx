
import React from 'react';
import { Box } from '@mantine/core';

interface StickyHeaderProps {
  children: React.ReactNode;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({ children }) => {
  return (
    <Box
      pos="sticky"
      top={0}
      style={{
        zIndex: 30,
        backgroundColor: 'var(--mantine-color-body)',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
      px="md"
      py="sm"
      className="drop-shadow-sm"
    >
      {children}
    </Box>
  );
};
