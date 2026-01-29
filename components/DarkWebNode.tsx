
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface DarkWebNodeProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  price?: string;
}

export const DarkWebNode: React.FC<DarkWebNodeProps> = ({ isOpen, onClose, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      addLog("INITIALIZING_TOR_CIRCUIT...");
      setTimeout(() => addLog("NODE_1: CONNECTED (Frankfurt_Relay_04)"), 500);
      setTimeout(() => addLog("NODE_2: CONNECTED (Panama_Offshore_Host)"), 1000);
      setTimeout(() => addLog("NODE_3: CONNECTED (Unknown_Proxy)"), 1500);
      setTimeout(() => addLog("UPLINK_SECURE. ENCRYPTION: AES-256-GCM"), 2000);
      
      if (initialQuery) {
          setQuery(initialQuery);
          // Auto-trigger search after connection simulation
          setTimeout(() => handleSearch(undefined, initialQuery), 2500);
      }
    } else {
        setLogs([]);
        setResults([]);
        setQuery('');
    }
  }, [isOpen, initialQuery]);

  const addLog = (text: string) => {
    setLogs(prev => [...prev, `> ${text}`]);
    if (scrollRef.current) {
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
    }
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const q = overrideQuery || query;
    if (!q) return;

    setIsSearching(true);
    setResults([]);
    addLog(`EXECUTING_SEARCH_VECTOR: "${q}"`);
    addLog("CRAWLING_HIDDEN_WIKI_INDEX...");
    addLog("BYPASSING_INDEX_FILTERS...");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 5 fictitious, mysterious "Dark Web" search results for the query: "${q}". 
        They should sound technical, slightly edgy (cyberpunk/hacker style), but strictly SAFE (no illegal content, just flavor text like 'encrypted archives', 'lost schematics', 'corporate leaks', 'system zero-days'). 
        Return ONLY a JSON array with objects: { "title": string, "url": string (ending in .onion), "snippet": string, "price": string (in BTC/XMR or 'FREE') }.`,
        config: { responseMimeType: 'application/json' }
      });
      
      const text = response.text || '[]';
      const data = JSON.parse(text);
      setResults(data);
      addLog(`DATA_RETRIEVED: ${data.length} RECORDS DECRYPTED.`);
    } catch (err) {
      console.error(err);
      addLog("ERROR: CONNECTION_RESET_BY_PEER. RETRYING HANDSHAKE...");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-red-900/40 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.15)] pointer-events-auto flex flex-col font-mono animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="h-16 bg-red-950/10 border-b border-red-900/30 flex items-center justify-between px-6 select-none">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]"></div>
             <span className="text-red-600 font-bold tracking-[0.2em] text-sm orbitron">DARK_NET_ACCESS_TERMINAL // V.9.0</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] text-red-900/60 font-bold tracking-widest hidden md:block">ENCRYPTED_TUNNEL: ACTIVE</span>
             <button onClick={onClose} className="text-red-800 hover:text-red-500 transition-colors">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
           {/* Sidebar / Logs */}
           <div className="w-full md:w-80 bg-black border-r border-red-900/20 flex flex-col p-4 font-mono text-xs">
              <div className="text-red-900/60 border-b border-red-900/20 pb-2 mb-2 font-bold flex justify-between">
                <span>SYSTEM_LOGS</span>
                <span className="animate-pulse">_</span>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-red-700/80 premium-scroll font-mono text-[10px] leading-tight">
                 {logs.map((log, i) => <div key={i} className="break-words">{log}</div>)}
                 {isSearching && <div className="animate-pulse text-red-500">> DECRYPTING_PACKETS...</div>}
              </div>
              <div className="mt-4 p-4 border border-red-900/30 rounded bg-red-950/10">
                 <div className="text-[10px] text-red-500 mb-2 font-bold tracking-widest">NETWORK_LOAD</div>
                 <div className="flex gap-1 h-8 items-end">
                    {[40, 70, 30, 80, 50, 90, 60, 40, 75, 45, 60, 80, 20, 90, 50].map((h, i) => (
                      <div key={i} className="flex-1 bg-red-800/40 transition-all duration-300" style={{ height: `${Math.max(10, h + (Math.random() * 20 - 10))}%` }}></div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Main Content */}
           <div className="flex-1 flex flex-col bg-[#080808] relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
              
              {/* Search Bar */}
              <div className="p-8 pb-4 border-b border-red-900/10">
                 <form onSubmit={(e) => handleSearch(e)} className="flex gap-4">
                    <div className="flex-1 relative group">
                       <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="ENTER_SEARCH_VECTOR..."
                        className="w-full bg-black border border-red-900/40 p-4 pl-12 rounded-lg text-red-500 outline-none focus:border-red-600 focus:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all font-bold tracking-wider placeholder:text-red-900/30 font-mono"
                       />
                       <svg className="w-5 h-5 text-red-800 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSearching}
                      className="px-8 bg-red-900/20 border border-red-800/50 text-red-500 font-bold rounded-lg hover:bg-red-600 hover:text-black hover:shadow-[0_0_20px_#dc2626] transition-all disabled:opacity-50 orbitron tracking-widest text-xs"
                    >
                       {isSearching ? 'SCANNING...' : 'EXECUTE'}
                    </button>
                 </form>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4 premium-scroll">
                 {results.length === 0 && !isSearching && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 select-none pointer-events-none">
                       <div className="w-40 h-40 border border-red-900/50 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                          <svg viewBox="0 0 24 24" className="w-20 h-20 text-red-900" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                       </div>
                       <span className="text-red-800 tracking-[0.5em] mt-8 font-bold orbitron">SECURE_CHANNEL_READY</span>
                    </div>
                 )}
                 
                 {results.map((res, i) => (
                    <div key={i} className="border border-red-900/30 bg-black/50 p-6 rounded-lg hover:border-red-600/50 hover:bg-red-950/10 transition-all group cursor-pointer animate-in slide-in-from-bottom-4 duration-500 fill-mode-forwards opacity-0" style={{ animationDelay: `${i * 150}ms` }}>
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-red-500 font-bold text-lg group-hover:text-red-400 group-hover:underline decoration-red-800 underline-offset-4 tracking-tight">{res.title}</h3>
                          <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-900/30 font-bold orbitron">{res.price}</span>
                       </div>
                       <div className="text-red-800/60 text-xs mb-3 font-mono break-all flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-900/50 rounded-full"></span>
                          {res.url}
                       </div>
                       <p className="text-red-700/80 text-sm leading-relaxed font-mono">{res.snippet}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
