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
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

export default function InterstateNocPage() {
  const currentUser = getCurrentUser();
  const { toast } = useToast();

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

  const handleGeneratePacket = () => {
    setPacketGenerated(true);
    toast({
      title: 'Form 28 NOC dossier generated',
      description: `Refund claim of ${formatINR(refundFromOriginState)} attached and digitally signed.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow="Interstate Relocation & Tax Refund Engine"
        icon={<Compass className="w-3.5 h-3.5" />}
        title="Interstate NOC & Tax Calculator"
        subtitle="Calculate pro-rata road tax refunds from your origin state and auto-generate Form 28 (NOC) packets in one click."
      />

      {/* Main Interactive Calculator Form */}
      <div className="card p-6 sm:p-8 space-y-8 animate-rise">

        {/* Journey: Origin → Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-4">
          <div>
            <label className="eyebrow text-teal-700 block mb-1.5">Origin State (Current Registration)</label>
            <select
              value={originState}
              onChange={(e) => setOriginState(e.target.value as any)}
              className="field w-full"
            >
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center justify-center pb-2.5 text-teal-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          <div>
            <label className="eyebrow text-teal-700 block mb-1.5">Destination State (Relocation Target)</label>
            <select
              value={destState}
              onChange={(e) => setDestState(e.target.value as any)}
              className="field w-full"
            >
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-slate-500 block mb-1.5">Vehicle Age in Months</label>
            <input
              type="number"
              value={vehicleAgeMonths}
              onChange={(e) => setVehicleAgeMonths(Number(e.target.value))}
              min={1}
              max={160}
              className="field w-full font-mono"
            />
          </div>

          <div>
            <label className="eyebrow text-slate-500 block mb-1.5">Original Invoice Value (₹)</label>
            <input
              type="number"
              value={invoiceValue}
              onChange={(e) => setInvoiceValue(Number(e.target.value))}
              step={50000}
              className="field w-full font-mono"
            />
          </div>
        </div>

        <div className="hairline" />

        {/* Money Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Refund Claimable */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-emerald-800 block">
                Refund from {stateTaxRates[originState].name} RTO
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-emerald-700 mt-1.5">
                {formatINR(refundFromOriginState)}
              </div>
            </div>
            <p className="text-[11px] text-emerald-800/90 mt-3 leading-relaxed">
              Pro-rata refund for {remainingMonths} remaining unexpired months.
            </p>
          </div>

          {/* New Tax Payable */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-slate-500 block">
                New Tax in {stateTaxRates[destState].name}
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-slate-900 mt-1.5">
                {formatINR(newTaxPayable)}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              Based on depreciated vehicle valuation ({formatINR(depreciatedVehicleValue)}).
            </p>
          </div>

          {/* Net Cash Differential */}
          <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-teal-800 block">
                Net Out-of-Pocket Balance
              </span>
              <div className={`text-2xl font-display font-extrabold tracking-tight mt-1.5 ${netDifferential > 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                {formatINR(Math.abs(netDifferential))}
              </div>
              <span className={`text-[11px] font-bold ${netDifferential > 0 ? 'text-slate-500' : 'text-emerald-700'}`}>
                {netDifferential > 0 ? 'Payable' : 'Cashback Surplus'}
              </span>
            </div>
            <p className="text-[11px] text-teal-800/90 mt-3 leading-relaxed">
              Calculated under Section 47 of Motor Vehicles Act 1988.
            </p>
          </div>

        </div>

        {/* Generate NOC Packet */}
        <div className="hairline" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
            Auto-generates official <strong className="text-slate-700">Form 27 (Re-Registration)</strong> and <strong className="text-slate-700">Form 28 (No-Objection Certificate)</strong>.
          </div>

          <button
            type="button"
            onClick={handleGeneratePacket}
            className="btn btn-brand w-full sm:w-auto shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official Form 28 NOC Packet</span>
          </button>
        </div>

      </div>

      {/* Generated NOC Packet Preview */}
      {packetGenerated && (
        <div className="card p-6 sm:p-8 space-y-6 animate-rise">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-900">
              Form 28 NOC & Tax Refund Dossier Ready
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              DOSSIER ID: GATI-NOC-{originState}-{destState}-2026-9810
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 text-xs space-y-3 text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900">Form 28 No-Objection Certificate (NOC)</span>
              <Pill tone="emerald">Digitally Signed</Pill>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span>Vehicle Registration</span>
              <span className="font-mono font-bold text-slate-900">{vehicleNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span>Origin State RTO</span>
              <span className="font-semibold text-slate-900">{stateTaxRates[originState].name} RTO</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span>Target RTO Jurisdiction</span>
              <span className="font-semibold text-slate-900">{stateTaxRates[destState].name} RTO</span>
            </div>
            <div className="flex justify-between">
              <span>Pro-Rata Road Tax Refund Claim</span>
              <span className="font-mono font-bold text-emerald-700">{formatINR(refundFromOriginState)} Attached</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={() => window.print()}
              className="btn btn-ghost w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print NOC Packet</span>
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-primary w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download Form 28 PDF</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
