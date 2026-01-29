import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppStatus } from '../types';
import { GoogleGenAI } from "@google/genai";

interface WhatsAppNodeProps {
  isOpen: boolean;
  onClose: () => void;
  status: WhatsAppStatus;
  onConnect: (sessionName: string) => void;
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

export const WhatsAppNode: React.FC<WhatsAppNodeProps> = ({ isOpen, onClose, status, onConnect, onMessageSent }) => {
  const [pairingStep, setPairingStep] = useState<'IDLE' | 'GENERATING' | 'READY' | 'CLONING' | 'COMPLETE'>(status.isConnected ? 'COMPLETE' : 'IDLE');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [cloneStatus, setCloneStatus] = useState("INITIALIZING_BAILEYS_CORE...");
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [autoPilot, setAutoPilot] = useState(false);
  const [inputMsg, setInputMsg] = useState('');

  const [chats, setChats] = useState<ChatPreview[]>([
    { 
      id: 'c1', name: 'Tony Stark', lastMsg: 'Project Mark 85 status?', time: '14:20', unread: 1, isBusiness: true, riskLevel: 'LOW',
      messages: [
        { id: 'm1', text: "Gervis, check the nanotech regeneration rates.", sender: 'CONTACT', timestamp: Date.now() - 100000 },
        { id: 'm2', text: "Analyzing, Sir. 98.4% efficiency maintained.", sender: 'GERVIS', timestamp: Date.now() - 90000 },
        { id: 'm3', text: "Project Mark 85 status?", sender: 'CONTACT', timestamp: Date.now() - 10000 }
      ]
    },
    { id: 'c2', name: 'Pepper Potts', lastMsg: 'Board meeting in 5.', time: '12:05', unread: 0, isBusiness: false, riskLevel: 'LOW', messages: [] },
    { id: 'c3', name: 'Peter Parker', lastMsg: 'Mr. Stark, I found something weird.', time: 'Yesterday', unread: 3, isBusiness: false, riskLevel: 'MEDIUM', messages: [] },
  ]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const initiateConnection = () => {
    setPairingStep('GENERATING');
    setTimeout(() => {
      setPairingCode(Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase());
      setQrData(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WA_UPLINK_${Date.now()}`);
      setPairingStep('READY');
    }, 1200);
  };

  const simulateClone = () => {
    setPairingStep('CLONING');
    const logs = ["SOCKET_SYNC...", "MD_AUTHENTICATED", "CONTACT_DECRYPT", "GERVIS_BRIDGE_STABLE"];
    let i = 0;
    const interval = setInterval(() => {
      setCloneStatus(logs[i] || 'COMPLETE');
      i++;
      if (i > logs.length) {
        clearInterval(interval);
        setPairingStep('COMPLETE');
        onConnect("REAL_TIME_UPLINK");
      }
    }, 600);
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
      
      <div className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#0b141a] border border-green-500/20 md:rounded-[3rem] overflow-hidden shadow-2xl pointer-events-auto flex flex-col animate-in zoom-in duration-300">
        <div className="h-14 md:h-16 bg-black/40 flex items-center justify-between px-6 md:px-8 border-b border-green-500/10">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${status.isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
            <span className="text-[10px] md:text-[12px] orbitron font-black text-green-500 tracking-widest uppercase">WA_UPLINK</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {pairingStep !== 'COMPLETE' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center gap-6 md:gap-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-2">
              <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
            </div>
            <h2 className="text-xl md:text-2xl orbitron font-black text-white uppercase italic">Neural_Sync</h2>
            {pairingStep === 'IDLE' && <button onClick={initiateConnection} className="px-6 md:px-8 py-3 bg-green-600 text-white orbitron font-black text-[10px] md:text-xs rounded-xl shadow-lg hover:scale-105 transition-all">INITIALIZE</button>}
            {pairingStep === 'GENERATING' && <div className="animate-pulse text-green-500 orbitron text-[10px]">AUTH_SYNC...</div>}
            {pairingStep === 'READY' && (
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 bg-black/60 p-4 md:p-6 rounded-3xl border border-green-500/20">
                <img src={qrData} alt="QR" className="w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-xl" />
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="text-2xl md:text-3xl font-mono text-green-400 tracking-widest">{pairingCode}</div>
                  <button onClick={simulateClone} className="px-5 py-2 bg-green-600 text-white orbitron font-black text-[9px] md:text-[10px] rounded-lg uppercase">Link_Node</button>
                </div>
              </div>
            )}
            {pairingStep === 'CLONING' && <div className="text-green-500 orbitron font-black animate-bounce">{cloneStatus}</div>}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} w-full md:w-72 lg:w-80 border-r border-green-500/10 bg-black/20 flex-col`}>
              <div className="p-3 md:p-4 border-b border-green-500/10">
                <input type="text" placeholder="Search..." className="w-full bg-[#111b21] rounded-lg px-4 py-2 text-[10px] md:text-xs outline-none text-green-100" />
              </div>
              <div className="flex-1 overflow-y-auto premium-scroll">
                {chats.map(chat => (
                  <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-all ${activeChatId === chat.id ? 'bg-green-500/5 border-l-4 border-green-500' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-500 orbitron font-black text-[10px]">{chat.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center"><span className="text-white text-[12px] orbitron font-bold truncate">{chat.name}</span><span className="text-[8px] text-slate-500">{chat.time}</span></div>
                      <div className="text-[10px] text-slate-500 truncate">{chat.lastMsg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#080b0d]`}>
              {activeChat ? (
                <>
                  <div className="h-14 bg-[#111b21] flex items-center justify-between px-4 md:px-6 border-b border-green-500/10">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActiveChatId(null)} className="md:hidden text-slate-400">
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7"/></svg>
                      </button>
                      <span className="text-white orbitron font-black text-[11px] md:text-[12px] uppercase">{activeChat.name}</span>
                    </div>
                    <button onClick={() => setAutoPilot(!autoPilot)} className={`text-[7px] md:text-[8px] orbitron font-black px-2 md:px-3 py-1 rounded border ${autoPilot ? 'bg-green-600 text-white border-green-500' : 'text-slate-500 border-white/10'}`}>AUTO: {autoPilot ? 'ON' : 'OFF'}</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
                    {activeChat.messages.map(m => (
                      <div key={m.id} className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl text-[11px] md:text-xs font-mono ${m.sender === 'SIR' ? 'bg-green-900/40 text-green-50 self-end' : 'bg-slate-800 text-slate-200 self-start'}`}>{m.text}</div>
                    ))}
                  </div>
                  <div className="p-3 md:p-4 bg-[#111b21] border-t border-green-500/10 flex flex-col md:flex-row gap-3 md:gap-4">
                    <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                      <input value={inputMsg} onChange={e=>setInputMsg(e.target.value)} type="text" placeholder="Message..." className="flex-1 bg-[#202c33] rounded-xl px-4 py-2 text-[11px] md:text-xs outline-none text-white font-mono" />
                      <button type="submit" className="p-2 bg-green-600 rounded-lg text-white shrink-0"><svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
                    </form>
                    <button onClick={handleSynthesizeReply} disabled={isDrafting} className="w-full md:w-auto px-4 py-2 bg-white/5 rounded-xl orbitron font-black text-[8px] text-green-500 border border-green-500/20 hover:bg-green-500/10 transition-all uppercase">{isDrafting ? 'Synth...' : 'AI_Draft'}</button>
                  </div>
                  {aiDraft && (
                    <div className="mx-3 md:mx-4 mb-3 md:mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex justify-between items-center animate-in slide-in-from-bottom-2 duration-300">
                      <span className="text-[9px] md:text-[10px] font-mono text-green-400 italic">"{aiDraft}"</span>
                      <button onClick={() => { setInputMsg(aiDraft); setAiDraft(''); }} className="text-[8px] orbitron font-black text-white bg-green-600 px-3 py-1 rounded-lg shrink-0 ml-2">USE</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-20"><span className="orbitron font-black text-sm md:text-xl tracking-widest uppercase">Select_Channel</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};