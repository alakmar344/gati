'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Command as CmdIcon } from 'lucide-react';
import { CORE_SERVICES, SPEED_TOOLS, ACCOUNT_LINKS, NavItem } from '@/lib/nav';

const GROUPS: { label: string; items: NavItem[] }[] = [
  { label: 'Services', items: CORE_SERVICES },
  { label: 'Speed Tools', items: SPEED_TOOLS },
  { label: 'Account', items: ACCOUNT_LINKS },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard + custom-event triggers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('gati_open_command', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('gati_open_command', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups = GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => {
        if (!q) return true;
        return (
          it.name.toLowerCase().includes(q) ||
          it.desc.toLowerCase().includes(q) ||
          (it.keywords || '').includes(q)
        );
      }),
    })).filter((g) => g.items.length > 0);
    return groups;
  }, [query]);

  const flat = useMemo(() => results.flatMap((g) => g.items), [results]);

  const go = useCallback(
    (item?: NavItem) => {
      const target = item || flat[active];
      if (target) {
        setOpen(false);
        router.push(target.href);
      }
    },
    [flat, active, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go();
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4 bg-slate-950/40 backdrop-blur-md animate-overlay-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl border border-white/70 overflow-hidden animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search field */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search services & tools…"
            className="flex-1 bg-transparent text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((group) => (
              <div key={group.label} className="mb-1.5 last:mb-0">
                <div className="px-3 pt-2 pb-1 eyebrow text-slate-400">{group.label}</div>
                {group.items.map((item) => {
                  runningIndex++;
                  const idx = runningIndex;
                  const Icon = item.icon;
                  const isActive = idx === active;
                  return (
                    <button
                      key={item.href}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-colors ${
                        isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-white/15 text-white' : item.tint
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </span>
                        <span className={`block text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                          {item.desc}
                        </span>
                      </span>
                      {isActive && <CornerDownLeft className="w-4 h-4 text-white/70 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer legend */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              navigate
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> open
            </span>
          </div>
          <span className="flex items-center gap-1 font-semibold">
            <CmdIcon className="w-3 h-3" /> K
          </span>
        </div>
      </div>
    </div>
  );
}
