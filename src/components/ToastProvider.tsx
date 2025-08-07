import { createContext, useCallback, useState } from "react";
import Toast from "./Toast";
import type { ReactNode } from "react";

interface ToastOptions {
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

let toastId = 0;

interface ToastInstance {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = ++toastId;
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type: options?.type || "info",
        duration: options?.duration || 3000,
      },
    ]);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed z-50 top-6 right-6 flex flex-col gap-3 items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export { ToastProvider, ToastContext };
