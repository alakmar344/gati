import {
  AlertTriangle,
  Radio,
  FileClock,
  ShieldAlert,
  Sparkles,
  CreditCard,
  RefreshCw,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { DemoUser, AnyApplication, ChallanRecord, FastagAccount } from './types';

export type Urgency = 'critical' | 'soon' | 'ok';

export type QuickAction =
  | { kind: 'settleChallan'; challanId: string }
  | { kind: 'settleAll'; challanIds: string[] }
  | { kind: 'topup'; amount: number }
  | { kind: 'nav'; href: string }
  | { kind: 'resume'; href: string };

export interface ActionItem {
  id: string;
  urgency: Urgency;
  icon: LucideIcon;
  /** short domain tag e.g. "Challan", "FASTag" */
  kicker: string;
  title: string;
  subtitle: string;
  /** money involved, if any */
  amount?: number;
  /** e.g. "in 12 days", "94 km/h" */
  meta?: string;
  actionLabel: string;
  action: QuickAction;
  /** true when Gati inferred this proactively rather than from a hard record */
  predicted?: boolean;
}

const URGENCY_RANK: Record<Urgency, number> = { critical: 0, soon: 1, ok: 2 };

/** stable pseudo-random 0..1 from a string (no Math.random → deterministic per persona) */
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/**
 * The heart of Gati Autopilot: read the citizen's live state and synthesize
 * a prioritised list of things that need them — each resolvable in one tap.
 */
export function computeInsights(params: {
  user: DemoUser;
  challans: ChallanRecord[];
  fastag: FastagAccount;
  apps: AnyApplication[];
  now?: Date;
}): ActionItem[] {
  const { user, challans, fastag, apps } = params;
  const now = params.now ?? new Date();
  const items: ActionItem[] = [];

  // 1) Pending challans — batch if more than one
  const pending = challans.filter((c) => c.status === 'PENDING');
  if (pending.length > 1) {
    const total = pending.reduce((s, c) => s + c.amount, 0);
    items.push({
      id: 'challans-all',
      urgency: 'critical',
      icon: AlertTriangle,
      kicker: 'Challans',
      title: `Clear ${pending.length} traffic challans`,
      subtitle: `Across your fleet — one tap settles every pending fine with UPI.`,
      amount: total,
      meta: `${pending.length} violations`,
      actionLabel: `Pay all ${formatShort(total)}`,
      action: { kind: 'settleAll', challanIds: pending.map((c) => c.id) },
    });
  } else if (pending.length === 1) {
    const c = pending[0];
    items.push({
      id: `challan-${c.id}`,
      urgency: 'critical',
      icon: AlertTriangle,
      kicker: 'Challan',
      title: c.violationType.replace(/\s*\(.*\)/, ''),
      subtitle: `${c.vehicleNumber} · ${c.city}`,
      amount: c.amount,
      meta: c.detectedSpeed ? `${c.detectedSpeed} in ${c.speedLimit} zone` : c.actSection,
      actionLabel: `Pay ${formatShort(c.amount)}`,
      action: { kind: 'settleChallan', challanId: c.id },
    });
  }

  // 2) FASTag balance
  const low = fastag.status === 'LOW_BALANCE' || fastag.walletBalance < 500;
  if (low) {
    items.push({
      id: 'fastag-low',
      urgency: fastag.walletBalance < 250 ? 'critical' : 'soon',
      icon: Radio,
      kicker: 'FASTag',
      title: 'FASTag balance running low',
      subtitle: `${fastag.vehicleNumber} · ${fastag.issuingBank}. Avoid blacklisting at toll plazas.`,
      amount: fastag.walletBalance,
      meta: `Balance ${formatShort(fastag.walletBalance)}`,
      actionLabel: 'Top up ₹1,000',
      action: { kind: 'topup', amount: 1000 },
    });
  }

  // 3) In-progress applications → resume in one tap
  apps
    .filter((a) => a.status !== 'card_generated' && a.currentStepIndex < a.totalSteps)
    .forEach((a) => {
      items.push({
        id: `resume-${a.id}`,
        urgency: 'soon',
        icon: FileClock,
        kicker: 'In progress',
        title: a.title,
        subtitle: `${a.nextActionLabel || 'Continue application'} · ${a.estimatedCompletion}`,
        meta: `Step ${a.currentStepIndex}/${a.totalSteps}`,
        actionLabel: 'Resume',
        action: { kind: 'resume', href: `/track?ref=${a.referenceNumber}` },
      });
    });

  // 4) Document/compliance expiries from real application fields (within 120 days)
  apps.forEach((a) => {
    if (a.serviceType !== 'vehicle-permit') return;
    const checks: { label: string; date?: string }[] = [
      { label: 'PUC certificate', date: (a as any).puccValidTill },
      { label: 'Fitness certificate', date: (a as any).fitnessValidTill },
      { label: 'Insurance', date: (a as any).insuranceValidTill },
    ];
    checks.forEach((chk) => {
      if (!chk.date) return;
      const d = new Date(chk.date);
      const days = daysBetween(now, d);
      if (days >= 0 && days <= 120) {
        items.push({
          id: `expiry-${a.id}-${chk.label}`,
          urgency: days <= 30 ? 'critical' : 'soon',
          icon: ShieldAlert,
          kicker: 'Renewal',
          title: `${chk.label} expiring`,
          subtitle: `${(a as any).vehicleRegNumber || a.title} — renew before it lapses.`,
          meta: `in ${days} days`,
          actionLabel: 'Renew',
          action: { kind: 'nav', href: '/vehicle-permit' },
        });
      }
    });
  });

  // 5) Proactive prediction — insurance renewal Gati infers for vehicle owners
  if (user.vehiclesCount > 0) {
    const s = seed(user.id);
    const days = 9 + Math.floor(s * 40); // 9..48 days, stable per persona
    items.push({
      id: 'predicted-insurance',
      urgency: days <= 20 ? 'soon' : 'ok',
      icon: RefreshCw,
      kicker: 'Predicted',
      predicted: true,
      title: 'Motor insurance renewal coming up',
      subtitle: `Gati spotted this from your ${user.vehiclesCount > 1 ? 'garage' : 'vehicle'} records. Lock this year’s rate early.`,
      meta: `in ${days} days`,
      actionLabel: 'Review',
      action: { kind: 'nav', href: '/documents' },
    });
  }

  // 6) A single opportunistic nudge (VIP plate) — lowest priority delight
  if (items.length < 3) {
    items.push({
      id: 'suggest-vip',
      urgency: 'ok',
      icon: Sparkles,
      kicker: 'For you',
      predicted: true,
      title: 'A signature VIP plate is up for grabs',
      subtitle: 'Rare choice numbers are live in the auction studio right now.',
      actionLabel: 'Explore',
      action: { kind: 'nav', href: '/fancy-numbers' },
    });
  }

  return items.sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]);
}

/** Estimated hours Gati saved vs. traditional RTO queues. Playful but grounded. */
export function computeTimeSaved(apps: AnyApplication[]): { hours: number; tasks: number } {
  const completed = apps.filter((a) => a.status === 'card_generated');
  // ~3.5h saved per completed digital journey vs physical RTO visit
  const hours = Math.round(completed.length * 3.5 + apps.length * 0.5);
  return { hours, tasks: apps.length };
}

function formatShort(n: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

export const URGENCY_STYLES: Record<
  Urgency,
  { chip: string; dot: string; label: string; ring: string; badge: string }
> = {
  critical: {
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border-rose-200 dark:border-rose-800/80',
    dot: 'bg-rose-500',
    label: 'Action Required',
    ring: 'ring-rose-500/20',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  soon: {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400 border-amber-200 dark:border-amber-800/80',
    dot: 'bg-amber-500',
    label: 'Coming Up',
    ring: 'ring-amber-500/20',
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  ok: {
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80',
    dot: 'bg-emerald-500',
    label: 'Recommended',
    ring: 'ring-emerald-500/15',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
};

export const QUICK_ICONS = { AlertTriangle, Radio, FileClock, ShieldAlert, Sparkles, CreditCard, RefreshCw, Wallet };
