'use client';

import React from 'react';

interface HsrpPlateProps {
  plateText: string;
  vehicleType?: 'private' | 'ev' | 'commercial' | 'luxury';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const HsrpPlate: React.FC<HsrpPlateProps> = ({
  plateText,
  vehicleType = 'private',
  size = 'md',
  className = '',
}) => {
  // Styles based on vehicle type
  const getThemeStyles = () => {
    switch (vehicleType) {
      case 'ev':
        return {
          bg: 'bg-gradient-to-b from-[#15803d] to-[#166534]',
          text: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]',
          border: 'border-[#14532d]',
          blueBarBg: 'bg-[#1e40af]',
        };
      case 'commercial':
        return {
          bg: 'bg-gradient-to-b from-[#facc15] to-[#eab308]',
          text: 'text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]',
          border: 'border-[#ca8a04]',
          blueBarBg: 'bg-[#1e3a8a]',
        };
      case 'luxury':
        return {
          bg: 'bg-gradient-to-b from-[#1e293b] to-[#0f172a]',
          text: 'text-[#facc15] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]',
          border: 'border-[#475569]',
          blueBarBg: 'bg-[#0f172a]',
        };
      case 'private':
      default:
        return {
          bg: 'bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#f1f5f9]',
          text: 'text-[#0f172a] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
          border: 'border-[#94a3b8]',
          blueBarBg: 'bg-[#1d4ed8]',
        };
    }
  };

  const theme = getThemeStyles();

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-10 px-2 rounded-md min-w-[160px]',
      blueBar: 'w-5 text-[8px] mr-2 pl-0.5',
      text: 'text-sm font-black tracking-wider',
      screw: 'w-1.5 h-1.5',
      hologram: 'w-2 h-2 text-[5px]',
    },
    md: {
      container: 'h-14 px-3.5 rounded-lg min-w-[240px]',
      blueBar: 'w-7 text-[10px] mr-3 pl-1',
      text: 'text-xl font-extrabold tracking-widest',
      screw: 'w-2.5 h-2.5',
      hologram: 'w-3 h-3 text-[7px]',
    },
    lg: {
      container: 'h-20 px-5 rounded-xl min-w-[340px]',
      blueBar: 'w-10 text-xs mr-4 pl-1.5',
      text: 'text-3xl font-black tracking-widest',
      screw: 'w-3.5 h-3.5',
      hologram: 'w-4 h-4 text-[9px]',
    },
    hero: {
      container: 'h-24 sm:h-28 px-6 rounded-2xl min-w-[320px] sm:min-w-[440px]',
      blueBar: 'w-12 sm:w-14 text-xs sm:text-sm mr-5 pl-2',
      text: 'text-2xl sm:text-4xl font-black tracking-widest',
      screw: 'w-4 h-4',
      hologram: 'w-5 h-5 text-[10px]',
    },
  }[size];

  return (
    <div
      className={`relative inline-flex items-center shadow-lg border-2 select-none overflow-hidden transition-all duration-300 ${theme.bg} ${theme.border} ${sizeConfig.container} ${className}`}
      style={{
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Left Blue IND Band */}
      <div
        className={`absolute left-0 top-0 bottom-0 ${theme.blueBarBg} text-white flex flex-col items-center justify-between py-1 shadow-inner z-10 ${sizeConfig.blueBar}`}
      >
        {/* Ashoka Chakra Hologram Icon */}
        <div className="w-full flex justify-center opacity-90">
          <div className="w-3.5 h-3.5 rounded-full border border-ashoka-300/80 flex items-center justify-center">
            <div className="w-1 h-1 bg-amber-300 rounded-full animate-pulse" />
          </div>
        </div>
        
        {/* IND Label */}
        <div className="font-bold tracking-widest text-center">
          IND
        </div>

        {/* Laser security mark */}
        <div className="text-[6px] opacity-60 tracking-tighter scale-75">
          HSRP
        </div>
      </div>

      {/* Plate Content */}
      <div className="w-full flex items-center justify-between pl-8 sm:pl-11 pr-2 relative z-0">
        {/* Hologram security badge top-left */}
        <div className="absolute top-0.5 left-8 sm:left-12 flex items-center gap-1 opacity-70">
          <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-amber-400 via-olive-300 to-ashoka-400 border border-white/50 shadow-xs flex items-center justify-center">
            <span className="text-[5px] font-bold text-olive-950">⚡</span>
          </div>
          <span className="text-[7px] font-mono tracking-tighter text-olive-700/70 opacity-60 hidden sm:inline">
            IN7492019
          </span>
        </div>

        {/* Embossed Screws */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-40">
          <div className={`rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center ${sizeConfig.screw}`}>
            <div className="w-full h-[1px] bg-olive-700 rotate-45" />
          </div>
        </div>

        {/* License Plate Number Text */}
        <div className={`w-full text-center uppercase font-mono hsrp-font ${theme.text} ${sizeConfig.text}`}>
          {plateText || 'KA 01 MX 0001'}
        </div>

        {/* Right Screw */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
          <div className={`rounded-full bg-slate-400 border border-slate-600 shadow-inner flex items-center justify-center ${sizeConfig.screw}`}>
            <div className="w-full h-[1px] bg-olive-700 -rotate-12" />
          </div>
        </div>
      </div>

      {/* Subtle glossy sheen reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
