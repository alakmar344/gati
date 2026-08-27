'use client';

import React, { useState } from 'react';
import { Shield, RotateCw, Heart, QrCode, Cpu, Printer, CheckCircle } from 'lucide-react';
import { DriverLicenceApplication } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

interface DigitalDrivingLicenceCardProps {
  data: DriverLicenceApplication;
}

export const DigitalDrivingLicenceCard: React.FC<DigitalDrivingLicenceCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useLanguage();

  const dl = data.digitalLicenceCard || {
    dlNumber: 'MH 12 2026 0094821',
    holderName: data.applicantName.toUpperCase(),
    fatherName: `${data.applicantName.trim().split(/\s+/).slice(-1)[0].toUpperCase()} (GUARDIAN)`,
    dob: '14-MAY-2002',
    bloodGroup: data.bloodGroup || 'O+ve',
    validFrom: '25-AUG-2026',
    validTill: '24-AUG-2046',
    allowedVehicles: data.vehicleClasses && data.vehicleClasses.length > 0 
      ? data.vehicleClasses.map(c => c.split(' ')[0]) 
      : ['MCWG', 'LMV'],
    rtoAuthority: `${data.rtoName}, ${data.state}`,
    organDonor: data.organDonor !== false,
    chipSerial: 'IND-DL-948210-2026',
    qrData: `GATI-DL:${data.referenceNumber}:${data.applicantName}:VALID`
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Flip Prompt */}
      <div className="flex items-center justify-between w-full px-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          <CheckCircle className="w-3.5 h-3.5" />
          {t('ddVerifiedPVC')}
        </span>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{t('ddClickFlip')} ({t('ddSide')} {isFlipped ? '2' : '1'} {t('ddOf')} 2)</span>
        </button>
      </div>

      {/* 3D Flip Container */}
      <div 
        className="w-full aspect-[1.586/1] perspective-1000 cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-7 backface-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between"
            style={{
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            }}
          >
            {/* Holographic Watermark pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-sky-500/15 blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between relative z-10 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                    {t('ddUnionDL')}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    {dl.rtoAuthority}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-wider text-slate-400">{t('ddClassCOV')}</div>
                <div className="flex gap-1 mt-0.5">
                  {dl.allowedVehicles.map((v, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[9px] font-bold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Section: Photo / Chip / DL Number */}
            <div className="flex items-center justify-between gap-4 relative z-10 my-1">
              {/* Photo Avatar Frame */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-white/30 p-0.5 shadow-md flex flex-col items-center justify-center text-center overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-sky-500/30 flex items-center justify-center font-bold text-base text-sky-200 mb-1">
                    {dl.holderName.slice(0, 2)}
                  </div>
                  <span className="text-[7px] text-slate-300 font-mono uppercase tracking-tighter">
                    {t('ddPhotoID')}
                  </span>
                </div>

                {/* Smart Chip */}
                <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-yellow-300 p-1 shadow-md border border-amber-500/60 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-amber-950" />
                </div>
              </div>

              {/* Main DL Number */}
              <div className="text-right">
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">{t('ddLicenceNumber')}</div>
                <div className="text-sm sm:text-lg font-mono font-black text-amber-400 tracking-wider">
                  {dl.dlNumber}
                </div>
                <div className="text-[9px] text-emerald-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{t('ddActiveValid')}</span>
                </div>
              </div>
            </div>

            {/* Bottom details */}
            <div className="grid grid-cols-12 gap-2 text-xs relative z-10 border-t border-white/10 pt-2">
              <div className="col-span-7">
                <div className="text-[8px] uppercase tracking-wider text-slate-400">{t('ddNameHolder')}</div>
                <div className="font-bold text-xs sm:text-sm text-white truncate">{dl.holderName}</div>
                <div className="text-[8px] text-slate-300 mt-0.5">{t('ddDOB')}: {dl.dob} • {t('ddBG')}: <span className="text-amber-300 font-bold">{dl.bloodGroup}</span></div>
              </div>
              <div className="col-span-5 text-right">
                <div className="text-[8px] uppercase tracking-wider text-slate-400">{t('ddValidityNT')}</div>
                <div className="font-mono text-[10px] sm:text-xs font-bold text-emerald-400">{dl.validTill}</div>
                {dl.organDonor && (
                  <div className="inline-flex items-center gap-1 text-[8px] text-rose-300 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/30 mt-0.5">
                    <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                    <span>{t('ddOrganDonor')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[7px] text-white/40 text-center uppercase tracking-wider pt-0.5">
              {t('ddDemoDisclaimer')}
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-7 backface-hidden rotate-y-180 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] text-white border border-white/20 shadow-2xl overflow-hidden flex flex-col justify-between"
            style={{
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
            }}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-9 bg-slate-950 -mx-7 px-7 flex items-center justify-between border-y border-slate-800">
              <span className="text-[7px] font-mono text-slate-500 tracking-widest">
                /// {t('ddEncryptedChip')} ///
              </span>
            </div>

            {/* Address & Endorsements */}
            <div className="grid grid-cols-12 gap-3 text-xs my-auto">
              <div className="col-span-8 space-y-1">
                <div>
                  <div className="text-[8px] uppercase tracking-wider text-slate-400">{t('ddPermanentAddress')}</div>
                  <div className="text-[10px] text-slate-200 leading-snug">
                    Flat 402, Green Valley Enclave, Bavdhan, Pune, Maharashtra - 411021
                  </div>
                </div>
                <div className="pt-1">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400">{t('ddAuthIssuingOfficer')}</div>
                  <div className="text-[10px] font-serif text-slate-300 italic">
                    RTO Licensing Authority, Pune
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="col-span-4 flex flex-col items-center justify-center bg-white rounded-xl p-1.5 text-slate-950">
                <QrCode className="w-14 h-14" />
                <span className="text-[6px] font-mono font-bold tracking-tighter text-slate-800">
                  {t('ddScanForAuth')}
                </span>
              </div>
            </div>

            {/* Micro-print barcode & disclaimer */}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[8px] text-slate-400">
              <span className="font-mono">{dl.chipSerial}</span>
              <span className="text-amber-400 font-semibold">{t('ddGatiDemoLicence')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{t('ddPrintSave')}</span>
        </button>
      </div>
    </div>
  );
};
