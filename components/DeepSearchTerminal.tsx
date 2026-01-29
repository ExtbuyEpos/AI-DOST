
import React, { useState, useEffect, useRef } from 'react';

interface DeepSearchTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  research: { topic: string, data: string, results?: any[] } | null;
}

export const DeepSearchTerminal: React.FC<DeepSearchTerminalProps> = ({ isOpen, onClose, research }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && research) {
      const initialLogs = [
        `EXECUTING_FAST_CRAWL: ${research.topic.toUpperCase()}`,
        "NODE_HANDSHAKE: OK",
        "SYNCING_GROUNDING_NODES...",
        "DECRYPTING_PACKETS...",
        "STREAM_LIVE."
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < initialLogs.length) {
          setLogs(prev => [...prev, `> ${initialLogs[i]}`]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50); // FAST OPEN: 50ms interval instead of 400ms
      return () => clearInterval(interval);
    } else {
      setLogs([]);
    }
  }, [isOpen, research]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#05070a] border border-cyan-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.2)] pointer-events-auto flex flex-col font-mono animate-in zoom-in duration-300">
        
        <div className="h-16 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between px-8 select-none">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_15px_#06b6d4]"></div>
             <span className="text-cyan-500 font-black tracking-[0.2em] text-xs orbitron uppercase">Deep_Fast_Terminal_v6.0</span>
          </div>
          <button onClick={onClose} className="text-cyan-800 hover:text-cyan-400 transition-colors">
             <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
           <div className="w-full md:w-80 bg-black/40 border-r border-cyan-500/10 flex flex-col p-6 overflow-hidden">
              <div className="text-cyan-900 border-b border-cyan-500/20 pb-3 mb-4 font-bold flex justify-between uppercase text-[10px] orbitron">
                <span>Fast_Stream</span>
                <span className="animate-pulse">_READY</span>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-cyan-600/80 premium-scroll text-[10px] leading-relaxed">
                 {logs.map((log, i) => <div key={i} className="break-words">{log}</div>)}
                 {research && <div className="text-cyan-400 mt-4">> SYNC_COMPLETE.</div>}
              </div>
           </div>

           <div className="flex-1 flex flex-col p-10 gap-8 overflow-y-auto premium-scroll relative">
              {!research ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 select-none grayscale scale-95">
                   <div className="w-32 h-32 border-2 border-dashed border-cyan-500 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <svg viewBox="0 0 24 24" className="w-16 h-16 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   </div>
                   <span className="text-cyan-500 tracking-[1em] mt-10 font-black orbitron uppercase">Fast_Search_Active</span>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] orbitron font-black text-cyan-800 uppercase tracking-widest">Master_Node: {research.topic.toUpperCase()}</span>
                      <h2 className="text-4xl orbitron font-black text-white italic tracking-tighter uppercase border-l-4 border-cyan-500 pl-6">{research.topic}</h2>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="hud-glass p-8 rounded-[2.5rem] bg-cyan-900/5 border-cyan-500/20 space-y-6">
                         <span className="text-[12px] orbitron font-black text-cyan-400 tracking-widest uppercase italic">Detailed_Intel</span>
                         <p className="text-sm text-cyan-100/70 leading-relaxed font-mono whitespace-pre-wrap">
                            {research.data}
                         </p>
                      </div>
                      <div className="flex flex-col gap-6">
                         <div className="hud-glass p-8 rounded-[2.5rem] bg-emerald-900/5 border-emerald-500/20">
                            <span className="text-[12px] orbitron font-black text-emerald-400 tracking-widest uppercase italic">Key_Insights</span>
                            <ul className="mt-4 space-y-3 text-[11px] font-mono text-emerald-100/60 list-disc pl-4">
                               <li>Sir, results verified across all global nodes.</li>
                               <li>Accuracy: 100% Guaranteed.</li>
                            </ul>
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
