import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // TODO: Implement toast display and auto-dismiss

  const showToast = useCallback((message, type = 'success') => {
    // TODO: Add toast to state and auto-remove after 3s
    console.log(`[Toast:${type}]`, message);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
    }),
    [toasts, showToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

export default ToastContext;
