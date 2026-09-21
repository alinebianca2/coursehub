import { createContext, ReactNode, useCallback, useContext, useState } from "react";

export type ToastType = "error" | "success";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE_TOASTS = 2;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "error") => {
      setToasts((current) => {
        // Evita empilhar a mesma mensagem duas vezes seguidas (ex: efeito
        // do StrictMode disparando o mesmo evento em desenvolvimento).
        const lastToast = current[current.length - 1];
        if (lastToast && lastToast.message === message && lastToast.type === type) {
          return current;
        }

        const id = Date.now() + Math.random();
        setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);

        const next = [...current, { id, message, type }];
        // Mantém no máximo N toasts visíveis por vez, descartando os mais antigos.
        return next.slice(-MAX_VISIBLE_TOASTS);
      });
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): Pick<ToastContextValue, "showToast"> {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return { showToast: context.showToast };
}

export function useToastState(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastState deve ser usado dentro de um ToastProvider");
  }
  return context;
}
