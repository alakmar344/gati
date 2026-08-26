'use client';

import React from 'react';
import { ShieldCheck, CheckCircle, Printer, Download, X, QrCode } from 'lucide-react';
import { PaymentReceipt } from '@/lib/types';
import { formatINR, formatDate } from '@/lib/utils';

interface ReceiptModalProps {
  receipt: PaymentReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, isOpen, onClose }) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-overlay-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>Official Simulated Receipt</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Payment Confirmation
          </h3>
          <div className="text-xs text-slate-400 font-mono mt-1">
            TXN: {receipt.transactionId}
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4">
          <div className="text-center py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-xs text-emerald-800 font-medium">Total Paid (Simulated)</span>
            <div className="text-3xl font-black text-emerald-700 font-mono tracking-tight mt-0.5">
              {formatINR(receipt.totalPaid)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
              STATUS: SUCCESS (SETTLED)
            </span>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Service</span>
              <span className="font-semibold text-slate-900 text-right">{receipt.serviceTitle}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Application Ref</span>
              <span className="font-mono font-bold text-sky-700">{receipt.applicationNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Bank UTR</span>
              <span className="font-mono text-slate-800">{receipt.utrNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Payment Mode</span>
              <span className="font-medium text-slate-900">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Date & Time</span>
              <span className="text-slate-800">{formatDate(receipt.date)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-400">Payer</span>
              <span className="font-medium text-slate-900">{receipt.payerName}</span>
            </div>
          </div>

          {/* QR & Disclaimer */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <QrCode className="w-12 h-12 text-slate-800 shrink-0" />
            <div className="text-[11px] text-slate-500 leading-tight">
              Cryptographically signed by Gati FastTrack Gateway.
              <span className="block font-semibold text-slate-700 mt-0.5">
                DEMO • NOT AN OFFICIAL GOVERNMENT TAX RECEIPT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-1/2 py-2.5 rounded-full border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-1/2 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
