'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Radio, 
  CreditCard, 
  ArrowRight, 
  CheckCircle, 
  Plus, 
  Zap, 
  Navigation, 
  Clock, 
  ShieldCheck,
  TrendingDown,
  Building
} from 'lucide-react';
import { FastagAccount } from '@/lib/types';
import { getFastagAccount, topupFastagWallet } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { MOCK_EXPRESSWAY_ROUTES } from '@/lib/mockData';

export default function FastagPage() {
  const [fastag, setFastag] = useState<FastagAccount>(getFastagAccount());
  const [selectedRoute, setSelectedRoute] = useState(MOCK_EXPRESSWAY_ROUTES[0]);
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

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
      setTimeout(() => setRechargeSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>NETC National Electronic Toll Autopilot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          FASTag Radar & Expressway Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Real-time balance telemetry, zero-surcharge instant recharges, and expressway toll route calculators.
        </p>
      </div>

      {/* Top Banner: Tag Telemetry & 1-Tap Recharge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Live Balance Meter */}
        <div className="md:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-300 block tracking-wider">
                  {fastag.issuingBank}
                </span>
                <span className="font-mono text-sm font-bold text-slate-200">
                  {fastag.vehicleNumber}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
              ACTIVE NETC
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">
              Available Wallet Balance
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight mt-1">
              {formatINR(fastag.walletBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Low-Balance Expressway Shield Active</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 font-mono pt-3 border-t border-white/10">
            RFID EPC: {fastag.tagId}
          </div>
        </div>

        {/* Right 1-Tap Quick Recharge Box */}
        <div className="md:col-span-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Instant 1-Tap Wallet Top-up
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Top up FASTag without convenience fee
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct NPCI settlement ensures immediate balance reflection at all toll plazas nationwide.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmount(amt)}
                className={`py-3 rounded-2xl border text-xs font-bold font-mono transition-all ${
                  topupAmount === amt
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                +{formatINR(amt)}
              </button>
            ))}
          </div>

          <div>
            {rechargeSuccess ? (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Wallet credited with {formatINR(topupAmount)}!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTopup}
                disabled={isToppingUp}
                className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{isToppingUp ? 'Crediting Wallet...' : `Recharge ${formatINR(topupAmount)}`}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ================= EXPRESSWAY ROUTE TOLL CALCULATOR ================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
            Expressway Cost & Route Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Interactive Expressway Toll Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select any major Indian expressway to calculate toll budget, distance, and FASTag savings.
          </p>
        </div>

        {/* Route Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_EXPRESSWAY_ROUTES.map((route) => {
            const isSelected = selectedRoute.name === route.name;
            return (
              <div
                key={route.name}
                onClick={() => setSelectedRoute(route)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white/80 border-slate-200 hover:bg-white'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 mb-1">{route.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{route.distanceKm} KM</span>
                    <span>•</span>
                    <span>{route.typicalTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                    {route.fastagDiscountPercent}% FASTag CashPass
                  </span>
                  <span className="font-mono font-black text-slate-900">{formatINR(route.totalTollCost)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Route Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-sm">{selectedRoute.name}</span>
            <p className="text-[11px] text-slate-500">
              Total Distance: <strong>{selectedRoute.distanceKm} km</strong> • Typical Travel Time: <strong>{selectedRoute.typicalTime}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">One-Way Toll</span>
              <span className="text-lg font-black text-slate-900 font-mono">{formatINR(selectedRoute.totalTollCost)}</span>
            </div>
            <button
              onClick={() => alert(`Annual FASTag Corridor Pass activated for ${selectedRoute.name}!`)}
              className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Activate Annual Pass
            </button>
          </div>
        </div>
      </div>

      {/* ================= TOLL DEDUCTION HISTORY ================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Recent NETC Toll Plaza Deductions
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {fastag.recentTolls.map((t, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">{t.plazaName}</div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {t.date} • {t.lane}
                </div>
              </div>
              <span className="font-mono font-bold text-rose-600 text-sm">
                -{formatINR(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
