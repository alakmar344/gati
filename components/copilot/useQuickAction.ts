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

  return useCallback(
    (action: AnyAction, opts?: RunOptions): boolean => {
      const silent = opts?.silent === true;
      switch (action.kind) {
        case 'topup': {
          const acct = topupFastagWallet(action.amount);
          if (!silent) soundManager.playCheckpointChime();
          toast({
            title: `FASTag topped up ₹${action.amount.toLocaleString('en-IN')}`,
            description: `New balance ₹${acct.walletBalance.toLocaleString('en-IN')} · ${acct.issuingBank}`,
            variant: 'success',
          });
          return true;
        }
        case 'settleChallan': {
          const r = settleChallan(action.challanId);
          if (r) {
            if (!silent) celebrate();
            toast({
              title: 'Challan settled',
              description: `₹${r.totalPaid.toLocaleString('en-IN')} paid · UTR ${r.utrNumber}`,
              variant: 'success',
            });
          } else {
            toast({ title: 'Already settled', variant: 'info' });
          }
          return true;
        }
        case 'settleAll': {
          const receipts = settleAllChallans(action.challanIds);
          if (receipts.length) {
            const total = receipts.reduce((s, r) => s + r.totalPaid, 0);
            if (!silent) celebrate();
            toast({
              title: `${receipts.length} challans cleared`,
              description: `₹${total.toLocaleString('en-IN')} settled in one tap`,
              variant: 'success',
            });
          } else {
            toast({ title: 'Nothing pending', description: 'All challans are already clear.', variant: 'info' });
          }
          return true;
        }
        case 'payAll': {
          const pending = getAllChallans().filter((c) => c.status === 'PENDING');
          if (!pending.length) {
            toast({ title: 'All clear', description: 'No pending challans to pay.', variant: 'info' });
            return true;
          }
          const receipts = settleAllChallans(pending.map((c) => c.id));
          const total = receipts.reduce((s, r) => s + r.totalPaid, 0);
          if (!silent) celebrate();
          toast({
            title: `${receipts.length} challans cleared`,
            description: `₹${total.toLocaleString('en-IN')} settled in one tap`,
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
    [router, toast]
  );
}
