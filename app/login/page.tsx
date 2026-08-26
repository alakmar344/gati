'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  MapPin,
  Car,
} from 'lucide-react';
import { DEMO_USERS } from '@/lib/mockData';
import { setCurrentUser } from '@/lib/storage';
import { SectionHeading, Pill } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePersonaQuickFill = (u: typeof DEMO_USERS[0]) => {
    setSelectedUser(u);
    setEmail(u.email);
    setPassword('demo123');
    setErrorMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || selectedUser;
      setCurrentUser(matched);
      toast({
        title: `Signed in as ${matched.name}`,
        description: `${matched.role} · ${matched.city}`,
        variant: 'success',
      });
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start animate-rise">

        {/* Left — value proposition + credential panel */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <SectionHeading
            align="left"
            eyebrow="Prototype demo"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            title={<>Choose your demo citizen</>}
            subtitle="Gati is a working prototype. Pick a persona to explore their credentials, active applications, and vehicle garage — no real accounts, no passwords to remember."
          />

          <form onSubmit={handleLogin} className="card p-6 sm:p-7 space-y-5">
            <div className="space-y-1.5">
              <span className="eyebrow text-olive-700/70">Selected persona</span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-olive-500 to-olive-700 text-white flex items-center justify-center font-display font-extrabold text-sm shrink-0">
                  {selectedUser.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold tracking-tight text-olive-950 truncate">
                    {selectedUser.name}
                  </div>
                  <div className="text-[12px] text-olive-700 font-semibold truncate">
                    {selectedUser.role}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-olive-800 block">
                Citizen email / user ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-500/80" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 field text-[13px] font-medium text-olive-950"
                  placeholder="name@demo.gati.in"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-olive-800 block">
                Demo password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-500/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 field text-[13px] font-medium text-olive-950"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-olive-500/80 hover:text-olive-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-rose-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3.5 text-sm disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying sandbox credentials…</span>
                </>
              ) : (
                <>
                  <span>Continue as {selectedUser.name.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4 text-olive-400" />
                </>
              )}
            </button>

            <div className="flex items-start gap-2.5 hairline border-t pt-4 text-[12px] text-olive-700/70 leading-relaxed">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-olive-900 font-semibold">Demo authentication sandbox.</strong>{' '}
                Pick any profile on the right to instantly fill credentials for 1-click testing.
              </p>
            </div>
          </form>
        </div>

        {/* Right — persona directory grid */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between px-1">
            <span className="eyebrow text-olive-700/70">Demo profiles</span>
            <Pill tone="emerald">{DEMO_USERS.length} personas</Pill>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
            {DEMO_USERS.map((user) => {
              const isSelected = selectedUser.id === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handlePersonaQuickFill(user)}
                  aria-pressed={isSelected}
                  className={`card text-left p-5 flex flex-col gap-4 transition-all ${
                    isSelected
                      ? 'border-olive-400 ring-2 ring-olive-500/30 shadow-lg'
                      : 'card-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-extrabold text-sm shrink-0 ${
                        isSelected
                          ? 'bg-gradient-to-br from-olive-500 to-olive-700 text-white'
                          : 'bg-olive-100 text-olive-800'
                      }`}
                    >
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-extrabold tracking-tight text-olive-950 truncate">
                        {user.name}
                      </div>
                      <div className="text-[12px] text-olive-700 font-semibold truncate">
                        {user.role}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-olive-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 hairline border-t pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-olive-700/70">
                      <MapPin className="w-3.5 h-3.5 text-olive-500/80" />
                      {user.city}
                    </span>
                    <Pill tone={isSelected ? 'emerald' : 'slate'}>
                      <Car className="w-3 h-3" />
                      {user.vehiclesCount} {user.vehiclesCount === 1 ? 'vehicle' : 'vehicles'}
                    </Pill>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
