'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  Loader2, 
  X, 
  QrCode, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentReceipt, ServiceType } from '@/lib/types';
import { formatINR, generateUTR, generateTransactionId } from '@/lib/utils';
import { savePayment } from '@/lib/storage';

interface GatiPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: ServiceType;
  serviceTitle: string;
  applicationNumber: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  onPaymentSuccess: (receipt: PaymentReceipt) => void;
}

type PaymentMethod = 'UPI' | 'RuPay Card' | 'Net Banking' | 'Credit/Debit Card';

export const GatiPayModal: React.FC<GatiPayModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  serviceTitle,
  applicationNumber,
  amount,
  payerName,
  payerEmail,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const stages = [
    'Initiating encrypted 256-bit handshake with NPCI...',
    'Allocating statutory treasury credit to State RTO...',
    'Validating cryptographic settlement ledger...',
    'Payment verified & digital receipt minted!'
  ];

  const convenienceFee = 0; // ₹0 convenience fee for modern digital public service
  const gst = 0;
  const totalAmount = amount + convenienceFee + gst;

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setProcessingStage(0);
      setReceipt(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    setIsProcessing(true);
    setProcessingStage(0);

    // Stage 1
    setTimeout(() => {
      setProcessingStage(1);
    }, 1200);

    // Stage 2
    setTimeout(() => {
      setProcessingStage(2);
    }, 2400);

    // Stage 3 & Success
    setTimeout(() => {
      setProcessingStage(3);
      
      const newReceipt: PaymentReceipt = {
        transactionId: generateTransactionId(),
        utrNumber: generateUTR(),
        date: new Date().toISOString(),
        amount: amount,
        convenienceFee: 0,
        gst: 0,
        totalPaid: totalAmount,
        paymentMethod: method,
        paymentGateway: 'GatiPay NPCI FastTrack (Simulated)',
        serviceType: serviceType,
        serviceTitle: serviceTitle,
        applicationNumber: applicationNumber,
        status: 'SUCCESS',
        payerName: payerName,
        payerEmail: payerEmail,
      };

      setReceipt(newReceipt);
      savePayment(newReceipt);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti error:', e);
      }

      // Finish flow after brief pause
      setTimeout(() => {
        onPaymentSuccess(newReceipt);
      }, 1800);
    }, 3600);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-overlay-in"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-dialog-in"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>GatiPay 1-Click FastTrack (Simulated)</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {serviceTitle}
          </h3>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
            <span>Ref: <strong className="font-mono text-sky-300">{applicationNumber}</strong></span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              Total: {formatINR(totalAmount)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isProcessing ? (
            /* Processing Animation Screen */
            <div className="py-8 flex flex-col items-center justify-center text-center">
              {processingStage < 3 ? (
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-emerald-600 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              )}

              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {processingStage < 3 ? 'Securing Transaction...' : 'Payment Successful!'}
              </h4>

              <p className="text-xs text-slate-600 font-medium max-w-xs transition-all duration-300 h-10 flex items-center justify-center">
                {stages[processingStage]}
              </p>

              {/* Progress dots */}
              <div className="flex gap-2 mt-4">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      processingStage >= step ? 'bg-emerald-600 scale-110' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                SIMULATED RBI / NPCI FASTPAY PROTOCOL • ZERO ACTUAL CHARGE
              </div>
            </div>
          ) : (
            /* Payment Method Selection Screen */
            <div className="space-y-5">
              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setMethod('UPI')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    method === 'UPI'
                      ? 'bg-white text-olive-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span>UPI Instant</span>
                </button>

                <button
                  onClick={() => setMethod('RuPay Card')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    method === 'RuPay Card'
                      ? 'bg-white text-olive-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span>Cards / RuPay</span>
                </button>

                <button
                  onClick={() => setMethod('Net Banking')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                    method === 'Net Banking'
                      ? 'bg-white text-olive-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Sub-method details */}
              {method === 'UPI' && (
                <div className="p-4 bg-olive-50/70 rounded-2xl border border-olive-200 space-y-4">
                  <div className="flex items-center justify-between text-xs text-olive-950 font-medium">
                    <span>Select Simulated UPI App:</span>
                    <span className="text-[11px] text-olive-800 bg-olive-200/80 px-2 py-0.5 rounded-full font-bold">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'qr', label: 'Scan QR', icon: <QrCode className="w-5 h-5 text-slate-800" /> },
                      { id: 'gpay', label: 'Google Pay', icon: <span className="font-bold text-ashoka-700 text-xs">GPay</span> },
                      { id: 'phonepe', label: 'PhonePe', icon: <span className="font-bold text-ashoka-900 text-xs">PhonePe</span> },
                      { id: 'paytm', label: 'Paytm', icon: <span className="font-bold text-sky-700 text-xs">Paytm</span> },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          upiApp === app.id
                            ? 'bg-white border-olive-600 shadow-sm ring-2 ring-olive-600/20'
                            : 'bg-white/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="h-6 flex items-center justify-center">{app.icon}</div>
                        <span className="text-[11px] font-semibold text-slate-700 mt-1">{app.label}</span>
                      </button>
                    ))}
                  </div>

                  {upiApp === 'qr' && (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-olive-200">
                      <div className="w-16 h-16 bg-slate-900 text-white rounded-lg p-1 flex items-center justify-center">
                        <QrCode className="w-14 h-14 text-white" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">Scan via any UPI App</div>
                        <div className="text-slate-500 text-[11px]">Instant 1-click authorization ready</div>
                        <div className="font-mono text-[11px] text-olive-800 font-semibold mt-0.5">gati.rto@npci.simulated</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {method === 'RuPay Card' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs font-semibold text-slate-800">Pre-filled Demo Test Card:</div>
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-xl text-xs space-y-1 shadow-inner">
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>RuPay Platinum Debit</span>
                      <span className="text-amber-400 font-bold">NPCI TEST</span>
                    </div>
                    <div className="font-mono text-sm tracking-wider font-bold text-sky-200">
                      4532 •••• •••• 9821
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-300 pt-1">
                      <span>{payerName}</span>
                      <span>EXP: 12/29</span>
                    </div>
                  </div>
                </div>
              )}

              {method === 'Net Banking' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-800">Select Instant Simulated Bank:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 text-center hover:border-emerald-500 cursor-pointer">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee Breakdown Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>RTO Statutory Processing Fee</span>
                  <span className="font-mono font-medium text-slate-900">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Convenience & FastTrack Cess</span>
                  <span className="font-mono font-bold">FREE (₹0)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900 text-sm">
                  <span>Total Payable</span>
                  <span className="font-mono text-emerald-700">{formatINR(totalAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn btn-ghost w-1/3 py-3 text-xs">
                  Cancel
                </button>
                <button type="button" onClick={handleStartPayment} className="btn btn-brand w-2/3 py-3 text-xs">
                  <span>Authorize {formatINR(totalAmount)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  🔒 100% mock sandbox transaction • no real charges will occur
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
