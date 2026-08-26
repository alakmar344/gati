'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  ArrowRight,
  Layers,
  Receipt,
  Download,
  Eye,
  Plus,
  User,
  Wallet,
  FolderLock,
  CheckCircle2,
} from 'lucide-react';
import { DemoUser, AnyApplication, StoredDocument, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, getApplicationsForUser, getAllDocuments, getAllPayments } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { HsrpPlate } from '@/components/plates/HsrpPlate';
import { ReceiptModal } from '@/components/payment/ReceiptModal';
import { PersonaSwitcherModal } from '@/components/layout/PersonaSwitcherModal';
import { Skeleton } from '@/components/ui/Primitives';
import { useMounted } from '@/components/ui/Toast';
import { CORE_SERVICES } from '@/lib/nav';

type Tab = 'applications' | 'garage' | 'payments';

export default function DashboardPage() {
  const mounted = useMounted();
  const [currentUser, setCurrentUser] = useState<DemoUser>(getCurrentUser());
  const [applications, setApplications] = useState<AnyApplication[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('applications');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setApplications(getApplicationsForUser(user.id));
    setDocuments(getAllDocuments());
    setPayments(getAllPayments());
  };

  useEffect(() => {
    loadData();
    const events = ['gati_user_changed', 'gati_applications_updated', 'gati_payments_updated', 'gati_documents_updated'];
    events.forEach((e) => window.addEventListener(e, loadData));
    return () => events.forEach((e) => window.removeEventListener(e, loadData));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { label: 'Applications', value: applications.length, tone: 'text-slate-900', icon: Layers },
    { label: 'Garage vehicles', value: currentUser.vehiclesCount, tone: 'text-emerald-700', icon: Car },
    { label: 'Smart cards', value: documents.length, tone: 'text-sky-700', icon: FolderLock },
    { label: 'Payments', value: payments.length, tone: 'text-slate-900', icon: Wallet },
  ];

  const tabs: { key: Tab; label: string; icon: typeof Layers; count?: number }[] = [
    { key: 'applications', label: 'Applications', icon: Layers, count: applications.length },
    { key: 'garage', label: 'Digital Garage', icon: Car },
    { key: 'payments', label: 'Payments', icon: Receipt, count: payments.length },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-7">
      {/* ===== Citizen banner ===== */}
      <div className="card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-display font-black text-xl shadow-md border-2 border-white">
              {currentUser.avatar}
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-700">
                {getGreeting()}, {currentUser.name.split(' ')[0]}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {currentUser.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {currentUser.role} • {currentUser.city}, {currentUser.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsSwitcherOpen(true)} className="btn btn-ghost px-4 py-2.5 text-xs">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Switch persona</span>
            </button>
            <Link href="/vehicle-licensing" className="btn btn-primary px-5 py-2.5 text-xs">
              <Plus className="w-4 h-4 text-emerald-400" /> New application
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 pt-6 border-t hairline">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-slate-50/80 border hairline p-3.5">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-slate-400">{s.label}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-300" />
                </div>
                {mounted ? (
                  <span className={`font-display text-2xl font-extrabold mt-1 block ${s.tone}`}>{s.value}</span>
                ) : (
                  <Skeleton className="h-7 w-10 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Quick launch ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CORE_SERVICES.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.href} href={a.href} className="card card-hover p-4 flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.tint} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[13px] text-slate-900 truncate">{a.short || a.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{a.desc.split('.')[0]}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ===== Tabs ===== */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100/80 w-fit text-xs font-bold">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===== Applications ===== */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {!mounted ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)
          ) : applications.length === 0 ? (
            <EmptyState
              icon={<Layers className="w-6 h-6" />}
              title="No applications yet"
              body="Start your first vehicle registration, VIP number, driving licence, or permit application."
              cta={{ href: '/vehicle-licensing', label: 'Start Vehicle Registration' }}
            />
          ) : (
            applications.map((app) => {
              const pct = Math.round((app.currentStepIndex / app.totalSteps) * 100);
              const issued = app.status === 'card_generated';
              return (
                <div key={app.id} className="card card-hover p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        {app.serviceType.replace('-', ' ')}
                      </span>
                      <span className="font-mono text-xs text-sky-700 font-bold">{app.referenceNumber}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{app.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>RTO: <strong className="text-slate-700">{app.rtoName}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>Filed: <strong className="text-slate-700">{formatDate(app.createdAt)}</strong></span>
                    </div>
                    <div className="pt-1.5">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className={`font-bold inline-flex items-center gap-1 ${issued ? 'text-emerald-700' : 'text-sky-700'}`}>
                          {issued && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {issued ? 'Issued & ready' : 'In progress'}
                        </span>
                        <span className="font-mono text-slate-500">{app.currentStepIndex}/{app.totalSteps} steps</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/track?ref=${app.referenceNumber}`} className="btn btn-ghost px-4 py-2 text-xs">
                      <Eye className="w-3.5 h-3.5" /> Track
                    </Link>
                    {issued && (
                      <Link href="/documents" className="btn btn-brand px-4 py-2 text-xs">
                        <Download className="w-3.5 h-3.5" /> Document
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== Garage ===== */}
      {activeTab === 'garage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              tag: 'Primary Private EV',
              tagTone: 'text-emerald-800 bg-emerald-100',
              valid: 'Valid till Aug 2041',
              plate: 'KA 01 EK 4920',
              name: 'Tata Nexon.ev Empowered+ LR',
              meta: 'Bengaluru Central (KA-01) • 106.4 kW Electric',
              note: 'Zero-Emission FastPass enabled',
              vin: 'MAT629482NZ91024',
            },
            {
              tag: 'Secondary 2W Scooter',
              tagTone: 'text-sky-800 bg-sky-100',
              valid: 'Valid till Oct 2038',
              plate: 'KA 05 NB 1122',
              name: 'Ather 450X Gen 3',
              meta: 'Bengaluru South (KA-05) • 6.4 kW Electric',
              note: 'Active connected telematics',
              vin: 'ME4A450XNZ10492',
            },
          ].map((v) => (
            <div key={v.vin} className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${v.tagTone}`}>{v.tag}</span>
                <span className="text-xs font-semibold text-slate-500">{v.valid}</span>
              </div>
              <div className="flex justify-center py-2">
                <HsrpPlate plateText={v.plate} vehicleType="ev" size="md" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                <div className="text-slate-500">{v.meta}</div>
                <div className="text-[11px] text-emerald-700 font-medium">{v.note}</div>
              </div>
              <div className="pt-3 border-t hairline flex items-center justify-between">
                <Link href="/documents" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  View Smart RC <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">VIN: {v.vin}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Payments ===== */}
      {activeTab === 'payments' && (
        <div className="card overflow-hidden">
          {!mounted ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No simulated payments recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.transactionId} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-1 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 truncate">{p.transactionId}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">{p.status}</span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">{p.serviceTitle}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">UTR: {p.utrNumber} • {formatDate(p.date)} • {p.paymentMethod}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-extrabold text-slate-900 font-mono">{formatINR(p.totalPaid)}</span>
                    <button onClick={() => setSelectedReceipt(p)} className="btn btn-primary px-3.5 py-1.5 text-xs">
                      <Receipt className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ReceiptModal receipt={selectedReceipt} isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      <PersonaSwitcherModal isOpen={isSwitcherOpen} onClose={() => setIsSwitcherOpen(false)} onSelectUser={() => loadData()} />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="card p-12 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">{icon}</div>
      <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{body}</p>
      <Link href={cta.href} className="btn btn-brand px-5 py-2.5 text-sm mt-1">
        {cta.label} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
