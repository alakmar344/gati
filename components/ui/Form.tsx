'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

/* ============================================================
   Form primitives — tactile clay inputs, consistent validation,
   smart formatting, and low-friction selection with dark theme.
   ============================================================ */

export function Field({
  label,
  hint,
  htmlFor,
  required,
  optional,
  adornment,
  error,
  success,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  adornment?: React.ReactNode;
  error?: string;
  success?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <label htmlFor={htmlFor} className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
          {optional && <span className="text-slate-400 dark:text-slate-500 font-medium normal-case tracking-normal">(optional)</span>}
        </label>
        {adornment && <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">{adornment}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      ) : success ? (
        <p className="text-[11px] text-olive-700 dark:text-olive-400 mt-1.5 flex items-center gap-1 font-medium">
          <Check className="w-3 h-3" /> {success}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> {
  value: string;
  onValue: (v: string) => void;
  transform?: 'upper' | 'none';
  mono?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  invalid?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { value, onValue, transform = 'none', mono, prefix, suffix, invalid, className, ...rest },
  ref
) {
  return (
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">{prefix}</span>}
      <input
        ref={ref}
        value={value}
        onChange={(e) => {
          const v = transform === 'upper' ? e.target.value.toUpperCase() : e.target.value;
          onValue(v);
        }}
        className={cn(
          'clay-input w-full py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100',
          prefix ? 'pl-9' : 'pl-4',
          suffix ? 'pr-11' : 'pr-4',
          mono && 'font-mono tracking-wide',
          invalid && 'border-rose-400 focus:border-rose-500',
          className
        )}
        {...rest}
      />
      {suffix && <span className="absolute right-2.5 flex items-center">{suffix}</span>}
    </div>
  );
});

/* -------- Money input: grouped ₹ display + quick chips -------- */

export function formatGrouped(n: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

export function amountInWords(n: number): string {
  if (!n || n <= 0) return '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${crore} crore`);
  if (lakh) parts.push(`${lakh} lakh`);
  if (thousand) parts.push(`${thousand} thousand`);
  if (rest) parts.push(`${rest}`);
  return parts.join(' ') + ' rupees';
}

export function MoneyInput({
  value,
  onValue,
  quickAdd,
  presets,
  id,
}: {
  value: number;
  onValue: (n: number) => void;
  quickAdd?: number[];
  presets?: number[];
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-500 dark:text-slate-400 font-semibold text-sm pointer-events-none">₹</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value ? formatGrouped(value) : ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^0-9]/g, '');
            onValue(digits ? parseInt(digits, 10) : 0);
          }}
          placeholder="0"
          className="clay-input w-full pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tracking-wide"
        />
      </div>
      {(quickAdd || presets) && (
        <div className="flex flex-wrap gap-1.5">
          {presets?.map((p) => (
            <button
              key={`set-${p}`}
              type="button"
              onClick={() => onValue(p)}
              className="clay-pill px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
            >
              ₹{formatGrouped(p)}
            </button>
          ))}
          {quickAdd?.map((a) => (
            <button
              key={`add-${a}`}
              type="button"
              onClick={() => onValue(value + a)}
              className="clay-pill px-2.5 py-1 bg-olive-50 dark:bg-olive-950/60 hover:bg-olive-100 dark:hover:bg-olive-900/60 text-[11px] font-bold text-olive-800 dark:text-olive-300 transition-colors"
            >
              +{a >= 100000 ? `${a / 100000}L` : a >= 1000 ? `${a / 1000}k` : a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------- Option grid: low-friction selectable cards -------- */

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
  desc?: string;
  badge?: string;
}

const TONES = {
  emerald: 'bg-olive-50 dark:bg-olive-950/60 border-olive-600 dark:border-olive-500 text-olive-950 dark:text-olive-200 ring-olive-600/20',
  olive: 'bg-olive-50 dark:bg-olive-950/60 border-olive-600 dark:border-olive-500 text-olive-950 dark:text-olive-200 ring-olive-600/20',
  sky: 'bg-ashoka-50 dark:bg-ashoka-950/60 border-ashoka-600 dark:border-ashoka-500 text-ashoka-950 dark:text-ashoka-200 ring-ashoka-600/20',
  ashoka: 'bg-ashoka-50 dark:bg-ashoka-950/60 border-ashoka-600 dark:border-ashoka-500 text-ashoka-950 dark:text-ashoka-200 ring-ashoka-600/20',
  teal: 'bg-olive-50 dark:bg-olive-950/60 border-olive-600 dark:border-olive-500 text-olive-950 dark:text-olive-200 ring-olive-600/20',
  amber: 'bg-saffron-50 dark:bg-saffron-950/60 border-saffron-500 dark:border-saffron-400 text-saffron-950 dark:text-saffron-200 ring-saffron-500/20',
  saffron: 'bg-saffron-50 dark:bg-saffron-950/60 border-saffron-500 dark:border-saffron-400 text-saffron-950 dark:text-saffron-200 ring-saffron-500/20',
  violet: 'bg-olive-50 dark:bg-olive-950/60 border-olive-600 dark:border-olive-500 text-olive-950 dark:text-olive-200 ring-olive-600/20',
} as const;

export function OptionGrid({
  options,
  value,
  onChange,
  columns = 'grid-cols-2 sm:grid-cols-4',
  tone = 'emerald',
  multi = false,
  selectedValues,
}: {
  options: Option[];
  value?: string;
  onChange: (v: string) => void;
  columns?: string;
  tone?: keyof typeof TONES;
  multi?: boolean;
  selectedValues?: string[];
}) {
  return (
    <div className={cn('grid gap-2.5', columns)}>
      {options.map((opt) => {
        const selected = multi ? selectedValues?.includes(opt.value) : value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'clay-card relative p-3.5 border text-left transition-all',
              selected
                ? cn('ring-2', TONES[tone] || TONES.emerald)
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            {opt.badge && (
              <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 border border-current opacity-70">
                {opt.badge}
              </span>
            )}
            <div className="flex items-center gap-2">
              {opt.icon && <span className="text-lg leading-none">{opt.icon}</span>}
              <span className="text-[13px] font-semibold">{opt.label}</span>
              {selected && <Check className="w-4 h-4 ml-auto shrink-0" />}
            </div>
            {opt.desc && <p className="text-[11px] mt-1 opacity-70 leading-snug">{opt.desc}</p>}
          </button>
        );
      })}
    </div>
  );
}

/* -------- Native select wrapped for consistency -------- */

export function SelectInput({
  value,
  onValue,
  children,
  id,
}: {
  value: string;
  onValue: (v: string) => void;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className="clay-input w-full pl-4 pr-9 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100 appearance-none cursor-pointer"
      >
        {children}
      </select>
      <svg
        className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Small verified chip for autofilled/verified fields. */
export function VerifiedChip({ label = 'Verified' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-olive-700 dark:text-olive-400">
      <Check className="w-3 h-3" /> {label}
    </span>
  );
}
