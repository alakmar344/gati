'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Command as CmdIcon,
  LayoutDashboard,
  Wand2,
} from 'lucide-react';
import { DemoUser } from '@/lib/types';
import { getCurrentUser } from '@/lib/storage';
import { PersonaSwitcherModal } from './PersonaSwitcherModal';
import { CORE_SERVICES, SPEED_TOOLS, ACCOUNT_LINKS, NavItem } from '@/lib/nav';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
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
              ? 'glass-panel shadow-lg border-white/70'
              : 'bg-white/60 backdrop-blur-md border border-white/50 shadow-sm'
          }`}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-saffron-600 via-ashoka-800 to-olive-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-white/20">
              <span className="font-display font-black text-base tracking-tighter">ग</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
                GATI
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-[0.16em] uppercase mt-0.5">
                Mobility OS
              </span>
            </div>
          </Link>

          {/* Center nav — grouped, decluttered */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <Dropdown
              label="Services"
              active={isServiceActive}
              isOpen={openMenu === 'services'}
              onToggle={() => setOpenMenu(openMenu === 'services' ? null : 'services')}
            >
              <MegaMenu items={CORE_SERVICES} pathname={pathname} note="End-to-end guided journeys" />
            </Dropdown>

            <Dropdown
              label="Speed Tools"
              active={isToolActive}
              isOpen={openMenu === 'tools'}
              onToggle={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
            >
              <MegaMenu items={SPEED_TOOLS} pathname={pathname} note="One-tap power utilities" />
            </Dropdown>

            <Link
              href="/track"
              className={`px-3.5 py-2 rounded-full transition-colors ${
                pathname === '/track' ? 'text-slate-900 bg-slate-100' : 'hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Track
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command search */}
            <button
              onClick={openCommand}
              className="hidden md:flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-olive-50 hover:bg-olive-100 border border-olive-200 text-olive-800 text-xs font-semibold transition-all"
              title="Ask Gati (⌘K)"
            >
              <Wand2 className="w-4 h-4 text-saffron-600" />
              <span className="hidden xl:inline">Ask Gati</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 text-[10px] font-bold text-olive-700 bg-white border border-olive-200 rounded px-1.5 py-0.5 shadow-xs">
                <CmdIcon className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Persona */}
            {currentUser && (
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="hidden sm:flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                title="Switch demo persona"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-olive-700 to-olive-900 text-white flex items-center justify-center font-bold text-[9px] shadow-xs">
                  {currentUser.avatar}
                </span>
                <span className="font-medium text-slate-800 max-w-[72px] truncate text-[11px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="btn btn-primary px-4 py-2 text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-saffron-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 max-w-6xl mx-auto glass-panel rounded-3xl p-4 shadow-xl border border-white/70 max-h-[78vh] overflow-y-auto animate-dialog-in">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openCommand();
              }}
              className="w-full flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-olive-50 text-olive-800 text-sm font-semibold mb-3 border border-olive-200"
            >
              <Wand2 className="w-4 h-4 text-saffron-600" />
              Ask Gati to do something…
            </button>

            <MobileGroup title="Services" items={CORE_SERVICES} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />
            <MobileGroup title="Speed Tools" items={SPEED_TOOLS} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />
            <MobileGroup title="Account" items={ACCOUNT_LINKS} pathname={pathname} onNav={() => setIsMobileMenuOpen(false)} />

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSwitcherOpen(true);
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-olive-50 text-olive-800 text-sm font-bold border border-olive-200"
            >
              Switch Demo Persona
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
        className={`flex items-center gap-1 px-3.5 py-2 rounded-full transition-colors ${
          active || isOpen ? 'text-slate-900 bg-slate-100' : 'hover:text-slate-900 hover:bg-slate-100/70'
        }`}
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[30rem] glass-panel rounded-3xl border border-white/70 shadow-xl p-2 animate-dialog-in">
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
                isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100/80'
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
                <span className={`block text-[13px] font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {item.name}
                </span>
                <span className={`block text-[11px] leading-snug ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                  {item.desc}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
      <div className="px-3 py-2 mt-1 text-[11px] font-semibold text-slate-400 border-t border-slate-100">
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
      <div className="px-2 pb-1.5 eyebrow text-slate-400">{title}</div>
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
                isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/15 text-white' : item.tint}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
