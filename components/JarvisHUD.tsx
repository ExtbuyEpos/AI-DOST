import React, { useState, useEffect } from 'react';
import { AIPersonality, SystemStatus } from '../types';

interface JarvisHUDProps {
  lastCommand?: string;
  systemInfo?: Partial<SystemStatus>;
  isModelTalking?: boolean;
  identity?: AIPersonality;
  isLightMode: boolean;
  onToggleLightMode: () => void;
  onToggleVR: () => void;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({ 
  lastCommand, 
  systemInfo, 
  isModelTalking,
  identity = 'MOLTBOT',
  isLightMode,
  onToggleLightMode,
  onToggleVR
}) => {
  const [telemetry, setTelemetry] = useState({
    sync: 99.982,
    ping: 7,
    cpu: 12,
    mem: 3.4
  });

  const themeColor = isLightMode ? '#0891b2' : '#06b6d4';

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        sync: 99.9 + Math.random() * 0.09,
        ping: Math.floor(Math.random() * 6) + 3,
        cpu: Math.floor(Math.random() * 10) + 5,
        mem: 3.4 + Math.random() * 0.2
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* PROFESSIONAL OVERLAYS */}
      <div className={`absolute top-0 left-0 w-full h-40 ${isLightMode ? 'bg-gradient-to-b from-white/70' : 'bg-gradient-to-b from-black/90'} to-transparent transition-all duration-1000`}></div>
      
      {/* TOP COMMAND CLUSTER */}
      <div className="absolute top-10 md:top-14 left-10 md:left-14 flex items-center gap-8 md:gap-12 pointer-events-auto">
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
           <div className={`absolute inset-0 border-2 rounded-full ${isLightMode ? 'border-slate-900/10' : 'border-white/10'}`}></div>
           <div 
            className="absolute inset-0 border-t-4 border-r-2 rounded-full animate-[spin_5s_linear_infinite]" 
            style={{ borderColor: themeColor }}
           ></div>
           <div className={`text-[10px] md:text-[14px] orbitron font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{telemetry.ping}ms</div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] md:text-[12px] orbitron font-black text-slate-500 tracking-[0.5em] uppercase">AI_DOST_CORE</span>
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_15px_currentColor] transition-all`} style={{ backgroundColor: themeColor, color: themeColor }}></div>
            <span className={`text-sm md:text-lg font-mono font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{telemetry.sync.toFixed(3)}%_DOST_UPLINK</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: SYSTEM TOGGLES */}
      <div className="absolute top-10 md:top-14 right-10 md:right-14 flex items-center gap-6 pointer-events-auto">
        <div className="hidden lg:flex items-center gap-10 mr-10 px-8 py-3 bg-white/5 dark:bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
           <div className="flex flex-col">
              <span className="text-[8px] orbitron text-slate-500 uppercase tracking-widest">CPU_LOAD</span>
              <span className={`text-xs font-mono font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{telemetry.cpu}%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] orbitron text-slate-500 uppercase tracking-widest">MEM_POOL</span>
              <span className={`text-xs font-mono font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{telemetry.mem.toFixed(1)}GB</span>
           </div>
        </div>
        
        <button 
          onClick={onToggleVR}
          className={`px-6 py-3 rounded-xl border orbitron text-[10px] font-black tracking-[0.2em] transition-all shadow-xl ${isLightMode ? 'border-slate-900/10 bg-slate-100 text-slate-600' : 'border-white/10 bg-white/5 text-slate-400'} hover:border-cyan-500/50 hover:text-cyan-500`}
        >
          VR_DOST
        </button>
        <button 
          onClick={onToggleLightMode}
          className={`px-6 py-3 rounded-xl border flex items-center justify-center transition-all shadow-xl gap-3 ${isLightMode ? 'border-slate-900/10 bg-slate-100 text-slate-900' : 'border-white/10 bg-white/5 text-white'} hover:border-cyan-500/50 group`}
        >
          <span className="text-[9px] orbitron font-black hidden md:block group-hover:text-cyan-500">{isLightMode ? 'DARK_MOOD' : 'LIGHT_MOOD'}</span>
          {isLightMode ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          )}
        </button>
      </div>

      {/* LOWER LOG: MISSION FEED */}
      <div className="absolute bottom-48 md:bottom-56 left-10 md:left-14 max-w-md md:max-w-lg w-full">
        <div className={`hud-glass p-8 md:p-10 border-l-[6px] transition-all duration-700 shadow-2xl rounded-r-3xl ${isLightMode ? 'bg-white/85 border-slate-900/20' : 'bg-black/50 border-white/10'}`} style={{ borderLeftColor: themeColor }}>
           <div className="flex items-center justify-between mb-5 border-b border-slate-900/5 dark:border-white/5 pb-3">
              <div className="text-[10px] md:text-[13px] orbitron font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-3">
                 DOST_MISSION_LOG
              </div>
              <span className="text-[10px] font-mono text-cyan-600/70 font-bold uppercase">SECURE_LAYER_L7</span>
           </div>
           <div className={`text-[13px] md:text-[15px] font-mono italic line-clamp-2 leading-relaxed tracking-tight ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>
             {lastCommand || "AI Dost Uplink Synchronized. Standing by for instructions, Sir."}
           </div>
        </div>
      </div>

      {/* DIEGETIC PROFESSIONAL DATA MESH */}
      <div className={`absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:80px_80px] transition-all duration-1000 ${isLightMode ? 'grayscale invert opacity-[0.02]' : ''}`}></div>
    </div>
  );
};
