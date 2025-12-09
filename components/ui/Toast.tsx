"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastIcons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/30",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/30",
    icon: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full ${styles.bg} ${styles.border}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration (default 5 seconds)
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
