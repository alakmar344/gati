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
  language?: 'en' | 'hi';
}): ActionItem[] {
  const { user, challans, fastag, apps } = params;
  const language = params.language ?? 'en';
  const L = (en: string, hi: string) => (language === 'hi' ? hi : en);
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
      kicker: L('Challans', 'चालान'),
      title: L(`Clear ${pending.length} traffic challans`, `${pending.length} ट्रैफ़िक चालान चुकाएँ`),
      subtitle: L(
        `Across your fleet — one tap settles every pending fine with UPI.`,
        `आपके पूरे बेड़े में — एक टैप से हर बकाया जुर्माना UPI से चुक जाएगा।`
      ),
      amount: total,
      meta: L(`${pending.length} violations`, `${pending.length} उल्लंघन`),
      actionLabel: L(`Pay all ${formatShort(total)}`, `सभी ${formatShort(total)} चुकाएँ`),
      action: { kind: 'settleAll', challanIds: pending.map((c) => c.id) },
    });
  } else if (pending.length === 1) {
    const c = pending[0];
    items.push({
      id: `challan-${c.id}`,
      urgency: 'critical',
      icon: AlertTriangle,
      kicker: L('Challan', 'चालान'),
      title: c.violationType.replace(/\s*\(.*\)/, ''),
      subtitle: `${c.vehicleNumber} · ${c.city}`,
      amount: c.amount,
      meta: c.detectedSpeed
        ? L(`${c.detectedSpeed} in ${c.speedLimit} zone`, `${c.speedLimit} ज़ोन में ${c.detectedSpeed}`)
        : c.actSection,
      actionLabel: L(`Pay ${formatShort(c.amount)}`, `${formatShort(c.amount)} चुकाएँ`),
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
      title: L('FASTag balance running low', 'FASTag बैलेंस कम हो रहा है'),
      subtitle: L(
        `${fastag.vehicleNumber} · ${fastag.issuingBank}. Avoid blacklisting at toll plazas.`,
        `${fastag.vehicleNumber} · ${fastag.issuingBank}। टोल प्लाज़ा पर ब्लैकलिस्ट होने से बचें।`
      ),
      amount: fastag.walletBalance,
      meta: L(`Balance ${formatShort(fastag.walletBalance)}`, `बैलेंस ${formatShort(fastag.walletBalance)}`),
      actionLabel: L('Top up ₹1,000', '₹1,000 टॉप-अप करें'),
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
        kicker: L('In progress', 'प्रगति पर'),
        title: a.title,
        subtitle: `${a.nextActionLabel || L('Continue application', 'आवेदन जारी रखें')} · ${a.estimatedCompletion}`,
        meta: L(`Step ${a.currentStepIndex}/${a.totalSteps}`, `चरण ${a.currentStepIndex}/${a.totalSteps}`),
        actionLabel: L('Resume', 'जारी रखें'),
        action: { kind: 'resume', href: `/track?ref=${a.referenceNumber}` },
      });
    });

  // 4) Document/compliance expiries from real application fields (within 120 days)
  apps.forEach((a) => {
    if (a.serviceType !== 'vehicle-permit') return;
    const checks: { key: string; label: string; date?: string }[] = [
      { key: 'PUC certificate', label: L('PUC certificate', 'PUC प्रमाणपत्र'), date: (a as any).puccValidTill },
      { key: 'Fitness certificate', label: L('Fitness certificate', 'फिटनेस प्रमाणपत्र'), date: (a as any).fitnessValidTill },
      { key: 'Insurance', label: L('Insurance', 'बीमा'), date: (a as any).insuranceValidTill },
    ];
    checks.forEach((chk) => {
      if (!chk.date) return;
      const d = new Date(chk.date);
      const days = daysBetween(now, d);
      if (days >= 0 && days <= 120) {
        items.push({
          id: `expiry-${a.id}-${chk.key}`,
          urgency: days <= 30 ? 'critical' : 'soon',
          icon: ShieldAlert,
          kicker: L('Renewal', 'नवीनीकरण'),
          title: L(`${chk.label} expiring`, `${chk.label} की अवधि समाप्त हो रही है`),
          subtitle: L(
            `${(a as any).vehicleRegNumber || a.title} — renew before it lapses.`,
            `${(a as any).vehicleRegNumber || a.title} — समाप्त होने से पहले नवीनीकरण करा लें।`
          ),
          meta: L(`in ${days} days`, `${days} दिनों में`),
          actionLabel: L('Renew', 'नवीनीकरण करें'),
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
      kicker: L('Predicted', 'पूर्वानुमान'),
      predicted: true,
      title: L('Motor insurance renewal coming up', 'मोटर बीमा नवीनीकरण नज़दीक है'),
      subtitle: L(
        `Gati spotted this from your ${user.vehiclesCount > 1 ? 'garage' : 'vehicle'} records. Lock this year’s rate early.`,
        `गति ने आपके ${user.vehiclesCount > 1 ? 'गैराज' : 'वाहन'} रिकॉर्ड से यह पहचाना। इस साल की दर पहले ही लॉक करें।`
      ),
      meta: L(`in ${days} days`, `${days} दिनों में`),
      actionLabel: L('Review', 'देखें'),
      action: { kind: 'nav', href: '/documents' },
    });
  }

  // 6) A single opportunistic nudge (VIP plate) — lowest priority delight
  if (items.length < 3) {
    items.push({
      id: 'suggest-vip',
      urgency: 'ok',
      icon: Sparkles,
      kicker: L('For you', 'आपके लिए'),
      predicted: true,
      title: L('A signature VIP plate is up for grabs', 'एक ख़ास VIP नंबर प्लेट आपका इंतज़ार कर रही है'),
      subtitle: L(
        'Rare choice numbers are live in the auction studio right now.',
        'दुर्लभ पसंदीदा नंबर अभी नीलामी स्टूडियो में लाइव हैं।'
      ),
      actionLabel: L('Explore', 'एक्सप्लोर करें'),
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
  { chip: string; dot: string; label: string; labelHi: string; ring: string; badge: string }
> = {
  critical: {
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400 border-rose-200 dark:border-rose-800/80',
    dot: 'bg-rose-500',
    label: 'Action Required',
    labelHi: 'कार्रवाई आवश्यक',
    ring: 'ring-rose-500/20',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  soon: {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400 border-amber-200 dark:border-amber-800/80',
    dot: 'bg-amber-500',
    label: 'Coming Up',
    labelHi: 'आगामी',
    ring: 'ring-amber-500/20',
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  ok: {
    chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80',
    dot: 'bg-emerald-500',
    label: 'Recommended',
    labelHi: 'अनुशंसित',
    ring: 'ring-emerald-500/15',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
};

export const QUICK_ICONS = { AlertTriangle, Radio, FileClock, ShieldAlert, Sparkles, CreditCard, RefreshCw, Wallet };
