'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  RotateCcw, 
  Sparkles, 
  Car, 
  CreditCard, 
  Compass, 
  FileCheck2,
  ExternalLink,
  Code2
} from 'lucide-react';
import { resetDemoState } from '@/lib/storage';

export const Footer: React.FC = () => {
  const handleResetDemo = () => {
    if (confirm('Reset all simulated applications and demo sessions to initial defaults?')) {
      resetDemoState();
      window.location.href = '/';
    }
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-saffron-500 via-ashoka-700 to-indiaGreen-700 flex items-center justify-center text-white font-black text-sm shadow-md">
                G
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  GATI
                </span>
                <span className="text-saffron-400 text-xs font-bold bg-saffron-950/80 border border-saffron-800 px-2 py-0.5 rounded-md">
                  गति • भारत
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sovereign digital mobility architecture engineered for 1.4 billion citizens — 10x faster RTO workflows, instant biometric FastPass, and transparent road governance.
            </p>

            {/* Prototype Trust Disclaimer Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block font-semibold mb-0.5">
                  Hackathon Prototype & NextGen Architecture Showcase
                </strong>
                Demonstration platform simulating Vahan 4.0, Sarathi, DigiLocker, and NPCI Unified Transport APIs.
              </div>
            </div>
          </div>

          {/* Col 3: Core Interactive Services */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Services
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/vehicle-licensing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>Vehicle Registration (RC)</span>
                </Link>
              </li>
              <li>
                <Link href="/fancy-numbers" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Fancy / VIP Plate Auction</span>
                </Link>
              </li>
              <li>
                <Link href="/driver-licence" className="hover:text-sky-400 transition-colors flex items-center gap-1.5">
                  <span>Driving Licence (LL / DL)</span>
                </Link>
              </li>
              <li>
                <Link href="/vehicle-permit" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <span>National & Tourist Permits</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Tools */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Citizen Hub
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Personal Dashboard
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Live Status Tracker
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white transition-colors">
                  GatiLocker Smart Cards
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Demo Account Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Prototype Actions & Reset */}
          <div className="space-y-3 text-xs">
            <div className="font-bold text-white uppercase tracking-wider text-[11px]">
              Prototype Controls
            </div>
            <p className="text-[11px] text-slate-500">
              Built with Next.js 14, TypeScript & Tailwind CSS. Ready for one-click deployment.
            </p>
            <button
              onClick={handleResetDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Sandbox Data</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Gati Mobility OS. Designed for modern Indian transport.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-400/80 font-mono">10 Simulated Personas Active</span>
            <span>•</span>
            <span className="text-sky-400/80 font-mono">100% Client-Side Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
