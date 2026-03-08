import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QueryProvider } from './providers/QueryProvider';
import './lib/i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);