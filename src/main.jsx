import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AppRoutes from './Routes.jsx';
import { SpeechRevealProvider } from './contexts/SpeechRevealContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SpeechRevealProvider>
        <AppRoutes />
      </SpeechRevealProvider>
    </BrowserRouter>
  </StrictMode>,
);
