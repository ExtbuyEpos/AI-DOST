import React, { useState, useEffect } from 'react';
import { WhatsAppStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface WhatsAppNodeProps {
  isOpen: boolean;
  onClose: () => void;
  status: WhatsAppStatus;
  onConnect: (sessionName: string) => void;
  onDisconnect?: () => void;
  onMessageSent?: (msg: string) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'SIR' | 'CONTACT' | 'GERVIS';
  timestamp: number;
}

interface ChatPreview {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  isBusiness: boolean;
  messages: Message[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const WhatsAppNode: React.FC<WhatsAppNodeProps> = ({ isOpen, onClose, status, onConnect, onDisconnect, onMessageSent }) => {
  const [pairingStep, setPairingStep] = useState<'READY' | 'CLONING' | 'COMPLETE'>(status.isConnected ? 'COMPLETE' : 'READY');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [qrData, setQrData] = useState(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=00a884&data=WA_UPLINK_PRO_V7_${Date.now()}`);
  const [cloneStatus, setCloneStatus] = useState("AWAITING_SCAN...");
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [autoPilot, setAutoPilot] = useState(false);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (status.isConnected) {
      setPairingStep('COMPLETE');
    } else {
      setPairingStep('READY');
      setActiveChatId(null);
    }
  }, [status.isConnected]);

  const [chats, setChats] = useState<ChatPreview[]>([
    { 
      id: 'c1', name: 'Strategic Command', lastMsg: 'Status of the deep crawl?', time: '14:20', unread: 1, isBusiness: true, riskLevel: 'LOW',
      messages: [
        { id: 'm1', text: "Gervis, initialize the network scan.", sender: 'CONTACT', timestamp: Date.now() - 100000 },
        { id: 'm2', text: "Scanning initialized, Sir. No anomalies detected.", sender: 'GERVIS', timestamp: Date.now() - 90000 },
        { id: 'm3', text: "Status of the deep crawl?", sender: 'CONTACT', timestamp: Date.now() - 10000 }
      ]
    },
    { id: 'c2', name: 'Agent X', lastMsg: 'Package delivered.', time: '12:05', unread: 0, isBusiness: false, riskLevel: 'LOW', messages: [] },
    { id: 'c3', name: 'Unknown Node', lastMsg: 'Signal detected at 0x4F...', time: 'Yesterday', unread: 3, isBusiness: false, riskLevel: 'MEDIUM', messages: [] },
  ]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const simulateClone = () => {
    setPairingStep('CLONING');
    const logs = ["FETCHING_REMOTE_KEYS...", "SYNCING_MD_SESSION...", "DECRYPTING_STORE...", "UPLINK_STABLE"];
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setCloneStatus(logs[i]);
        i++;
      } else {
        clearInterval(interval);
        setPairingStep('COMPLETE');
        onConnect("REAL_TIME_CLONE_V7");
      }
    }, 400);
  };

  const handleDisconnect = () => {
    if (onDisconnect) onDisconnect();
    setPairingStep('READY');
    setActiveChatId(null);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !activeChatId) return;
    const newMsg: Message = { id: Date.now().toString(), text: inputMsg, sender: 'SIR', timestamp: Date.now() };
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, newMsg], lastMsg: inputMsg } : c));
    if (onMessageSent) onMessageSent(inputMsg);
    setInputMsg('');
  };

  const handleSynthesizeReply = async () => {
    if (!activeChat) return;
    setIsDrafting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a quick, witty AI reply for this chat with ${activeChat.name}. Context: ${activeChat.lastMsg}. Keep it short and professional.`,
      });
      setAiDraft(response.text || 'Protocol error.');
    } catch (e) { console.error(e); } finally { setIsDrafting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#0b141a] border border-emerald-500/30 md:rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(0,255,160,0.1)] pointer-events-auto flex flex-col animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="h-16 md:h-20 bg-black/40 flex items-center justify-between px-6 md:px-10 border-b border-emerald-500/10">
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${status.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <div className="flex flex-col">
              <span className="text-[12px] md:text-[14px] orbitron font-black text-emerald-500 tracking-widest uppercase italic">DOST_WHATSAPP_CLONE_V7</span>
              <span className="text-[8px] orbitron text-emerald-900 font-bold uppercase tracking-[0.4em]">{status.isConnected ? 'NODE_SYNCED' : 'AWAITING_HANDSHAKE'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {status.isConnected && (
              <button 
                onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-600/10 border border-rose-500/30 text-rose-500 orbitron font-black text-[9px] rounded-lg hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest"
              >
                Terminate_Uplink
              </button>
            )}
            <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all shadow-xl group">
              <svg viewBox="0 0 24 24" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {pairingStep !== 'COMPLETE' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center gap-8 md:gap-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
            {pairingStep === 'READY' ? (
              <>
                <div className="max-w-md space-y-2 mb-4">
                  <h2 className="text-2xl md:text-4xl orbitron font-black text-white uppercase italic tracking-tighter">Instant_Clone_Access</h2>
                  <p className="text-xs md:text-sm font-mono text-emerald-800 leading-relaxed uppercase">Scan the QR code below with your WhatsApp device to establish a direct neural bridge, Sir.</p>
                </div>

                <div className="relative group cursor-pointer" onClick={simulateClone}>
                  <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3rem] blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                  <div className="relative bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.2)] border-8 border-black overflow-hidden">
                    <img src={qrData} alt="WhatsApp QR" className="w-56 h-56 md:w-72 md:h-72" />
                    {/* Simulated "Scan" detection overlay */}
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="w-full h-1 bg-emerald-500 absolute top-0 animate-[scan_2s_linear_infinite]"></div>
                       <span className="text-[10px] orbitron font-black text-emerald-600 uppercase tracking-widest bg-black/80 px-4 py-2 rounded-full">Click_To_Simulate_Scan</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[10px] orbitron font-black text-emerald-500 tracking-widest uppercase">SYMBOLS_READY: SCAN_NOW</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-8">
                 <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                 </div>
                 <div className="text-emerald-500 orbitron font-black text-2xl tracking-[0.4em] uppercase italic animate-pulse">{cloneStatus}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden animate-in fade-in duration-500">
            {/* SIDEBAR */}
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-emerald-500/10 bg-black/20 flex-col`}>
              <div className="p-5 md:p-6 border-b border-emerald-500/10">
                <div className="relative">
                  <input type="text" placeholder="Scan contacts..." className="w-full bg-[#111b21] rounded-2xl px-10 py-3 text-xs md:text-sm outline-none text-emerald-100 border border-emerald-500/5 focus:border-emerald-500/30 transition-all font-mono" />
                  <svg className="w-4 h-4 text-emerald-900 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto premium-scroll p-2 space-y-2">
                {chats.map(chat => (
                  <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`p-5 rounded-[2rem] flex gap-4 cursor-pointer transition-all duration-300 relative group ${activeChatId === chat.id ? 'bg-emerald-500/10 border-2 border-emerald-500/30 shadow-lg' : 'hover:bg-white/5'}`}>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500 orbitron font-black text-lg shadow-xl">{chat.name[0]}</div>
                      {chat.unread > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-black border-2 border-[#0b141a]">{chat.unread}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-[14px] orbitron font-black truncate tracking-tighter">{chat.name}</span>
                        <span className="text-[9px] font-mono text-emerald-900 font-bold">{chat.time}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono italic">"{chat.lastMsg}"</div>
                    </div>
                    {chat.riskLevel === 'HIGH' && <div className="absolute top-1/2 right-4 -translate-y-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#080b0d] relative`}>
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
              
              {activeChat ? (
                <>
                  <div className="h-16 md:h-20 bg-[#111b21] flex items-center justify-between px-6 md:px-10 border-b border-emerald-500/10 relative z-10 shadow-xl">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setActiveChatId(null)} className="md:hidden text-slate-400 p-2 hover:text-emerald-500">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <div className="flex flex-col">
                        <span className="text-white orbitron font-black text-sm md:text-lg uppercase italic tracking-tighter">{activeChat.name}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase">Online_Bridge</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAutoPilot(!autoPilot)} className={`text-[9px] orbitron font-black px-4 py-2 rounded-xl border-2 transition-all shadow-lg ${autoPilot ? 'bg-emerald-600 text-white border-emerald-500' : 'text-emerald-900 border-emerald-900/30 hover:border-emerald-500/50'}`}>
                        AUTO_REPLY: {autoPilot ? 'ENGAGED' : 'OFFLINE'}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-6 premium-scroll relative z-10">
                    {activeChat.messages.map(m => (
                      <div key={m.id} className={`max-w-[90%] md:max-w-[75%] flex flex-col gap-2 ${m.sender === 'SIR' ? 'self-end items-end' : 'self-start items-start animate-in slide-in-from-left-4'}`}>
                        <div className={`px-6 py-4 rounded-[2rem] text-[13px] md:text-[15px] font-mono leading-relaxed shadow-2xl relative ${m.sender === 'SIR' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'}`}>
                           {m.text}
                           <div className={`absolute bottom-[-1.5rem] text-[9px] font-mono opacity-40 italic ${m.sender === 'SIR' ? 'right-2' : 'left-2'}`}>
                              {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 md:p-8 bg-[#111b21] border-t border-emerald-500/10 flex flex-col gap-6 relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                      <div className="flex-1 relative">
                        <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} type="text" placeholder="Message to clone..." className="w-full bg-[#202c33] rounded-[2rem] px-8 py-4 text-sm md:text-base outline-none text-white font-mono border-2 border-transparent focus:border-emerald-500/20 transition-all shadow-inner" />
                      </div>
                      <button type="submit" className="w-14 h-14 bg-emerald-600 rounded-2xl text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all shrink-0"><svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </form>
                    
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                       <button onClick={handleSynthesizeReply} disabled={isDrafting} className="w-full md:w-auto px-8 py-3 bg-white/5 rounded-2xl orbitron font-black text-[10px] text-emerald-500 border-2 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all uppercase tracking-widest flex items-center gap-3">
                         {isDrafting ? <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                         {isDrafting ? 'Synthesizing...' : 'Dost_Suggested_Reply'}
                       </button>
                       <span className="text-[9px] orbitron text-emerald-900 font-bold uppercase tracking-[0.3em] opacity-40">Direct_Cloned_Protocol: ACTIVE</span>
                    </div>

                    {aiDraft && (
                      <div className="p-6 bg-emerald-500/5 border-2 border-emerald-500/30 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
                        <p className="text-[13px] md:text-[15px] font-mono text-emerald-400 italic leading-relaxed pl-2 border-l-4 border-emerald-500/30">"{aiDraft}"</p>
                        <div className="flex gap-3 shrink-0">
                           <button onClick={() => setAiDraft('')} className="px-5 py-2 rounded-xl text-[10px] orbitron font-black text-rose-500 hover:bg-rose-500/10 transition-all uppercase">Discard</button>
                           <button onClick={() => { setInputMsg(aiDraft); setAiDraft(''); }} className="px-8 py-2 bg-emerald-600 text-white orbitron font-black text-[10px] rounded-xl shadow-lg hover:bg-emerald-500 transition-all uppercase tracking-widest">Execute</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-20 select-none grayscale scale-95">
                  <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-dashed border-emerald-500/40 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                     <svg viewBox="0 0 24 24" className="w-16 md:w-24 h-16 md:h-24 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <span className="orbitron font-black text-xl md:text-3xl tracking-[1em] uppercase text-center pl-[1em]">Awaiting_Link</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(280px); opacity: 0; }
        }
      `}} />
    </div>
  );
};
