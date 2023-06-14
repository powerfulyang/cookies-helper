import { queryClient } from '@/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
  const root = document.getElementById('options');
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <div>Options</div>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }
});

await browser.cookies.set({
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  name: 'test',
  url: 'http://localhost:8080',
  value: 'test',
});

const res = await browser.cookies.getAll({
  domain: 'localhost',
});
console.log(res);
