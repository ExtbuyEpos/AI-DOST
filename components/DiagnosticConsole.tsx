
import React from 'react';

interface DiagnosticConsoleProps {
  logs: string[];
  isOpen: boolean;
}

export const DiagnosticConsole: React.FC<DiagnosticConsoleProps> = ({ logs, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl hud-glass p-8 rounded-3xl border-cyan-500/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 animate-pulse"></div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping"></div>
          <h2 className="text-xl orbitron font-black text-white tracking-widest uppercase">
            NEURAL_DOCTOR_ENGAGED
          </h2>
        </div>
        
        <div className="flex flex-col gap-3 font-mono text-[10px] md:text-xs">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 items-center animate-in slide-in-from-left-4 duration-300">
              <span className="text-cyan-800">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className={log.includes('FIX') || log.includes('RESTORED') ? 'text-green-400 font-bold' : 'text-cyan-400'}>
                > {log}
              </span>
            </div>
          ))}
          <div className="w-full h-2 bg-slate-900 rounded-full mt-4 overflow-hidden border border-cyan-500/10">
            <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_10px_cyan]" style={{ width: `${(logs.length / 5) * 100}%` }}></div>
          </div>
        </div>

        <div className="mt-8 text-[8px] orbitron text-cyan-900 font-bold tracking-[1em] uppercase text-center opacity-40">
          Auto_Correction_Module_v4.2.1
        </div>
      </div>
    </div>
  );
};
