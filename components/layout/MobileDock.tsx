'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Command, House, LayoutDashboard, MapPin, ReceiptText } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

/**
 * Persistent mobile navigation for the five journeys people use most.
 * Desktop already has a full navigation bar, so this only appears below lg.
 */
export function MobileDock() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = [
    { href: '/', label: t('dockHome'), icon: House, matches: (path: string) => path === '/' },
    { href: '/track', label: t('dockTrack'), icon: MapPin, matches: (path: string) => path === '/track' },
    { href: '/challans', label: t('dockFines'), icon: ReceiptText, matches: (path: string) => path === '/challans' },
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, matches: (path: string) => path === '/dashboard' },
  ];

  const openCommand = () => window.dispatchEvent(new Event('gati_open_command'));

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="lg:hidden fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-[1.35rem] border border-white/70 dark:border-white/10 bg-white/90 dark:bg-[#142017]/95 px-2 py-2 shadow-[0_16px_40px_-12px_rgba(20,30,23,.35)] backdrop-blur-xl"
    >
      <div className="grid grid-cols-5 items-center">
        {items.slice(0, 2).map((item) => <DockLink key={item.href} {...item} active={item.matches(pathname)} />)}
        <button
          type="button"
          onClick={openCommand}
          className="group -mt-6 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[var(--canvas)] bg-gradient-to-br from-olive-700 to-olive-900 text-white shadow-lg transition-transform active:scale-95"
          aria-label={t('askGati')}
        >
          <Command className="h-5 w-5 transition-transform group-active:scale-90" />
        </button>
        {items.slice(2).map((item) => <DockLink key={item.href} {...item} active={item.matches(pathname)} />)}
      </div>
    </nav>
  );
}

function DockLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof House; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-bold transition-colors ${
        active
          ? 'text-olive-800 dark:text-olive-300'
          : 'text-slate-400 dark:text-slate-500'
      }`}
    >
      <span className={`flex h-6 w-8 items-center justify-center rounded-lg ${active ? 'bg-olive-100 dark:bg-olive-950/70' : ''}`}>
        <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
      </span>
      <span className="max-w-[68px] truncate">{label}</span>
    </Link>
  );
}
