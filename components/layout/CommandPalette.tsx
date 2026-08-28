'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Zap,
  Mic,
  Square,
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
import { useSpeechToText } from '@/components/copilot/useSpeechToText';
import { useLanguage } from '@/lib/i18n';

const EXAMPLES_EN = [
  'pay all my challans',
  'top up fastag 1000',
  'renew my licence',
  'register a new EV',
  'scan my RC',
  'book an ADTT slot',
];

const EXAMPLES_HI = [
  'मेरे सभी चालान भरें',
  'फास्टैग में 1000 डालें',
  'ड्राइविंग लाइसेंस नवीनीकृत करें',
  'नया ईवी पंजीकृत करें',
  'मेरी आरसी स्कैन करें',
  'एडीटीटी स्लॉट बुक करें',
];

type Row =
  | { type: 'suggestion'; data: Suggestion }
  | { type: 'insight'; data: ActionItem };

export function CommandPalette() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const run = useQuickAction();

  // Browser speech-to-text — speak a command instead of typing it
  const speech = useSpeechToText({
    lang: language === 'hi' ? 'hi-IN' : 'en-IN',
    onResult: (transcript, isFinal) => {
      setQuery(transcript);
      if (isFinal) requestAnimationFrame(() => inputRef.current?.focus());
    },
  });

  const examples = language === 'hi' ? EXAMPLES_HI : EXAMPLES_EN;

  // rotating placeholder
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setExampleIdx((i) => (i + 1) % examples.length), 2600);
    return () => clearInterval(t);
  }, [open, examples.length]);

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
      speech.stop();
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
      insights: computeInsights({ user, challans, fastag, apps, language }),
      pendingTotal: pending.reduce((s, c) => s + c.amount, 0),
      pendingCount: pending.length,
      balance: fastag.walletBalance,
    };
  }, [open, language]);

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
    return ctx.insights.slice(0, 5).map((i) => ({ type: 'insight', data: i }));
  }, [query, suggestions, ctx.insights]);

  // One flat ordered list — same order as rendered (suggested, then actions, then nav) —
  // used for BOTH rendering and keyboard navigation so highlight and Enter always agree.
  const grouped = useMemo(() => {
    const insight = rows.filter((r) => r.type === 'insight');
    const doNow = rows.filter((r) => r.type === 'suggestion' && r.data.group === 'Do it now');
    const goTo = rows.filter((r) => r.type === 'suggestion' && r.data.group === 'Go to');
    return { insight, doNow, goTo, flat: [...insight, ...doNow, ...goTo] };
  }, [rows]);

  const execute = useCallback(
    (row?: Row) => {
      const r = row || grouped.flat[active];
      if (!r) return;
      const action = r.type === 'suggestion' ? r.data.run : r.data.action;
      run(action as IntentRun);
      setOpen(false);
    },
    [grouped, active, run]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, grouped.flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute();
    }
  };

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row visible while arrow-navigating
  useEffect(() => {
    if (!open) return;
    document.getElementById(`gati-cmd-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  const renderRow = (r: Row, idx: number) => {
    const isActive = idx === active;
    const Icon = r.data.icon;
    const title = r.data.title;
    const hint = r.type === 'suggestion' ? r.data.hint : r.data.subtitle;
    const tint = r.type === 'suggestion' ? r.data.tint : 'text-olive-800 dark:text-olive-300 bg-olive-100 dark:bg-olive-950/60';
    const canRunInline =
      r.type === 'suggestion'
        ? r.data.run.kind !== 'nav'
        : r.data.action.kind !== 'nav' && r.data.action.kind !== 'resume';
    return (
      <button
        key={r.type + r.data.id}
        id={`gati-cmd-option-${idx}`}
        role="option"
        aria-selected={isActive}
        onMouseEnter={() => setActive(idx)}
        onClick={() => execute(r)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
          isActive ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
        }`}
      >
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/15 text-white' : tint}`}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{title}</span>
          {hint && <span className={`block text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>{hint}</span>}
        </span>
        {canRunInline && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
              isActive ? 'bg-olive-500/40 text-olive-100' : 'bg-olive-100 dark:bg-olive-900/60 text-olive-800 dark:text-olive-300'
            }`}
          >
            <Zap className="w-3 h-3 inline -mt-0.5" /> {t('cpRun')}
          </span>
        )}
        {isActive && <CornerDownLeft className="w-4 h-4 text-white/70 shrink-0" />}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[11vh] px-4 bg-slate-950/50 backdrop-blur-md animate-overlay-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl clay-card dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/80 dark:border-white/10 overflow-hidden animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search field */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-olive-700 dark:text-olive-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              speech.listening
                ? t('cpListening')
                : `${t('heroSearchPlaceholderPrefix')} “${examples[exampleIdx]}”`
            }
            role="combobox"
            aria-expanded="true"
            aria-controls="gati-cmd-listbox"
            aria-activedescendant={grouped.flat.length > 0 ? `gati-cmd-option-${active}` : undefined}
            className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={() => {
                speech.toggle();
                inputRef.current?.focus();
              }}
              aria-label={speech.listening ? t('cpVoiceStop') : t('cpVoiceStart')}
              aria-pressed={speech.listening}
              title={speech.listening ? t('cpVoiceStop') : t('cpVoiceStart')}
              className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all active:scale-95 ${
                speech.listening
                  ? 'bg-rose-600 text-white shadow-md animate-pulse-subtle'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-olive-100 dark:hover:bg-olive-950/60 hover:text-olive-800 dark:hover:text-olive-300'
              }`}
            >
              {speech.listening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div id="gati-cmd-listbox" role="listbox" className="max-h-[54vh] overflow-y-auto p-2">
          {grouped.flat.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {query.trim() ? `${t('cpNoMatchPrefix')} “${query}”. ${t('cpNoMatchSuffix')}` : t('cpEmptyHint')}
              </p>
            </div>
          ) : (
            <>
              {grouped.insight.length > 0 && (
                <Group label={t('cpSuggestedForYou')}>
                  {grouped.insight.map((r, i) => renderRow(r, i))}
                </Group>
              )}
              {grouped.doNow.length > 0 && (
                <Group label={t('cpDoItNow')}>
                  {grouped.doNow.map((r, i) => renderRow(r, grouped.insight.length + i))}
                </Group>
              )}
              {grouped.goTo.length > 0 && (
                <Group label={t('cpGoTo')}>
                  {grouped.goTo.map((r, i) => renderRow(r, grouped.insight.length + grouped.doNow.length + i))}
                </Group>
              )}
            </>
          )}
        </div>

        {/* Footer legend */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" /> {t('cpNavigate')}
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> {t('cpExecute')}
            </span>
          </div>
          <span className="flex items-center gap-1 font-semibold text-olive-800 dark:text-olive-300">
            <Zap className="w-3 h-3 text-saffron-500" /> {t('cpInstantExec')}
          </span>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="px-3 pt-2 pb-1 eyebrow text-slate-400 dark:text-slate-500">{label}</div>
      {children}
    </div>
  );
}
