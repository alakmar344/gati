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
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

export default function FastPassPage() {
  const currentUser = getCurrentUser();
  const { toast } = useToast();
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
      const elapsedSeconds = Number(((Date.now() - startTime) / 1000).toFixed(1));
      const newPass = {
        passId,
        title: currentServiceObj.title,
        vehicleNumber: vehicleNumber.toUpperCase(),
        holderName: currentUser.name.toUpperCase(),
        amount: currentServiceObj.fee,
        issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
        validTill: '24-SEP-2026',
        elapsedSeconds,
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

      toast({
        title: `FastPass minted in ${elapsedSeconds}s`,
        description: `${passId} · ${currentServiceObj.title}`,
        variant: 'success',
      });

    }, 3800); // Super fast 3.8s simulated issuance!
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow="Zero-Friction 10-Second Issuance"
        icon={<Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
        title="Gati FastPass 10s"
        subtitle="Instant pre-authorized public mobility passes minted in under 10 seconds flat."
        className="animate-rise"
      />

      {completedPass ? (
        /* Completed FastPass Card */
        <div className="card p-8 sm:p-10 space-y-7 animate-dialog-in max-w-xl mx-auto">

          <div className="text-center space-y-3">
            <Pill tone="olive" className="mx-auto">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Minted in {completedPass.elapsedSeconds} seconds
            </Pill>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-olive-950">
              FastPass Active &amp; Verified
            </h2>
            <p className="text-[11px] text-olive-700/70 font-mono">
              PASS ID: <strong className="text-olive-700">{completedPass.passId}</strong>
            </p>
          </div>

          {/* Cryptographic Pass Ticket */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-olive-950 via-olive-900 to-olive-950 text-white shadow-xl border border-olive-500/40 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-olive-400 font-bold block">National Mobility FastPass</span>
                <div className="font-bold text-sm text-white mt-0.5">{completedPass.title}</div>
              </div>
              <span className="text-[11px] bg-olive-500/20 text-olive-300 font-bold px-2 py-0.5 rounded border border-olive-500/30">
                ACTIVE PASS
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-8 space-y-3">
                <div>
                  <span className="text-[11px] text-olive-500/80 uppercase tracking-wider block">Vehicle Registration</span>
                  <span className="font-mono font-black text-sm text-amber-300">{completedPass.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-[11px] text-olive-500/80 uppercase tracking-wider block">Authorized Holder</span>
                  <span className="font-semibold text-olive-100">{completedPass.holderName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-olive-500/80 uppercase block">Issue Date</span>
                    <span className="font-mono text-olive-200 text-[11px]">{completedPass.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-olive-500/80 uppercase block">Valid Upto</span>
                    <span className="font-mono text-olive-400 font-bold text-[11px]">{completedPass.validTill}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center bg-white rounded-xl p-2 text-olive-950">
                <QrCode className="w-16 h-16" />
                <span className="text-[11px] font-mono font-bold mt-1 text-olive-800">AUTH</span>
              </div>
            </div>

            <div className="text-[11px] text-olive-500/80 text-center border-t border-white/10 pt-2 uppercase tracking-wide">
              Demo • Not an official government document • Gati Mobility OS
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-1">
            <button
              onClick={() => window.print()}
              className="btn btn-ghost px-5 py-2.5 text-sm w-full sm:w-auto"
            >
              <Printer className="w-4 h-4 text-olive-700/70" />
              <span>Print Pass</span>
            </button>

            <button
              onClick={() => setCompletedPass(null)}
              className="btn btn-primary px-5 py-2.5 text-sm w-full sm:w-auto"
            >
              <span>Mint Another FastPass</span>
              <ArrowRight className="w-4 h-4 text-olive-400" />
            </button>
          </div>
        </div>
      ) : (
        /* FastPass Launchpad */
        <div className="card p-6 sm:p-10 space-y-8">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-amber-600">Select 10-Second Instant Service</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
              {services.map((s) => {
                const active = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id as any)}
                    aria-pressed={active}
                    className={`card text-left p-4 flex flex-col justify-between transition-all ${
                      active
                        ? 'ring-2 ring-amber-500/40 border-amber-400 bg-amber-50/60'
                        : 'card-hover'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="font-bold text-sm text-olive-950 leading-tight mb-1.5">{s.title}</div>
                      <p className="text-[11px] text-olive-700/70 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t hairline">
                      <Pill tone={active ? 'amber' : 'slate'}>{s.tag}</Pill>
                      <span className="font-mono font-bold text-sm text-olive-950">
                        {s.fee === 0 ? 'FREE' : formatINR(s.fee)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-olive-800 block">Target Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="field w-full px-4 py-2.5 text-sm font-mono font-bold text-olive-950 uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-olive-800 block">Applicant Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="field w-full px-4 py-2.5 text-sm font-medium text-olive-700 bg-olive-100"
              />
            </div>
          </div>

          {/* 1-Tap Trigger Button */}
          <div className="pt-6 border-t hairline">
            {isProcessing ? (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-olive-950 via-olive-900 to-olive-950 text-white flex flex-col items-center justify-center text-center space-y-4">
                <div className="font-display text-6xl sm:text-7xl font-extrabold tracking-tight text-amber-400 tabular-nums">
                  {countdown}<span className="text-3xl text-amber-500/80">s</span>
                </div>
                <div className="text-sm font-semibold text-olive-400 animate-pulse-subtle">
                  Pre-authorizing DigiLocker handshake &amp; minting FastPass...
                </div>
                <div className="w-56 h-1.5 bg-olive-700/60 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartFastPass}
                className="btn w-full py-4 text-base bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-olive-950 font-extrabold shadow-xl shadow-amber-500/20"
              >
                <Zap className="w-5 h-5 fill-olive-950" />
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
