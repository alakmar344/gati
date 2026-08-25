'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, 
  Sparkles, 
  CreditCard, 
  Compass, 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Receipt, 
  Download, 
  Eye, 
  Plus, 
  User, 
  Building,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { DemoUser, AnyApplication, StoredDocument, PaymentReceipt } from '@/lib/types';
import { getCurrentUser, getApplicationsForUser, getAllDocuments, getAllPayments } from '@/lib/storage';
import { formatINR, formatDate } from '@/lib/utils';
import { HsrpPlate } from '@/components/plates/HsrpPlate';
import { ReceiptModal } from '@/components/payment/ReceiptModal';
import { PersonaSwitcherModal } from '@/components/layout/PersonaSwitcherModal';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<DemoUser>(getCurrentUser());
  const [applications, setApplications] = useState<AnyApplication[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [activeTab, setActiveTab] = useState<'applications' | 'garage' | 'payments'>('applications');
  
  // Selected Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const loadData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const userApps = getApplicationsForUser(user.id);
    setApplications(userApps);
    setDocuments(getAllDocuments());
    setPayments(getAllPayments());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('gati_user_changed', loadData);
    window.addEventListener('gati_applications_updated', loadData);
    window.addEventListener('gati_payments_updated', loadData);
    return () => {
      window.removeEventListener('gati_user_changed', loadData);
      window.removeEventListener('gati_applications_updated', loadData);
      window.removeEventListener('gati_payments_updated', loadData);
    };
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* ================= TOP CITIZEN BANNER ================= */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl bg-gradient-to-r from-white/90 via-slate-50/80 to-emerald-50/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* User Bio & Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
              {currentUser.avatar}
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>{getGreeting()},</span>
                <span className="font-bold">{currentUser.name.split(' ')[0]}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {currentUser.name}
              </h1>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span>{currentUser.role}</span>
                <span>•</span>
                <span>{currentUser.city}, {currentUser.state}</span>
              </p>
            </div>
          </div>

          {/* Quick Persona Switcher Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSwitcherOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all hover:border-slate-300"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Switch Demo Persona</span>
            </button>

            <Link
              href="/vehicle-licensing"
              className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Application</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200/80 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Applications</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{applications.length}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Garage</span>
            <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{currentUser.vehiclesCount} Vehicles</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">GatiLocker Smart Cards</span>
            <span className="text-xl font-extrabold text-sky-700 mt-0.5 block">{documents.length} Documents</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulated Payments</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{payments.length} Settled</span>
          </div>
        </div>
      </div>

      {/* ================= FAST ACTION LAUNCHPAD ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Vehicle Registration', desc: 'New RC or Transfer', href: '/vehicle-licensing', icon: Car, color: 'text-emerald-700 bg-emerald-100/80' },
          { title: 'VIP Plates', desc: 'Choice Plate Auction', href: '/fancy-numbers', icon: Sparkles, color: 'text-amber-700 bg-amber-100/80' },
          { title: 'Driver Licence', desc: 'ADTT Slot & PVC Card', href: '/driver-licence', icon: CreditCard, color: 'text-sky-700 bg-sky-100/80' },
          { title: 'Vehicle Permits', desc: 'National AITP & Goods', href: '/vehicle-permit', icon: Compass, color: 'text-teal-700 bg-teal-100/80' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              href={action.href}
              className="glass-panel p-4 rounded-2xl border border-white/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${action.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">{action.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{action.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'applications'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'garage'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Digital Garage & Plates</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payment History ({payments.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: APPLICATIONS LIST ================= */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Applications Filed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start your first vehicle registration, VIP number allocation, driving licence, or commercial permit application.
              </p>
              <Link
                href="/vehicle-licensing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                <span>Start Vehicle Licensing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="glass-panel p-6 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* App Information */}
                <div className="space-y-2 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {app.serviceType.replace('-', ' ')}
                    </span>
                    <span className="font-mono text-xs text-sky-700 font-bold">
                      {app.referenceNumber}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {app.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>RTO: <strong className="text-slate-700">{app.rtoName}</strong></span>
                    <span>•</span>
                    <span>Filed: <strong className="text-slate-700">{formatDate(app.createdAt)}</strong></span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                      <span className="font-semibold text-emerald-700">
                        {app.status === 'card_generated' ? 'Issued & Ready' : 'In Progress'}
                      </span>
                      <span className="font-mono">{app.currentStepIndex} / {app.totalSteps} Steps Complete</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${(app.currentStepIndex / app.totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Status</span>
                    <span className="text-xs font-semibold text-emerald-700">{app.estimatedCompletion}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/track?ref=${app.referenceNumber}`}
                      className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Tracker</span>
                    </Link>

                    {app.status === 'card_generated' && (
                      <Link
                        href="/documents"
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TAB 2: DIGITAL GARAGE ================= */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle 1 */}
            <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Primary Private EV
                </span>
                <span className="text-xs font-semibold text-slate-500">Valid till Aug 2041</span>
              </div>

              <div className="flex justify-center py-2">
                <HsrpPlate
                  plateText="KA 01 EK 4920"
                  vehicleType="ev"
                  size="md"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">Tata Nexon.ev Empowered+ LR</div>
                <div className="text-slate-500">RTO: Bengaluru Central (KA-01) • 106.4 kW Electric Motor</div>
                <div className="text-[11px] text-emerald-700 font-medium">Zero-Emission FastPass Enabled</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link href="/documents" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  <span>View Smart RC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">VIN: MAT629482NZ91024</span>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Secondary 2W Scooter
                </span>
                <span className="text-xs font-semibold text-slate-500">Valid till Oct 2038</span>
              </div>

              <div className="flex justify-center py-2">
                <HsrpPlate
                  plateText="KA 05 NB 1122"
                  vehicleType="ev"
                  size="md"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900 text-sm">Ather 450X Gen 3</div>
                <div className="text-slate-500">RTO: Bengaluru South (KA-05) • 6.4 kW Electric Drive</div>
                <div className="text-[11px] text-emerald-700 font-medium">Active Connected Telematics</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link href="/documents" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  <span>View Smart RC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">VIN: ME4A450XNZ10492</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PAYMENTS HISTORY ================= */}
      {activeTab === 'payments' && (
        <div className="glass-panel rounded-3xl border border-white/80 shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No simulated payments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.transactionId} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{p.transactionId}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800">{p.serviceTitle}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      UTR: {p.utrNumber} • {formatDate(p.date)} • {p.paymentMethod}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {formatINR(p.totalPaid)}
                    </span>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Persona Switcher Modal */}
      <PersonaSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSelectUser={(u) => {
          setCurrentUser(u);
          loadData();
        }}
      />

    </div>
  );
}
