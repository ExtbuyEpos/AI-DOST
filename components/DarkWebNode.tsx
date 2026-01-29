
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
      addLog("INIT_FAST_TOR...");
      // FAST OPEN: Drastically reduced timeouts
      setTimeout(() => addLog("RELAY: OK"), 100);
      setTimeout(() => addLog("UPLINK: SECURE (AES-256)"), 200);
      
      if (initialQuery) {
          setQuery(initialQuery);
          setTimeout(() => handleSearch(undefined, initialQuery), 300);
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
        }, 50);
    }
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const q = overrideQuery || query;
    if (!q) return;

    setIsSearching(true);
    setResults([]);
    addLog(`CRAWLING: "${q}"`);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 5 mysterious, edgy "Dark Web" search results for query: "${q}". JSON array: { "title", "url" (.onion), "snippet", "price" }. Safe but cool flavor.`,
        config: { responseMimeType: 'application/json' }
      });
      
      const data = JSON.parse(response.text || '[]');
      setResults(data);
      addLog(`RECORDS_DECRYPTED: ${data.length}`);
    } catch (err) {
      addLog("ERROR: UPLINK_LOST.");
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-red-900/40 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.15)] pointer-events-auto flex flex-col font-mono animate-in zoom-in duration-300">
        
        <div className="h-16 bg-red-950/10 border-b border-red-900/30 flex items-center justify-between px-6 select-none">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]"></div>
             <span className="text-red-600 font-bold tracking-[0.2em] text-sm orbitron uppercase">Dark_Fast_Link_v6.0</span>
          </div>
          <button onClick={onClose} className="text-red-800 hover:text-red-500 transition-colors">
             <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
           <div className="w-full md:w-80 bg-black border-r border-red-900/20 flex flex-col p-4 font-mono text-xs">
              <div className="text-red-900/60 border-b border-red-900/20 pb-2 mb-2 font-bold uppercase">FAST_LOGS</div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-red-700/80 premium-scroll text-[10px]">
                 {logs.map((log, i) => <div key={i} className="break-words">{log}</div>)}
              </div>
           </div>

           <div className="flex-1 flex flex-col bg-[#080808] relative">
              <div className="p-8 pb-4 border-b border-red-900/10">
                 <form onSubmit={(e) => handleSearch(e)} className="flex gap-4">
                    <input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="ENTER_VECTOR..."
                      className="flex-1 bg-black border border-red-900/40 p-4 rounded-lg text-red-500 outline-none transition-all font-mono"
                    />
                    <button type="submit" disabled={isSearching} className="px-8 bg-red-900/20 border border-red-800/50 text-red-500 font-bold rounded-lg hover:bg-red-600 hover:text-black transition-all">
                       {isSearching ? '...' : 'EXECUTE'}
                    </button>
                 </form>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 premium-scroll">
                 {results.map((res, i) => (
                    <div key={i} className="border border-red-900/30 bg-black/50 p-6 rounded-lg hover:border-red-600/50 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="text-red-500 font-bold text-lg">{res.title}</h3>
                          <span className="text-[10px] bg-red-950/40 text-red-400 px-2 py-1 rounded border border-red-900/30">{res.price}</span>
                       </div>
                       <p className="text-red-700/80 text-sm font-mono italic">{res.url}</p>
                       <p className="text-red-700/60 text-xs mt-2">{res.snippet}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
