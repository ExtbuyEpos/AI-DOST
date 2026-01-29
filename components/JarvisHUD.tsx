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
  const [telemetry, setTelemetry] = useState({
    sync: 99.85,
    ping: 11,
    load: 12,
    bits: '0.00',
    vector: '0x00'
  });

  const themeColor = identity === 'GERVIS' ? '#06b6d4' : identity === 'FRIDAY' ? '#f97316' : '#8b5cf6';

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        sync: 99.8 + Math.random() * 0.15,
        ping: Math.floor(Math.random() * 12) + 7,
        load: Math.floor(Math.random() * 25) + 8,
        bits: (Math.random() * 100).toFixed(2),
        vector: '0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0')
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* GLOBAL TACTICAL OVERLAYS */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-black/90 to-transparent"></div>
      <div className="absolute inset-0 border-[20px] md:border-[40px] border-black/10 pointer-events-none"></div>
      
      {/* TOP LEFT: NEURAL LINK TELEMETRY */}
      <div className="absolute top-12 md:top-16 left-8 md:left-16 flex items-center gap-10 md:gap-14">
        <div className="relative w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
           <div className="absolute inset-0 border border-white/10 rounded-full"></div>
           <div 
            className="absolute inset-0 border-t-4 border-r-2 rounded-full animate-[spin_5s_linear_infinite]" 
            style={{ borderColor: themeColor }}
           ></div>
           <div 
            className="absolute inset-3 border-b-2 border-l-4 rounded-full animate-[spin_8s_linear_infinite_reverse]" 
            style={{ borderColor: `${themeColor}66` }}
           ></div>
           <div className="text-[10px] md:text-[14px] orbitron font-black text-glow" style={{ color: themeColor }}>{telemetry.ping}ms</div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] md:text-[11px] orbitron font-black text-slate-500 tracking-[0.5em] uppercase">NEURAL_SYNC_ESTABLISHED</span>
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]`} style={{ backgroundColor: themeColor, color: themeColor }}></div>
            <span className="text-sm md:text-lg font-mono font-black" style={{ color: themeColor }}>{telemetry.sync.toFixed(3)}%_STABLE</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: MISSION PARAMETERS */}
      <div className="absolute top-12 md:top-16 right-8 md:right-16 text-right flex flex-col gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[9px] md:text-[11px] orbitron font-black text-slate-500 tracking-[0.5em] uppercase">SYSTEM_ARCH_IDENT</span>
          <span className="text-sm md:text-lg font-mono font-black text-glow" style={{ color: themeColor }}>PROJ_DOST_4.2.1_FINAL</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex justify-between w-40 md:w-64 text-[8px] md:text-[11px] orbitron font-black text-slate-500 uppercase tracking-widest">
             <span>COGNITIVE_LOAD</span>
             <span style={{ color: themeColor }}>{telemetry.load}%</span>
          </div>
          <div className="w-40 md:w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
            <div 
              className="h-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.6)]" 
              style={{ width: `${telemetry.load}%`, backgroundColor: themeColor }}
            ></div>
          </div>
        </div>
      </div>

      {/* BOTTOM LOG: MISSION CONTROL FEED */}
      <div className="absolute bottom-44 left-8 md:bottom-56 md:left-16 max-w-sm md:max-w-xl w-full">
        <div className="hologram-card p-6 md:p-8 border-l-4 group" style={{ borderLeftColor: themeColor }}>
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="text-[11px] md:text-[13px] orbitron font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_cyan]"></div>
                 MISSION_CONTROL_TELEMETRY
              </div>
              <span className="text-[10px] font-mono text-cyan-800 tracking-tighter uppercase font-bold">{telemetry.vector}</span>
           </div>
           <div className="text-sm md:text-lg font-mono text-white/95 italic line-clamp-2 leading-relaxed tracking-tight group-hover:text-white transition-colors">
             {lastCommand || "System online. Awaiting Sir's neural input injection..."}
           </div>
           <div className="mt-5 text-[8px] md:text-[10px] orbitron font-black text-slate-600 uppercase tracking-[0.6em] flex justify-between animate-pulse">
              <span>PRIME_PROTOCOL: v4.2.1</span>
              <span>_SECURE_LINK_100%</span>
           </div>
        </div>
      </div>

      {/* DIEGETIC GRID FLOOR */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(6,182,212,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.2)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"></div>
    </div>
  );
};