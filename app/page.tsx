'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Command as CmdIcon,
  Clock,
  Wand2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { CORE_SERVICES, SPEED_TOOLS } from '@/lib/nav';
import { ActionFeed } from '@/components/copilot/ActionFeed';
import { computeTimeSaved } from '@/lib/insights';
import { getCurrentUser, getApplicationsForUser } from '@/lib/storage';
import { DemoUser } from '@/lib/types';
import { useMounted } from '@/components/ui/Toast';

const EXAMPLES = [
  'pay all my challans',
  'top up fastag ₹1,000',
  'renew my licence',
  'register a new EV',
  'scan my RC',
];

function openCopilot(q?: string) {
  window.dispatchEvent(new CustomEvent('gati_open_command', { detail: q ? { q } : undefined }));
}

export default function HomePage() {
  const mounted = useMounted();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [saved, setSaved] = useState({ hours: 0, tasks: 0 });
  const [ph, setPh] = useState(0);

  const load = () => {
    const u = getCurrentUser();
    setUser(u);
    setSaved(computeTimeSaved(getApplicationsForUser(u.id)));
  };

  useEffect(() => {
    load();
    const evs = ['gati_user_changed', 'gati_applications_updated', 'gati_payments_updated'];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % EXAMPLES.length), 2800);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div className="flex flex-col">
      {/* ================= COCKPIT HERO ================= */}
      <section className="px-3 sm:px-6 pt-2">
        <div className="relative max-w-6xl mx-auto rounded-[2.25rem] overflow-hidden bg-slate-950 text-white shadow-2xl border border-white/10">
          {/* Restored Indian-Themed Background Image with Subtle Depth */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 transition-transform duration-1000 opacity-35"
            style={{
              backgroundImage: `url('/images/hero-expressway.jpg')`,
            }}
            aria-hidden="true"
          />
          {/* Subtle atmospheric gradient overlay for pristine contrast and Indian Gov-Tech identity */}
          <div
            className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95 backdrop-blur-[0.5px]"
            aria-hidden="true"
          />
          {/* Sparing Tiranga ambient light pools */}
          <div className="absolute -top-32 -left-16 w-96 h-96 rounded-full bg-saffron-500/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-olive-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[20rem] rounded-full bg-ashoka-600/10 blur-3xl" aria-hidden="true" />

          {/* Micro grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 px-5 sm:px-12 py-12 sm:py-16 text-center flex flex-col items-center">
            {/* National Sovereign Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 shadow-sm backdrop-blur-md animate-rise">
              <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                Gati Autopilot · भारत Mobility OS
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.06] max-w-3xl text-balance animate-rise">
              {mounted && user ? (
                <>
                  {greeting}, {user.name.split(' ')[0]}.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-300 via-amber-200 to-olive-300">
                    What should I handle?
                  </span>
                </>
              ) : (
                <>
                  Tell Gati what you need.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-300 via-amber-200 to-olive-300">
                    It gets done.
                  </span>
                </>
              )}
            </h1>

            {/* Ask Gati bar */}
            <button
              onClick={() => openCopilot()}
              className="group relative w-full max-w-xl mx-auto mt-9 animate-rise"
              style={{ animationDelay: '0.08s' }}
            >
              <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-olive-600/60 via-saffron-600/40 to-olive-600/60 blur opacity-50 group-hover:opacity-90 transition-opacity" aria-hidden="true" />
              <span className="relative flex items-center gap-3 rounded-2xl bg-white/[0.08] border border-white/20 px-4 py-4 text-left backdrop-blur-md shadow-xl">
                <Wand2 className="w-5 h-5 text-saffron-400 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] text-slate-200 truncate">
                    Ask Gati to <span className="text-white font-semibold">“{EXAMPLES[ph]}”</span>
                  </span>
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-200 bg-white/10 border border-white/20 rounded-md px-2 py-1 shrink-0 shadow-inner">
                  <CmdIcon className="w-3 h-3" /> K
                </kbd>
              </span>
            </button>

            {/* example chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-rise" style={{ animationDelay: '0.14s' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => openCopilot(ex.replace(/₹|,/g, ''))}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-sm"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* live stats */}
            <div className="flex items-center gap-6 mt-9 text-sm animate-rise" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-olive-400" />
                <span className="text-slate-300">
                  <span className="font-display font-extrabold text-white">{mounted ? saved.hours : '—'}h</span> saved with Gati
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-saffron-400" />
                Zero forms to hunt for
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= AUTOPILOT FEED ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full pt-12 sm:pt-16">
        <ActionFeed />
      </section>

      {/* ================= DEMOTED NAV (progressive disclosure) ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full pt-14 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-slate-900">Or start something specific</h2>
          <button onClick={() => openCopilot()} className="text-xs font-bold text-olive-700 hover:text-olive-800 inline-flex items-center gap-1">
            Ask instead <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CORE_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link key={svc.href} href={svc.href} className="card card-hover p-4 group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${svc.tint} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-slate-900 mt-3">{svc.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{svc.desc}</div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 rounded-3xl border hairline bg-white/60 p-2 flex flex-wrap gap-1.5">
          {SPEED_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.tint}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {t.short || t.name}
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
