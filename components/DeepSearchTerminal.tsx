
import React, { useState, useEffect, useRef } from 'react';
import { SourceLink } from '../types';

interface DeepSearchTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  research: { topic: string, data: string, sources: SourceLink[] } | null;
}

export const DeepSearchTerminal: React.FC<DeepSearchTerminalProps> = ({ isOpen, onClose, research }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && research) {
      const initialLogs = [
        `INITIATING_DEEP_CRAWL: ${research.topic.toUpperCase()}`,
        "NODE_HANDSHAKE: SUCCESS",
        "SYNCING_GOOGLE_SEARCH_GROUNDING...",
        "DECRYPTING_REAL_TIME_PACKETS...",
        "FEED_ACTIVE"
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < initialLogs.length) {
          setLogs(prev => [...prev, `> ${initialLogs[i]}`]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 100);
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#05070a] border border-cyan-500/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.3)] pointer-events-auto flex flex-col font-mono animate-in zoom-in duration-500">
        
        <div className="h-16 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between px-8 select-none">
          <div className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_15px_#06b6d4]"></div>
             <span className="text-cyan-500 font-black tracking-[0.2em] text-xs orbitron uppercase italic">DEEP_INTERNET_CRAWLER_v7.5</span>
          </div>
          <button onClick={onClose} className="text-cyan-800 hover:text-cyan-400 transition-colors">
             <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
           <div className="w-full md:w-80 bg-black/40 border-r border-cyan-500/10 flex flex-col p-6 overflow-hidden">
              <div className="text-cyan-900 border-b border-cyan-500/20 pb-3 mb-4 font-bold flex justify-between uppercase text-[10px] orbitron">
                <span>CRAWL_STATUS</span>
                <span className="animate-pulse">_CONNECTED</span>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 text-cyan-600/80 premium-scroll text-[10px] leading-relaxed">
                 {logs.map((log, i) => <div key={i} className="break-words">{log}</div>)}
                 {research?.sources && research.sources.length > 0 && (
                   <div className="text-emerald-500 mt-4 font-black">>> SOURCES_EXTRACTED_{research.sources.length}</div>
                 )}
              </div>
           </div>

           <div className="flex-1 flex flex-col p-10 gap-8 overflow-y-auto premium-scroll relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
              {!research ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 select-none grayscale scale-95">
                   <div className="w-32 h-32 border-2 border-dashed border-cyan-500 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <svg viewBox="0 0 24 24" className="w-16 h-16 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   </div>
                   <span className="text-cyan-500 tracking-[1em] mt-10 font-black orbitron uppercase">Awaiting_Query_Lock</span>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] orbitron font-black text-cyan-800 uppercase tracking-widest italic">Research_Target: {research.topic.toUpperCase()}</span>
                      <h2 className="text-4xl orbitron font-black text-white italic tracking-tighter uppercase border-l-4 border-cyan-500 pl-6">{research.topic}</h2>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="hud-glass p-8 rounded-[2.5rem] bg-cyan-900/5 border-cyan-500/20 space-y-6">
                         <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="text-[12px] orbitron font-black text-cyan-400 tracking-widest uppercase italic">Neural_Synthesis_Data</span>
                            <div className="px-3 py-1 bg-cyan-500/10 rounded-lg text-[8px] text-cyan-500">REAL_TIME</div>
                         </div>
                         <p className="text-sm text-cyan-100/70 leading-relaxed font-mono whitespace-pre-wrap italic">
                            {research.data}
                         </p>
                      </div>

                      <div className="flex flex-col gap-8">
                         <div className="hud-glass p-8 rounded-[2.5rem] bg-emerald-900/5 border-emerald-500/20 flex flex-col gap-6">
                            <span className="text-[12px] orbitron font-black text-emerald-400 tracking-widest uppercase italic">Verified_Intelligence_Nodes</span>
                            <div className="flex flex-col gap-3">
                               {research.sources.length === 0 ? (
                                 <span className="text-[10px] font-mono text-slate-600 italic">No external nodes linked yet...</span>
                               ) : (
                                 research.sources.map((s, idx) => (
                                   <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10 transition-all group overflow-hidden">
                                      <div className="flex items-center gap-3">
                                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                         <span className="text-[11px] font-mono text-emerald-300 font-bold truncate uppercase">{s.title || s.uri}</span>
                                      </div>
                                      <span className="text-[8px] font-mono text-emerald-900 block mt-1 truncate group-hover:text-emerald-500 transition-colors">{s.uri}</span>
                                   </a>
                                 ))
                               )}
                            </div>
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
