'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Shimmer skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />;
}

/** Consistent eyebrow → title → subtitle section header. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  icon,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'inline-flex items-center gap-1.5 eyebrow text-emerald-700',
            align === 'center' ? 'justify-center' : ''
          )}
        >
          {icon}
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-2xl sm:text-[2rem] font-extrabold tracking-tight text-slate-900 mt-2 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-[0.95rem] text-slate-500 mt-2.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/** Small labelled pill/badge. */
export function Pill({
  children,
  tone = 'slate',
  className,
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'violet';
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
