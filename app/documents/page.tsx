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
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
              selectedFilter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'glass-panel text-slate-600 hover:text-slate-900'
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
            <div key={i} className="card p-6 space-y-4">
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
        <div className="card p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-display font-extrabold tracking-tight text-slate-900">
            Your wallet is empty
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Complete a service workflow to generate and securely store your digital smart cards and permits here.
          </p>
          <Link href="/dashboard" className="btn btn-primary inline-flex items-center gap-1.5 mx-auto">
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
              <div key={app.id} className="card card-hover p-6 flex flex-col justify-between">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <Pill tone={meta.tone}>{meta.badge}</Pill>
                    <Pill tone={isActive ? 'emerald' : 'amber'}>
                      <ShieldCheck className="w-3 h-3" />
                      {isActive ? 'VALID' : 'IN REVIEW'}
                    </Pill>
                  </div>

                  <h3 className="font-display font-extrabold tracking-tight text-slate-900 text-base leading-snug mb-4">
                    {app.title}
                  </h3>

                  <dl className="text-[13px] text-slate-500 space-y-1.5 mb-5">
                    <div className="flex justify-between gap-3">
                      <dt>Holder</dt>
                      <dd className="font-semibold text-slate-800 text-right">{app.applicantName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>RTO</dt>
                      <dd className="font-semibold text-slate-800 text-right">{app.rtoName}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Issued</dt>
                      <dd className="font-semibold text-slate-800 text-right">{formatDate(app.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 hairline pt-2 mt-2">
                      <dt>Ref No.</dt>
                      <dd className="font-mono text-[12px] font-semibold text-sky-700 text-right">
                        {app.referenceNumber}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewApp(app)}
                    className="btn btn-primary flex-1 gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    View &amp; Inspect
                  </button>

                  <button
                    onClick={() => setPreviewApp(app)}
                    className="btn btn-ghost px-3"
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
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 sm:p-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between hairline pb-4 mb-6">
              <div>
                <span className="eyebrow text-emerald-700">GatiLocker Verified Document</span>
                <h3 className="font-display font-extrabold tracking-tight text-slate-900 text-lg sm:text-xl mt-1">
                  {previewApp.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewApp(null)}
                className="btn btn-ghost px-2.5"
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
