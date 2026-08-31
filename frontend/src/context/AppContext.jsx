import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadAppData, saveAppData } from '@/services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appData, setAppDataState] = useState(loadAppData);
  const [toast, setToast] = useState('');

  const setAppData = useCallback((updater) => {
    setAppDataState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveAppData(next);
      return next;
    });
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'meca_data_v2' && e.newValue) {
        try {
          setAppDataState(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ appData, setAppData, showToast, toast }),
    [appData, setAppData, showToast, toast],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
