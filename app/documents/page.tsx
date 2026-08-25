'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileCheck2, 
  Car, 
  CreditCard, 
  Sparkles, 
  Compass, 
  Printer, 
  Download, 
  Eye, 
  CheckCircle, 
  ShieldCheck, 
  QrCode,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StoredDocument, AnyApplication } from '@/lib/types';
import { getAllDocuments, getAllApplications, getCurrentUser } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { DigitalRcSmartCard } from '@/components/documents/DigitalRcSmartCard';
import { DigitalDrivingLicenceCard } from '@/components/documents/DigitalDrivingLicenceCard';
import { VipAllotmentOrder } from '@/components/documents/VipAllotmentOrder';
import { DigitalPermitDocument } from '@/components/documents/DigitalPermitDocument';

export default function DocumentsPage() {
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
  const completedApps = applications.filter(app => app.status === 'card_generated' || app.status === 'under_review');

  const filteredApps = completedApps.filter(app => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'RC' && app.serviceType === 'vehicle-licensing') return true;
    if (selectedFilter === 'VIP' && app.serviceType === 'fancy-numbers') return true;
    if (selectedFilter === 'DL' && app.serviceType === 'driver-licence') return true;
    if (selectedFilter === 'PERMIT' && app.serviceType === 'vehicle-permit') return true;
    return false;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold uppercase tracking-wider mb-2">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>GatiLocker Cryptographic Vault</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Digital Document Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Access, verify, print, and download your authentic Smart RCs, PVC Driving Licences, VIP Allotment Orders, and National Permits.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 text-xs font-bold">
        {[
          { id: 'ALL', label: 'All Documents' },
          { id: 'RC', label: '🚗 Smart RCs' },
          { id: 'VIP', label: '👑 VIP Allotments' },
          { id: 'DL', label: '💳 PVC Licences' },
          { id: 'PERMIT', label: '🌐 National Permits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'glass-panel text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Generated Documents Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Complete a service workflow to generate and store your digital smart cards.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isRC = app.serviceType === 'vehicle-licensing';
            const isVIP = app.serviceType === 'fancy-numbers';
            const isDL = app.serviceType === 'driver-licence';
            const isPermit = app.serviceType === 'vehicle-permit';

            return (
              <div
                key={app.id}
                className="glass-panel p-6 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isRC ? 'bg-emerald-100 text-emerald-800' :
                      isVIP ? 'bg-amber-100 text-amber-800' :
                      isDL ? 'bg-sky-100 text-sky-800' :
                      'bg-teal-100 text-teal-800'
                    }`}>
                      {app.serviceType.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Cryptographic Live
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {app.title}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1 mb-4">
                    <div>Holder: <strong className="text-slate-800">{app.applicantName}</strong></div>
                    <div>RTO: <strong className="text-slate-800">{app.rtoName}</strong></div>
                    <div className="font-mono text-[11px] text-sky-700 font-semibold">Ref: {app.referenceNumber}</div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewApp(app)}
                    className="flex-1 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Inspect</span>
                  </button>

                  <button
                    onClick={() => setPreviewApp(app)}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= INSPECT & PREVIEW MODAL ================= */}
      {previewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 p-6 sm:p-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  GatiLocker Verified Document
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {previewApp.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewApp(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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
