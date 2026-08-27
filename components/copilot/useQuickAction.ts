'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useToast } from '@/components/ui/Toast';
import { soundManager } from '@/lib/soundEffects';
import {
  getAllChallans,
  settleChallan,
  settleAllChallans,
  topupFastagWallet,
} from '@/lib/storage';
import { QuickAction } from '@/lib/insights';
import { IntentRun } from '@/lib/intent';
import { useLanguage } from '@/lib/i18n';

type AnyAction = QuickAction | IntentRun;

interface RunOptions {
  /** Suppress confetti + sound for this action (used by batch loops that celebrate once at the end). */
  silent?: boolean;
}

/** Single success celebration: one confetti burst + one fanfare. */
export function celebrate() {
  try {
    confetti({ particleCount: 70, spread: 72, origin: { y: 0.55 }, disableForReducedMotion: true });
  } catch {}
  soundManager.playVictoryFanfare();
}

/**
 * The single execution path for every Autopilot / Copilot action.
 * Returns true if it handled inline (no navigation), false if it navigated.
 */
export function useQuickAction() {
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();

  return useCallback(
    (action: AnyAction, opts?: RunOptions): boolean => {
      const silent = opts?.silent === true;
      const L = (en: string, hi: string) => (language === 'hi' ? hi : en);
      switch (action.kind) {
        case 'topup': {
          const acct = topupFastagWallet(action.amount);
          if (!silent) soundManager.playCheckpointChime();
          toast({
            title: L(
              `FASTag topped up ₹${action.amount.toLocaleString('en-IN')}`,
              `FASTag में ₹${action.amount.toLocaleString('en-IN')} टॉप-अप हुआ`
            ),
            description: L(
              `New balance ₹${acct.walletBalance.toLocaleString('en-IN')} · ${acct.issuingBank}`,
              `नया बैलेंस ₹${acct.walletBalance.toLocaleString('en-IN')} · ${acct.issuingBank}`
            ),
            variant: 'success',
          });
          return true;
        }
        case 'settleChallan': {
          const r = settleChallan(action.challanId);
          if (r) {
            if (!silent) celebrate();
            toast({
              title: L('Challan settled', 'चालान चुका दिया गया'),
              description: L(
                `₹${r.totalPaid.toLocaleString('en-IN')} paid · UTR ${r.utrNumber}`,
                `₹${r.totalPaid.toLocaleString('en-IN')} का भुगतान हुआ · UTR ${r.utrNumber}`
              ),
              variant: 'success',
            });
          } else {
            toast({ title: L('Already settled', 'पहले ही चुकाया जा चुका है'), variant: 'info' });
          }
          return true;
        }
        case 'settleAll': {
          const receipts = settleAllChallans(action.challanIds);
          if (receipts.length) {
            const total = receipts.reduce((s, r) => s + r.totalPaid, 0);
            if (!silent) celebrate();
            toast({
              title: L(`${receipts.length} challans cleared`, `${receipts.length} चालान चुका दिए गए`),
              description: L(
                `₹${total.toLocaleString('en-IN')} settled in one tap`,
                `एक टैप में ₹${total.toLocaleString('en-IN')} का निपटान`
              ),
              variant: 'success',
            });
          } else {
            toast({
              title: L('Nothing pending', 'कुछ भी बकाया नहीं'),
              description: L('All challans are already clear.', 'सभी चालान पहले ही चुकाए जा चुके हैं।'),
              variant: 'info',
            });
          }
          return true;
        }
        case 'payAll': {
          const pending = getAllChallans().filter((c) => c.status === 'PENDING');
          if (!pending.length) {
            toast({
              title: L('All clear', 'सब क्लियर'),
              description: L('No pending challans to pay.', 'भुगतान के लिए कोई बकाया चालान नहीं है।'),
              variant: 'info',
            });
            return true;
          }
          const receipts = settleAllChallans(pending.map((c) => c.id));
          const total = receipts.reduce((s, r) => s + r.totalPaid, 0);
          if (!silent) celebrate();
          toast({
            title: L(`${receipts.length} challans cleared`, `${receipts.length} चालान चुका दिए गए`),
            description: L(
              `₹${total.toLocaleString('en-IN')} settled in one tap`,
              `एक टैप में ₹${total.toLocaleString('en-IN')} का निपटान`
            ),
            variant: 'success',
          });
          return true;
        }
        case 'nav':
        case 'resume': {
          router.push(action.href);
          return false;
        }
        default:
          return false;
      }
    },
    [router, toast, language]
  );
}
