'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Shimmer skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton dark:bg-slate-800/80', className)} aria-hidden="true" />;
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
            'inline-flex items-center gap-1.5 eyebrow text-olive-800 dark:text-olive-400',
            align === 'center' ? 'justify-center' : ''
          )}
        >
          {icon}
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-2xl sm:text-[2rem] font-extrabold tracking-tight text-slate-900 dark:text-white mt-2 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-[0.95rem] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/** Small labelled clay pill/badge. */
export function Pill({
  children,
  tone = 'slate',
  className,
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'emerald' | 'olive' | 'saffron' | 'ashoka' | 'sky' | 'amber' | 'rose' | 'violet';
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    olive: 'bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 border-olive-200 dark:border-olive-800/60',
    emerald: 'bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 border-olive-200 dark:border-olive-800/60',
    saffron: 'bg-saffron-50 dark:bg-saffron-950/60 text-saffron-800 dark:text-saffron-300 border-saffron-200 dark:border-saffron-800/60',
    ashoka: 'bg-ashoka-50 dark:bg-ashoka-950/60 text-ashoka-800 dark:text-ashoka-300 border-ashoka-200 dark:border-ashoka-800/60',
    sky: 'bg-ashoka-50 dark:bg-ashoka-950/60 text-ashoka-800 dark:text-ashoka-300 border-ashoka-200 dark:border-ashoka-800/60',
    amber: 'bg-saffron-50 dark:bg-saffron-950/60 text-saffron-800 dark:text-saffron-300 border-saffron-200 dark:border-saffron-800/60',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    violet: 'bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 border-olive-200 dark:border-olive-800/60',
  };
  return (
    <span
      className={cn(
        'clay-pill inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
        tones[tone] || tones.slate,
        className
      )}
    >
      {children}
    </span>
  );
}
