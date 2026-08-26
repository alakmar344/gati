'use client';

import React from 'react';
import { ShieldCheck, Truck, QrCode, Printer, Download, MapPin, CheckCircle2 } from 'lucide-react';
import { VehiclePermitApplication } from '@/lib/types';

interface DigitalPermitDocumentProps {
  data: VehiclePermitApplication;
}

export const DigitalPermitDocument: React.FC<DigitalPermitDocumentProps> = ({ data }) => {
  const permit = data.digitalPermitDocument || {
    permitNumber: 'AITP-DL-2026-90184-AUTH',
    vehicleNumber: data.vehicleRegNumber || 'DL 01 AA 9481',
    permitHolder: data.applicantName.toUpperCase(),
    permitType: data.permitCategory || 'ALL INDIA TOURIST PERMIT (AITP)',
    authorizedZones: data.routeCorridors && data.routeCorridors.length > 0 
      ? data.routeCorridors 
      : ['ALL STATES AND UNION TERRITORIES OF INDIA'],
    goodsOrPassengersAllowed: data.seatingOrPayload || 'PASSENGERS (COMMERCIAL TOURIST)',
    issueDate: '23-AUG-2026',
    expiryDate: '22-AUG-2031',
    authRto: `${data.rtoName}, ${data.state}`,
    qrData: `GATI-PERMIT:${data.referenceNumber}:${data.vehicleRegNumber}:VALID`
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Official Form 47 Permit Document Container */}
      <div 
        className="w-full rounded-3xl p-6 sm:p-8 bg-white text-olive-950 border-2 border-olive-200 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Subtle Watermark Stamp in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Truck className="w-96 h-96 text-olive-950" />
        </div>

        {/* Security Border Pattern */}
        <div className="border border-olive-600/30 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-olive-50/20 via-white to-ashoka-50/20">
          
          {/* Header */}
          <div className="text-center border-b-2 border-olive-200 pb-4 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-100 text-olive-800 text-[10px] font-bold tracking-wider uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FORM 47 • NATIONAL TRANSPORT PERMIT</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-olive-950 uppercase">
              {permit.permitType}
            </h2>
            <p className="text-xs text-olive-700 font-medium">
              Issued under Central Motor Vehicles Rules, 1989 (Rule 85-B)
            </p>
            <div className="mt-2 text-xs font-mono font-bold text-ashoka-700 bg-ashoka-50 py-1 px-3 rounded-md inline-block border border-ashoka-200">
              PERMIT NO: {permit.permitNumber}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-12 gap-3 text-xs">
            {/* Left side details */}
            <div className="col-span-8 space-y-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Permit Holder / Firm</span>
                <span className="font-bold text-sm text-olive-950">{permit.permitHolder}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Vehicle Regn No</span>
                  <span className="font-mono font-black text-xs text-olive-800 bg-olive-50 px-2 py-0.5 rounded border border-olive-200 inline-block">
                    {permit.vehicleNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Gross Weight / Seats</span>
                  <span className="font-semibold text-olive-900">
                    {data.grossVehicleWeightKg ? `${data.grossVehicleWeightKg} KG` : permit.goodsOrPassengersAllowed}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Authorized Corridors / States</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {permit.authorizedZones.map((z, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-olive-100 text-olive-800 px-2 py-0.5 rounded font-medium">
                      <MapPin className="w-2.5 h-2.5 text-olive-600" />
                      {z}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-olive-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Issue Date</span>
                  <span className="font-mono text-olive-800">{permit.issueDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-olive-700/70 block">Valid Upto</span>
                  <span className="font-mono font-bold text-olive-700">{permit.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Right side QR & Seal */}
            <div className="col-span-4 flex flex-col items-center justify-between border-l border-olive-200 pl-3">
              <div className="bg-white p-2 rounded-xl border border-olive-200 shadow-sm flex flex-col items-center">
                <QrCode className="w-16 h-16 text-olive-950" />
                <span className="text-[7px] font-mono font-bold text-olive-700 mt-1">
                  NATIONAL GATEWAY AUTH
                </span>
              </div>

              {/* Digital Seal */}
              <div className="text-center mt-2">
                <div className="w-12 h-12 mx-auto rounded-full border-2 border-olive-600 border-dashed flex items-center justify-center text-olive-700 bg-olive-50/50">
                  <CheckCircle2 className="w-6 h-6 text-olive-600" />
                </div>
                <span className="text-[8px] font-bold text-olive-800 uppercase block mt-1">
                  DIGITALLY CERTIFIED
                </span>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-4 pt-3 border-t border-olive-200 text-center">
            <span className="text-[9px] font-medium text-olive-500/80">
              DEMO • NOT AN OFFICIAL GOVERNMENT DOCUMENT • GATI MOBILITY OS HACKATHON PROTOTYPE
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-olive-50 border border-olive-200 text-olive-800 text-xs font-semibold shadow-sm transition-all hover:shadow"
        >
          <Printer className="w-4 h-4 text-olive-700/70" />
          <span>Print Permit</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-olive-700 hover:bg-olive-800 text-white text-xs font-semibold shadow-md shadow-olive-700/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Save Form 47 PDF</span>
        </button>
      </div>
    </div>
  );
};
