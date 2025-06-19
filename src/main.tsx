
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { ColorSchemeProvider } from '@mantine/core';
import { useLocalStorage, useHotkeys } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import App from './App';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './styles/mantine-globals.css';
import { theme } from './mantine/theme';
import { updateFranchiseeSlugs } from './scripts/updateFranchiseeSlugs';

const queryClient = new QueryClient();

// Update existing franchisees with slugs if needed
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  // Only run in development mode to avoid production issues
  updateFranchiseeSlugs().catch(console.error);
}

function AppWithColorScheme() {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
  });

  const toggleColorScheme = (value?: 'light' | 'dark') =>
    setColorScheme(value ?? (colorScheme === 'light' ? 'dark' : 'light'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        withCssVariables
        theme={{ ...theme, colorScheme }}
      >
        <ModalsProvider>
          <Notifications />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="light" />
    <QueryClientProvider client={queryClient}>
      <AppWithColorScheme />
    </QueryClientProvider>
  </React.StrictMode>
);
