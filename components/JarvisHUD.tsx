
import React, { useState, useEffect } from 'react';
import { AIPersonality, SystemStatus } from '../types';

interface JarvisHUDProps {
  lastCommand?: string;
  systemInfo?: Partial<SystemStatus>;
  isModelTalking?: boolean;
  identity?: AIPersonality;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({ 
  lastCommand, 
  systemInfo, 
  isModelTalking,
  identity = 'GERVIS'
}) => {
  const themeColor = identity === 'GERVIS' ? '#22d3ee' : identity === 'FRIDAY' ? '#f97316' : '#6366f1';

  return (
    <div className="fixed top-0 left-0 w-full p-4 md:p-8 z-40 pointer-events-none flex flex-col gap-2">
      {/* Top Mobile Bar */}
      <div className="flex justify-between items-center w-full bg-black/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/5 md:bg-transparent md:border-none">
        <div className="flex flex-col">
          <span className="text-[10px] orbitron font-black uppercase tracking-widest" style={{ color: themeColor }}>{identity}_X_OS</span>
          <div className="flex gap-1">
             {[...Array(4)].map((_, i) => (
               <div key={i} className={`w-3 h-1 rounded-full ${isModelTalking ? 'animate-pulse' : ''}`} style={{ backgroundColor: themeColor, opacity: 0.3 + (i * 0.2) }}></div>
             ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
           {systemInfo?.battery && (
             <div className="flex items-center gap-2">
                <div className="w-8 h-4 border border-current rounded-sm p-0.5 flex" style={{ color: systemInfo.battery.level < 20 ? '#ef4444' : themeColor }}>
                  <div className="h-full bg-current transition-all" style={{ width: `${systemInfo.battery.level}%` }}></div>
                </div>
                <span className="text-[9px] orbitron font-bold text-white">{systemInfo.battery.level.toFixed(0)}%</span>
             </div>
           )}
           <div className={`w-2 h-2 rounded-full ${systemInfo?.isSearching ? 'bg-orange-500 animate-ping' : 'bg-emerald-500'}`}></div>
        </div>
      </div>

      {/* Desktop Detailed Stats (Hidden on Small Mobile) */}
      <div className="hidden md:flex justify-between items-start mt-4">
        <div className="flex flex-col gap-1 border-l-2 pl-4" style={{ borderColor: themeColor }}>
          <span className="text-[8px] orbitron text-slate-500 font-black uppercase tracking-widest">Neural_Telemetry</span>
          <span className="text-[10px] font-mono text-white">X_LAT: 12ms // BUFFER: 4.2GB</span>
        </div>
        
        {systemInfo?.location && (
          <div className="text-right">
            <span className="text-[8px] orbitron text-slate-500 font-black uppercase">SAT_POS</span>
            <div className="text-[9px] font-mono text-white">{systemInfo.location.lat.toFixed(4)}, {systemInfo.location.lng.toFixed(4)}</div>
          </div>
        )}
      </div>

      {/* Persistent Command Line */}
      <div className="mt-4 md:mt-auto">
        <div className="hud-glass p-3 rounded-xl border-white/10 max-w-xs md:max-w-md animate-in slide-in-from-left duration-500">
           <div className="text-[8px] orbitron font-black uppercase opacity-40 mb-1" style={{ color: themeColor }}>Command_Feed</div>
           <div className="text-[11px] font-mono text-white truncate italic uppercase">
              {lastCommand || "Awaiting authorization, Sir..."}
           </div>
        </div>
      </div>
    </div>
  );
};
