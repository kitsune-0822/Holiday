import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/global.css';
import { initBodyScrollbars } from '@/lib/scrollbars';
import { ToastProvider } from '@/components';
import { ShowcaseApp } from './ShowcaseApp';

initBodyScrollbars();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ShowcaseApp />
    </ToastProvider>
  </StrictMode>,
);
