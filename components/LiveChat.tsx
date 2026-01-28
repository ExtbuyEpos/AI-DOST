
import React, { useRef, useEffect } from 'react';
import { TranscriptionLine } from '../types';

// Defining and exporting ChatOptions to resolve the missing export error in App.tsx
export interface ChatOptions {
  mode?: 'FAST' | 'THINKING' | 'STANDARD';
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  imageSize?: "1K" | "2K" | "4K";
}

interface LiveChatProps {
  messages: TranscriptionLine[];
  isOpen: boolean;
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const LiveChat: React.FC<LiveChatProps> = ({ messages, isOpen, onSendMessage, isProcessing }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value.trim()) {
      onSendMessage(inputRef.current.value.trim());
      inputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-36 top-28 w-80 md:w-96 z-[60] flex flex-col gap-4 animate-in slide-in-from-right-10 duration-700 pointer-events-auto">
      {/* Tactical Chat Header */}
      <div className="hud-glass rounded-[2rem] px-5 py-4 flex items-center justify-between border-slate-200/50 dark:border-cyan-500/20">
        <div className="flex items-center gap-3">
           <div className="w-2.5 h-2.5 bg-sky-500 dark:bg-cyan-400 animate-pulse rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
           <span className="text-[11px] orbitron text-slate-800 dark:text-cyan-400 font-black tracking-[0.2em]">GERVIS_COM_LINK</span>
        </div>
        <span className="text-[8px] orbitron font-black text-slate-400 dark:text-cyan-800 uppercase tracking-widest">Session_Secure</span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 hud-glass rounded-[2.5rem] flex flex-col overflow-hidden border-slate-200/50 dark:border-cyan-500/10">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto premium-scroll flex flex-col gap-4 px-5 py-6 mask-fade-top"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start animate-in fade-in slide-in-from-left-4 duration-500'}`}>
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[8px] orbitron font-black tracking-[0.1em] ${m.role === 'user' ? 'text-slate-500 dark:text-cyan-700' : 'text-sky-600 dark:text-cyan-400'}`}>
                  {m.role === 'user' ? 'SIR_AUTHORIZED' : 'GERVIS_X'}
                </span>
                <span className="text-[7px] font-mono text-slate-400 opacity-60">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-[11px] font-mono leading-relaxed transition-all shadow-sm ${
                m.role === 'user' 
                  ? 'bg-slate-100 dark:bg-cyan-500/10 border border-slate-200 dark:border-cyan-500/20 text-slate-900 dark:text-cyan-50' 
                  : 'bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-cyan-400/10 text-slate-700 dark:text-cyan-400'
              }`}>
                {m.text}

                {/* Citations / Grounding Chunks */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-cyan-400/10 space-y-2">
                     <div className="text-[8px] orbitron text-slate-400 dark:text-cyan-700 font-black uppercase tracking-widest flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="4"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        Intelligence_Sources
                     </div>
                     <div className="flex flex-col gap-1.5">
                        {m.sources.map((s, idx) => (
                          <a 
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-sky-600 dark:text-cyan-500/60 hover:text-sky-800 dark:hover:text-cyan-300 transition-all truncate block border-l-2 border-slate-200 dark:border-cyan-500/20 pl-3 py-1 bg-slate-50 dark:bg-cyan-500/5 rounded-r-md"
                          >
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
            <div className="flex gap-1.5 items-center px-2 py-3">
              <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-cyan-400 animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-sky-500 dark:bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-[8px] orbitron text-slate-400 dark:text-cyan-800 ml-2 font-black uppercase tracking-widest animate-pulse">Neural_Processing...</span>
            </div>
          )}
        </div>

        {/* Command Input Area */}
        <div className="p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-cyan-500/10">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-white dark:bg-black/80 border-2 border-slate-200 dark:border-cyan-500/30 rounded-2xl overflow-hidden px-4 py-3 group focus-within:border-sky-500 dark:focus-within:border-cyan-400 transition-all shadow-lg focus-within:shadow-sky-500/10">
              <span className="text-slate-400 dark:text-cyan-500/60 font-black mr-2 text-[12px] orbitron">$</span>
              <input 
                ref={inputRef}
                type="text"
                placeholder="PROMPT_SYSTEM..."
                className="w-full bg-transparent outline-none text-[12px] font-mono text-slate-900 dark:text-cyan-100 placeholder:text-slate-300 dark:placeholder:text-cyan-900"
              />
              <button type="submit" className="ml-3 text-sky-600 dark:text-cyan-500 hover:text-sky-800 dark:hover:text-cyan-300 transition-all transform hover:scale-110 active:scale-95">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-top {
          mask-image: linear-gradient(to bottom, transparent, black 15%);
        }
      `}} />
    </div>
  );
};
