'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { AnyApplication } from '@/lib/types';
import { getApplicationByRef } from '@/lib/storage';
import { formatDate, formatINR } from '@/lib/utils';
import { SectionHeading, Pill, Skeleton } from '@/components/ui/Primitives';
import { useMounted } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || 'GATI-VL-2026-89421';
  const mounted = useMounted();
  const { t } = useLanguage();

  const [searchRef, setSearchRef] = useState(initialRef);
  const [activeApp, setActiveApp] = useState<AnyApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = (refToLookup: string) => {
    const app = getApplicationByRef(refToLookup);
    setActiveApp(app || null);
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialRef) {
      handleLookup(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      handleLookup(searchRef.trim());
    }
  };

  const sampleRefs = [
    { label: t('trkSampleVL'), ref: 'GATI-VL-2026-89421' },
    { label: t('trkSampleFN'), ref: 'GATI-FN-2026-10492' },
    { label: t('trkSampleDL'), ref: 'GATI-DL-2026-44912' },
    { label: t('trkSampleVP'), ref: 'GATI-VP-2026-90184' },
  ];

  return (
    <div className="space-y-8">
      {/* Reference lookup — prominent search bar */}
      <div className="clay-card max-w-2xl mx-auto rounded-2xl p-2.5 animate-rise">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="pl-3 text-emerald-600 dark:text-emerald-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder={t('trkSearchPlaceholder')}
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-mono font-medium focus:outline-none px-1 uppercase"
          />
          <button type="submit" className="clay-btn clay-btn-primary min-h-[44px] px-6 py-2.5 text-sm text-white shrink-0 font-bold">
            {t('track')}
          </button>
        </form>
      </div>

      {/* Quick sample references */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {t('trkTrySample')}
        </span>
        {sampleRefs.map((s) => (
          <button
            key={s.ref}
            onClick={() => {
              setSearchRef(s.ref);
              handleLookup(s.ref);
            }}
            className="min-h-[34px] px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-semibold transition-colors"
            title={s.label}
          >
            {s.ref}
          </button>
        ))}
      </div>

      {/* Result */}
      {!mounted ? (
        <div className="clay-card p-6 sm:p-10 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : activeApp ? (
        <div className="clay-card p-6 sm:p-10 space-y-8 animate-rise">
          {/* Header banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="emerald">{activeApp.serviceType.replace('-', ' ')}</Pill>
                <span className="font-mono text-xs text-sky-700 dark:text-sky-400 font-bold">
                  {activeApp.referenceNumber}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {activeApp.title}
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('citizenProfile')} <strong className="text-slate-800 dark:text-slate-200 font-semibold">{activeApp.applicantName}</strong>
                {' '}&middot; {t('docRto')} <strong className="text-slate-800 dark:text-slate-200 font-semibold">{activeApp.rtoName}</strong>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="eyebrow text-slate-400 dark:text-slate-500 block mb-1.5">{t('trkCurrentState')}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                {activeApp.status === 'card_generated' ? t('issued') : t('trkUnderReview')}
              </span>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                {t('trkUpdated')} {formatDate(activeApp.updatedAt)}
              </div>
            </div>
          </div>

          {/* Next recommended action */}
          <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('trkNextAction')}</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300 max-w-xl">
                {activeApp.status === 'card_generated'
                  ? t('trkCredentialIssued')
                  : t('trkDocumentsCleared')}
              </p>
            </div>

            <Link href="/documents" className="clay-btn clay-btn-primary min-h-[44px] px-5 py-2.5 text-xs text-white shrink-0 font-bold">
              <span>{activeApp.nextActionLabel || t('trkOpenLocker')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Milestone timeline */}
          <div className="space-y-5">
            <h3 className="eyebrow text-slate-400 dark:text-slate-500">{t('trkMilestones')}</h3>

            <div className="relative">
              {/* Connecting rail */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

              <ol className="space-y-6">
                {activeApp.timeline.map((step, idx) => {
                  const isCurrent = !!step.current;
                  return (
                    <li key={idx} className="relative flex gap-4">
                      {/* Node */}
                      <div className="relative z-10 shrink-0 mt-0.5">
                        {isCurrent && (
                          <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-ping" aria-hidden="true" />
                        )}
                        <span
                          className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                            isCurrent
                              ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                              : step.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {step.completed && !isCurrent && <CheckCircle className="w-3.5 h-3.5" />}
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                          <span
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : step.completed
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{step.timestamp}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-1">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Payment & security metadata */}
          {activeApp.payment && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="eyebrow text-slate-400 dark:text-slate-500 block">{t('trkPaymentRef')}</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{activeApp.payment.transactionId}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Bank UTR: {activeApp.payment.utrNumber}</div>
              </div>

              <div className="text-right">
                <span className="eyebrow text-slate-400 dark:text-slate-500 block">{t('trkSettledAmount')}</span>
                <div className="text-lg font-mono font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatINR(activeApp.payment.totalPaid)}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : hasSearched ? (
        /* Friendly empty state */
        <div className="clay-card p-12 text-center space-y-4 animate-rise">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('trkNoAppTitle')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {t('trkNoAppBodyPrefix')}{' '}
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{searchRef}</span>
              {t('trkNoAppBodySuffix')}
            </p>
          </div>
          <Pill tone="slate" className="font-mono">
            Format: GATI-XX-YYYY-NNNNN
          </Pill>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
      <SectionHeading
        eyebrow={t('trkEyebrow')}
        icon={<Search className="w-3.5 h-3.5" />}
        title={t('trkTitle')}
        subtitle={t('trkSubtitle')}
      />

      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </div>
  );
}
