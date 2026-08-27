'use client';

import React, { useEffect } from 'react';
import { CheckCircle, Printer, Download, X, QrCode } from 'lucide-react';
import { PaymentReceipt } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, isOpen, onClose }) => {
  const { t } = useLanguage();
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !receipt) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Payment receipt"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 relative">
          <button
            onClick={onClose}
            aria-label="Close receipt"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>{t('rcptOfficial')}</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {t('rcptTitle')}
          </h3>
          <div className="text-xs text-slate-400 font-mono mt-1">
            TXN: {receipt.transactionId}
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4">
          <div className="text-center py-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">{t('rcptTotalPaid')}</span>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tight mt-0.5">
              {formatINR(receipt.totalPaid)}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-300 font-medium bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full inline-block mt-1">
              {t('rcptStatus')}
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptService')}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-right">{receipt.serviceTitle}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptAppRef')}</span>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{receipt.applicationNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptBankUtr')}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{receipt.utrNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptPaymentMode')}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptDateTime')}</span>
              <span className="text-slate-800 dark:text-slate-200">{formatDate(receipt.date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="text-slate-400 dark:text-slate-500">{t('rcptPayer')}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{receipt.payerName}</span>
            </div>
          </div>

          {/* QR & Disclaimer */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200 shrink-0" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {t('rcptSigned')}
              <span className="block font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {t('rcptDemo')}
              </span>
            </div>
          </div>

          {/* Action Buttons — both open the browser print dialog */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-1/2 py-2.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('rcptPrint')}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-1/2 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('rcptSavePdf')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
