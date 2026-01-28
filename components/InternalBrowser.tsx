
import React, { useState } from 'react';

interface InternalBrowserProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  onUrlChange: (url: string) => void;
}

export const InternalBrowser: React.FC<InternalBrowserProps> = ({ url, isOpen, onClose, onUrlChange }) => {
  const [inputUrl, setInputUrl] = useState(url);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    onUrlChange(targetUrl);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
      
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-sm aspect-[9/19] bg-[#0a0a0a] border-[6px] border-[#1a1a1a] rounded-[3rem] shadow-[0_0_100px_rgba(34,211,238,0.2)] pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in duration-500">
        
        {/* Notch Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#1a1a1a] rounded-b-2xl z-50 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#333]"></div>
          <div className="w-10 h-1 bg-[#222] rounded-full"></div>
        </div>

        {/* Browser Top Bar */}
        <div className="pt-10 px-6 pb-4 bg-[#111] border-b border-white/5">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-black/50 rounded-full px-4 py-2 border border-cyan-500/20 focus-within:border-cyan-400 transition-all">
            <span className="text-cyan-500/40 mr-2">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input 
              type="text" 
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="bg-transparent outline-none text-[10px] font-mono text-cyan-100 w-full placeholder-cyan-900"
              placeholder="SEARCH_OR_URL..."
            />
          </form>
          <div className="flex justify-between mt-3 px-2">
            <div className="flex gap-4">
               <button className="text-cyan-500/60 hover:text-cyan-400 transition-colors">
                 <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
               </button>
               <button className="text-cyan-500/60 hover:text-cyan-400 transition-colors">
                 <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
               </button>
            </div>
            <button onClick={onClose} className="text-red-500/60 hover:text-red-400 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white relative">
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            title="Tactical View"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          ></iframe>
          
          {/* Neural HUD Overlay on Browser */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/10 shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]">
            <div className="absolute top-2 left-2 text-[6px] orbitron font-black text-cyan-400/30">PROXY_NODE_OS</div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="h-8 bg-[#111] flex items-center justify-center">
          <div className="w-24 h-1 bg-white/10 rounded-full"></div>
        </div>
      </div>

      {/* Side Label */}
      <div className="hidden lg:block absolute left-full ml-10 text-cyan-400/20 whitespace-nowrap rotate-90 origin-left">
        <span className="orbitron text-4xl font-black tracking-[1em]">MOBILE_UPLINK</span>
      </div>
    </div>
  );
};
