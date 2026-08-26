import { Zap, Radio, AlertTriangle, ScanLine, type LucideIcon } from 'lucide-react';
import { ALL_NAV } from './nav';

export type IntentRun =
  | { kind: 'topup'; amount: number }
  | { kind: 'payAll' }
  | { kind: 'nav'; href: string };

export interface Suggestion {
  id: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  group: 'Do it now' | 'Go to';
  run: IntentRun;
  tint: string;
  score: number;
}

export interface IntentCtx {
  pendingChallanTotal?: number;
  pendingChallanCount?: number;
  fastagBalance?: number;
}

/** parse "1000", "1,000", "₹500", "2k" → number */
function parseAmount(q: string): number | null {
  const k = q.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  const m = q.match(/(?:₹|rs\.?|inr)?\s*(\d[\d,]{1,7})/i);
  if (m) {
    const n = parseInt(m[1].replace(/,/g, ''), 10);
    if (!isNaN(n)) return n;
  }
  return null;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

/**
 * Turn a free-text query into ranked, executable suggestions.
 * "Do it now" items mutate state directly; "Go to" items navigate to a flow.
 */
export function parseIntent(query: string, ctx: IntentCtx = {}): Suggestion[] {
  const q = query.trim().toLowerCase();
  const out: Suggestion[] = [];

  if (!q) return out;

  const amount = parseAmount(q);

  // --- Quick actions (execute inline) ---
  if (has(q, 'top up', 'topup', 'recharge', 'add money', 'load', 'fastag balance') || (has(q, 'fastag') && amount)) {
    const amt = amount || 500;
    out.push({
      id: 'run-topup',
      icon: Radio,
      title: `Top up FASTag by ₹${amt.toLocaleString('en-IN')}`,
      hint: ctx.fastagBalance !== undefined ? `Balance ₹${ctx.fastagBalance.toLocaleString('en-IN')}` : 'Instant',
      group: 'Do it now',
      run: { kind: 'topup', amount: amt },
      tint: 'text-sky-700 bg-sky-100',
      score: 100,
    });
  }

  if (has(q, 'pay', 'clear', 'settle') && has(q, 'challan', 'challans', 'fine', 'fines', 'all')) {
    out.push({
      id: 'run-payall',
      icon: AlertTriangle,
      title: ctx.pendingChallanCount
        ? `Pay all ${ctx.pendingChallanCount} challans`
        : 'Pay all pending challans',
      hint: ctx.pendingChallanTotal ? `₹${ctx.pendingChallanTotal.toLocaleString('en-IN')}` : 'UPI',
      group: 'Do it now',
      run: { kind: 'payAll' },
      tint: 'text-rose-700 bg-rose-100',
      score: 100,
    });
  }

  if (has(q, 'scan', 'ocr') && !has(q, 'go to')) {
    out.push({
      id: 'run-scan',
      icon: ScanLine,
      title: 'Scan a document with Smart Lens',
      hint: '0.3s OCR',
      group: 'Do it now',
      run: { kind: 'nav', href: '/scan' },
      tint: 'text-emerald-700 bg-emerald-100',
      score: 90,
    });
  }

  if (has(q, 'fastpass', 'instant pass', 'emergency pass', 'green pass')) {
    out.push({
      id: 'run-fastpass',
      icon: Zap,
      title: 'Mint a 10-second FastPass',
      hint: 'Instant',
      group: 'Do it now',
      run: { kind: 'nav', href: '/fastpass' },
      tint: 'text-amber-700 bg-amber-100',
      score: 90,
    });
  }

  // --- Navigation via keyword scoring over the nav registry ---
  const tokens = q.split(/\s+/).filter(Boolean);
  ALL_NAV.forEach((item) => {
    const hay = `${item.name} ${item.desc} ${item.keywords || ''}`.toLowerCase();
    let score = 0;
    tokens.forEach((t) => {
      if (item.name.toLowerCase().includes(t)) score += 8;
      else if ((item.keywords || '').includes(t)) score += 5;
      else if (hay.includes(t)) score += 2;
    });
    if (score > 0) {
      out.push({
        id: `nav-${item.href}`,
        icon: item.icon,
        title: item.name,
        hint: item.desc,
        group: 'Go to',
        run: { kind: 'nav', href: item.href },
        tint: item.tint,
        score,
      });
    }
  });

  return out.sort((a, b) => b.score - a.score).slice(0, 6);
}
