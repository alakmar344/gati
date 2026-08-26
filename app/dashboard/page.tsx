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
import { ActionFeed } from '@/components/copilot/ActionFeed';
import { useLanguage } from '@/lib/i18n';

type Tab = 'applications' | 'garage' | 'payments';

export default function DashboardPage() {
  const mounted = useMounted();
  const { language, t } = useLanguage();
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
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const stats = [
    { label: t('applications'), value: applications.length, tone: 'text-slate-900 dark:text-white', icon: Layers },
    { label: 'Garage vehicles', value: currentUser.vehiclesCount, tone: 'text-olive-800 dark:text-olive-400', icon: Car },
    { label: t('smartCards'), value: documents.length, tone: 'text-ashoka-800 dark:text-ashoka-400', icon: FolderLock },
    { label: t('payments'), value: payments.length, tone: 'text-slate-900 dark:text-white', icon: Wallet },
  ];

  const tabs: { key: Tab; label: string; icon: typeof Layers; count?: number }[] = [
    { key: 'applications', label: t('applications'), icon: Layers, count: applications.length },
    { key: 'garage', label: t('digitalGarage'), icon: Car },
    { key: 'payments', label: t('payments'), icon: Receipt, count: payments.length },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-7">
      {/* ===== Citizen banner ===== */}
      <div className="clay-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-olive-500/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-olive-700 to-olive-900 text-white flex items-center justify-center font-display font-black text-xl shadow-md border-2 border-white/20">
              {currentUser.avatar}
            </div>
            <div>
              <div className="text-xs font-semibold text-olive-800 dark:text-olive-400">
                {getGreeting()}, {currentUser.name.split(' ')[0]}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {currentUser.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {currentUser.role} • {currentUser.city}, {currentUser.state}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="clay-btn min-h-[44px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 text-xs"
            >
              <User className="w-4 h-4 text-olive-700 dark:text-olive-400" />
              <span className="hidden sm:inline">{t('switchPersona')}</span>
            </button>
            <Link
              href="/vehicle-licensing"
              className="clay-btn clay-btn-primary min-h-[44px] px-5 py-2.5 text-xs text-white"
            >
              <Plus className="w-4 h-4 text-saffron-300" /> {t('newApplication')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 pt-6 border-t border-slate-100 dark:border-slate-800">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-slate-400 dark:text-slate-500">{s.label}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
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

      {/* ===== Autopilot feed ===== */}
      <ActionFeed limit={4} />

      {/* ===== Tabs ===== */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 w-fit text-xs font-bold">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                active ? 'clay-pill bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-olive-100 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
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
                <div key={app.id} className="clay-card clay-card-interactive p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="clay-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-olive-100 dark:bg-olive-950/60 text-olive-900 dark:text-olive-300 border border-olive-200 dark:border-olive-800/60">
                        {app.serviceType.replace('-', ' ')}
                      </span>
                      <span className="font-mono text-xs text-ashoka-800 dark:text-ashoka-400 font-bold">{app.referenceNumber}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{app.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>RTO: <strong className="text-slate-700 dark:text-slate-200">{app.rtoName}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Filed: <strong className="text-slate-700 dark:text-slate-200">{formatDate(app.createdAt)}</strong></span>
                    </div>
                    <div className="pt-1.5">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className={`font-bold inline-flex items-center gap-1 ${issued ? 'text-olive-800 dark:text-olive-400' : 'text-ashoka-800 dark:text-ashoka-400'}`}>
                          {issued && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {issued ? 'Issued & ready' : 'In progress'}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{app.currentStepIndex}/{app.totalSteps} steps</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-olive-600 to-olive-800 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link
                      href={issued ? '/documents' : `/${app.serviceType}`}
                      className="clay-btn clay-btn-primary min-h-[40px] px-4 py-2 text-xs text-white"
                    >
                      <span>{issued ? 'View Smart Card' : 'Continue'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
              tagTone: 'text-olive-800 dark:text-olive-300 bg-olive-100 dark:bg-olive-950/60',
              valid: 'Valid till Aug 2041',
              plate: 'KA 01 EK 4920',
              name: 'Tata Nexon.ev Empowered+ LR',
              meta: 'Bengaluru Central (KA-01) • 106.4 kW Electric',
              note: 'Zero-Emission FastPass enabled',
              vin: 'MAT629482NZ91024',
            },
            {
              tag: 'Secondary 2W Scooter',
              tagTone: 'text-ashoka-800 dark:text-ashoka-300 bg-ashoka-100 dark:bg-ashoka-950/60',
              valid: 'Valid till Oct 2038',
              plate: 'KA 05 NB 1122',
              name: 'Ather 450X Gen 3',
              meta: 'Bengaluru South (KA-05) • 6.4 kW Electric',
              note: 'Active connected telematics',
              vin: 'ME4A450XNZ10492',
            },
          ].map((v) => (
            <div key={v.vin} className="clay-card clay-card-interactive p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`clay-pill text-xs font-bold px-3 py-1 ${v.tagTone}`}>{v.tag}</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{v.valid}</span>
              </div>
              <div className="flex justify-center py-2">
                <HsrpPlate plateText={v.plate} vehicleType="ev" size="md" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</div>
                <div className="text-slate-500 dark:text-slate-400">{v.meta}</div>
                <div className="text-[11px] text-olive-700 dark:text-olive-400 font-medium">{v.note}</div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link href="/documents" className="text-xs font-bold text-olive-700 dark:text-olive-400 hover:underline flex items-center gap-1">
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
        <div className="clay-card overflow-hidden">
          {!mounted ? (
            <div className="p-4 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No simulated payments recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <div key={p.transactionId} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="space-y-1 text-xs min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white truncate">{p.transactionId}</span>
                      <span className="clay-pill text-[10px] bg-olive-100 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 font-bold px-2 py-0.5 shrink-0">{p.status}</span>
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{p.serviceTitle}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">UTR: {p.utrNumber} • {formatDate(p.date)} • {p.paymentMethod}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{formatINR(p.totalPaid)}</span>
                    <button onClick={() => setSelectedReceipt(p)} className="clay-btn min-h-[38px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 text-xs">
                      <Receipt className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <PersonaSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSelectUser={() => loadData()}
      />
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
  cta?: { href: string; label: string };
}) {
  return (
    <div className="clay-card p-10 text-center max-w-md mx-auto space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
      {cta && (
        <div className="pt-2">
          <Link href={cta.href} className="clay-btn clay-btn-primary px-5 py-2 text-xs text-white">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}
