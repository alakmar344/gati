'use client';

import React from 'react';
import { QrCode, Cpu, ShieldCheck, Printer } from 'lucide-react';
import { VehicleLicensingData } from '@/lib/types';

interface DigitalRcSmartCardProps {
  data: VehicleLicensingData;
  onPrint?: () => void;
}

export const DigitalRcSmartCard: React.FC<DigitalRcSmartCardProps> = ({ data, onPrint }) => {
  const isEV = data.fuelType === 'Electric';
  const rc = data.digitalRcCard || {
    rcNumber: data.registrationNumberAssigned || 'KA 01 EK 4920',
    ownerName: data.applicantName.toUpperCase(),
    fatherName: `${data.applicantName.trim().split(/\s+/).slice(-1)[0].toUpperCase()} (GUARDIAN)`,
    address: `${data.rtoName}, ${data.state}`,
    modelName: `${data.maker} ${data.model}`,
    cubicCapacityOrKw: isEV ? '106.4 kW (EV)' : '1498 CC',
    seatingCapacity: 5,
    color: 'Glacier White',
    issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    validUpto: 'AUG 2041',
    financer: 'HDFC AUTO FINANCE',
    chipUid: 'IND-KA01-2026-948102',
    qrData: `GATI-RC:${data.registrationNumberAssigned || 'KA01EK4920'}:${data.applicantName}:VALID`
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      {/* Smart Card Container */}
      <div 
        className={`w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-2xl transition-all duration-300 border ${
          isEV 
            ? 'bg-gradient-to-br from-[#1b3419] via-[#2b4c27] to-[#1e391b] text-white border-olive-400/40 shadow-olive-950/20' 
            : 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white border-white/20 shadow-slate-900/30'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Subtle Background Security Guilloche Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-olive-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-ashoka-400/10 blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-start justify-between relative z-10 border-b border-white/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-olive-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-olive-300 uppercase flex items-center gap-1.5">
                <span>CERTIFICATE OF REGISTRATION</span>
                {isEV && (
                  <span className="px-1.5 py-0.5 rounded-full bg-olive-400/20 text-olive-200 text-[8px] font-bold">
                    ZERO EMISSION EV
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold tracking-tight text-white/90">
                {data.rtoName} • {data.state}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-slate-400">SMART CARD UID</div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-ashoka-300">{rc.chipUid}</div>
          </div>
        </div>

        {/* Chip & Main Registration Number Banner */}
        <div className="flex items-center justify-between my-3 sm:my-4 relative z-10">
          {/* Smart Card Contact Chip */}
          <div className="w-11 h-9 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 p-1 shadow-md border border-amber-500/50 flex flex-col justify-between relative">
            <div className="w-full h-[1px] bg-amber-700/40" />
            <div className="flex justify-between items-center px-0.5">
              <Cpu className="w-4 h-4 text-amber-900/80" />
              <div className="w-2 h-2 rounded-full border border-amber-800/40" />
            </div>
            <div className="w-full h-[1px] bg-amber-700/40" />
          </div>

          {/* Registration Number Pill */}
          <div className="px-4 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-inner">
            <span className="text-xs text-slate-300 mr-2 uppercase tracking-wider">REGN NO:</span>
            <span className="text-base sm:text-xl font-mono font-black tracking-widest text-white">
              {rc.rcNumber}
            </span>
          </div>
        </div>

        {/* Vehicle & Owner Details Grid */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 text-xs relative z-10">
          <div className="col-span-8 space-y-1">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-300">Registered Owner</div>
              <div className="font-bold text-sm tracking-wide text-white truncate">{rc.ownerName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-300">Make / Model</div>
                <div className="font-semibold text-[11px] text-slate-100 truncate">{rc.modelName}</div>
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-300">Fuel & Power</div>
                <div className="font-semibold text-[11px] text-emerald-300 truncate">
                  {data.fuelType} ({rc.cubicCapacityOrKw})
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-300">Issue Date</div>
                <div className="font-mono text-[10px] text-slate-200">{rc.issueDate}</div>
              </div>
              <div>
                <div className="text-[8px] uppercase tracking-wider text-slate-300">Valid Upto</div>
                <div className="font-mono text-[10px] text-emerald-300 font-bold">{rc.validUpto}</div>
              </div>
            </div>
          </div>

          {/* QR Code & Security Stamp */}
          <div className="col-span-4 flex flex-col items-center justify-center bg-white/90 rounded-2xl p-2 text-slate-900 shadow-inner">
            <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-slate-900" />
            <span className="text-[8px] font-mono font-bold text-slate-700 tracking-tighter mt-1">
              DIGITAL VERIFIED
            </span>
          </div>
        </div>

        {/* Footer Hackathon Disclaimer Strip */}
        <div className="absolute bottom-2 left-6 right-6 flex items-center justify-between text-[8px] text-white/50 border-t border-white/10 pt-1.5">
          <span>FORM 23 • CMVR 1989 COMPLIANT SPECIFICATION</span>
          <span className="font-semibold text-emerald-300">DEMO • NOT AN OFFICIAL GOVERNMENT DOCUMENT</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
};
