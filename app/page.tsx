'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  Sparkles, 
  CreditCard, 
  Compass, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  Zap, 
  TrendingUp, 
  HelpCircle,
  ChevronRight,
  Shield,
  Layers,
  Award,
  ScanLine,
  AlertTriangle,
  Radio,
  Gamepad2
} from 'lucide-react';
import { HsrpPlate } from '@/components/plates/HsrpPlate';
import { formatINR } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/track?ref=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/track');
    }
  };

  const faqs = [
    {
      q: 'How does Gati simplify the vehicle registration process?',
      a: 'Gati eliminates physical queues and paperwork by integrating automated chassis/VIN decoding, Aadhaar e-KYC autofill, instant road tax calculation with EV subsidies, and immediate digital RC smart card generation.'
    },
    {
      q: 'How does the 10-Second FastPass work?',
      a: 'Gati FastPass pre-links your DigiLocker and verified Aadhaar biometrics to issue 30-day interstate passes, green corridor certificates, and duplicate smart RCs in under 10 seconds flat.'
    },
    {
      q: 'Can I contest wrong traffic e-challans online?',
      a: 'Yes! The National E-Challan Radar lets you inspect camera evidence photos, GPS coordinates, and either settle with 1-tap UPI or auto-generate a formal representation to the Virtual Traffic Court.'
    },
    {
      q: 'What is the ADTT Driving Test Simulator?',
      a: 'It is a playable simulator that allows driving licence applicants to practice the real sensor-monitored track maneuvers (8-figure, parallel parking, reverse S, and gradient hill test) with live collision penalty telemetry before booking their slot.'
    },
    {
      q: 'Is this an official government website?',
      a: 'No. Gati is an independent design prototype created for a hackathon to showcase how modern consumer-grade UX, visual beauty, and transparent workflows can radically elevate digital public mobility services.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Cinematic Scenic Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('/images/hero-expressway.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-slate-50/90 backdrop-blur-[1px]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Social Proof Pill Badge with Tiranga accents */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel shadow-sm border border-white/80 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-saffron-600 text-white flex items-center justify-center font-bold text-[9px] border border-white">VS</div>
              <div className="w-5 h-5 rounded-full bg-ashoka-700 text-white flex items-center justify-center font-bold text-[9px] border border-white">PS</div>
              <div className="w-5 h-5 rounded-full bg-indiaGreen-700 text-white flex items-center justify-center font-bold text-[9px] border border-white">AS</div>
            </div>
            <span className="text-xs font-bold text-slate-800">
              National Digital Mobility Stack • भारत
            </span>
          </div>

          {/* Huge Typography Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-4xl mb-6">
            Indian vehicle services. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-ashoka-700 to-indiaGreen-700">
              for all your needs on road!
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Digital Smart RCs, VIP number plates, 3D flippable driving licences, playable ADTT test simulators, and 10-second biometric FastPass.
          </p>

          {/* Unified Search & Quick Lookup Pill */}
          <form 
            onSubmit={handleSearch}
            className="w-full max-w-xl mx-auto glass-panel p-2 rounded-full shadow-xl border border-white flex items-center gap-2 mb-8 transition-all focus-within:ring-4 focus-within:ring-emerald-500/20"
          >
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track application (e.g. GATI-VL-2026-89421) or search RC..."
              className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none px-2"
            />
            <button
              type="submit"
              className="px-5 sm:px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] shrink-0"
            >
              <span>Track Now</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </form>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-slate-700">
            <Link href="/adtt-simulator" className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800 flex items-center gap-1.5 font-bold">
              <Gamepad2 className="w-3.5 h-3.5 text-saffron-400" />
              <span>🎮 ADTT Track Simulator</span>
            </Link>
            <Link href="/fastpass" className="px-3.5 py-1.5 rounded-full bg-saffron-500 text-white shadow-sm hover:bg-saffron-600 flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>⚡ 10s FastPass</span>
            </Link>
            <Link href="/scan" className="px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs hover:bg-white flex items-center gap-1.5 text-emerald-800">
              <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Lens OCR</span>
            </Link>
            <Link href="/challans" className="px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs hover:bg-white flex items-center gap-1.5 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Challan Radar</span>
            </Link>
            <Link href="/fastag" className="px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs hover:bg-white flex items-center gap-1.5 text-sky-800">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>FASTag Hub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SPEED TOOL LAUNCH TILES ================= */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto w-full -mt-12 mb-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            href="/scan"
            className="glass-panel p-5 rounded-3xl border border-white/90 shadow-md hover:-translate-y-1 transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Smart Lens OCR</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">0.3s</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Scan any RC or plate to extract VIN, engine serial & flag expired PUCC.
              </p>
            </div>
          </Link>

          <Link
            href="/fastpass"
            className="glass-panel p-5 rounded-3xl border border-amber-300 shadow-md hover:-translate-y-1 transition-all flex items-start gap-4 group bg-amber-50/30"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>10-Sec FastPass</span>
                <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-mono">Instant</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Zero-friction 1-tap minting for emergency interstate & green passes.
              </p>
            </div>
          </Link>

          <Link
            href="/challans"
            className="glass-panel p-5 rounded-3xl border border-white/90 shadow-md hover:-translate-y-1 transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Challan Radar</span>
                <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-mono">Camera</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Inspect camera evidence photos, 1-tap UPI pay, or file court dispute.
              </p>
            </div>
          </Link>

          <Link
            href="/adtt-simulator"
            className="glass-panel p-5 rounded-3xl border border-white/90 shadow-md hover:-translate-y-1 transition-all flex items-start gap-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <span>ADTT Simulator</span>
                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono">Playable</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Practice 8-figure and parallel parking sensor tracks with live scoring.
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* ================= 4 MAJOR SERVICE CARDS ================= */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Four Pillars of Mobility</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Radically better public service journeys
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Interactive, end-to-end workflows that answer &ldquo;What do I need to do next?&rdquo; every step of the way.
          </p>
        </div>

        {/* 4 Core Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Service 1: Vehicle Licensing */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/80 shadow-glass flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 mb-5 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                REGISTRATION & RC
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2.5">
                Vehicle Licensing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Register new 2W, 4W, or Electric Vehicles with automated road tax calculation, green rebates, and instant cryptographic smart RC cards.
              </p>
            </div>

            <Link
              href="/vehicle-licensing"
              className="mt-6 w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all group-hover:shadow-lg"
            >
              <span>Start Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Service 2: Fancy Number Allocation */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/80 shadow-glass flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                VIP & CHOICE PLATES
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2.5">
                Fancy Numbers
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Explore rare number patterns (`0001`, `0007`, `0786`, `7777`) with real-time HSRP plate simulation and simulated e-auction reservation.
              </p>
            </div>

            <Link
              href="/fancy-numbers"
              className="mt-6 w-full py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 transition-all group-hover:shadow-lg"
            >
              <span>Browse VIP Numbers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Service 3: Driver Licence */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/80 shadow-glass flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-700 mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                DRIVING PERMITS & DL
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2.5">
                Driver Licence
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Learner&apos;s Licence, Permanent DL, and IDP with automated sensor test track (ADTT) slot booking and 3D flippable PVC digital card.
              </p>
            </div>

            <Link
              href="/driver-licence"
              className="mt-6 w-full py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all group-hover:shadow-lg"
            >
              <span>Apply for DL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Service 4: Vehicle Permit */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/80 shadow-glass flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700 mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                COMMERCIAL & INTERSTATE
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2.5">
                Vehicle Permit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                All India Tourist Permits (AITP), National Goods Carrier passes, and temporary interstate corridor permits with fast-track single-window approval.
              </p>
            </div>

            <Link
              href="/vehicle-permit"
              className="mt-6 w-full py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all group-hover:shadow-lg"
            >
              <span>Get Vehicle Permit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help & FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index}
                className="glass-panel rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-emerald-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
