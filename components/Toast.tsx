import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

const TYPE_STYLES: Record<ToastType, { icon: typeof CheckCircle; textClass: string; barClass: string }> = {
  success: { icon: CheckCircle, textClass: 'text-success', barClass: 'bg-success' },
  error: { icon: AlertCircle, textClass: 'text-destructive', barClass: 'bg-destructive' },
  info: { icon: Info, textClass: 'text-info', barClass: 'bg-info' },
};

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: ToastAction;
  onDismiss: (id: string) => void;
}

export function Toast({ id, message, type, duration = 3000, action, onDismiss }: ToastProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, paused, onDismiss]);

  const { icon: Icon, textClass, barClass } = TYPE_STYLES[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="glass-card relative flex items-start gap-3 p-4 rounded-xl shadow-xl overflow-hidden"
    >
      <div className={`shrink-0 ${textClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-1 text-sm font-medium text-primary hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${barClass}`}
        initial={{ width: '100%' }}
        animate={{ width: paused ? undefined : '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}
