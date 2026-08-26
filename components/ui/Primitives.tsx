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
            'inline-flex items-center gap-1.5 eyebrow text-olive-700',
            align === 'center' ? 'justify-center' : ''
          )}
        >
          {icon}
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="font-display text-2xl sm:text-[2rem] font-extrabold tracking-tight text-olive-950 mt-2 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-[0.95rem] text-olive-700/70 mt-2.5 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/** Small labelled pill/badge. */
export function Pill({
  children,
  tone = 'olive',
  className,
}: {
  children: React.ReactNode;
  tone?: 'olive' | 'ashoka' | 'saffron' | 'india' | 'rose' | 'slate';
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate: 'bg-olive-100 text-olive-800 border-olive-200',
    olive: 'bg-olive-50 text-olive-800 border-olive-200',
    ashoka: 'bg-ashoka-100 text-ashoka-700 border-ashoka-200',
    saffron: 'bg-saffron-50 text-saffron-700 border-saffron-200',
    india: 'bg-indiaGreen-50 text-indiaGreen-700 border-indiaGreen-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
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
