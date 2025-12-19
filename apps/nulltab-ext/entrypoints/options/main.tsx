import '#main.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { SettingsPage } from '#pages/SettingsPage/index.js';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Failed to get root element');

const queryClient = new QueryClient();

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
    </QueryClientProvider>
  </StrictMode>,
);
