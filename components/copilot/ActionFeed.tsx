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
    // brief delay so the "working" state is felt, then execute
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
          <div className={`inline-flex items-center gap-1.5 eyebrow ${dark ? 'text-olive-400' : 'text-olive-800'}`}>
            <Wand2 className="w-3.5 h-3.5 text-saffron-600" /> Gati Autopilot
          </div>
          <h2 className={`font-display text-2xl sm:text-[1.75rem] font-extrabold tracking-tight mt-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
            {critical > 0 ? (
              <>
                {critical} thing{critical > 1 ? 's' : ''} need{critical > 1 ? '' : 's'} you —{' '}
                <span className="text-saffron-500">I can handle them</span>
              </>
            ) : (
              <>You&apos;re all caught up ✨</>
            )}
          </h2>
        </div>
        {showHandleAll && inlineResolvable > 1 && (
          <button
            onClick={handleAll}
            disabled={busy !== null}
            className="btn btn-brand px-4 py-2.5 text-xs shrink-0 disabled:opacity-60"
          >
            {busy === '__all__' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Handle everything
          </button>
        )}
      </div>

      {/* Items */}
      {shown.length === 0 ? (
        <div className={`rounded-3xl border p-8 text-center ${dark ? 'border-white/10 bg-white/[0.03]' : 'card'}`}>
          <div className="w-12 h-12 rounded-2xl bg-olive-100 text-olive-800 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>Nothing needs you right now</div>
          <div className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gati is watching your challans, FASTag, renewals and applications.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
          {shown.map((item) => {
            const u = URGENCY_STYLES[item.urgency];
            const Icon = item.icon;
            const working = busy === item.id || busy === '__all__';
            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl p-4 flex flex-col gap-3 transition-all ${
                  dark
                    ? 'bg-white/[0.05] border border-white/10 hover:bg-white/[0.08]'
                    : 'card card-hover'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${u.chip} border`}>
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
                      <span className={`eyebrow ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{item.kicker}</span>
                      {item.predicted && (
                        <span className="text-[10px] font-bold text-saffron-600 inline-flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> predicted
                        </span>
                      )}
                    </div>
                    <div className={`font-bold text-[15px] leading-snug mt-0.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {item.title}
                    </div>
                    <div className={`text-xs leading-snug mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                  {item.amount !== undefined && item.action.kind !== 'topup' && (
                    <div className={`font-display font-extrabold text-lg shrink-0 ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {formatINR(item.amount)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {item.meta ? (
                    <span className={`text-[11px] font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{item.meta}</span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => handle(item)}
                    disabled={busy !== null}
                    className={`btn px-4 py-2 text-xs disabled:opacity-60 ${
                      item.urgency === 'critical' ? 'btn-brand' : dark ? 'btn-ghost' : 'btn-primary'
                    }`}
                  >
                    {working ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {item.actionLabel}
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
