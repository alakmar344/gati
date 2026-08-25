'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Car, 
  Sparkles, 
  CreditCard, 
  FileCheck2, 
  Compass, 
  User, 
  Menu, 
  X, 
  ArrowRight, 
  Layers, 
  Search,
  CheckCircle2,
  ChevronDown,
  ScanLine,
  Zap,
  AlertTriangle,
  Radio,
  Gamepad2
} from 'lucide-react';
import { DemoUser } from '@/lib/types';
import { getCurrentUser } from '@/lib/storage';
import { PersonaSwitcherModal } from './PersonaSwitcherModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUserState] = useState<DemoUser | null>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const refreshUser = () => {
    setCurrentUserState(getCurrentUser());
  };

  useEffect(() => {
    refreshUser();
    const handleUserChange = () => refreshUser();
    window.addEventListener('gati_user_changed', handleUserChange);
    return () => window.removeEventListener('gati_user_changed', handleUserChange);
  }, []);

  const navLinks = [
    { name: 'Vehicle Registration', href: '/vehicle-licensing', icon: Car },
    { name: 'VIP Plates', href: '/fancy-numbers', icon: Sparkles },
    { name: 'Driver Licence', href: '/driver-licence', icon: CreditCard },
    { name: 'Permits', href: '/vehicle-permit', icon: Compass },
    { name: 'AI Lens OCR', href: '/scan', icon: ScanLine },
    { name: '10s FastPass', href: '/fastpass', icon: Zap },
    { name: 'E-Challan Radar', href: '/challans', icon: AlertTriangle },
    { name: 'FASTag Hub', href: '/fastag', icon: Radio },
    { name: 'ADTT Simulator', href: '/adtt-simulator', icon: Gamepad2 },
    { name: 'Interstate NOC', href: '/interstate-noc', icon: Compass },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-full px-4 sm:px-5 py-2.5 shadow-sm border border-white/80">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="font-mono font-black text-base tracking-tighter">G</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  GATI
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  गति
                </span>
              </div>
              <span className="text-[9px] font-medium text-slate-500 tracking-wider uppercase leading-none mt-0.5">
                Indian Mobility OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Link 
              href="/vehicle-licensing"
              className={`px-3 py-1.5 rounded-full transition-all ${
                pathname === '/vehicle-licensing' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              Licensing
            </Link>

            <Link 
              href="/fancy-numbers"
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/fancy-numbers' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>VIP Plates</span>
            </Link>

            <Link 
              href="/driver-licence"
              className={`px-3 py-1.5 rounded-full transition-all ${
                pathname === '/driver-licence' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              DL Portal
            </Link>

            <Link 
              href="/vehicle-permit"
              className={`px-3 py-1.5 rounded-full transition-all ${
                pathname === '/vehicle-permit' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              Permits
            </Link>

            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

            <Link 
              href="/scan"
              className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/scan' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'hover:bg-emerald-50 text-emerald-800 font-bold'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Lens OCR</span>
            </Link>

            <Link 
              href="/fastpass"
              className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/fastpass' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'hover:bg-amber-50 text-amber-900 font-bold'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              <span>10s FastPass</span>
            </Link>

            <Link 
              href="/challans"
              className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/challans' 
                  ? 'bg-rose-600 text-white shadow-sm' 
                  : 'hover:bg-rose-50 text-rose-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Challans</span>
            </Link>

            <Link 
              href="/fastag"
              className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/fastag' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'hover:bg-sky-50 text-sky-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>FASTag</span>
            </Link>

            <Link 
              href="/adtt-simulator"
              className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                pathname === '/adtt-simulator' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'hover:bg-purple-50 text-purple-800'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>ADTT Game</span>
            </Link>
          </nav>

          {/* Right Action: Persona Switcher & Dashboard CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Persona Switcher Pill */}
            {currentUser && (
              <button
                onClick={() => setIsSwitcherOpen(true)}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all hover:border-slate-300"
                title="Switch demo user persona"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                  {currentUser.avatar}
                </div>
                <span className="hidden sm:inline font-medium text-slate-800 max-w-[80px] truncate text-[11px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Dashboard Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-slate-200 shadow-xs"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden mt-2 max-w-7xl mx-auto glass-panel rounded-3xl p-4 shadow-xl border border-white/80 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSwitcherOpen(true);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-emerald-700 p-2"
              >
                <User className="w-4 h-4" />
                <span>Switch Demo Persona</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Demo Persona Switcher Modal */}
      <PersonaSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onSelectUser={(u) => {
          setCurrentUserState(u);
        }}
      />
    </>
  );
};
