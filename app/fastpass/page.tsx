'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  Printer, 
  QrCode, 
  ArrowRight, 
  Sparkles,
  Flame,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrentUser, saveDocument } from '@/lib/storage';
import { formatINR } from '@/lib/utils';

export default function FastPassPage() {
  const currentUser = getCurrentUser();
  const [selectedService, setSelectedService] = useState<'interstate' | 'duplicate_rc' | 'green_fleet'>('interstate');
  const [vehicleNumber, setVehicleNumber] = useState('KA 01 EK 4920');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [completedPass, setCompletedPass] = useState<{
    passId: string;
    title: string;
    vehicleNumber: string;
    holderName: string;
    amount: number;
    issueDate: string;
    validTill: string;
    elapsedSeconds: number;
    qrData: string;
  } | null>(null);

  const services = [
    {
      id: 'interstate',
      title: 'Emergency 30-Day Interstate Pass',
      tag: 'Express Corridor',
      desc: 'Instant single-window clearance for multi-state travel across national highways without checkpoint stoppage.',
      fee: 500,
      icon: '🛣️'
    },
    {
      id: 'duplicate_rc',
      title: 'Cryptographic Duplicate RC Pass',
      tag: 'Instant Digital',
      desc: 'Immediate authorized replacement digital certificate for lost or damaged physical smart cards.',
      fee: 350,
      icon: '🚗'
    },
    {
      id: 'green_fleet',
      title: 'Zero-Emission Green EV FastPass',
      tag: '100% Free Statutory',
      desc: 'Priority urban corridor access and exemption from odd-even or green congestion restrictions.',
      fee: 0,
      icon: '⚡'
    }
  ];

  const currentServiceObj = services.find(s => s.id === selectedService) || services[0];

  const handleStartFastPass = () => {
    setIsProcessing(true);
    setCountdown(0);
    setCompletedPass(null);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000);
      setCountdown(Number(elapsed.toFixed(1)));
    }, 100);

    setTimeout(() => {
      clearInterval(timer);
      setIsProcessing(false);

      const passId = `FP-${Date.now().toString().slice(-6)}`;
      const newPass = {
        passId,
        title: currentServiceObj.title,
        vehicleNumber: vehicleNumber.toUpperCase(),
        holderName: currentUser.name.toUpperCase(),
        amount: currentServiceObj.fee,
        issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        validTill: '24-SEP-2026',
        elapsedSeconds: Number(((Date.now() - startTime) / 1000).toFixed(1)),
        qrData: `GATI-FASTPASS:${passId}:${vehicleNumber}:VALID`
      };

      setCompletedPass(newPass);

      // Save to GatiLocker
      saveDocument({
        id: `doc-fp-${Date.now()}`,
        type: 'FASTPASS_PERMIT',
        title: `FastPass: ${currentServiceObj.title}`,
        documentNumber: passId,
        holderName: currentUser.name,
        issueDate: new Date().toISOString(),
        expiryDate: '2026-09-24',
        status: 'VALID',
        referenceId: passId,
        details: {
          service: currentServiceObj.title,
          vehicle: vehicleNumber,
          fee: currentServiceObj.fee
        }
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    }, 3800); // Super fast 3.8s simulated issuance!
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Zero-Friction 10-Second Issuance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Gati FastPass 10s
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Instant pre-authorized public mobility passes minted in under 10 seconds flat.
        </p>
      </div>

      {completedPass ? (
        /* Completed FastPass Card */
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 max-w-xl mx-auto">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono mb-2">
              ⚡ Minted in {completedPass.elapsedSeconds} seconds!
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              FastPass Active & Verified
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              PASS ID: <strong className="text-emerald-700">{completedPass.passId}</strong>
            </p>
          </div>

          {/* Cryptographic Pass Ticket */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold block">NATIONAL MOBILITY FASTPASS</span>
                <div className="font-bold text-sm text-white">{completedPass.title}</div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE PASS
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-8 space-y-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Vehicle Registration</span>
                  <span className="font-mono font-black text-sm text-amber-300">{completedPass.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Authorized Holder</span>
                  <span className="font-semibold text-slate-100">{completedPass.holderName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase block">Issue Date</span>
                    <span className="font-mono text-slate-200 text-[10px]">{completedPass.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase block">Valid Upto</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">{completedPass.validTill}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center bg-white rounded-xl p-2 text-slate-950">
                <QrCode className="w-16 h-16" />
                <span className="text-[7px] font-mono font-bold mt-1 text-slate-700">FASTPASS AUTH</span>
              </div>
            </div>

            <div className="text-[8px] text-slate-400 text-center border-t border-white/10 pt-2 uppercase">
              DEMO • NOT AN OFFICIAL GOVERNMENT DOCUMENT • GATI MOBILITY OS
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 justify-center pt-2 text-xs font-semibold">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Pass</span>
            </button>

            <button
              onClick={() => setCompletedPass(null)}
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-sm"
            >
              <span>Mint Another FastPass</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>
      ) : (
        /* FastPass Launchpad */
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl space-y-6">
          
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Select 10-Second Instant Service
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedService === s.id
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="font-bold text-xs text-slate-900 leading-tight mb-1">{s.title}</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
                      {s.tag}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {s.fee === 0 ? 'FREE' : formatINR(s.fee)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Applicant Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-100"
              />
            </div>
          </div>

          {/* 1-Tap Trigger Button */}
          <div className="pt-4 border-t border-slate-100">
            {isProcessing ? (
              <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-3">
                <div className="text-3xl font-black font-mono text-amber-400">
                  {countdown}s
                </div>
                <div className="text-xs font-semibold text-slate-300 animate-pulse">
                  Pre-authorizing DigiLocker handshake & minting FastPass...
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartFastPass}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-all"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>1-Tap Mint FastPass ({currentServiceObj.fee === 0 ? 'FREE' : formatINR(currentServiceObj.fee)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
