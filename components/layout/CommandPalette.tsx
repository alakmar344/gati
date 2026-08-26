'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Command as CmdIcon,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import { parseIntent, Suggestion, IntentRun } from '@/lib/intent';
import { computeInsights, ActionItem } from '@/lib/insights';
import {
  getCurrentUser,
  getAllChallans,
  getFastagAccount,
  getApplicationsForUser,
} from '@/lib/storage';
import { useQuickAction } from '@/components/copilot/useQuickAction';

const EXAMPLES = [
  'pay all my challans',
  'top up fastag 1000',
  'renew my licence',
  'register a new EV',
  'scan my RC',
  'book an ADTT slot',
];

type Row =
  | { type: 'suggestion'; data: Suggestion }
  | { type: 'insight'; data: ActionItem };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const run = useQuickAction();

  // rotating placeholder
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLES.length), 2600);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.q) setQuery(String(detail.q));
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('gati_open_command', onOpen as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('gati_open_command', onOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // live context for smarter labels + proactive suggestions
  const ctx = useMemo(() => {
    if (!open) return { insights: [] as ActionItem[], pendingTotal: 0, pendingCount: 0, balance: 0 };
    const user = getCurrentUser();
    const challans = getAllChallans();
    const fastag = getFastagAccount();
    const apps = getApplicationsForUser(user.id);
    const pending = challans.filter((c) => c.status === 'PENDING');
    return {
      insights: computeInsights({ user, challans, fastag, apps }),
      pendingTotal: pending.reduce((s, c) => s + c.amount, 0),
      pendingCount: pending.length,
      balance: fastag.walletBalance,
    };
    // recompute whenever opened or query changes (cheap)
  }, [open, query]);

  const suggestions = useMemo(
    () =>
      parseIntent(query, {
        pendingChallanTotal: ctx.pendingTotal,
        pendingChallanCount: ctx.pendingCount,
        fastagBalance: ctx.balance,
      }),
    [query, ctx]
  );

  const rows: Row[] = useMemo(() => {
    if (query.trim()) return suggestions.map((s) => ({ type: 'suggestion', data: s }));
    // empty query → proactive: top insights first
    return ctx.insights.slice(0, 5).map((i) => ({ type: 'insight', data: i }));
  }, [query, suggestions, ctx.insights]);

  const execute = useCallback(
    (row?: Row) => {
      const r = row || rows[active];
      if (!r) return;
      const action = r.type === 'suggestion' ? r.data.run : r.data.action;
      const inline = run(action as IntentRun);
      setOpen(false);
    },
    [rows, active, run]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute();
    }
  };

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const doNow = rows.filter((r) => (r.type === 'suggestion' ? r.data.group === 'Do it now' : false));
  const goTo = rows.filter((r) => r.type === 'suggestion' && r.data.group === 'Go to');
  const insightRows = rows.filter((r) => r.type === 'insight');

  let idxCounter = -1;
  const renderRow = (r: Row) => {
    idxCounter++;
    const idx = idxCounter;
    const isActive = idx === active;
    const Icon = r.type === 'suggestion' ? r.data.icon : r.data.icon;
    const title = r.type === 'suggestion' ? r.data.title : r.data.title;
    const hint = r.type === 'suggestion' ? r.data.hint : r.data.subtitle;
    const tint = r.type === 'suggestion' ? r.data.tint : 'text-emerald-700 bg-emerald-100';
    const canRunInline =
      r.type === 'suggestion'
        ? r.data.run.kind !== 'nav'
        : r.data.action.kind !== 'nav' && r.data.action.kind !== 'resume';
    return (
      <button
        key={r.type + (r.type === 'suggestion' ? r.data.id : r.data.id)}
        onMouseEnter={() => setActive(idx)}
        onClick={() => execute(r)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
          isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100/70'
        }`}
      >
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/15 text-white' : tint}`}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{title}</span>
          {hint && <span className={`block text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-500'}`}>{hint}</span>}
        </span>
        {canRunInline && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              isActive ? 'bg-emerald-500/30 text-emerald-100' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Zap className="w-3 h-3 inline -mt-0.5" /> run
          </span>
        )}
        {isActive && <CornerDownLeft className="w-4 h-4 text-white/70 shrink-0" />}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[11vh] px-4 bg-slate-950/45 backdrop-blur-md animate-overlay-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-white/70 overflow-hidden animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search field */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Wand2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask Gati to “${EXAMPLES[exampleIdx]}”`}
            className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[54vh] overflow-y-auto p-2">
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                {query.trim() ? `No match for “${query}”. Try a service name or an action.` : 'Type what you need done.'}
              </p>
            </div>
          ) : (
            <>
              {insightRows.length > 0 && (
                <Group label="Suggested for you">{insightRows.map(renderRow)}</Group>
              )}
              {doNow.length > 0 && <Group label="Do it now">{doNow.map(renderRow)}</Group>}
              {goTo.length > 0 && <Group label="Go to">{goTo.map(renderRow)}</Group>}
            </>
          )}
        </div>

        {/* Footer legend */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" /> navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> run
            </span>
          </div>
          <span className="flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Gati Copilot
          </span>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="px-3 pt-2 pb-1 eyebrow text-slate-400">{label}</div>
      {children}
    </div>
  );
}
