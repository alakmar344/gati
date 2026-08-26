'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { computeInsights, ActionItem, URGENCY_STYLES } from '@/lib/insights';
import { formatINR } from '@/lib/utils';
import {
  getCurrentUser,
  getAllChallans,
  getFastagAccount,
  getApplicationsForUser,
} from '@/lib/storage';
import { useQuickAction } from './useQuickAction';
import { useMounted } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Primitives';
import { useLanguage } from '@/lib/i18n';

export function ActionFeed({
  limit,
  showHandleAll = true,
  dark = false,
}: {
  limit?: number;
  showHandleAll?: boolean;
  dark?: boolean;
}) {
  const mounted = useMounted();
  const { t } = useLanguage();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const run = useQuickAction();

  const recompute = useCallback(() => {
    const user = getCurrentUser();
    setItems(
      computeInsights({
        user,
        challans: getAllChallans(),
        fastag: getFastagAccount(),
        apps: getApplicationsForUser(user.id),
      })
    );
  }, []);

  useEffect(() => {
    recompute();
    const events = [
      'gati_user_changed',
      'gati_challans_updated',
      'gati_fastag_updated',
      'gati_applications_updated',
      'gati_payments_updated',
    ];
    events.forEach((e) => window.addEventListener(e, recompute));
    return () => events.forEach((e) => window.removeEventListener(e, recompute));
  }, [recompute]);

  const handle = (item: ActionItem) => {
    setBusy(item.id);
    setTimeout(() => {
      const inline = run(item.action);
      setBusy(null);
      if (inline) recompute();
    }, 260);
  };

  const handleAll = () => {
    const actionable = items.filter(
      (i) => i.action.kind === 'settleAll' || i.action.kind === 'settleChallan' || i.action.kind === 'topup'
    );
    if (!actionable.length) return;
    setBusy('__all__');
    setTimeout(() => {
      actionable.forEach((i) => run(i.action));
      setBusy(null);
      recompute();
    }, 300);
  };

  const shown = limit ? items.slice(0, limit) : items;
  const inlineResolvable = items.filter(
    (i) => i.action.kind === 'settleAll' || i.action.kind === 'settleChallan' || i.action.kind === 'topup'
  ).length;
  const critical = items.filter((i) => i.urgency === 'critical').length;

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 border border-olive-200 dark:border-olive-800/60 mb-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-olive-700 dark:text-olive-400" />
            <span className="uppercase tracking-wider text-[10px]">{t('autopilotTitle')}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {critical > 0 ? (
              <>
                {critical} action{critical > 1 ? 's' : ''} pending —{' '}
                <span className="text-saffron-600 dark:text-saffron-400">FastTrack Settle</span>
              </>
            ) : (
              <>{t('resolved')}</>
            )}
          </h2>
        </div>
        {showHandleAll && inlineResolvable > 1 && (
          <button
            onClick={handleAll}
            disabled={busy !== null}
            className="clay-btn clay-btn-saffron min-h-[44px] px-5 py-2.5 text-xs shrink-0 disabled:opacity-60 text-white font-bold shadow-md self-start sm:self-auto"
          >
            {busy === '__all__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Resolve all pending</span>
          </button>
        )}
      </div>

      {/* Items Grid */}
      {shown.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-olive-100 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="font-display font-extrabold text-lg text-slate-900 dark:text-white">{t('noActions')}</div>
          <div className="text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Gati Autopilot is actively watching your vehicle registrations, challans, FASTag, and upcoming compliance renewals.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {shown.map((item) => {
            const u = URGENCY_STYLES[item.urgency];
            const Icon = item.icon;
            const working = busy === item.id || busy === '__all__';
            return (
              <div
                key={item.id}
                className="clay-card clay-card-interactive p-5 flex flex-col justify-between gap-4 group rounded-3xl"
              >
                <div>
                  {/* Top line: Icon + Category Badge + Urgency */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${u.chip} border shadow-xs`}>
                        <Icon className="w-5 h-5" />
                        {item.urgency === 'critical' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className={`absolute inline-flex h-full w-full rounded-full ${u.dot} opacity-70 animate-ping`} />
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${u.dot}`} />
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="eyebrow text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] block">
                          {item.kicker}
                        </span>
                        {item.predicted && (
                          <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {t('predictedBadge')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${u.badge}`}>
                      {u.label}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-display font-extrabold text-[15px] leading-snug text-slate-900 dark:text-white group-hover:text-olive-700 dark:group-hover:text-olive-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-1.5">
                    {item.subtitle}
                  </p>
                </div>

                {/* Bottom Bar: Meta info chip + Action Button */}
                <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  {item.meta ? (
                    <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-200/70 dark:border-slate-700 truncate max-w-[130px]">
                      {item.meta}
                    </span>
                  ) : item.amount !== undefined && item.action.kind !== 'topup' ? (
                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatINR(item.amount)}
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => handle(item)}
                    disabled={busy !== null}
                    className={`clay-btn min-h-[42px] px-4 py-2 text-xs font-bold disabled:opacity-60 flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
                      item.urgency === 'critical'
                        ? 'clay-btn-saffron text-white'
                        : 'clay-btn-primary text-white'
                    }`}
                  >
                    {working ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
