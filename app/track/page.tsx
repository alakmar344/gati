'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Download, 
  Sparkles, 
  Car, 
  CreditCard, 
  Compass,
  Building,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { AnyApplication } from '@/lib/types';
import { getAllApplications, getApplicationByRef } from '@/lib/storage';
import { formatDate, formatINR } from '@/lib/utils';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || 'GATI-VL-2026-89421';

  const [searchRef, setSearchRef] = useState(initialRef);
  const [activeApp, setActiveApp] = useState<AnyApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = (refToLookup: string) => {
    const app = getApplicationByRef(refToLookup);
    setActiveApp(app || null);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      handleLookup(searchRef.trim());
    }
  };

  const sampleRefs = [
    { label: 'Vehicle Registration', ref: 'GATI-VL-2026-89421' },
    { label: 'VIP 0007 Number', ref: 'GATI-FN-2026-10492' },
    { label: 'Driver Licence (ADTT)', ref: 'GATI-DL-2026-44912' },
    { label: 'National Tourist Permit', ref: 'GATI-VP-2026-90184' },
  ];

  return (
    <div className="space-y-8">
      {/* Search Bar Pill */}
      <div className="glass-panel p-3 rounded-full shadow-lg border border-white/80 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="Enter Reference Number (e.g. GATI-VL-2026-89421)..."
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono font-medium focus:outline-none px-2 uppercase"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            Track Status
          </button>
        </form>
      </div>

      {/* Quick Sample Links */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold">Test Sample IDs:</span>
        {sampleRefs.map((s) => (
          <button
            key={s.ref}
            onClick={() => {
              setSearchRef(s.ref);
              handleLookup(s.ref);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold transition-all shadow-2xs"
          >
            {s.ref} ({s.label})
          </button>
        ))}
      </div>

      {/* Result Card */}
      {activeApp ? (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl space-y-8 animate-in fade-in duration-300">
          
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {activeApp.serviceType.replace('-', ' ')}
                </span>
                <span className="font-mono text-xs text-sky-700 font-bold">
                  {activeApp.referenceNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeApp.title}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Applicant: <strong className="text-slate-800">{activeApp.applicantName}</strong> • RTO: <strong className="text-slate-800">{activeApp.rtoName}</strong>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current State</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {activeApp.status === 'card_generated' ? 'Issued & Active' : 'Under Review'}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Updated: {formatDate(activeApp.updatedAt)}
              </div>
            </div>
          </div>

          {/* "What do I need to do next?" Guidance Box */}
          <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-2 text-emerald-900 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Next Recommended Action</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                {activeApp.status === 'card_generated'
                  ? 'Your digital credential has been cryptographically signed and minted. You can immediately download or print it from GatiLocker.'
                  : 'Your application documents have cleared scrutiny. Please arrive at the test facility 15 minutes before your scheduled slot.'}
              </p>
            </div>

            <Link
              href="/documents"
              className="px-5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 shrink-0 flex items-center gap-1.5"
            >
              <span>{activeApp.nextActionLabel || 'Open GatiLocker'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Timeline Stepper */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Application Milestones
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activeApp.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Step Dot */}
                  <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    step.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-300'
                  }`}>
                    {step.completed && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>

                  <div className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{step.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Security Metadata */}
          {activeApp.payment && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Payment Reference</span>
                <div className="font-mono font-bold text-slate-900">{activeApp.payment.transactionId}</div>
                <div className="text-[10px] text-slate-500 font-mono">Bank UTR: {activeApp.payment.utrNumber}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Settled Amount</span>
                <div className="text-sm font-mono font-extrabold text-emerald-700">
                  {formatINR(activeApp.payment.totalPaid)}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : hasSearched ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Application Reference Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We could not find an active application with reference &ldquo;<span className="font-mono">{searchRef}</span>&rdquo;. Please verify the reference number or try one of the test samples above.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>Real-Time Public Service Tracker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Application Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Instant status, milestone progression, and next action guidance for all transport requests.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-10 text-slate-500 text-xs">Loading tracker...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
