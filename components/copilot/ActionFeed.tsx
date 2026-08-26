'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Loader2, Wand2 } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 eyebrow text-olive-800 dark:text-olive-400">
            <Wand2 className="w-3.5 h-3.5 text-saffron-600 dark:text-saffron-400" /> {t('autopilotTitle')}
          </div>
          <h2 className="font-display text-2xl sm:text-[1.75rem] font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
            {critical > 0 ? (
              <>
                {critical} action{critical > 1 ? 's' : ''} pending —{' '}
                <span className="text-saffron-600 dark:text-saffron-400">1-Click FastTrack</span>
              </>
            ) : (
              <>{t('resolved')} ✨</>
            )}
          </h2>
        </div>
        {showHandleAll && inlineResolvable > 1 && (
          <button
            onClick={handleAll}
            disabled={busy !== null}
            className="clay-btn clay-btn-saffron px-4 py-2 text-xs shrink-0 disabled:opacity-60 text-white"
          >
            {busy === '__all__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Resolve all pending
          </button>
        )}
      </div>

      {/* Items */}
      {shown.length === 0 ? (
        <div className="clay-card p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-olive-100 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="font-bold text-slate-900 dark:text-white">{t('noActions')}</div>
          <div className="text-sm mt-1 text-slate-500 dark:text-slate-400">
            Gati is watching your challans, FASTag, renewals and applications.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 stagger">
          {shown.map((item) => {
            const u = URGENCY_STYLES[item.urgency];
            const Icon = item.icon;
            const working = busy === item.id || busy === '__all__';
            return (
              <div
                key={item.id}
                className="clay-card clay-card-interactive p-4.5 flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${u.chip} border shadow-xs`}>
                    <Icon className="w-5 h-5" />
                    {item.urgency === 'critical' && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className={`absolute inline-flex h-full w-full rounded-full ${u.dot} opacity-70 animate-ping`} />
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${u.dot}`} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="eyebrow text-slate-400 dark:text-slate-500">{item.kicker}</span>
                      {item.predicted && (
                        <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 inline-flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> {t('predictedBadge')}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-[15px] leading-snug mt-0.5 text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs leading-snug mt-1 text-slate-500 dark:text-slate-400">
                      {item.subtitle}
                    </div>
                  </div>
                  {item.amount !== undefined && item.action.kind !== 'topup' && (
                    <div className="font-display font-extrabold text-lg shrink-0 text-slate-900 dark:text-white">
                      {formatINR(item.amount)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {item.meta ? (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{item.meta}</span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => handle(item)}
                    disabled={busy !== null}
                    className={`clay-btn px-4 py-1.5 text-xs disabled:opacity-60 ${
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
