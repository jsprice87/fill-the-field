
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { updateFranchiseeSlugs } from './scripts/updateFranchiseeSlugs';

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
    <App />
  </React.StrictMode>
);
