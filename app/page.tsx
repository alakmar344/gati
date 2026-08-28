'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Command as CmdIcon,
  Clock,
  Wand2,
  ChevronRight,
  ShieldCheck,
  Search,
  Zap,
  Car,
  CreditCard,
  Truck,
  Compass,
  ScanLine,
  Layers,
} from 'lucide-react';
import { CORE_SERVICES, SPEED_TOOLS, NavItem, navItemName, navItemDesc } from '@/lib/nav';
import { ActionFeed } from '@/components/copilot/ActionFeed';
import { computeTimeSaved } from '@/lib/insights';
import { getCurrentUser, getApplicationsForUser } from '@/lib/storage';
import { DemoUser } from '@/lib/types';
import { useMounted } from '@/components/ui/Toast';
import { useLanguage } from '@/lib/i18n';

const EXAMPLES_EN = [
  'pay all my challans',
  'top up fastag ₹1,000',
  'renew my licence',
  'register a new EV',
  'scan my RC',
];

const EXAMPLES_HI = [
  'मेरे सभी चालान भरें',
  'फास्टैग में ₹1,000 डालें',
  'ड्राइविंग लाइसेंस नवीनीकृत करें',
  'नया ईवी पंजीकृत करें',
  'मेरी आरसी स्कैन करें',
];

function openCopilot(q?: string) {
  window.dispatchEvent(new CustomEvent('gati_open_command', { detail: q ? { q } : undefined }));
}

type ServiceCategory = 'ALL' | 'VEHICLE' | 'DRIVER' | 'TOLLS' | 'TOOLS';

