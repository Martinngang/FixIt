import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastProps, ToastType, ToastAction } from './Toast.tsx';

interface ToastContextType {
  addToast: (message: string, type: ToastType, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onDismiss'>[]>([]);

  const addToast = useCallback((message: string, type: ToastType, action?: ToastAction) => {
    const id = crypto.randomUUID();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, action }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              action={toast.action}
              onDismiss={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}