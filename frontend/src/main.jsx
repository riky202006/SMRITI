import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CaretakerProvider } from './context/CaretakerContext';
import { registerServiceWorker } from './services/pushNotifications';
import './styles/globals.css';

// Initialize Service Worker for Web Push & PWA
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CaretakerProvider>
            <App />
          </CaretakerProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
