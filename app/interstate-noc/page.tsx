'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  ArrowRight, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Printer, 
  Download, 
  Building, 
  ShieldCheck, 
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getCurrentUser } from '@/lib/storage';

export default function InterstateNocPage() {
  const currentUser = getCurrentUser();

  const [originState, setOriginState] = useState<'KA' | 'MH' | 'DL' | 'TN' | 'TS' | 'GJ'>('KA');
  const [destState, setDestState] = useState<'MH' | 'KA' | 'DL' | 'TN' | 'TS' | 'GJ'>('MH');
  const [vehicleAgeMonths, setVehicleAgeMonths] = useState<number>(24);
  const [invoiceValue, setInvoiceValue] = useState<number>(1600000);
  const [vehicleNumber, setVehicleNumber] = useState('KA 01 EK 4920');

  const [packetGenerated, setPacketGenerated] = useState(false);

  // State Tax Rates
  const stateTaxRates: Record<string, { name: string; rate: number }> = {
    'KA': { name: 'Karnataka', rate: 0.14 },
    'MH': { name: 'Maharashtra', rate: 0.12 },
    'DL': { name: 'Delhi NCR', rate: 0.10 },
    'TN': { name: 'Tamil Nadu', rate: 0.12 },
    'TS': { name: 'Telangana', rate: 0.13 },
    'GJ': { name: 'Gujarat', rate: 0.08 }
  };

  // Computations
  const originalTaxRate = stateTaxRates[originState].rate;
  const originalTaxPaid = Math.round(invoiceValue * originalTaxRate);

  // Depreciation: 7% per year
  const depreciationFactor = Math.max(0.2, 1 - (vehicleAgeMonths / 12) * 0.07);
  const depreciatedVehicleValue = Math.round(invoiceValue * depreciationFactor);

  // Pro-rata refund from origin state (15 year base lifespan)
  const remainingMonths = Math.max(0, 180 - vehicleAgeMonths);
  const refundFromOriginState = Math.round((originalTaxPaid * remainingMonths) / 180);

  // New tax payable in destination state
  const destTaxRate = stateTaxRates[destState].rate;
  const newTaxPayable = Math.round(depreciatedVehicleValue * destTaxRate);

  const netDifferential = newTaxPayable - refundFromOriginState;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Interstate Relocation & Tax Refund Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Interstate NOC & Tax Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Calculate pro-rata road tax refunds from your origin state and auto-generate Form 28 (NOC) packets in 1 click.
        </p>
      </div>

      {/* Main Interactive Calculator Form */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/80 shadow-xl space-y-8">
        
        {/* State Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Origin State (Current Registration)</label>
            <select
              value={originState}
              onChange={(e) => setOriginState(e.target.value as any)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
            >
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Destination State (Relocation Target)</label>
            <select
              value={destState}
              onChange={(e) => setDestState(e.target.value as any)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900"
            >
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Age in Months</label>
            <input
              type="number"
              value={vehicleAgeMonths}
              onChange={(e) => setVehicleAgeMonths(Number(e.target.value))}
              min={1}
              max={160}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Original Invoice Value (₹)</label>
            <input
              type="number"
              value={invoiceValue}
              onChange={(e) => setInvoiceValue(Number(e.target.value))}
              step={50000}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-medium text-slate-900 font-mono"
            />
          </div>
        </div>

        {/* Calculation Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          
          {/* Card 1: Refund Claimable */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                Refund from {stateTaxRates[originState].name} RTO
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {formatINR(refundFromOriginState)}
              </div>
            </div>
            <p className="text-[10px] text-emerald-800 mt-2">
              Pro-rata refund for {remainingMonths} remaining unexpired months.
            </p>
          </div>

          {/* Card 2: New Tax Payable */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                New Tax in {stateTaxRates[destState].name}
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {formatINR(newTaxPayable)}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Based on depreciated vehicle valuation ({formatINR(depreciatedVehicleValue)}).
            </p>
          </div>

          {/* Card 3: Net Cash Differential */}
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-800 block">
                Net Out-of-Pocket Balance
              </span>
              <div className={`text-2xl font-black font-mono mt-1 ${netDifferential > 0 ? 'text-sky-900' : 'text-emerald-700'}`}>
                {formatINR(Math.abs(netDifferential))} {netDifferential > 0 ? 'Payable' : 'Cashback Surplus'}
              </div>
            </div>
            <p className="text-[10px] text-sky-800 mt-2">
              Calculated under Section 47 of Motor Vehicles Act 1988.
            </p>
          </div>

        </div>

        {/* Generate NOC Packet Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Auto-generates official <strong>Form 27 (Re-Registration)</strong> and <strong>Form 28 (No-Objection Certificate)</strong>.
          </div>

          <button
            type="button"
            onClick={() => setPacketGenerated(true)}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-all shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Generate Official Form 28 NOC Packet</span>
          </button>
        </div>

      </div>

      {/* Generated NOC Packet Modal / Preview */}
      {packetGenerated && (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/80 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Form 28 NOC & Tax Refund Dossier Ready
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              DOSSIER ID: GATI-NOC-{originState}-{destState}-2026-9810
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 text-xs space-y-3 text-slate-700">
            <div className="flex justify-between border-b pb-2">
              <span className="font-bold">Form 28 No-Objection Certificate (NOC)</span>
              <span className="text-emerald-700 font-bold">DIGITALLY SIGNED</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Vehicle Registration:</span>
              <span className="font-mono font-bold text-slate-900">{vehicleNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Origin State RTO:</span>
              <span className="font-semibold text-slate-900">{stateTaxRates[originState].name} RTO</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span>Target RTO Jurisdiction:</span>
              <span className="font-semibold text-slate-900">{stateTaxRates[destState].name} RTO</span>
            </div>
            <div className="flex justify-between">
              <span>Pro-Rata Road Tax Refund Claim Form:</span>
              <span className="font-mono font-bold text-emerald-700">{formatINR(refundFromOriginState)} Attached</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-xs font-semibold">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print NOC Packet</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Form 28 PDF</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
