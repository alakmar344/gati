'use client';

import React, { useEffect } from 'react';
import { User, Check, X, MapPin, Car } from 'lucide-react';
import { DemoUser } from '@/lib/types';
import { DEMO_USERS } from '@/lib/mockData';
import { getCurrentUser, setCurrentUser } from '@/lib/storage';

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

  if (!isOpen) return null;

  const currentUser = getCurrentUser();

  const handleSelect = (user: DemoUser) => {
    setCurrentUser(user);
    if (onSelectUser) onSelectUser(user);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-dialog-in"
      >
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <User className="w-4 h-4" />
            <span>Prototype Demo Accounts</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white">
            Switch Demo Citizen Persona
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Select one of the 10 pre-configured realistic Indian profiles to test tailored workflows and saved records.
          </p>
        </div>

        {/* Personas Grid (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_USERS.map((user) => {
              const isCurrent = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Row: Avatar, Name & Check */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                          isCurrent 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 leading-tight">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            {user.role}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                      {user.bio}
                    </p>
                  </div>

                  {/* Metadata pill footer */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100/80 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {user.city}, {user.state.split(' ')[0]}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium text-slate-700">
                      <Car className="w-3 h-3 text-sky-600" />
                      {user.vehiclesCount} {user.vehiclesCount === 1 ? 'vehicle' : 'vehicles'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span className="text-[11px]">Active session auto-persists in browser storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
