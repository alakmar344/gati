'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Command as CmdIcon,
  Clock,
  Layers,
  BadgeCheck,
} from 'lucide-react';
import { CORE_SERVICES, SPEED_TOOLS } from '@/lib/nav';
import { SectionHeading } from '@/components/ui/Primitives';

const FAQS = [
  {
    q: 'How does Gati simplify vehicle registration?',
    a: 'Gati eliminates physical queues and paperwork by integrating automated chassis/VIN decoding, Aadhaar e-KYC autofill, instant road-tax calculation with EV subsidies, and immediate digital RC smart-card generation.',
  },
  {
    q: 'How does the 10-Second FastPass work?',
    a: 'FastPass pre-links your DigiLocker and verified Aadhaar biometrics to issue 30-day interstate passes, green corridor certificates, and duplicate smart RCs in under 10 seconds flat.',
  },
  {
    q: 'Can I contest wrong traffic e-challans online?',
    a: 'Yes. The E-Challan Radar lets you inspect camera evidence photos and GPS coordinates, then either settle with 1-tap UPI or auto-generate a formal representation to the Virtual Traffic Court.',
  },
  {
    q: 'What is the ADTT Driving Test Simulator?',
    a: 'A playable simulator that lets licence applicants practice the real sensor-monitored track maneuvers (8-figure, parallel parking, reverse S) with live collision-penalty telemetry before booking a slot.',
  },
  {
    q: 'Is this an official government website?',
    a: 'No. Gati is an independent design prototype created for a hackathon to show how modern, consumer-grade UX can radically elevate digital public mobility services.',
  },
];

const STATS = [
  { label: 'Avg. issuance time', value: '10s', icon: Clock },
  { label: 'Guided journeys', value: '4', icon: Layers },
  { label: 'Power tools', value: '6', icon: Zap },
  { label: 'Paperwork forms', value: '0', icon: BadgeCheck },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchQuery.trim() ? `/track?ref=${encodeURIComponent(searchQuery.trim())}` : '/track');
  };

  return (
    <div className="flex flex-col">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* subtle scenic wash */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.14]"
          style={{ backgroundImage: `url('/images/hero-expressway.jpg')` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/20 to-canvas" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full tiranga-badge shadow-sm mb-7 animate-rise">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              National Digital Mobility Stack • भारत
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-[4.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.05] max-w-3xl text-balance animate-rise">
            Every road service,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 via-ashoka-600 to-indiaGreen-600">
              done in seconds
            </span>
          </h1>

          <p
            className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed mt-6 animate-rise"
            style={{ animationDelay: '0.06s' }}
          >
            Smart RCs, VIP plates, driving licences and permits — reimagined as one calm,
            10x-faster mobility operating system.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-lg mx-auto glass-panel p-1.5 rounded-full flex items-center gap-2 mt-8 transition-all focus-within:ring-4 focus-within:ring-emerald-500/15 animate-rise"
            style={{ animationDelay: '0.12s' }}
          >
            <Search className="w-5 h-5 text-emerald-600 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track a reference (e.g. GATI-VL-2026-89421)…"
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
            />
            <button type="submit" className="btn btn-primary px-5 py-2.5 text-sm shrink-0">
              Track
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </form>

          <div
            className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs text-slate-500 animate-rise"
            style={{ animationDelay: '0.18s' }}
          >
            <button
              onClick={() => window.dispatchEvent(new Event('gati_open_command'))}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <CmdIcon className="w-3.5 h-3.5" /> Press ⌘K to jump anywhere
            </button>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% client-side demo
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 w-full max-w-3xl stagger">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card px-4 py-4 text-center">
                  <Icon className="w-4 h-4 text-emerald-600 mx-auto mb-2" />
                  <div className="font-display text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CORE SERVICES ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full py-14 sm:py-20">
        <SectionHeading
          eyebrow="Four guided journeys"
          icon={<Sparkles className="w-3.5 h-3.5" />}
          title="Start with what you need"
          subtitle="Each journey answers “what do I do next?” at every step — no 40-field forms, no guesswork."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12 stagger">
          {CORE_SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.href}
                href={svc.href}
                className="card card-hover p-6 flex flex-col group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${svc.tint} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-5">{svc.name}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed mt-2 flex-1">{svc.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 mt-5 group-hover:gap-2.5 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= SPEED TOOLS ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full pb-16">
        <div className="rounded-[2rem] bg-slate-950 text-white p-6 sm:p-10 overflow-hidden relative shadow-lg">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-28 -left-16 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl" aria-hidden />
          <div className="relative">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 eyebrow text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Speed tools
              </div>
              <h2 className="font-display text-2xl sm:text-[2rem] font-extrabold tracking-tight mt-2 text-balance">
                One-tap utilities for everyday driving
              </h2>
              <p className="text-sm text-slate-400 mt-2.5 leading-relaxed">
                The friction-killers — reach for any of them from the top nav or ⌘K, anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
              {SPEED_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all"
                  >
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.tint}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                        {tool.name}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </span>
                      <span className="block text-xs text-slate-400 leading-snug mt-0.5">{tool.desc}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="px-4 sm:px-8 max-w-3xl mx-auto w-full pb-24">
        <SectionHeading
          eyebrow="Help & FAQ"
          icon={<HelpCircle className="w-3.5 h-3.5" />}
          title="Questions, answered"
        />
        <div className="space-y-2.5 mt-10">
          {FAQS.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-bold text-slate-900"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-90 text-emerald-600' : 'text-slate-400'}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-[13px] text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
