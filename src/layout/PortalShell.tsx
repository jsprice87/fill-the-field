
import React from 'react';
import { AppShell, Box, useMantineTheme } from '@mantine/core';

interface PortalShellProps {
  children: React.ReactNode;
  navbar?: React.ReactNode;
}

export const PortalShell: React.FC<PortalShellProps> = ({ children, navbar }) => {
  const theme = useMantineTheme();

  return (
    <AppShell
      navbar={{
        width: { base: 72, lg: 240 },
        breakpoint: 'lg',
      }}
      padding="md"
      styles={{
        main: {
          paddingLeft: 0,
          [`@media (min-width: ${theme.breakpoints.sm})`]: {
            paddingLeft: 0,
          },
        },
      }}
    >
      {navbar && (
        <AppShell.Navbar>
          {navbar}
        </AppShell.Navbar>
      )}
      <AppShell.Main>
        <Box h="100vh" style={{ overflow: 'hidden' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
};
