'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Command as CmdIcon,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
  CreditCard,
} from 'lucide-react';
import { DemoUser } from '@/lib/types';
import { getCurrentUser } from '@/lib/storage';
import { PersonaSwitcherModal } from './PersonaSwitcherModal';
import { CORE_SERVICES, SPEED_TOOLS, ACCOUNT_LINKS, NavItem } from '@/lib/nav';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [currentUser, setCurrentUserState] = useState<DemoUser | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'services' | 'tools' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
    const handleUserChange = () => setCurrentUserState(getCurrentUser());
    window.addEventListener('gati_user_changed', handleUserChange);
    return () => window.removeEventListener('gati_user_changed', handleUserChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Escape closes open dropdowns and the mobile sheet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll while the mobile sheet is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const openCommand = () => window.dispatchEvent(new Event('gati_open_command'));

  const isServiceActive = CORE_SERVICES.some((s) => s.href === pathname);
  const isToolActive = SPEED_TOOLS.some((s) => s.href === pathname);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 pt-3">
        <div
          ref={navRef}
          className={`max-w-6xl mx-auto flex items-center justify-between rounded-full pl-4 pr-2 py-2 transition-all duration-300 ${
            scrolled
              ? 'glass-panel dark:bg-slate-900/80 shadow-lg border-white/70 dark:border-white/10'
              : 'bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm'
          }`}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-saffron-600 via-ashoka-800 to-olive-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-white/20">
              <span className="font-display font-black text-base tracking-tighter">ग</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                {t('appName')}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 tracking-[0.16em] uppercase mt-0.5">
                {t('appTagline')}
              </span>
            </div>
          </Link>

          {/* Center nav — grouped & centralized */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Dropdown
              label={t('services')}
              active={isServiceActive}
              isOpen={openMenu === 'services'}
              onToggle={() => setOpenMenu(openMenu === 'services' ? null : 'services')}
            >
              <MegaMenu items={CORE_SERVICES} pathname={pathname} note="End-to-end guided journeys" />
            </Dropdown>

            <Dropdown
              label={t('speedTools')}
              active={isToolActive}
              isOpen={openMenu === 'tools'}
              onToggle={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
            >
              <MegaMenu items={SPEED_TOOLS} pathname={pathname} note="One-tap power utilities" />
            </Dropdown>

            <Link
              href="/track"
              className={`px-3.5 py-2 rounded-full transition-colors ${
                pathname === '/track'
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {t('track')}
            </Link>

            <Link
              href="/challans"
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 text-xs font-bold ${
                pathname === '/challans'
                  ? 'clay-pill bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === 'hi' ? 'भुगतान / चालान' : 'Pay Fines & Tolls'}</span>
            </Link>
          </nav>

          {/* Right centralized control capsule */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs active:scale-95 min-h-[40px]"
              title={`Switch language (Current: ${language === 'en' ? 'English' : 'हिन्दी'})`}
              aria-label={language === 'en' ? 'Switch language to Hindi' : 'Switch language to English'}
            >
              <Globe className="w-3.5 h-3.5 text-olive-700 dark:text-olive-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 transition-all shadow-xs active:scale-95"
              title={`Toggle Theme (Current: ${theme === 'dark' ? 'Dark' : 'Light'})`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Command search */}
            <button
              onClick={openCommand}
              className="hidden md:flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full bg-olive-50 dark:bg-olive-950/60 hover:bg-olive-100 dark:hover:bg-olive-900/60 border border-olive-200 dark:border-olive-800/60 text-olive-800 dark:text-olive-300 text-xs font-semibold transition-all shadow-xs min-h-[40px]"
              title={`${t('askGati')} (⌘K)`}
              aria-label={`${t('askGati')} (Command K)`}
            >
              <CmdIcon className="w-3.5 h-3.5 text-saffron-600 dark:text-saffron-400" />
              <span className="hidden xl:inline">{t('askGati')}</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-bold text-olive-700 dark:text-olive-300 bg-white dark:bg-slate-800 border border-olive-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Persona */}
            {currentUser && (
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs min-h-[40px]"
                title={t('switchPersona')}
              >
                <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-olive-700 to-olive-900 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                  {currentUser.avatar}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[72px] truncate text-[11px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="clay-btn clay-btn-primary min-h-[40px] px-3.5 sm:px-4 py-2 text-xs text-white"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-saffron-300" />
              <span className="hidden sm:inline">{t('dashboard')}</span>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-6xl mx-auto glass-panel dark:bg-slate-900/90 rounded-3xl p-4 shadow-xl border border-white/70 dark:border-white/10 max-h-[78vh] overflow-y-auto animate-dialog-in">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={toggleLanguage}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <Globe className="w-4 h-4 text-olive-700 dark:text-olive-400" />
                <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCommand();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 text-xs font-bold border border-olive-200 dark:border-olive-800/60"
              >
                <CmdIcon className="w-3.5 h-3.5 text-saffron-600 dark:text-saffron-400" />
                <span>FastTrack ⌘K</span>
              </button>

              <Link
                href="/challans"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>{language === 'hi' ? 'भुगतान / चालान' : 'Pay Fines & Tolls'}</span>
              </Link>
            </div>

            <MobileGroup title={t('services')} items={CORE_SERVICES} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />
            <MobileGroup title={t('speedTools')} items={SPEED_TOOLS} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />
            <MobileGroup title="Account" items={ACCOUNT_LINKS} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSwitcherOpen(true);
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-olive-50 dark:bg-olive-950/60 text-olive-800 dark:text-olive-300 text-sm font-bold border border-olive-200 dark:border-olive-800/60"
            >
              {t('switchPersona')}
            </button>
          </div>
        )}
      </header>

      <PersonaSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSelectUser={(u) => setCurrentUserState(u)}
      />
    </>
  );
};

/* ---------------- sub-components ---------------- */

function Dropdown({
  label,
  active,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  active: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1 px-3.5 py-2 rounded-full transition-colors ${
          active || isOpen
            ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
            : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[30rem] glass-panel dark:bg-slate-900/95 rounded-3xl border border-white/70 dark:border-white/10 shadow-xl p-2 animate-dialog-in">
          {children}
        </div>
      )}
    </div>
  );
}

function MegaMenu({ items, pathname, note }: { items: NavItem[]; pathname: string; note: string }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start gap-3 p-2.5 rounded-2xl transition-colors ${
                isActive ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-white/15 text-white' : item.tint
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0">
                <span className={`block text-[13px] font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                  {item.name}
                </span>
                <span className={`block text-[11px] leading-snug ${isActive ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.desc}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="px-3 py-2 mt-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
        {note}
      </div>
    </div>
  );
}

function MobileGroup({
  title,
  items,
  pathname,
  onNav,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNav: () => void;
}) {
  return (
    <div className="mb-3">
      <div className="px-2 pb-1.5 eyebrow text-slate-400 dark:text-slate-500">{title}</div>
      <div className="grid grid-cols-1 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={`flex items-center gap-3 p-2.5 rounded-2xl transition-colors ${
                isActive ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/15 text-white' : item.tint}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
