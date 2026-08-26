'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { resetDemoState } from '@/lib/storage';
import { CORE_SERVICES, SPEED_TOOLS, ACCOUNT_LINKS } from '@/lib/nav';
import { useToast } from '@/components/ui/Toast';

export const Footer: React.FC = () => {
  const { toast } = useToast();

  const handleResetDemo = () => {
    if (confirm('Reset all simulated applications and demo sessions to initial defaults?')) {
      resetDemoState();
      toast({ title: 'Sandbox reset', description: 'Returning to a clean demo state…', variant: 'info' });
      setTimeout(() => (window.location.href = '/'), 700);
    }
  };

  const columns = [
    { title: 'Services', items: CORE_SERVICES },
    { title: 'Speed Tools', items: SPEED_TOOLS.slice(0, 4) },
    { title: 'Account', items: ACCOUNT_LINKS },
  ];

  return (
    <footer className="relative w-full bg-slate-950 text-slate-400 mt-24">
      <div className="tiranga-top-bar opacity-80" />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-10">
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
              A calmer, 10x-faster mobility operating system for Indian vehicle & driving services.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5 max-w-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-semibold mb-0.5">Hackathon prototype</strong>
                Simulates Vahan 4.0, Sarathi, DigiLocker & NPCI transport APIs — not an official portal.
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <div className="eyebrow text-slate-500">{col.title}</div>
              <ul className="space-y-2 text-[13px]">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-slate-400 hover:text-white transition-colors">
                      {item.short || item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Gati Mobility OS • Designed for modern Indian transport.</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-olive-400">100% client-side</span>
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset sandbox
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
