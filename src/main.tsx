
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import App from './App';
import './index.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { theme } from './mantine/theme';
import { updateFranchiseeSlugs } from './scripts/updateFranchiseeSlugs';

const queryClient = new QueryClient();

// Update existing franchisees with slugs if needed
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  // Only run in development mode to avoid production issues
  updateFranchiseeSlugs().catch(console.error);
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
        withCssVariables
        defaultColorScheme="light"
        theme={theme}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Notifications />
          <App />
        </ThemeProvider>
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
