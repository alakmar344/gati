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
        className="relative w-full max-w-lg clay-card dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-dialog-in"
      >
        {/* Secure Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-olive-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Treasury Gateway • Bharat e-Pay</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {serviceTitle}
          </h3>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
            <span>Ref: <strong className="font-mono text-ashoka-300">{applicationNumber}</strong></span>
            <span className="text-sm font-black text-olive-400 font-mono">
              Total: {formatINR(totalAmount)}
            </span>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {isProcessing ? (
            /* Processing Animation Screen */
            <div className="py-8 flex flex-col items-center justify-center text-center">
              {processingStage < 3 ? (
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-olive-100 dark:border-olive-900/40 border-t-olive-600 animate-spin flex items-center justify-center" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-olive-600 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-olive-100 dark:bg-olive-950/60 text-olive-600 dark:text-olive-400 flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              )}

              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {processingStage < 3 ? 'Securing Transaction...' : 'Payment Successful!'}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-xs transition-all duration-300 h-10 flex items-center justify-center">
                {stages[processingStage]}
              </p>

              {/* Progress dots */}
              <div className="flex gap-2 mt-4">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      processingStage >= step ? 'bg-olive-600 scale-110' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                SIMULATED RBI / NPCI FASTPAY PROTOCOL • ZERO ACTUAL CHARGE
              </div>
            </div>
          ) : (
            /* Payment Method Selection Screen */
            <div className="space-y-4">
              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    method === 'UPI'
                      ? 'clay-pill bg-white dark:bg-slate-900 text-olive-800 dark:text-olive-300 shadow-sm border border-olive-200 dark:border-olive-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-0.5 text-olive-600 dark:text-olive-400" />
                  <span>UPI Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('RuPay Card')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    method === 'RuPay Card'
                      ? 'clay-pill bg-white dark:bg-slate-900 text-olive-800 dark:text-olive-300 shadow-sm border border-olive-200 dark:border-olive-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-0.5 text-ashoka-600 dark:text-ashoka-400" />
                  <span>Cards / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Net Banking')}
                  className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    method === 'Net Banking'
                      ? 'clay-pill bg-white dark:bg-slate-900 text-olive-800 dark:text-olive-300 shadow-sm border border-olive-200 dark:border-olive-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-0.5 text-sky-600 dark:text-sky-400" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Sub-method details */}
              {method === 'UPI' && (
                <div className="p-4 bg-olive-50/70 dark:bg-olive-950/40 rounded-2xl border border-olive-200 dark:border-olive-800/60 space-y-3">
                  <div className="flex items-center justify-between text-xs text-olive-950 dark:text-olive-200 font-medium">
                    <span>Select Simulated UPI App:</span>
                    <span className="text-[11px] text-olive-800 dark:text-olive-300 bg-olive-200/80 dark:bg-olive-900/80 px-2.5 py-0.5 rounded-full font-bold">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'qr', label: 'Scan QR', icon: <QrCode className="w-5 h-5 text-slate-800 dark:text-slate-200" /> },
                      { id: 'gpay', label: 'Google Pay', icon: <span className="font-bold text-ashoka-700 dark:text-ashoka-300 text-xs">GPay</span> },
                      { id: 'phonepe', label: 'PhonePe', icon: <span className="font-bold text-ashoka-900 dark:text-ashoka-200 text-xs">PhonePe</span> },
                      { id: 'paytm', label: 'Paytm', icon: <span className="font-bold text-sky-700 dark:text-sky-300 text-xs">Paytm</span> },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all min-h-[56px] ${
                          upiApp === app.id
                            ? 'bg-white dark:bg-slate-900 border-olive-600 shadow-sm ring-2 ring-olive-600/30'
                            : 'bg-white/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="h-5 flex items-center justify-center">{app.icon}</div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1">{app.label}</span>
                      </button>
                    ))}
                  </div>

                  {upiApp === 'qr' && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-olive-200 dark:border-olive-800">
                      <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-lg p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">Scan via any UPI App</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">Instant 1-click authorization ready</div>
                        <div className="font-mono text-[11px] text-olive-800 dark:text-olive-300 font-semibold mt-0.5">gati.rto@npci.simulated</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {method === 'RuPay Card' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pre-filled Demo Test Card:</div>
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl text-xs space-y-1 shadow-inner">
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>RuPay Platinum Debit</span>
                      <span className="text-amber-400 font-bold">NPCI TEST</span>
                    </div>
                    <div className="font-mono text-sm tracking-wider font-bold text-ashoka-200">
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
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Select Instant Simulated Bank:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 text-center hover:border-olive-500 cursor-pointer">
                        {bank}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee Breakdown Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>RTO Statutory Processing Fee</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{formatINR(amount)}</span>
                </div>
                <div className="flex justify-between text-olive-700 dark:text-olive-400">
                  <span>Convenience &amp; FastTrack Cess</span>
                  <span className="font-mono font-bold">FREE (₹0)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-sm">
                  <span>Total Payable</span>
                  <span className="font-mono text-olive-700 dark:text-olive-400">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer — Always Visible & Fixed at Bottom */}
        {!isProcessing && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 space-y-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="clay-btn min-h-[48px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 w-1/3 py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartPayment}
                className="clay-btn clay-btn-saffron min-h-[48px] w-2/3 py-3 text-sm text-white font-black shadow-xl flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay {formatINR(totalAmount)} via {method === 'UPI' ? 'UPI' : method}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                🔒 100% simulated sandbox transaction • zero actual monetary deduction
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
