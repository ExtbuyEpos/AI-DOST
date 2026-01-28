
import React, { useState, useEffect } from 'react';
import { AIPersonality } from '../types';

interface LoginPageProps {
  onAuthorize: () => void;
  personality: AIPersonality;
  themeColor: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthorize, personality, themeColor }) => {
  const [authStep, setAuthStep] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'GRANTED'>('IDLE');
  const [progress, setProgress] = useState(0);

  const handleAuthorize = () => {
    setAuthStep('SCANNING');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setAuthStep('VERIFYING');
        setTimeout(() => {
          setAuthStep('GRANTED');
          setTimeout(onAuthorize, 1200);
        }, 1500);
      }
      setProgress(p);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#010409] flex items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-color)_0%,_transparent_70%)] opacity-10" style={{ '--accent-color': themeColor } as any}></div>
        <div className="absolute top-0 left-0 w-full h-[1px] animate-[scan_10s_linear_infinite]" style={{ backgroundColor: themeColor }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Hologram Container */}
      <div className="relative flex flex-col items-center gap-16 p-10 max-w-lg w-full">
        
        {/* Holographic Ring */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-dashed rounded-full animate-[rotate-slow_20s_linear_infinite] opacity-20" style={{ borderColor: themeColor }}></div>
          <div className="absolute inset-4 border border-current rounded-full animate-ping opacity-10" style={{ color: themeColor }}></div>
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${authStep !== 'IDLE' ? 'scale-110' : 'scale-100'}`}>
             <div className="w-48 h-48 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                {authStep === 'IDLE' && (
                  <svg viewBox="0 0 24 24" className="w-20 h-20 text-white opacity-40 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 11V7a4 4 0 0 1 8 0v4M5 11h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
                  </svg>
                )}
                {(authStep === 'SCANNING' || authStep === 'VERIFYING') && (
                  <div className="relative flex flex-col items-center">
                    <div className="w-24 h-24 border-4 border-t-current border-transparent rounded-full animate-spin mb-4" style={{ color: themeColor }}></div>
                    <span className="text-[12px] orbitron font-black uppercase tracking-[0.3em] animate-pulse" style={{ color: themeColor }}>
                      {authStep === 'SCANNING' ? 'SCANNING_SIR' : 'VERIFYING_DNA'}
                    </span>
                  </div>
                )}
                {authStep === 'GRANTED' && (
                  <svg viewBox="0 0 24 24" className="w-24 h-24 text-emerald-500 animate-in zoom-in duration-500" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
             </div>
          </div>
        </div>

        {/* Text and Controls */}
        <div className="text-center space-y-6 animate-in slide-in-from-bottom-10 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl orbitron font-black text-white tracking-[0.4em] uppercase italic italic">
              {personality === 'GERVIS' ? 'GERVIS_X' : personality === 'FRIDAY' ? 'FRIDAY_UI' : 'ALTON_01'}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-10 bg-white/20"></div>
              <span className="text-[10px] orbitron text-slate-500 font-bold uppercase tracking-[1em]">Tactical_Nexus</span>
              <div className="h-px w-10 bg-white/20"></div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-slate-400 max-w-sm mx-auto leading-relaxed uppercase opacity-60">
            {authStep === 'IDLE' ? 'Awaiting authorization from Sir to establish neural handshake and initialize system protocols.' : 'Synchronizing neural weights with local distributed node...'}
          </p>

          {authStep === 'IDLE' ? (
            <button 
              onClick={handleAuthorize}
              className="group relative px-10 py-5 bg-white/5 border-2 border-white/20 rounded-[2rem] hover:border-current hover:bg-current hover:text-black transition-all duration-500 flex items-center justify-center gap-6 overflow-hidden shadow-2xl"
              style={{ color: themeColor }}
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="text-xs orbitron font-black uppercase tracking-[0.5em] relative z-10">AUTHORIZE_UPLINK</span>
              <svg viewBox="0 0 24 24" className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 mx-auto">
               <div className="h-full transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{ width: `${progress}%`, backgroundColor: authStep === 'GRANTED' ? '#10b981' : themeColor }}></div>
            </div>
          )}
        </div>

        {/* Footer Data */}
        <div className="absolute bottom-12 flex justify-between w-full px-12 opacity-30">
          <div className="flex flex-col gap-1">
             <span className="text-[8px] orbitron font-black text-white">LATENCY_SYNC</span>
             <span className="text-[10px] font-mono text-white">0.002ms</span>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[8px] orbitron font-black text-white">LOCATION_NODE</span>
             <span className="text-[10px] font-mono text-white">TEHRAN_SEC_01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
