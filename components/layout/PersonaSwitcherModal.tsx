'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User, Check, X, MapPin, Car } from 'lucide-react';
import { DemoUser } from '@/lib/types';
import { DEMO_USERS } from '@/lib/mockData';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';
import { useLanguage } from '@/lib/i18n';

interface PersonaSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: DemoUser) => void;
}

export const PersonaSwitcherModal: React.FC<PersonaSwitcherModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
}) => {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentUser = getCurrentUser();

  const handleSelect = (user: DemoUser) => {
    setCurrentUser(user);
    if (onSelectUser) onSelectUser(user);
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-slate-950/50 backdrop-blur-md animate-overlay-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('switchPersona')}
        className="relative w-full max-w-2xl my-auto clay-card dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-dialog-in"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close persona switcher"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <User className="w-4 h-4" />
            <span>{t('demoBadge')}</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            {t('switchPersona')}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'hi'
              ? 'अनुकूलित वर्कफ़्लो और सहेजे गए रिकॉर्ड का परीक्षण करने के लिए 10 वास्तविक भारतीय प्रोफाइल में से चुनें।'
              : 'Select one of the 10 pre-configured realistic Indian profiles to test tailored workflows and saved records.'}
          </p>
        </div>

        {/* Personas Grid (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_USERS.map((user) => {
              const isCurrent = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={`clay-card w-full p-4 transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-olive-50/80 dark:bg-olive-950/70 border-olive-500 ring-2 ring-olive-500/20 shadow-sm'
                      : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-olive-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar, Name & Check */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                          isCurrent 
                            ? 'bg-olive-700 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-olive-800 dark:text-olive-400 font-medium">
                            {user.role}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-olive-700 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-2">
                      {user.bio}
                    </p>
                  </div>

                  {/* Metadata pill footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100/80 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {user.city}, {user.state.split(' ')[0]}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-300">
                      <Car className="w-3 h-3 text-ashoka-700 dark:text-ashoka-400" />
                      {user.vehiclesCount} {user.vehiclesCount === 1 ? 'vehicle' : 'vehicles'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          <span className="text-[11px]">
            {language === 'hi' ? 'सक्रिय सत्र ब्राउज़र मेमोरी में स्वतः सहेजा जाता है।' : 'Active session auto-persists in browser storage.'}
          </span>
          <button
            onClick={onClose}
            className="clay-btn clay-btn-primary px-4 py-1.5 text-white text-xs"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );
};
