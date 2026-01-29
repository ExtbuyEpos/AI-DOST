import React, { useRef, useEffect } from 'react';
import { TranscriptionLine } from '../types';

interface LiveChatProps {
  messages: TranscriptionLine[];
  isOpen: boolean;
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onClose: () => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({ messages, isOpen, onSendMessage, isProcessing, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value.trim()) {
      onSendMessage(inputRef.current.value.trim());
      inputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:right-8 md:bottom-36 md:top-32 md:w-[28rem] z-[60] flex flex-col gap-6 animate-in slide-in-from-right-12 duration-700 pointer-events-auto bg-slate-50 dark:bg-black/95 md:bg-transparent p-6 md:p-0">
      {/* PROFESSIONAL CHAT HEADER */}
      <div className="hud-glass rounded-[2.5rem] px-8 py-5 flex items-center justify-between border-slate-200 dark:border-cyan-500/20">
        <div className="flex items-center gap-4">
           <div className="w-2.5 h-2.5 bg-cyan-500 animate-pulse rounded-full shadow-[0_0_10px_#06b6d4]"></div>
           <span className="text-[13px] orbitron text-slate-900 dark:text-cyan-400 font-black tracking-[0.3em]">NEXUS_SYNC_L7</span>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-all">
           <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 hud-glass rounded-[3rem] flex flex-col overflow-hidden border-slate-200 dark:border-cyan-500/10">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto premium-scroll flex flex-col gap-6 px-8 py-8"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col gap-2.5 ${m.role === 'user' ? 'items-end' : 'items-start animate-in fade-in slide-in-from-left-6'}`}>
              <div className="flex items-center gap-3 px-1">
                <span className={`text-[9px] orbitron font-black tracking-widest uppercase ${m.role === 'user' ? 'text-slate-400' : 'text-cyan-600'}`}>
                  {m.role === 'user' ? 'SIR_UPLINK' : 'MOLTBOT_X'}
                </span>
                <span className="text-[7px] font-mono text-slate-400 opacity-50">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className={`max-w-[95%] px-6 py-5 rounded-[2rem] text-[12px] font-mono leading-relaxed transition-all shadow-md ${
                m.role === 'user' 
                  ? 'bg-cyan-600 text-white shadow-cyan-500/10' 
                  : 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-cyan-400/10 text-slate-800 dark:text-cyan-50'
              }`}>
                {m.text}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                     <span className="text-[9px] orbitron text-slate-500 dark:text-cyan-700 font-black uppercase italic">Intelligence_Verification_Nodes</span>
                     <div className="flex flex-col gap-2">
                        {m.sources.map((s, idx) => (
                          <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-600 dark:text-cyan-500/70 hover:underline truncate block border-l-2 border-cyan-500/30 pl-4 py-1 bg-cyan-500/5 rounded-r-lg">
                             {s.title || s.uri}
                          </a>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex flex-col gap-4 p-6 bg-cyan-500/5 rounded-[2.5rem] border border-cyan-500/10 animate-in zoom-in duration-500">
              <div className="flex gap-2.5 items-center">
                <div className="w-2 h-2 bg-cyan-500 animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-cyan-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[10px] orbitron text-cyan-800 dark:text-cyan-600 font-black uppercase tracking-[0.2em] ml-2">Internal_Neural_Debate</span>
              </div>
              <div className="space-y-2 border-l-2 border-cyan-500/20 pl-5 py-1">
                 <div className="text-[8px] font-mono text-cyan-600/80 uppercase">>> ARCHITECT: Mapping strategy vector Gamma-5...</div>
                 <div className="text-[8px] font-mono text-cyan-600/80 uppercase">>> SEARCHER: Scraping deep-web layer 7 caches...</div>
                 <div className="text-[8px] font-mono text-cyan-600/80 uppercase">>> LOGIC_GATE: Conflict resolution in progress...</div>
              </div>
            </div>
          )}
        </div>

        {/* PROFESSIONAL COMMAND INPUT */}
        <div className="p-6 bg-slate-100 dark:bg-black/50 border-t border-slate-200 dark:border-cyan-500/10">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-white dark:bg-black/80 border-2 border-slate-300 dark:border-cyan-500/40 rounded-[1.8rem] overflow-hidden px-6 py-4 focus-within:border-cyan-500 transition-all shadow-2xl">
              <span className="text-cyan-500 font-black mr-3 text-[14px] orbitron">></span>
              <input 
                ref={inputRef}
                type="text"
                placeholder="PROMPT_NEXUS_CORE_OS..."
                className="w-full bg-transparent outline-none text-[13px] font-mono text-slate-900 dark:text-cyan-50 placeholder:text-slate-400"
              />
              <button type="submit" className="ml-4 text-cyan-600 hover:text-cyan-400 transition-colors">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};