export default function HomePage() {
  const mounted = useMounted();
  const { language, t } = useLanguage();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [saved, setSaved] = useState({ hours: 0, tasks: 0 });
  const [ph, setPh] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const examples = language === 'hi' ? EXAMPLES_HI : EXAMPLES_EN;

  const load = () => {
    const u = getCurrentUser();
    setUser(u);
    setSaved(computeTimeSaved(getApplicationsForUser(u.id)));
  };

  useEffect(() => {
    load();
    const evs = ['gati_user_changed', 'gati_applications_updated', 'gati_payments_updated'];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % examples.length), 2800);
    return () => clearInterval(t);
  }, [examples.length]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  }, [t]);

  // Combined master list of all actions & tools
  const allItems: (NavItem & { category: ServiceCategory })[] = useMemo(() => [
    { ...CORE_SERVICES[0], category: 'VEHICLE' },
    { ...CORE_SERVICES[1], category: 'VEHICLE' },
    { ...CORE_SERVICES[2], category: 'DRIVER' },
    { ...CORE_SERVICES[3], category: 'TOLLS' },
    { ...SPEED_TOOLS[0], category: 'TOOLS' },
    { ...SPEED_TOOLS[1], category: 'TOLLS' },
    { ...SPEED_TOOLS[2], category: 'VEHICLE' },
    { ...SPEED_TOOLS[3], category: 'TOLLS' },
    { ...SPEED_TOOLS[4], category: 'VEHICLE' },
    { ...SPEED_TOOLS[5], category: 'DRIVER' },
  ], []);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        navItemName(item, t).toLowerCase().includes(q) ||
        navItemDesc(item, t).toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [allItems, activeCategory, searchQuery, t]);

  return (
    <div className="flex flex-col space-y-10 sm:space-y-14 pb-16">
      {/* ================= COCKPIT HERO ================= */}
      <section className="px-3 sm:px-6 pt-2">
        <div className="relative max-w-6xl mx-auto rounded-[2.5rem] overflow-hidden bg-slate-950 text-white shadow-2xl border border-white/10 dark:border-white/15">
          {/* Restored Indian Expressway Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 transition-transform duration-1000 opacity-30"
            style={{
              backgroundImage: `url('/images/hero-expressway.jpg')`,
            }}
            aria-hidden="true"
          />
          {/* Ambient atmosphere gradient overlay */}
          <div
            className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95 backdrop-blur-[0.5px]"
            aria-hidden="true"
          />
          {/* Ambient Tiranga light pools */}
          <div className="absolute -top-32 -left-16 w-96 h-96 rounded-full bg-saffron-500/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-olive-500/20 blur-3xl" aria-hidden="true" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[20rem] rounded-full bg-ashoka-600/10 blur-3xl" aria-hidden="true" />

          {/* Micro grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 px-5 sm:px-12 py-12 sm:py-16 text-center flex flex-col items-center">
            {/* National Sovereign Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 shadow-sm backdrop-blur-md animate-rise">
              <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                {t('heroTag')}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.06] max-w-3xl text-balance animate-rise">
              {mounted && user ? (
                <>
                  {greeting}, {user.name.split(' ')[0]}.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-300 via-amber-200 to-olive-300">
                    {t('heroHeadingPersonal')}
                  </span>
                </>
              ) : (
                <>
                  {t('heroHeadingMain')}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-300 via-amber-200 to-olive-300">
                    {t('heroHeadingHighlight')}
                  </span>
                </>
              )}
            </h1>

            {/* Centralized Search & Command Dock */}
            <button
              onClick={() => openCopilot()}
              className="group relative w-full max-w-xl mx-auto mt-8 animate-rise"
              style={{ animationDelay: '0.08s' }}
            >
              <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-olive-600/60 via-saffron-600/40 to-olive-600/60 blur opacity-50 group-hover:opacity-90 transition-opacity" aria-hidden="true" />
              <span className="relative flex items-center gap-3 rounded-2xl bg-white/[0.09] border border-white/20 px-4 py-3.5 text-left backdrop-blur-md shadow-xl transition-all group-hover:bg-white/[0.14] min-h-[48px]">
                <Search className="w-5 h-5 text-saffron-400 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] sm:text-[15px] text-slate-200 truncate">
                    {t('heroSearchPlaceholderPrefix')}: <span className="text-white font-semibold">“{examples[ph]}”</span>
                  </span>
                </span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-200 bg-white/10 border border-white/20 rounded-md px-2 py-1 shrink-0 shadow-inner">
                  <CmdIcon className="w-3 h-3" /> K
                </kbd>
              </span>
            </button>

            {/* Two decisive shortcuts; everything else is discoverable below. */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 animate-rise" style={{ animationDelay: '0.11s' }}>
              <Link href="/challans" className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 transition-colors backdrop-blur-sm min-h-[36px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-rose-300" />
                <span>{t('payChallans')}</span>
              </Link>
              <Link href="/fastag" className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-100 transition-colors backdrop-blur-sm min-h-[36px] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-300" />
                <span>{t('rechargeFastag')}</span>
              </Link>
            </div>

            {/* Live Metrics */}
            <div className="flex items-center gap-6 mt-6 text-sm animate-rise" style={{ animationDelay: '0.14s' }}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-olive-400" />
                <span className="text-slate-300 text-xs sm:text-sm">
                  <strong className="font-display font-extrabold text-white">{mounted ? saved.hours : '—'}h</strong> {t('hoursSaved')}
                </span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-saffron-400" />
                {t('zeroForms')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACTIVE COMPLIANCE RADAR ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full">
        <ActionFeed />
      </section>

      {/* ================= CENTRALIZED UNIFIED SERVICE MATRIX ================= */}
      <section className="px-4 sm:px-8 max-w-6xl mx-auto w-full">
        {/* Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('allActions')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('serviceMatrixSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <label className="relative block sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="clay-input w-full pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                placeholder={language === 'hi' ? 'सेवा खोजें' : 'Find a service'}
                aria-label={language === 'hi' ? 'सेवा खोजें' : 'Find a service'}
              />
            </label>
          {/* Centralized Category Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 w-fit overflow-x-auto max-w-full">
            {[
              { id: 'ALL', label: t('allActions'), icon: Layers },
              { id: 'VEHICLE', label: t('vehicleRc'), icon: Car },
              { id: 'DRIVER', label: t('driverLicence'), icon: CreditCard },
              { id: 'TOLLS', label: t('tollsPasses'), icon: Truck },
              { id: 'TOOLS', label: t('instantTools'), icon: Zap },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as ServiceCategory)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 min-h-[38px] ${
                    isActive
                      ? 'clay-pill bg-white dark:bg-slate-900 text-olive-900 dark:text-olive-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          </div>
        </div>

        {/* Clean, Decluttered Clay Cards Matrix */}
        {filteredItems.length === 0 ? (
          <div className="clay-card p-10 text-center">
            <Search className="w-5 h-5 text-olive-700 dark:text-olive-400 mx-auto mb-3" />
            <p className="font-display font-bold text-slate-900 dark:text-white">{language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No services found'}</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }} className="mt-3 text-xs font-bold text-olive-700 dark:text-olive-400 hover:underline">{language === 'hi' ? 'सभी सेवाएं देखें' : 'Show all services'}</button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="clay-card clay-card-interactive p-5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.tint} group-hover:scale-105 transition-transform shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-olive-700 dark:group-hover:text-olive-400 flex items-center gap-1 transition-colors">
                      <span>{t('startNow')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-[15px] text-slate-900 dark:text-white tracking-tight">
                    {navItemName(item, t)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {navItemDesc(item, t)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400 dark:text-slate-500 font-medium">
                    {item.category === 'VEHICLE' ? 'MoRTH • VAHAN' : item.category === 'DRIVER' ? 'MoRTH • SARATHI' : item.category === 'TOLLS' ? 'NPCI • NETC' : 'Gati Platform'}
                  </span>
                  <span className="font-semibold text-olive-700 dark:text-olive-400">
                    {t('instantFastTrack')}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </section>
    </div>
  );
}
