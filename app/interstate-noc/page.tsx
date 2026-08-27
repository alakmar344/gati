'use client';

import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  CheckCircle,
  FileText,
  Printer,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { Field, TextInput, MoneyInput, SelectInput, VerifiedChip, amountInWords } from '@/components/ui/Form';
import { useLanguage } from '@/lib/i18n';

export default function InterstateNocPage() {
  const { toast } = useToast();
  const { t } = useLanguage();

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
      title: t('nocToastGenerated'),
      description: `${t('nocToastDesc')} ${formatINR(refundFromOriginState)}`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow={t('nocEyebrow')}
        icon={<Compass className="w-3.5 h-3.5" />}
        title={t('nocTitle')}
        subtitle={t('nocSubtitle')}
      />

      {/* Main Interactive Calculator Form */}
      <div className="card p-6 sm:p-8 space-y-8 animate-rise">

        {/* Journey: Origin → Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-start gap-4">
          <Field
            label={t('nocOriginState')}
            adornment="Current registration"
            hint={t('nocOriginStateHint')}
          >
            <SelectInput value={originState} onValue={(v) => setOriginState(v as any)}>
              {Object.entries(stateTaxRates).map(([k, v]) => (
                <option key={k} value={k}>{v.name} ({k}) — {(v.rate * 100).toFixed(0)}% Tax</option>
              ))}
            </SelectInput>
          </Field>

          <div className="hidden sm:flex items-center justify-center pt-9 text-emerald-600 dark:text-emerald-400">
            <ArrowRight className="w-5 h-5" />
          </div>

          <Field
            label={t('nocDestState')}
            adornment="Relocation target"
            hint={t('nocDestStateHint')}
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
            label={t('nocVehicleReg')}
            adornment={<VerifiedChip label="From profile" />}
            hint={t('nocVehicleRegHint')}
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
            label={t('nocVehicleAge')}
            adornment="Months"
            hint={t('nocVehicleAgeHint')}
          >
            <TextInput
              value={vehicleAgeMonths ? String(vehicleAgeMonths) : ''}
              onValue={(v) => setVehicleAgeMonths(Number(v.replace(/[^0-9]/g, '')) || 0)}
              inputMode="numeric"
              mono
              suffix={<span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 pr-1">mo</span>}
              placeholder="24"
            />
          </Field>

          <Field
            label={t('nocInvoiceValue')}
            className="sm:col-span-2"
            hint={amountInWords(invoiceValue)
              ? amountInWords(invoiceValue).charAt(0).toUpperCase() + amountInWords(invoiceValue).slice(1)
              : t('nocInvoiceValueHint')}
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
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-emerald-800 dark:text-emerald-300 block">
                {t('nocRefundFrom')} {stateTaxRates[originState].name} {t('nocRTO')}
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mt-1.5">
                {formatINR(refundFromOriginState)}
              </div>
            </div>
            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 mt-3 leading-relaxed">
              {t('nocProRataRefund')} {remainingMonths} {t('nocRemainingMonths')}
            </p>
          </div>

          {/* New Tax Payable */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-slate-500 dark:text-slate-400 block">
                {t('nocNewTax')} {stateTaxRates[destState].name}
              </span>
              <div className="text-2xl font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-1.5">
                {formatINR(newTaxPayable)}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              {t('nocBasedOnDepreciated')} ({formatINR(depreciatedVehicleValue)}).
            </p>
          </div>

          {/* Net Cash Differential */}
          <div className="p-5 rounded-2xl bg-olive-50 dark:bg-olive-900/25 border border-olive-200 dark:border-olive-800/60 flex flex-col justify-between">
            <div>
              <span className="eyebrow text-olive-800 dark:text-olive-300 block">
                {t('nocNetBalance')}
              </span>
              <div className={`text-2xl font-display font-extrabold tracking-tight mt-1.5 ${netDifferential > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {formatINR(Math.abs(netDifferential))}
              </div>
              <span className={`text-[11px] font-bold ${netDifferential > 0 ? 'text-slate-500 dark:text-slate-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {netDifferential > 0 ? t('nocPayable') : t('nocCashbackSurplus')}
              </span>
            </div>
            <p className="text-[11px] text-olive-800/90 dark:text-olive-300/90 mt-3 leading-relaxed">
              {t('nocSection47')}
            </p>
          </div>

        </div>

        {/* Generate NOC Packet */}
        <div className="hairline" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t('nocForm27Form28')}
          </div>

          <button
            type="button"
            onClick={handleGeneratePacket}
            className="btn btn-brand w-full sm:w-auto shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>{t('nocGenerateNOC')}</span>
          </button>
        </div>

      </div>

      {/* Generated NOC Packet Preview */}
      {packetGenerated && (
        <div className="card p-6 sm:p-8 space-y-6 animate-rise">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {t('nocNOCDossierReady')}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
              {t('nocDossierID')} GATI-NOC-{originState}-{destState}-2026-9810
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-slate-900 dark:text-slate-100">{t('nocForm28NOC')}</span>
              <Pill tone="emerald">{t('nocDigitallySigned')}</Pill>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>{t('nocVehicleRegLabel')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{vehicleNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>{t('nocOriginRTOLabel')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stateTaxRates[originState].name} RTO</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>{t('nocTargetRTOLabel')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{stateTaxRates[destState].name} RTO</span>
            </div>
            <div className="flex justify-between">
              <span>{t('nocProRataRefundLabel')}</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatINR(refundFromOriginState)} Attached</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => window.print()}
              className="btn btn-primary w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{t('nocPrintSave')}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
