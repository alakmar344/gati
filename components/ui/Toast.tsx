'use client';

import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
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
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'success', duration = 3800 }) => {
      const id = counter++;
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
      if (variant !== 'loading' && duration > 0) {
        timersRef.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss]
  );

  // Clear all pending auto-dismiss timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(92vw,22rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const VARIANT = {
  success: { icon: CheckCircle2, tint: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500' },
  error: { icon: AlertTriangle, tint: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-500/20', bar: 'bg-rose-500' },
  info: { icon: Info, tint: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-500/20', bar: 'bg-sky-500' },
  loading: { icon: Loader2, tint: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-500/10', bar: 'bg-slate-400' },
} as const;

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const cfg = VARIANT[item.variant];
  const Icon = cfg.icon;
  return (
    <div
      className={`pointer-events-auto animate-toast-in glass-panel rounded-2xl p-3.5 pr-3 flex items-start gap-3 ring-1 ${cfg.ring} shadow-lg`}
    >
      <div className={`shrink-0 mt-0.5 ${cfg.tint}`}>
        <Icon className={`w-5 h-5 ${item.variant === 'loading' ? 'animate-spin' : ''}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.title}</div>
        {item.description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{item.description}</div>
        )}
      </div>
      {item.variant !== 'loading' && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
