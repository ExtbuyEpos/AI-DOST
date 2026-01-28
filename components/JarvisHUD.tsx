
import React, { useState, useEffect } from 'react';
import { AIPersonality, SystemStatus } from '../types';

interface JarvisHUDProps {
  lastCommand?: string;
  renderingMessage?: string | null;
  systemInfo?: Partial<SystemStatus>;
  isScreenSharing?: boolean;
  isModelTalking?: boolean;
  identity?: AIPersonality;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({ 
  lastCommand, 
  renderingMessage, 
  systemInfo, 
  isScreenSharing,
  isModelTalking,
  identity = 'GERVIS'
}) => {
  const [status, setStatus] = useState<SystemStatus>({
    cpu: 12,
    memory: 4.2,
    network: 156,
    threatLevel: 'MINIMAL',
    marketStatus: 'NEUTRAL',
    tradingVolume: '1.2B',
    pcLink: true,
    mobileLink: true,
    socialNodes: true,
    satelliteLink: true,
    miningHashrate: '450 TH/s',
    vaultStatus: 'SECURE',
    isSearching: false
  });

  const themeColor = identity === 'GERVIS' ? '#22d3ee' : identity === 'FRIDAY' ? '#f97316' : '#6366f1';

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 15) + 5,
        memory: Math.min(16, Math.max(2, prev.memory + (Math.random() - 0.5) * 0.1)),
        network: Math.floor(Math.random() * 400) + 400,
        tradingVolume: (Math.random() * 5 + 1).toFixed(1) + 'B',
        miningHashrate: (Math.random() * 20 + 420).toFixed(1) + ' TH/s'
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.5)_90%)] dark:bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_80%)] opacity-30 dark:opacity-50"></div>
      
      {/* SCANNING LINES */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-0 left-0 w-full h-[1px] animate-[scan_10s_linear_infinite]" style={{ backgroundColor: themeColor }}></div>
      </div>

      {/* TOP HUD ELEMENTS */}
      <div className="absolute top-8 md:top-12 left-8 md:left-12 right-8 md:right-12 flex justify-between items-start">
        <div className="flex flex-col gap-1 border-l-[3px] pl-5 py-1" style={{ borderColor: `${themeColor}66` }}>
          <div className="text-[11px] font-black orbitron tracking-[0.4em] uppercase" style={{ color: themeColor }}>SYSTEM_PROTOCOL_{identity === 'GERVIS' ? 'X' : identity === 'FRIDAY' ? 'F' : 'A'}</div>
          <div className="flex gap-1.5 mt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-4 rounded-sm overflow-hidden shadow-inner" style={{ backgroundColor: `${themeColor}33` }}>
                <div className="w-full h-full animate-pulse" style={{ backgroundColor: themeColor, animationDelay: `${i * 0.15}s` }}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12">
           {systemInfo?.location && (
             <div className="flex flex-col items-center gap-1 border-x border-cyan-500/20 px-6">
                <div className="text-[8px] orbitron font-black tracking-widest" style={{ color: `${themeColor}99` }}>SAT_LINK</div>
                <div className="text-[10px] font-mono font-black text-white animate-pulse">
                   {systemInfo.location.lat.toFixed(4)}N {systemInfo.location.lng.toFixed(4)}E
                </div>
                <div className="text-[6px] orbitron text-cyan-700 uppercase font-black">GPS_Triangulated</div>
             </div>
           )}

           {systemInfo?.battery && (
             <div className="flex flex-col items-center gap-1.5">
               <div className="text-[8px] orbitron font-black tracking-widest" style={{ color: `${themeColor}99` }}>AUX_CORE</div>
               <div className="w-14 h-7 border-2 rounded-lg flex items-center px-1 bg-white/50 dark:bg-black/20" style={{ borderColor: `${themeColor}4D` }}>
                  <div className={`h-4 transition-all duration-700 rounded-sm ${systemInfo.battery.level < 20 ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : ''}`} style={{ width: `${systemInfo.battery.level}%`, backgroundColor: systemInfo.battery.level >= 20 ? themeColor : undefined, boxShadow: systemInfo.battery.level >= 20 ? `0 0 10px ${themeColor}66` : undefined }}></div>
               </div>
               <div className="text-[9px] orbitron font-bold" style={{ color: themeColor }}>{systemInfo.battery.level.toFixed(0)}%</div>
             </div>
           )}
           
           <div className="flex flex-col items-center gap-1.5">
              <div className="text-[8px] orbitron font-black tracking-widest" style={{ color: `${themeColor}99` }}>NET_CRAWLER</div>
              <div className="flex gap-1">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className={`w-1.5 h-4 rounded-sm transition-all duration-500 ${systemInfo?.isSearching ? 'animate-pulse' : 'opacity-20'}`} style={{ backgroundColor: themeColor, animationDelay: `${i * 0.2}s` }}></div>
                 ))}
              </div>
              <div className={`text-[7px] orbitron font-black uppercase tracking-tighter ${systemInfo?.isSearching ? 'animate-pulse' : 'text-slate-400'}`} style={{ color: systemInfo?.isSearching ? themeColor : undefined }}>
                {systemInfo?.isSearching ? 'Active_Deep_Probe' : 'Proxy_Static'}
              </div>
           </div>

           <div className="flex flex-col items-center gap-1.5">
              <div className="text-[8px] orbitron text-slate-400 font-black tracking-widest uppercase">Vocal_Link</div>
              <div className={`w-4 h-4 rounded-full transition-all duration-500 ${isModelTalking ? 'scale-125 shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-emerald-500' : 'bg-slate-300 dark:bg-cyan-900/50 border-2 border-slate-100 dark:border-cyan-500/30'}`}></div>
           </div>
        </div>

        <div className="flex flex-col items-end gap-1 border-r-[3px] pr-5 py-1" style={{ borderColor: `${themeColor}66` }}>
          <div className="text-[11px] font-black orbitron tracking-[0.4em] uppercase italic" style={{ color: themeColor }}>{identity}_NODE_01</div>
          <div className="text-[8px] orbitron text-slate-400 font-black uppercase tracking-widest">Uplink: Tehran_Premium_Cloud</div>
        </div>
      </div>

      {/* CORE STATS (Right Center) */}
      <div className="absolute top-1/2 right-6 md:right-12 -translate-y-1/2 flex flex-col gap-8 text-right transition-all duration-500">
        <div className="text-[10px] font-black orbitron tracking-[0.5em] uppercase opacity-60" style={{ color: themeColor }}>Synaptic_Load_Telemetry</div>
        
        {[
          { label: 'BANDWIDTH', val: status.cpu + '%', pct: status.cpu },
          { label: 'BUFFER', val: status.memory.toFixed(1) + 'GB', pct: (status.memory / 16) * 100 }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-end gap-1.5">
            <div className="flex justify-between w-40 md:w-56 text-[8px] orbitron font-bold tracking-wider" style={{ color: `${themeColor}B3` }}>
              <span>{s.label}</span>
              <span style={{ color: themeColor }} className="font-black">{s.val}</span>
            </div>
            <div className="w-40 md:w-56 h-1.5 rounded-full overflow-hidden shadow-inner bg-slate-200 dark:bg-black/40">
              <div className="h-full transition-all duration-1000" style={{ width: `${s.pct}%`, backgroundColor: themeColor, boxShadow: `0 0 15px ${themeColor}66` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* COMMAND CONSOLE (Bottom Left) */}
      <div className="absolute bottom-40 left-10 flex flex-col gap-3 w-full max-w-md transition-all duration-500">
        <div className="hud-glass p-5 rounded-[2rem] pointer-events-auto relative group overflow-hidden border-2 border-white/50 shadow-2xl" style={{ borderColor: `${themeColor}33` }}>
          <div className="absolute top-0 left-0 w-1.5 h-full shadow-[0_0_20px_rgba(14,165,233,0.5)]" style={{ backgroundColor: themeColor }}></div>
          <div className="text-[9px] orbitron font-black mb-2 flex items-center justify-between tracking-widest uppercase" style={{ color: `${themeColor}99` }}>
            <div className="flex items-center gap-2.5">
               <div className={`w-2 h-2 rounded-full ${systemInfo?.isSearching ? 'animate-ping' : 'animate-pulse'}`} style={{ backgroundColor: themeColor }}></div>
               {systemInfo?.isSearching ? 'Dark_Net_Infiltration_Node' : `${identity}_Cognition_Stream`}
            </div>
            <span className="text-[7px] text-slate-400 opacity-60">Status: Optimized</span>
          </div>
          <div className="text-[13px] font-mono text-slate-800 dark:text-cyan-100 uppercase tracking-tight italic line-clamp-2 min-h-[3em] leading-snug">
            {lastCommand || renderingMessage || `Awaiting voice authorization from Sir...`}
          </div>
        </div>
      </div>
    </div>
  );
};
