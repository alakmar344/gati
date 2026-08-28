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
import { useLanguage } from '@/lib/i18n';

const LOW_BALANCE_THRESHOLD = 300;

export default function FastagPage() {
  const [fastag, setFastag] = useState<FastagAccount>(getFastagAccount());
  const [selectedRoute, setSelectedRoute] = useState(MOCK_EXPRESSWAY_ROUTES[0]);
  const [topupAmount, setTopupAmount] = useState<number>(500);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const mounted = useMounted();
  const { toast } = useToast();
  const { t } = useLanguage();

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
        title: t('ftToastRecharged'),
        description: `${formatINR(topupAmount)} ${t('ftToastCredited')} ${formatINR(updated.walletBalance)}.`,
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
        eyebrow={t('ftEyebrow')}
        icon={<Radio className="w-3.5 h-3.5 animate-pulse" />}
        title={t('ftTitle')}
        subtitle={t('ftSubtitle')}
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
              {lowBalance ? t('ftLowBalance') : t('ftActiveNetc')}
            </Pill>
          </div>

          <div>
            <span className="eyebrow text-slate-400">{t('ftWalletBalance')}</span>
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
                <Pill tone="rose">{t('ftTopupWarning')}</Pill>
              ) : (
                <span className="text-[12px] text-slate-400 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {t('ftShieldActive')}
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-white/10">
            RFID EPC: {fastag.tagId}
          </div>
        </div>

        {/* Quick recharge */}
        <div className="md:col-span-5 clay-card p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div>
            <span className="eyebrow text-emerald-700 dark:text-emerald-400">{t('ftInstantTopup')}</span>
            <h3 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
              {t('ftNoFee')}
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {t('ftNpciNote')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[500, 1000, 2000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopupAmount(amt)}
                className={`min-h-[44px] py-2.5 rounded-2xl border text-[13px] font-bold font-mono transition-all ${
                  topupAmount === amt
                    ? 'clay-pill bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
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
            className="clay-btn clay-btn-primary min-h-[44px] w-full py-3 text-sm text-white disabled:opacity-50 font-bold"
          >
            {rechargeSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t('ftWalletCredited')}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{isToppingUp ? t('ftCrediting') : `${t('ftRecharge')} ${formatINR(topupAmount)}`}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Expressway toll calculator */}
      <section className="clay-card p-6 sm:p-8 space-y-6 animate-rise">
        <div>
          <span className="eyebrow text-sky-700 dark:text-sky-400 inline-flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5" />
            {t('ftRouteEngine')}
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
            {t('ftCalculator')}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {t('ftCalculatorDesc')}
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
                className={`clay-card clay-card-interactive text-left p-4 transition-all flex flex-col justify-between gap-3 min-h-[110px] ${
                  isSelected
                    ? 'border-sky-500 ring-2 ring-sky-500/30 bg-sky-50/80 dark:bg-sky-950/40'
                    : ''
                }`}
              >
                <div>
                  <div className="font-bold text-[13px] text-slate-900 dark:text-white mb-1.5">{route.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{route.distanceKm} KM</span>
                    <span className="hairline w-px h-3 bg-slate-300 dark:bg-slate-700" />
                    <span>{route.typicalTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Pill tone="emerald">{route.fastagDiscountPercent}% {t('ftCashPass')}</Pill>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">
                    {formatINR(route.totalTollCost)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected route result summary */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedRoute.name}</span>
            <Pill tone="sky">{t('ftSelectedRoute')}</Pill>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
              <span className="eyebrow text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                {t('ftDistance')}
              </span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                {selectedRoute.distanceKm} km
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
              <span className="eyebrow text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {t('ftTypicalTime')}
              </span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                {selectedRoute.typicalTime}
              </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
              <span className="eyebrow text-slate-400 dark:text-slate-500">{t('ftOneWayToll')}</span>
              <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1 font-mono">
                {formatINR(selectedRoute.totalTollCost)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toast({
                title: t('ftToastPassTitle'),
                description: `${selectedRoute.name} ${t('ftToastPassDesc')}`,
                variant: 'success',
              })
            }
            className="clay-btn clay-btn-primary min-h-[44px] w-full sm:w-auto px-6 py-2.5 text-sm text-white font-bold"
          >
            {t('ftActivatePass')}
          </button>
        </div>
      </section>

      {/* Recent toll deductions */}
      <section className="clay-card p-6 sm:p-8 space-y-4 animate-rise">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="eyebrow text-slate-600 dark:text-slate-400">{t('ftRecentDeductions')}</h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {fastag.recentTolls.map((toll, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-[13px]">{toll.plazaName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {toll.date} • {toll.lane}
                </div>
              </div>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm shrink-0">
                -{formatINR(toll.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
