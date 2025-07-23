
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, ColorSchemeScript, createTheme, MantineColorSchemeManager, localStorageColorSchemeManager } from '@mantine/core';
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

// Create a color scheme manager that uses localStorage with the correct key
const colorSchemeManager: MantineColorSchemeManager = localStorageColorSchemeManager({
  key: 'mantine-color-scheme',
});

// Update existing franchisees with slugs if needed
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  // Only run in development mode and with proper error handling
  updateFranchiseeSlugs().catch((error) => {
    console.warn('Failed to initialize franchisee slugs (this is normal for localhost development):', error.message);
    // Don't break the app if database is unavailable during local development
  });
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
      <MantineProvider
        theme={theme}
        defaultColorScheme="light"
        colorSchemeManager={colorSchemeManager}
      >
        <ModalsProvider>
          <Notifications />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
