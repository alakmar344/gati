'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Printer,
  Eye,
  ShieldCheck,
  X,
  ArrowRight,
} from 'lucide-react';
import { StoredDocument, AnyApplication } from '@/lib/types';
import { getAllDocuments, getAllApplications } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { SectionHeading, Pill, Skeleton } from '@/components/ui/Primitives';
import { useMounted } from '@/components/ui/Toast';
import { DigitalRcSmartCard } from '@/components/documents/DigitalRcSmartCard';
import { DigitalDrivingLicenceCard } from '@/components/documents/DigitalDrivingLicenceCard';
import { VipAllotmentOrder } from '@/components/documents/VipAllotmentOrder';
import { DigitalPermitDocument } from '@/components/documents/DigitalPermitDocument';

type Tone = 'slate' | 'emerald' | 'olive' | 'saffron' | 'ashoka' | 'sky' | 'amber' | 'rose';

const TYPE_META: Record<string, { badge: string; tone: Tone }> = {
  'vehicle-licensing': { badge: 'Smart RC', tone: 'olive' },
  'fancy-numbers': { badge: 'VIP Plate', tone: 'saffron' },
  'driver-licence': { badge: 'PVC DL', tone: 'ashoka' },
  'vehicle-permit': { badge: 'National Permit', tone: 'olive' },
};

export default function DocumentsPage() {
  const mounted = useMounted();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [applications, setApplications] = useState<AnyApplication[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Active Preview State
  const [previewApp, setPreviewApp] = useState<AnyApplication | null>(null);

  const loadData = () => {
    const apps = getAllApplications();
    setApplications(apps);
    const docs = getAllDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('gati_documents_updated', loadData);
    window.addEventListener('gati_applications_updated', loadData);
    return () => {
      window.removeEventListener('gati_documents_updated', loadData);
      window.removeEventListener('gati_applications_updated', loadData);
    };
  }, []);

  // Filtered applications that have generated documents
  const completedApps = applications.filter(
    (app) => app.status === 'card_generated' || app.status === 'under_review'
  );

  const filteredApps = completedApps.filter((app) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'RC' && app.serviceType === 'vehicle-licensing') return true;
    if (selectedFilter === 'VIP' && app.serviceType === 'fancy-numbers') return true;
    if (selectedFilter === 'DL' && app.serviceType === 'driver-licence') return true;
    if (selectedFilter === 'PERMIT' && app.serviceType === 'vehicle-permit') return true;
    return false;
  });

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'RC', label: 'Smart RCs' },
    { id: 'VIP', label: 'VIP Allotments' },
    { id: 'DL', label: 'PVC Licences' },
    { id: 'PERMIT', label: 'National Permits' },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow="GatiLocker Cryptographic Vault"
        icon={<FileCheck2 className="w-4 h-4" />}
        title="Digital Document Center"
        subtitle="Access, verify, print, and download your authentic Smart RCs, PVC Driving Licences, VIP Allotment Orders, and National Permits."
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {filters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`min-h-[40px] px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'clay-pill bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'clay-card text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="clay-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-14 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your wallet is empty
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Complete a service workflow to generate and securely store your digital smart cards and permits here.
          </p>
          <Link href="/dashboard" className="clay-btn clay-btn-primary min-h-[44px] inline-flex items-center gap-1.5 mx-auto text-white">
            Start a service
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-rise stagger">
          {filteredApps.map((app) => {
            const meta = TYPE_META[app.serviceType] ?? { badge: 'Doc', tone: 'slate' as Tone };
            const isActive = app.status === 'card_generated';

            return (
              <div key={app.id} className="clay-card clay-card-interactive p-6 flex flex-col justify-between">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <Pill tone={meta.tone}>{meta.badge}</Pill>
                    <Pill tone={isActive ? 'emerald' : 'amber'}>
                      <ShieldCheck className="w-3 h-3" />
                      {isActive ? 'VALID' : 'IN REVIEW'}
                    </Pill>
                  </div>

                  <h3 className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white text-base leading-snug mb-4">
                    {app.title}
                  </h3>

                  <dl className="text-[13px] text-slate-500 dark:text-slate-400 space-y-1.5 mb-5">
                    <div className="flex justify-between gap-3">
                      <dt>Holder</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{app.applicantName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>RTO</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{app.rtoName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Issued</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-200 text-right">{formatDate(app.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                      <dt>Ref No.</dt>
                      <dd className="font-mono text-[12px] font-semibold text-sky-700 dark:text-sky-400 text-right">
                        {app.referenceNumber}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPreviewApp(app)}
                    className="clay-btn clay-btn-primary min-h-[40px] flex-1 gap-1.5 text-xs text-white"
                  >
                    <Eye className="w-4 h-4" />
                    View &amp; Inspect
                  </button>

                  <button
                    onClick={() => setPreviewApp(app)}
                    className="clay-btn min-h-[40px] px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    title="Print Document"
                    aria-label="Print document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= INSPECT & PREVIEW MODAL ================= */}
      {previewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-overlay-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 p-6 sm:p-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <span className="eyebrow text-emerald-700 dark:text-emerald-400">GatiLocker Verified Document</span>
                <h3 className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white text-lg sm:text-xl mt-1">
                  {previewApp.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewApp(null)}
                className="clay-btn min-h-[38px] px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Render Switch */}
            <div className="py-2">
              {previewApp.serviceType === 'vehicle-licensing' && (
                <DigitalRcSmartCard data={previewApp as any} />
              )}

              {previewApp.serviceType === 'fancy-numbers' && (
                <VipAllotmentOrder data={previewApp as any} />
              )}

              {previewApp.serviceType === 'driver-licence' && (
                <DigitalDrivingLicenceCard data={previewApp as any} />
              )}

              {previewApp.serviceType === 'vehicle-permit' && (
                <DigitalPermitDocument data={previewApp as any} />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
