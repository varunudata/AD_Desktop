import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ marginLeft: 'auto', color: 'inherit', opacity: 0.8 }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
