import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Toast from '@/components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg, durationMs = 3000) => {
    if (!msg) return;
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? '' : current));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast, toast: toastMessage }), [showToast, toastMessage]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastMessage && <Toast message={toastMessage} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {}, toast: '' };
  }
  return ctx;
}
