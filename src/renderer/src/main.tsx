import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ToastProvider } from './components/ui/Toast';
import './styles/global.css';
import './styles/components.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
}
