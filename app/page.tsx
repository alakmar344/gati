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
  ScanLine,
  Zap,
  AlertTriangle,
  Radio,
  Gamepad2,
  Car,
  CreditCard,
  Compass,
  Sparkle,
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

const QUICK_TOOLS = [
  { href: '/scan', label: 'Smart Lens OCR', icon: ScanLine, tint: 'text-olive-700 bg-olive-100', note: '0.3s' },
  { href: '/fastpass', label: '10-Sec FastPass', icon: Zap, tint: 'text-saffron-700 bg-saffron-100', note: '10s' },
  { href: '/challans', label: 'Challan Radar', icon: AlertTriangle, tint: 'text-rose-700 bg-rose-100', note: 'UPI' },
  { href: '/fastag', label: 'FASTag Hub', icon: Radio, tint: 'text-ashoka-700 bg-ashoka-100', note: 'NETC' },
  { href: '/adtt-simulator', label: 'ADTT Track', icon: Gamepad2, tint: 'text-indiaGreen-700 bg-indiaGreen-100', note: 'Live' },
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
      {/* ================= HERO SECTION ================= */}
      <section className="px-3 sm:px-6 pt-2 pb-8">
        <div className="relative max-w-6xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl bg-olive-900 text-white border border-olive-800/40">
          {/* Indian-themed hero image — restored, integrated subtly */}
          <div className="hero-img-frame absolute inset-0" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hero-expressway.jpg" alt="" />
          </div>

          {/* ambient olive glows over the image for warmth */}
          <div className="absolute -top-32 -left-16 w-96 h-96 rounded-full bg-olive-500/30 blur-3xl z-[2]" aria-hidden />
          <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-saffron-500/15 blur-3xl z-[2]" aria-hidden />

          {/* faint jali dot grid for texture */}
          <div
            className="absolute inset-0 opacity-[0.05] z-[2]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
            aria-hidden
          />

          <div className="relative z-10 px-5 sm:px-12 py-14 sm:py-20 text-center flex flex-col items-center">
            {/* Tiranga eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-olive-900 border border-olive-200/60 mb-5 animate-rise shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indiaGreen-600 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                <span className="text-saffron-600">Gati</span>{' '}
                <span className="text-olive-900">Autopilot</span>
                <span className="mx-1.5 text-olive-300">•</span>
                <span className="text-ashoka-700">भारत</span>{' '}
                <span className="text-olive-700">Mobility OS</span>
              </span>
            </div>

            <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-[3.6rem] font-extrabold tracking-tight leading-[1.04] max-w-3xl text-balance animate-rise text-olive-950">
              {mounted && user ? (
                <>
                  {greeting}, {user.name.split(' ')[0]}.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-700 via-ashoka-700 to-indiaGreen-700">
                    What should I handle?
                  </span>
                </>
              ) : (
                <>
                  Indian vehicle services.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-700 via-ashoka-700 to-indiaGreen-700">
                    Radically simpler & 10x faster.
                  </span>
                </>
              )}
            </h1>

            <p className="text-[15px] sm:text-base md:text-lg text-olive-900/80 max-w-2xl mx-auto leading-relaxed mt-5 mb-7 font-medium animate-rise" style={{ animationDelay: '0.05s' }}>
              Smart RCs, VIP plates, 3D flippable driving licences, playable ADTT tracks
              and 10-second biometric FastPass — one calm Indian mobility OS.
            </p>

            {/* Ask Gati bar */}
            <button
              onClick={() => openCopilot()}
              className="group relative w-full max-w-xl mx-auto animate-rise"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-olive-500/70 via-ashoka-500/50 to-saffron-500/50 blur opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden />
              <span className="relative flex items-center gap-3 rounded-2xl bg-white/[0.96] border border-olive-200/70 px-4 py-4 text-left shadow-lg">
                <Wand2 className="w-5 h-5 text-olive-700 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] text-olive-900/70 truncate">
                    Ask Gati to <span className="text-olive-900 font-bold">“{EXAMPLES[ph]}”</span>
                  </span>
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-olive-700 bg-olive-50 border border-olive-200 rounded-md px-1.5 py-1 shrink-0">
                  <CmdIcon className="w-3 h-3" /> K
                </kbd>
              </span>
            </button>

            {/* example chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-rise" style={{ animationDelay: '0.16s' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => openCopilot(ex.replace(/₹|,/g, ''))}
                  className="px-3 py-1.5 rounded-full bg-white/85 hover:bg-white border border-olive-200/60 text-xs font-semibold text-olive-900 hover:text-olive-950 transition-colors shadow-xs"
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* live stats */}
            <div className="flex items-center gap-6 mt-8 text-sm animate-rise flex-wrap justify-center" style={{ animationDelay: '0.22s' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-saffron-600" />
                <span className="text-olive-900/80">
                  <span className="font-display font-extrabold text-olive-950">{mounted ? saved.hours : '—'}h</span> saved with Gati
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-olive-400" />
              <div className="flex items-center gap-2 text-olive-900/80">
                <ShieldCheck className="w-4 h-4 text-indiaGreen-700" />
                Zero forms to hunt for
              </div>
              <span className="w-1 h-1 rounded-full bg-olive-400" />
              <div className="flex items-center gap-2 text-olive-900/80">
                <Sparkles className="w-4 h-4 text-ashoka-700" />
                Sovereign by design
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK TOOLS BAR ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full -mt-2 mb-4 relative z-20">
        <div className="rounded-3xl border hairline bg-white/85 backdrop-blur-md shadow-sm p-2 flex flex-wrap items-center gap-1">
          {QUICK_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-2xl hover:bg-olive-50 transition-colors group"
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.tint}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-[13px] font-bold text-olive-950 group-hover:text-olive-700">{t.label}</span>
                <span className="text-[10px] font-bold font-mono text-olive-400 bg-olive-50 border border-olive-100 px-1.5 py-0.5 rounded-md">{t.note}</span>
                <ChevronRight className="w-3.5 h-3.5 text-olive-300 group-hover:text-olive-500" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= AUTOPILOT FEED ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full pt-10 sm:pt-14">
        <ActionFeed />
      </section>

      {/* ================= DEMOTED NAV (progressive disclosure) ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full pt-14 pb-8">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="eyebrow text-olive-700 inline-flex items-center gap-1.5">
              <Sparkle className="w-3.5 h-3.5" /> Core journeys
            </div>
            <h2 className="font-display text-xl sm:text-[1.6rem] font-extrabold tracking-tight text-olive-950 mt-1">
              Or start something specific
            </h2>
          </div>
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
                <div className="font-bold text-sm text-olive-950 mt-3">{svc.name}</div>
                <div className="text-[11px] text-olive-700/70 mt-1 leading-snug line-clamp-2">{svc.desc}</div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 rounded-3xl border hairline bg-white/70 p-2 flex flex-wrap gap-1.5">
          {SPEED_TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-olive-50 transition-colors text-sm font-semibold text-olive-700 hover:text-olive-900"
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${t.tint}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {t.short || t.name}
                <ChevronRight className="w-3.5 h-3.5 text-olive-300" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
