'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Printer,
  QrCode,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCurrentUser, saveDocument } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

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

  const { t } = useLanguage();

  const stopwatchRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const issuanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the stopwatch interval and issuance timeout if the page unmounts mid-processing
  useEffect(() => {
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
      if (issuanceTimeoutRef.current) clearTimeout(issuanceTimeoutRef.current);
    };
  }, []);

  const services = [
    {
      id: 'interstate',
      title: t('fpInterstate'),
      tag: t('fpInterstateTag'),
      desc: t('fpInterstateDesc'),
      fee: 500,
      icon: '🛣️'
    },
    {
      id: 'duplicate_rc',
      title: t('fpDuplicateRC'),
      tag: t('fpDuplicateRCTag'),
      desc: t('fpDuplicateRCDesc'),
      fee: 350,
      icon: '🚗'
    },
    {
      id: 'green_fleet',
      title: t('fpGreenFleet'),
      tag: t('fpGreenFleetTag'),
      desc: t('fpGreenFleetDesc'),
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
    stopwatchRef.current = setInterval(() => {
      const elapsed = ((Date.now() - startTime) / 1000);
      setCountdown(Number(elapsed.toFixed(1)));
    }, 100);

    issuanceTimeoutRef.current = setTimeout(() => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
      setIsProcessing(false);

      const passId = `FP-${Date.now().toString().slice(-6)}`;
      const elapsedSeconds = Number(((Date.now() - startTime) / 1000).toFixed(1));
      const issuedAt = new Date();
      const validTillDate = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const formatPassDate = (d: Date) =>
        d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      const newPass = {
        passId,
        title: currentServiceObj.title,
        vehicleNumber: vehicleNumber.toUpperCase(),
        holderName: currentUser.name.toUpperCase(),
        amount: currentServiceObj.fee,
        issueDate: formatPassDate(issuedAt),
        validTill: formatPassDate(validTillDate),
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
        issueDate: issuedAt.toISOString(),
        expiryDate: validTillDate.toISOString(),
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
        title: `${t('fpToastMinted')} ${elapsedSeconds}s`,
        description: `${passId} · ${currentServiceObj.title}`,
        variant: 'success',
      });

    }, 3800); // Super fast 3.8s simulated issuance!
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow={t('fpEyebrow')}
        icon={<Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
        title={t('fpTitle')}
        subtitle={t('fpSubtitle')}
        className="animate-rise"
      />

      {completedPass ? (
        /* Completed FastPass Card */
        <div className="clay-card p-8 sm:p-10 space-y-7 animate-dialog-in max-w-xl mx-auto">

          <div className="text-center space-y-3">
            <Pill tone="emerald" className="mx-auto">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              {t('fpMintedIn')} {completedPass.elapsedSeconds} {t('fpSeconds')}
            </Pill>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('fpActiveVerified')}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {t('fpPassID')} <strong className="text-emerald-700 dark:text-emerald-400">{completedPass.passId}</strong>
            </p>
          </div>

          {/* Cryptographic Pass Ticket */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold block">{t('fpNationalMobility')}</span>
                <div className="font-bold text-sm text-white mt-0.5">{completedPass.title}</div>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {t('fpActivePass')}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-8 space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">{t('fpVehicleReg')}</span>
                  <span className="font-mono font-black text-sm text-amber-300">{completedPass.vehicleNumber}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">{t('fpAuthHolder')}</span>
                  <span className="font-semibold text-slate-100">{completedPass.holderName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block">{t('fpIssueDate')}</span>
                    <span className="font-mono text-slate-200 text-[11px]">{completedPass.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block">{t('fpValidUpto')}</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{completedPass.validTill}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-4 flex flex-col items-center justify-center bg-white rounded-2xl p-2 text-slate-950">
                <QrCode className="w-16 h-16" />
                <span className="text-[11px] font-mono font-bold mt-1 text-slate-700">AUTH</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center border-t border-white/10 pt-2 uppercase tracking-wide">
              {t('fpDemoDisclaimer')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-1">
            <button
              onClick={() => window.print()}
              className="clay-btn min-h-[44px] px-5 py-2.5 text-sm w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{t('fpPrintPass')}</span>
            </button>

            <button
              onClick={() => setCompletedPass(null)}
              className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm w-full sm:w-auto text-white font-bold"
            >
              <span>{t('fpMintAnother')}</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      ) : (
        /* FastPass Launchpad */
        <div className="clay-card p-6 sm:p-10 space-y-8">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-amber-600 dark:text-amber-400">{t('fpSelectService')}</span>
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
                    className={`clay-card clay-card-interactive text-left p-5 flex flex-col justify-between transition-all min-h-[160px] ${
                      active
                        ? 'ring-2 ring-amber-500/50 border-amber-400 bg-amber-50/60 dark:bg-amber-950/40'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-1.5">{s.title}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <Pill tone={active ? 'amber' : 'slate'}>{s.tag}</Pill>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white shrink-0">
                        {s.fee === 0 ? t('fpFREE') : formatINR(s.fee)}
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{t('fpTargetVehicle')}</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="clay-input w-full px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{t('fpApplicantName')}</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="clay-input w-full px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 opacity-80 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 1-Tap Trigger Button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {isProcessing ? (
              <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center justify-center text-center space-y-4">
                <div className="font-display text-6xl sm:text-7xl font-extrabold tracking-tight text-amber-400 tabular-nums">
                  {countdown}<span className="text-3xl text-amber-500/80">s</span>
                </div>
                <div className="text-sm font-semibold text-slate-300 animate-pulse-subtle">
                  {t('fpPreAuthorizing')}
                </div>
                <div className="w-56 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartFastPass}
                className="clay-btn clay-btn-saffron min-h-[48px] w-full py-3.5 text-base text-white font-extrabold shadow-xl"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>1-Tap Mint FastPass ({currentServiceObj.fee === 0 ? t('fpFREE') : formatINR(currentServiceObj.fee)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
