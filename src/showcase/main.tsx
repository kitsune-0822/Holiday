import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/global.css';
import { initBodyScrollbars } from '@/lib/scrollbars';
import { ShowcaseApp } from './ShowcaseApp';

initBodyScrollbars();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShowcaseApp />
  </StrictMode>,
);
