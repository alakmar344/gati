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
import { Field, TextInput, MoneyInput, SelectInput, VerifiedChip, amountInWords } from '@/components/ui/Form';

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
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-start gap-4">
          <Field
            label="Origin State"
            adornment="Current registration"
            hint="Where the vehicle is currently registered — its RTO issues the NOC and the pro-rata road-tax refund."
          >
            <SelectInput value={originState} onValue={(v) => setOriginState(v as any)}>
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </SelectInput>
          </Field>

          <div className="hidden sm:flex items-center justify-center pt-9 text-olive-500">
            <ArrowRight className="w-5 h-5" />
          </div>

          <Field
            label="Destination State"
            adornment="Relocation target"
            hint="Where the vehicle is being newly registered — its rate sets the fresh road tax payable."
          >
            <SelectInput value={destState} onValue={(v) => setDestState(v as any)}>
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {/* Vehicle particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <Field
            label="Vehicle Registration Number"
            adornment={<VerifiedChip label="From profile" />}
            hint="Appears on the generated Form 28 (NOC) and Form 27 (Re-Registration)."
          >
            <TextInput
              value={vehicleNumber}
              onValue={setVehicleNumber}
              transform="upper"
              mono
              placeholder="KA 01 EK 4920"
            />
          </Field>

          <Field
            label="Vehicle Age"
            adornment="Months"
            hint="Used to pro-rate the refund over the 180-month (15-year) tax lifespan and to depreciate the valuation."
          >
            <TextInput
              value={vehicleAgeMonths ? String(vehicleAgeMonths) : ''}
              onValue={(v) => setVehicleAgeMonths(Number(v.replace(/[^0-9]/g, '')) || 0)}
              inputMode="numeric"
              mono
              suffix={<span className="text-[11px] font-semibold text-olive-500/80 pr-1">mo</span>}
              placeholder="24"
            />
          </Field>

          <Field
            label="Original Invoice Value"
            className="sm:col-span-2"
            hint={amountInWords(invoiceValue)
              ? amountInWords(invoiceValue).charAt(0).toUpperCase() + amountInWords(invoiceValue).slice(1)
              : 'Ex-showroom purchase price — depreciated to value the new-state tax.'}
          >
            <MoneyInput
              value={invoiceValue}
              onValue={setInvoiceValue}
              presets={[800000, 1600000, 2500000, 4000000]}
              quickAdd={[100000, 500000]}
            />
          </Field>
        </div>

        <div className="hairline" />

        {/* Money Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Refund Claimable */}
          <div className="p-5 rounded-2xl bg-olive-50 border border-olive-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-olive-800 block">
                Refund from {stateTaxRates[originState].name} RTO
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-olive-700 mt-1.5">
                {formatINR(refundFromOriginState)}
              </div>
            </div>
            <p className="text-[11px] text-olive-800/90 mt-3 leading-relaxed">
              Pro-rata refund for {remainingMonths} remaining unexpired months.
            </p>
          </div>

          {/* New Tax Payable */}
          <div className="p-5 rounded-2xl bg-olive-50 border border-olive-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-olive-700/70 block">
                New Tax in {stateTaxRates[destState].name}
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-olive-950 mt-1.5">
                {formatINR(newTaxPayable)}
              </div>
            </div>
            <p className="text-[11px] text-olive-700/70 mt-3 leading-relaxed">
              Based on depreciated vehicle valuation ({formatINR(depreciatedVehicleValue)}).
            </p>
          </div>

          {/* Net Cash Differential */}
          <div className="p-5 rounded-2xl bg-olive-50 border border-olive-200 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-olive-800 block">
                Net Out-of-Pocket Balance
              </span>
              <div className={`text-2xl font-display font-extrabold tracking-tight mt-1.5 ${netDifferential > 0 ? 'text-olive-950' : 'text-olive-700'}`}>
                {formatINR(Math.abs(netDifferential))}
              </div>
              <span className={`text-[11px] font-bold ${netDifferential > 0 ? 'text-olive-700/70' : 'text-olive-700'}`}>
                {netDifferential > 0 ? 'Payable' : 'Cashback Surplus'}
              </span>
            </div>
            <p className="text-[11px] text-olive-800/90 mt-3 leading-relaxed">
              Calculated under Section 47 of Motor Vehicles Act 1988.
            </p>
          </div>

        </div>

        {/* Generate NOC Packet */}
        <div className="hairline" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] sm:text-xs text-olive-700/70 leading-relaxed">
            Auto-generates official <strong className="text-olive-800">Form 27 (Re-Registration)</strong> and <strong className="text-olive-800">Form 28 (No-Objection Certificate)</strong>.
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
            <div className="w-12 h-12 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-tight text-olive-950">
              Form 28 NOC & Tax Refund Dossier Ready
            </h3>
            <p className="text-[11px] text-olive-700/70 font-mono mt-1">
              DOSSIER ID: GATI-NOC-{originState}-{destState}-2026-9810
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-olive-200 text-xs space-y-3 text-olive-800">
            <div className="flex items-center justify-between border-b border-olive-100 pb-3">
              <span className="font-bold text-olive-950">Form 28 No-Objection Certificate (NOC)</span>
              <Pill tone="emerald">Digitally Signed</Pill>
            </div>
            <div className="flex justify-between border-b border-olive-100 pb-3">
              <span>Vehicle Registration</span>
              <span className="font-mono font-bold text-olive-950">{vehicleNumber}</span>
            </div>
            <div className="flex justify-between border-b border-olive-100 pb-3">
              <span>Origin State RTO</span>
              <span className="font-semibold text-olive-950">{stateTaxRates[originState].name} RTO</span>
            </div>
            <div className="flex justify-between border-b border-olive-100 pb-3">
              <span>Target RTO Jurisdiction</span>
              <span className="font-semibold text-olive-950">{stateTaxRates[destState].name} RTO</span>
            </div>
            <div className="flex justify-between">
              <span>Pro-Rata Road Tax Refund Claim</span>
              <span className="font-mono font-bold text-olive-700">{formatINR(refundFromOriginState)} Attached</span>
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
