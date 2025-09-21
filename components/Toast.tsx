import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

export function Toast({ id, message, type, duration = 3000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setIsVisible(true);

    // Set timer to dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for fade-out animation before removing from DOM
      setTimeout(() => onDismiss(id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, onDismiss]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50';
  const textColor = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const iconColor = isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div
      className={`flex items-start p-4 rounded-lg shadow-lg transition-all duration-300 ${bgColor} ${textColor} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`flex-shrink-0 ${iconColor}`}>
        {isSuccess ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
          }}
          className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}