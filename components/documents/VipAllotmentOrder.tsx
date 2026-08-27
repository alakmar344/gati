'use client';

import React from 'react';
import { QrCode, Printer, Sparkles, CheckCircle } from 'lucide-react';
import { FancyNumberApplication } from '@/lib/types';
import { HsrpPlate } from '../plates/HsrpPlate';

interface VipAllotmentOrderProps {
  data: FancyNumberApplication;
}

export const VipAllotmentOrder: React.FC<VipAllotmentOrderProps> = ({ data }) => {
  const cert = data.allotmentCertificate || {
    allotmentId: 'ALLOT-GATI-2026-0007',
    allocatedNumber: data.selectedNumber.fullPlateText || 'MH 02 CZ 0007',
    series: data.selectedNumber.series || 'VIP SERIES',
    allotteeName: data.applicantName.toUpperCase(),
    rtoJurisdiction: `${data.rtoName}, ${data.state}`,
    allotmentDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    validityWindowDays: 90,
    receiptRef: data.payment?.transactionId || 'TXN-GATI-88391024',
    qrData: `GATI-VIP:${data.selectedNumber.fullPlateText}:${data.applicantName}:VALID_90_DAYS`
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Official Certificate Box */}
      <div 
        className="w-full rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border border-amber-500/40 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(245, 158, 11, 0.4)'
        }}
      >
        {/* Amber luxury glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center border-b border-amber-500/20 pb-4 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL CHOICE REGISTRATION ALLOTMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-amber-200">
            Certificate of Number Reservation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Issued by {cert.rtoJurisdiction}
          </p>
        </div>

        {/* Embossed Number Plate Showcase */}
        <div className="flex justify-center my-4">
          <HsrpPlate
            plateText={cert.allocatedNumber}
            vehicleType="luxury"
            size="lg"
            className="shadow-2xl scale-105 sm:scale-110"
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-12 gap-3 text-xs mt-6 bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="col-span-8 space-y-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Allottee Name</span>
              <span className="font-bold text-sm text-white">{cert.allotteeName}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Allotment Order ID</span>
                <span className="font-mono text-[11px] text-amber-300 font-bold">{cert.allotmentId}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Reservation Window</span>
                <span className="font-semibold text-emerald-400">{cert.validityWindowDays} Days Valid</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Payment Reference</span>
              <span className="font-mono text-[10px] text-slate-300">{cert.receiptRef}</span>
            </div>
          </div>

          <div className="col-span-4 flex flex-col items-center justify-center border-l border-white/10 pl-3">
            <div className="bg-white p-2 rounded-xl text-slate-950 flex flex-col items-center shadow">
              <QrCode className="w-14 h-14" />
              <span className="text-[6px] font-mono font-bold mt-1 text-slate-700">RTO ALLOT SEC</span>
            </div>
            <span className="text-[8px] text-emerald-400 flex items-center gap-1 mt-2 font-medium">
              <CheckCircle className="w-3 h-3" />
              Confirmed
            </span>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-4 pt-3 border-t border-white/10 text-center text-[8px] text-slate-500">
          DEMO • NOT AN OFFICIAL GOVERNMENT DOCUMENT • GATI MOBILITY OS
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
};
