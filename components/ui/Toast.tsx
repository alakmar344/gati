'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'loading';

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (opts: {
    title: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
  }) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'success', duration = 3800 }) => {
      const id = counter++;
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
      if (variant !== 'loading' && duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(92vw,22rem)] pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const VARIANT = {
  success: { icon: CheckCircle2, tint: 'text-olive-700', ring: 'ring-olive-500/20', bar: 'bg-olive-500' },
  error: { icon: AlertTriangle, tint: 'text-rose-600', ring: 'ring-rose-500/20', bar: 'bg-rose-500' },
  info: { icon: Info, tint: 'text-ashoka-700', ring: 'ring-ashoka-500/20', bar: 'bg-ashoka-500' },
  loading: { icon: Loader2, tint: 'text-olive-600', ring: 'ring-olive-500/10', bar: 'bg-olive-400' },
} as const;

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const cfg = VARIANT[item.variant];
  const Icon = cfg.icon;
  return (
    <div
      className={`pointer-events-auto animate-toast-in glass-panel rounded-2xl p-3.5 pr-3 flex items-start gap-3 ring-1 ${cfg.ring} shadow-lg`}
      role="status"
    >
      <div className={`shrink-0 mt-0.5 ${cfg.tint}`}>
        <Icon className={`w-5 h-5 ${item.variant === 'loading' ? 'animate-spin' : ''}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-olive-950 leading-snug">{item.title}</div>
        {item.description && (
          <div className="text-xs text-olive-700/70 mt-0.5 leading-snug">{item.description}</div>
        )}
      </div>
      {item.variant !== 'loading' && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-olive-400 hover:text-olive-800 hover:bg-olive-50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful no-op fallback so components never crash outside provider
    return {
      toast: () => 0,
      dismiss: () => {},
    } as ToastContextValue;
  }
  return ctx;
}

/** Small hook to detect first client mount — used for skeleton loading states. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
