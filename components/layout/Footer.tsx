'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { resetDemoState } from '@/lib/storage';
import { CORE_SERVICES, SPEED_TOOLS, ACCOUNT_LINKS, navItemShort } from '@/lib/nav';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

export const Footer: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleResetDemo = () => {
    if (confirm(t('footResetConfirm'))) {
      resetDemoState();
      toast({ title: t('footToastResetTitle'), description: t('footToastResetDesc'), variant: 'info' });
      setTimeout(() => (window.location.href = '/'), 700);
    }
  };

  const columns = [
    { titleKey: 'services', items: CORE_SERVICES },
    { titleKey: 'speedTools', items: SPEED_TOOLS.slice(0, 4) },
    { titleKey: 'footAccount', items: ACCOUNT_LINKS },
  ] as const;

  return (
    <footer className="relative w-full bg-slate-950 text-slate-400 mt-24">
      <div className="tiranga-top-bar opacity-80" />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-28 lg:pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-600 via-ashoka-800 to-olive-700 flex items-center justify-center text-white font-display font-black text-sm shadow-md border border-white/10">
                ग
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-black tracking-tight text-white">GATI</span>
                <span className="text-saffron-400 text-[11px] font-bold bg-saffron-950/80 border border-saffron-800 px-2 py-0.5 rounded-md">
                  गति • भारत
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {t('footBrandBlurb')}
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5 max-w-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-semibold mb-0.5">{t('footPrototypeTitle')}</strong>
                {t('footPrototypeDesc')}
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey} className="space-y-3">
              <div className="eyebrow text-slate-500">{t(col.titleKey)}</div>
              <ul className="space-y-2 text-[13px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-slate-400 hover:text-white transition-colors">
                      {navItemShort(item, t)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} {t('footCopyright')}</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-olive-400">{t('footClientSide')}</span>
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> {t('footResetSandbox')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
