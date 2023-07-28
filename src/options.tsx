import { CookieShow } from '@/components/CookieShow';
import { queryClient } from '@/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';
import './app.scss';
import { StrictMode } from 'react';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  const root = document.getElementById('options');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <CookieShow />
        </QueryClientProvider>
      </StrictMode>,
    );
  }
});
