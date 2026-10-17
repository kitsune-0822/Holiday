import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/global.css';
import { initBodyScrollbars } from '@/lib/scrollbars';
import { App } from './App';

initBodyScrollbars();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
