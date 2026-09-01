'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  Search,
  Camera,
  MapPin,
  CreditCard,
  Scale,
  CheckCircle,
  Clock,
  X,
  ShieldAlert,
} from 'lucide-react';
import { ChallanRecord, PaymentReceipt } from '@/lib/types';
import { getAllChallans, updateChallanStatus, getCurrentUser } from '@/lib/storage';
import { formatINR } from '@/lib/utils';
import { GatiPayModal } from '@/components/payment/GatiPayModal';
import { SectionHeading, Pill, Skeleton } from '@/components/ui/Primitives';
import { useToast, useMounted } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

export default function ChallansPage() {
  const currentUser = getCurrentUser();
  const mounted = useMounted();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedChallanForPay, setSelectedChallanForPay] = useState<ChallanRecord | null>(null);
  const [isPayAllOpen, setIsPayAllOpen] = useState(false);

  // Virtual Court Dispute Modal State
  const [disputingChallan, setDisputingChallan] = useState<ChallanRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState('Erroneous camera trigger (Vehicle was stationary in traffic)');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const loadData = () => {
    setChallans(getAllChallans());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('gati_challans_updated', loadData);
    return () => window.removeEventListener('gati_challans_updated', loadData);
  }, []);

  const filteredChallans = challans.filter(c =>
    c.vehicleNumber.replace(/\s/g, '').toUpperCase().includes(searchPlate.replace(/\s/g, '').toUpperCase())
  );

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    if (selectedChallanForPay) {
      updateChallanStatus(selectedChallanForPay.id, 'PAID', receipt.transactionId);
      toast({
        title: t('chToastSettledTitle'),
        description: `${t('chToastSettledDescPrefix')} ${receipt.transactionId}`,
        variant: 'success',
      });
      setSelectedChallanForPay(null);
    }
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disputingChallan) {
      updateChallanStatus(disputingChallan.id, 'DISPUTED');
      setDisputeSubmitted(true);
      toast({
        title: t('chToastAppealTitle'),
        description: `${t('chChallanNoPrefix')}${disputingChallan.challanNumber} ${t('chToastAppealDescSuffix')}`,
        variant: 'success',
      });
    }
  };

  const pendingCount = challans.filter(c => c.status === 'PENDING').length;
  const totalPendingAmount = challans
    .filter(c => c.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const statusPill = (status: ChallanRecord['status']) => {
    if (status === 'PAID') return <Pill tone="emerald">{t('chStatusPaid')}</Pill>;
    if (status === 'DISPUTED') return <Pill tone="slate">{t('chStatusDisputed')}</Pill>;
    return <Pill tone="rose">{t('chStatusPending')}</Pill>;
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <SectionHeading
        eyebrow={t('chEyebrow')}
        icon={<AlertTriangle className="w-4 h-4" />}
        title={t('chTitle')}
        subtitle={t('chSubtitle')}
      />

      {/* Summary Banner */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              pendingCount > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {pendingCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
          <div>
            <span className="eyebrow text-slate-400 dark:text-slate-500">{t('chFleetRadarStatus')}</span>
            <div className="text-lg font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
              {pendingCount} {t('chPendingChallansSuffix')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block">{t('chTotalOutstanding')}</span>
            <span
              className={`text-2xl font-display font-extrabold tracking-tight font-mono ${
                pendingCount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {formatINR(totalPendingAmount)}
            </span>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => {
                if (pendingCount === 1) {
                  const firstPending = challans.find(c => c.status === 'PENDING');
                  if (firstPending) setSelectedChallanForPay(firstPending);
                } else {
                  setIsPayAllOpen(true);
                }
              }}
              className="clay-btn clay-btn-saffron min-h-[44px] px-5 py-2.5 text-xs text-white font-extrabold shadow-lg flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('chPayDues')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="clay-card p-2 max-w-xl mx-auto flex items-center gap-2">
        <div className="pl-3 text-rose-600 dark:text-rose-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          aria-label="Filter challans by vehicle plate"
          placeholder={t('chFilterPlaceholder')}
          className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-mono font-bold uppercase focus:outline-none px-2 py-2"
        />
      </div>

      {/* Challans List Grid */}
      <div className="space-y-6">
        {!mounted ? (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="clay-card p-6 sm:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <Skeleton className="lg:col-span-4 aspect-[16/10] rounded-2xl" />
                  <div className="lg:col-span-5 space-y-3">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-4 w-56 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                  <div className="lg:col-span-3 space-y-3">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-full" />
                    <Skeleton className="h-9 w-full rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChallans.length === 0 ? (
          <div className="clay-card p-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-display font-extrabold tracking-tight text-slate-900 dark:text-white">{t('chZeroViolations')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('chZeroViolationsSub')}</p>
          </div>
        ) : (
          filteredChallans.map((ch) => (
            <div
              key={ch.id}
              className={`clay-card clay-card-interactive p-6 sm:p-7 ${
                ch.status === 'PAID'
                  ? 'border-emerald-200 dark:border-emerald-800'
                  : ch.status === 'DISPUTED'
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-rose-200 dark:border-rose-800'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                {/* Left Photo Evidence Thumbnail */}
                <div className="lg:col-span-4 relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-700 shadow-inner group">
                  <Image
                    src={ch.photoEvidenceUrl}
                    alt="Camera Evidence"
                    fill
                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('chCamBadge')}</span>
                  </div>
                  {ch.detectedSpeed && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-rose-950/80 text-[11px] font-mono text-rose-200 border border-rose-500/40">
                      {t('chSpeedLabel')} {ch.detectedSpeed} ({t('chLimitLabel')} {ch.speedLimit})
                    </div>
                  )}
                </div>

                {/* Middle Details */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {ch.vehicleNumber}
                    </span>
                    {statusPill(ch.status)}
                  </div>

                  <h3 className="text-base sm:text-lg font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {ch.violationType}
                  </h3>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{ch.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ch.date}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {ch.actSection} • {t('chChallanNoPrefix')}{ch.challanNumber}
                    </div>
                  </div>
                </div>

                {/* Right Actions & Settlement */}
                <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="eyebrow text-slate-400 dark:text-slate-500 block">{t('chFineAmount')}</span>
                    <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                      {formatINR(ch.amount)}
                    </span>
                  </div>

                  {ch.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => setSelectedChallanForPay(ch)}
                        className="clay-btn min-h-[44px] w-full py-2.5 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md font-bold"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{t('chUpiSettle')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setDisputingChallan(ch);
                          setDisputeSubmitted(false);
                        }}
                        className="clay-btn min-h-[40px] w-full py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{t('chContestDispute')}</span>
                      </button>
                    </div>
                  )}

                  {ch.status === 'PAID' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t('chFineSettled')}
                    </span>
                  )}

                  {ch.status === 'DISPUTED' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      <Scale className="w-3.5 h-3.5" />
                      {t('chUnderReview')}
                    </span>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= VIRTUAL COURT DISPUTE MODAL ================= */}
      {disputingChallan && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-900/60 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-dialog-in">

            {/* Header */}
            <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white relative">
              <button
                onClick={() => setDisputingChallan(null)}
                aria-label="Close dispute dialog"
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 text-amber-400 eyebrow mb-1">
                <Scale className="w-4 h-4" />
                <span>{t('chVirtualCourtAppeal')}</span>
              </div>
              <h3 className="text-xl font-display font-extrabold tracking-tight">
                {t('chContestChallan')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {t('chChallanNoPrefix')}{disputingChallan.challanNumber} • {disputingChallan.vehicleNumber}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {disputeSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    {t('chAppealFiledTitle')}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                    {t('chAppealFiledBody')}
                  </p>
                  <button
                    onClick={() => setDisputingChallan(null)}
                    className="btn btn-primary px-6 py-2.5 text-sm"
                  >
                    {t('chDone')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDisputeSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{t('chSelectGrounds')}</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="field w-full px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100"
                    >
                      <option value="Erroneous camera trigger (Vehicle was stationary in traffic)">
                        {t('chReasonCameraTrigger')}
                      </option>
                      <option value="Cloned / Counterfeit plate match error">
                        {t('chReasonClonedPlate')}
                      </option>
                      <option value="Emergency corridor clearance for hospital vehicle">
                        {t('chReasonEmergencyCorridor')}
                      </option>
                      <option value="Obstruction by heavy vehicle blocking traffic light visibility">
                        {t('chReasonObstruction')}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{t('chDeclarationLabel')}</label>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                      {t('chDeclarationText')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDisputingChallan(null)}
                      className="btn btn-ghost w-1/2 py-2.5 text-sm"
                    >
                      {t('chCancel')}
                    </button>
                    <button
                      type="submit"
                      className="btn w-1/2 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                    >
                      {t('chSubmitContest')}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
          </div>
        </div>
      )}

      {/* Pay-all Gateway Modal */}
      {isPayAllOpen && (
        <GatiPayModal
          isOpen={isPayAllOpen}
          onClose={() => setIsPayAllOpen(false)}
          serviceType="challans"
          serviceTitle={`${t('chSettleAllTitle')} (${pendingCount})`}
          applicationNumber={`${pendingCount} × E-CHALLAN`}
          amount={totalPendingAmount}
          payerName={currentUser.name}
          payerEmail={currentUser.email}
          onPaymentSuccess={(receipt) => {
            challans
              .filter((c) => c.status === 'PENDING')
              .forEach((c) => updateChallanStatus(c.id, 'PAID', receipt.transactionId));
            toast({
              title: t('chAllToastSettledTitle'),
              description: t('chAllToastSettledDesc'),
              variant: 'success',
            });
            setIsPayAllOpen(false);
          }}
        />
      )}

      {/* Payment Gateway Modal */}
      {selectedChallanForPay && (
        <GatiPayModal
          isOpen={!!selectedChallanForPay}
          onClose={() => setSelectedChallanForPay(null)}
          serviceType="challans"
          serviceTitle={`${t('chSettlementTitle')} (#${selectedChallanForPay.challanNumber})`}
          applicationNumber={selectedChallanForPay.challanNumber}
          amount={selectedChallanForPay.amount}
          payerName={currentUser.name}
          payerEmail={currentUser.email}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
}
