'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle,
  Plus,
  Navigation,
  Clock,
  ShieldCheck,
  Route,
  Receipt,
} from 'lucide-react';
import { FastagAccount } from '@/lib/types';
import { getFastagAccount, topupFastagWallet } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { MOCK_EXPRESSWAY_ROUTES } from '@/lib/mockData';
import { SectionHeading, Pill, Skeleton } from '@/components/ui/Primitives';
import { useToast, useMounted } from '@/components/ui/Toast';

const LOW_BALANCE_THRESHOLD = 300;

export default function FastagPage() {
  const [fastag, setFastag] = useState<FastagAccount>(getFastagAccount());
  const [selectedRoute, setSelectedRoute] = useState(MOCK_EXPRESSWAY_ROUTES[0]);
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const mounted = useMounted();
  const { toast } = useToast();

  const loadData = () => {
    setFastag(getFastagAccount());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('gati_fastag_updated', loadData);
    return () => window.removeEventListener('gati_fastag_updated', loadData);
  }, []);

  const handleTopup = () => {
    setIsToppingUp(true);
    setTimeout(() => {
      const updated = topupFastagWallet(topupAmount);
      setFastag(updated);
      setIsToppingUp(false);
      setRechargeSuccess(true);
      toast({
        title: 'Wallet recharged',
        description: `${formatINR(topupAmount)} credited — new balance ${formatINR(updated.walletBalance)}.`,
        variant: 'success',
      });
      setTimeout(() => setRechargeSuccess(false), 3000);
    }, 1000);
  };

  const lowBalance =
    fastag.status === 'LOW_BALANCE' || fastag.walletBalance < LOW_BALANCE_THRESHOLD;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow="NETC National Electronic Toll Autopilot"
        icon={<Radio className="w-3.5 h-3.5 animate-pulse" />}
        title="FASTag Autopilot & Expressway Toll Hub"
        subtitle="Real-time balance telemetry, zero-surcharge instant recharges, and expressway toll route calculators."
      />

      {/* Balance hero + quick recharge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-rise">

        {/* Live wallet balance — hero card */}
        <div className="md:col-span-7 relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-sky-300 block tracking-wider">
                  {fastag.issuingBank}
                </span>
                <span className="font-mono text-sm font-bold text-slate-200">
                  {fastag.vehicleNumber}
                </span>
              </div>
            </div>
            <Pill tone={lowBalance ? 'amber' : 'emerald'} className="bg-white/10 border-white/15 text-white">
              {lowBalance ? 'LOW BALANCE' : 'ACTIVE NETC'}
            </Pill>
          </div>

          <div>
            <span className="eyebrow text-slate-400">Available Wallet Balance</span>
            {mounted ? (
              <div
                className={`font-display text-5xl sm:text-6xl font-extrabold tracking-tight mt-2 ${
                  lowBalance ? 'text-amber-300' : 'text-emerald-400'
                }`}
              >
                {formatINR(fastag.walletBalance)}
              </div>
            ) : (
              <Skeleton className="h-14 w-52 mt-2 rounded-2xl bg-white/10" />
            )}

            <div className="mt-3">
              {lowBalance ? (
                <Pill tone="rose">Top up now to avoid toll-lane declines</Pill>
              ) : (
                <span className="text-[12px] text-slate-400 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Low-Balance Expressway Shield Active
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-white/10">
            RFID EPC: {fastag.tagId}
          </div>
        </div>

        {/* Quick recharge */}
        <div className="md:col-span-5 card p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div>
            <span className="eyebrow text-emerald-700">Instant 1-Tap Top-up</span>
            <h3 className="font-display text-lg font-extrabold tracking-tight text-slate-900 mt-1.5">
              Recharge without convenience fee
            </h3>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
              Direct NPCI settlement ensures immediate balance reflection at all toll plazas nationwide.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmount(amt)}
                className={`py-3 rounded-2xl border text-[13px] font-bold font-mono transition-all ${
                  topupAmount === amt
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                +{formatINR(amt)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleTopup}
            disabled={isToppingUp}
            className="btn btn-primary w-full py-3.5 text-sm disabled:opacity-50"
          >
            {rechargeSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Wallet credited!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{isToppingUp ? 'Crediting Wallet…' : `Recharge ${formatINR(topupAmount)}`}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Expressway toll calculator */}
      <section className="card p-6 sm:p-8 space-y-6 animate-rise">
        <div>
          <span className="eyebrow text-sky-700 inline-flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5" />
            Expressway Cost & Route Engine
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1.5">
            Interactive Expressway Toll Calculator
          </h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
            Select any major Indian expressway to calculate toll budget, distance, and FASTag savings.
          </p>
        </div>

        {/* Route selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {MOCK_EXPRESSWAY_ROUTES.map((route) => {
            const isSelected = selectedRoute.name === route.name;
            return (
              <button
                key={route.name}
                type="button"
                onClick={() => setSelectedRoute(route)}
                className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-[13px] text-slate-900 mb-1.5">{route.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{route.distanceKm} KM</span>
                    <span className="hairline w-px h-3 bg-slate-300" />
                    <span>{route.typicalTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Pill tone="emerald">{route.fastagDiscountPercent}% FASTag CashPass</Pill>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {formatINR(route.totalTollCost)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected route result summary */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-900 text-sm">{selectedRoute.name}</span>
            <Pill tone="sky">Selected route</Pill>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <span className="eyebrow text-slate-400 inline-flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                Distance
              </span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 mt-1">
                {selectedRoute.distanceKm} km
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <span className="eyebrow text-slate-400 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Typical Time
              </span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 mt-1">
                {selectedRoute.typicalTime}
              </div>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <span className="eyebrow text-slate-400">One-Way Toll</span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 mt-1 font-mono">
                {formatINR(selectedRoute.totalTollCost)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toast({
                title: 'Annual Corridor Pass activated',
                description: `${selectedRoute.name} is now on your FASTag Annual Pass.`,
                variant: 'success',
              })
            }
            className="btn btn-brand w-full sm:w-auto px-6 py-3 text-sm"
          >
            Activate Annual Pass
          </button>
        </div>
      </section>

      {/* Recent toll deductions */}
      <section className="card p-6 sm:p-8 space-y-4 animate-rise">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-500" />
          <h3 className="eyebrow text-slate-600">Recent NETC Toll Plaza Deductions</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {fastag.recentTolls.map((t, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900 text-[13px]">{t.plazaName}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {t.date} • {t.lane}
                </div>
              </div>
              <span className="font-mono font-bold text-rose-600 text-sm shrink-0">
                -{formatINR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
