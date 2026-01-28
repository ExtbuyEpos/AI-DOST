
import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppStatus, TranscriptionLine } from '../types';
import { GoogleGenAI } from "@google/genai";

interface WhatsAppNodeProps {
  isOpen: boolean;
  onClose: () => void;
  status: WhatsAppStatus;
  onConnect: (sessionName: string) => void;
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

export const WhatsAppNode: React.FC<WhatsAppNodeProps> = ({ isOpen, onClose, status, onConnect }) => {
  const [pairingStep, setPairingStep] = useState<'IDLE' | 'GENERATING' | 'READY' | 'CLONING' | 'COMPLETE'>(status.isConnected ? 'COMPLETE' : 'IDLE');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [qrData, setQrData] = useState("");
  const [cloneStatus, setCloneStatus] = useState("INITIALIZING_BAILEYS_CORE...");
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [autoPilot, setAutoPilot] = useState(false);

  const [chats, setChats] = useState<ChatPreview[]>([
    { 
      id: 'c1', name: 'Tony Stark', lastMsg: 'The suit is ready for testing.', time: '10:45', unread: 2, isBusiness: true, riskLevel: 'LOW',
      messages: [
        { id: 'm1', text: "Gervis, the neural link is fluctuating. Run a bypass on sector 7G.", sender: 'CONTACT', timestamp: Date.now() - 100000 },
        { id: 'm2', text: "Confirmed, Sir. Re-routing sector 7G. Stability restored.", sender: 'GERVIS', timestamp: Date.now() - 90000 },
        { id: 'm3', text: "The suit is ready for testing.", sender: 'CONTACT', timestamp: Date.now() - 10000 }
      ]
    },
    { 
      id: 'c2', name: 'Unknown Contact', lastMsg: 'Project X blueprints attached.', time: '09:30', unread: 1, isBusiness: true, riskLevel: 'HIGH',
      messages: [
        { id: 'm4', text: "Project X blueprints attached. Do you have the decryption key?", sender: 'CONTACT', timestamp: Date.now() - 500000 }
      ]
    },
    { id: 'c3', name: 'Happy Hogan', lastMsg: 'I am downstairs.', time: 'Yesterday', unread: 0, isBusiness: false, riskLevel: 'LOW', messages: [] },
    { id: 'c4', name: 'Peter Parker', lastMsg: 'Peter here, Mr. Stark!', time: 'Yesterday', unread: 5, isBusiness: false, riskLevel: 'LOW', messages: [] },
  ]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const initiateConnection = () => {
    setPairingStep('GENERATING');
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + 
                  Math.random().toString(36).substring(2, 6).toUpperCase();
      setPairingCode(code);
      setQrData(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WA_LINK_${Date.now()}`);
      setPairingStep('READY');
    }, 1500);
  };

  const simulateClone = () => {
    setPairingStep('CLONING');
    const logs = [
      "ESTABLISHING_WEB_SOCKET...",
      "AUTHENTICATING_MD_SESSION...",
      "SYNCING_CONTACT_CRYPTO...",
      "DOWNLOADING_MESSAGE_HISTORY...",
      "FINALIZING_GERVIS_CLONE_UPLINK..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setCloneStatus(logs[i]);
      i++;
      if (i >= logs.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPairingStep('COMPLETE');
          onConnect("GERVIS_CLONE_BETA");
        }, 1000);
      }
    }, 800);
  };

  const handleSynthesizeReply = async () => {
    if (!activeChat) return;
    setIsDrafting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const lastMessages = activeChat.messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Draft a tactical, professional, and helpful reply for the following WhatsApp conversation as an AI assistant named Gervis. Sir is the user. \n\nCONVERSATION:\n${lastMessages}`,
      });
      setAiDraft(response.text || 'Neural synthesis failed.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleDeepWebScan = async () => {
    if (!activeChat) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Perform a simulated "Deep Internet Security Scan" for the contact: ${activeChat.name}. Search for potential data leaks, social media presence, and professional background. Return a summary with a "Threat Level" and 3 key findings.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      setScanResult(response.text || 'No data identified in public repositories.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-50 dark:bg-[#0b141a] border border-slate-200 dark:border-green-500/40 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.15)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        {/* TOP STATUS BAR */}
        <div className="h-16 bg-white dark:bg-black flex items-center justify-between px-10 border-b border-slate-200 dark:border-green-500/20 shadow-sm relative z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500 shadow-[0_0_15px_#22c55e] animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <div className="flex flex-col">
                 <span className="text-[11px] orbitron font-black text-slate-800 dark:text-green-500 tracking-[0.2em] uppercase">BAILEYS_AI_NEXUS_v9.0</span>
                 <span className="text-[7px] orbitron text-slate-400 dark:text-green-900 font-black uppercase">Secure_Multi-Device_Uplink</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-green-500/20"></div>
            <div className="flex items-center gap-3">
               <span className="text-[8px] orbitron text-slate-500 dark:text-green-700 font-bold uppercase tracking-widest">Protocol:</span>
               <div className={`px-3 py-1 rounded-full text-[8px] orbitron font-black tracking-tighter ${status.isConnected ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-slate-100 text-slate-400'}`}>
                 {status.isConnected ? 'ACTIVE_CLONE' : 'STANDBY'}
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-green-500 hover:bg-rose-500 hover:text-white transition-all duration-300">
               <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        {pairingStep !== 'COMPLETE' ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#080b0d] p-10 gap-10">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] border-2 border-green-500/20 flex items-center justify-center mx-auto mb-6">
                   <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-500" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
                </div>
                <h2 className="text-4xl orbitron font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">WhatsApp_Web_Connect</h2>
                <p className="text-xs font-mono text-slate-500 dark:text-green-700/80 leading-relaxed uppercase">
                   Establish a secure Baileys WebSocket tunnel to clone your WhatsApp Web session and grant Gervis full autonomous control over messages and contacts.
                </p>
              </div>

              {pairingStep === 'IDLE' && (
                <button 
                  onClick={initiateConnection}
                  className="group relative px-12 py-6 bg-green-600 text-white orbitron font-black text-sm rounded-3xl hover:scale-105 hover:bg-green-500 transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)] overflow-hidden"
                >
                  <span className="relative z-10">INITIALIZE_LINK_PROTOCOL</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
              )}

              {pairingStep === 'GENERATING' && (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                  <span className="text-[11px] orbitron text-green-500 font-black tracking-[0.4em] uppercase animate-pulse italic">Generating_Crypto_Handshake...</span>
                </div>
              )}

              {pairingStep === 'READY' && (
                <div className="flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-700">
                  <div className="flex flex-col md:flex-row items-center gap-12 bg-slate-50 dark:bg-black/60 p-10 rounded-[3rem] border-2 border-slate-200 dark:border-green-500/20 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full"></div>
                     <div className="flex flex-col items-center gap-5">
                        <div className="relative w-56 h-56 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100">
                           <img src={qrData} alt="WhatsApp QR" className="w-full h-full" />
                           <div className="absolute top-0 left-0 w-full h-1 bg-green-500/40 animate-[scan_2s_linear_infinite]"></div>
                        </div>
                        <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest">Protocol_A: Optical Sync</span>
                     </div>
                     <div className="w-px h-40 bg-slate-200 dark:bg-green-500/20 hidden md:block"></div>
                     <div className="flex flex-col items-center gap-5">
                        <div className="bg-white dark:bg-green-950/20 px-10 py-6 rounded-3xl border-2 border-slate-200 dark:border-green-400/20 shadow-xl">
                           <div className="text-5xl md:text-6xl font-mono text-slate-800 dark:text-green-400 font-black tracking-[0.2em]">{pairingCode}</div>
                        </div>
                        <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest">Protocol_B: Neural Pairing Code</span>
                     </div>
                  </div>
                  <button 
                    onClick={simulateClone}
                    className="px-10 py-5 bg-green-600 text-white orbitron font-black text-xs rounded-2xl hover:scale-105 transition-all shadow-2xl hover:shadow-green-500/20 uppercase tracking-widest"
                  >
                    Uplink_Established_//_Execute_Clone
                  </button>
                </div>
              )}

              {pairingStep === 'CLONING' && (
                <div className="flex flex-col items-center gap-10 animate-in fade-in duration-500">
                  <div className="w-40 h-40 relative">
                    <div className="absolute inset-0 border-[6px] border-green-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-t-green-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center animate-pulse">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-500" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
                       </div>
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-[14px] orbitron font-black text-green-500 uppercase tracking-[0.5em] italic">{cloneStatus}</div>
                    <div className="w-80 h-2 bg-green-950/40 rounded-full overflow-hidden border border-green-500/10">
                      <div className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]" style={{ width: '65%', transition: 'width 2s ease-in-out' }}></div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-white dark:bg-[#080b0d]">
            {/* LEFT SIDEBAR: CHATS */}
            <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-green-500/10 flex flex-col bg-slate-50 dark:bg-black/20">
              <div className="p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] orbitron font-black text-slate-900 dark:text-green-500 uppercase tracking-widest">Active_Channels</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-[8px] orbitron font-black text-green-600">LIVE</span>
                  </div>
                </div>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Intercept communications..."
                    className="w-full bg-white dark:bg-[#111b21] border-2 border-slate-200 dark:border-green-500/10 rounded-2xl px-5 py-4 text-[12px] text-slate-900 dark:text-green-100 outline-none shadow-sm focus:border-green-500/40 transition-all placeholder:text-slate-400 group-hover:border-green-500/20"
                  />
                  <svg className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-green-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto premium-scroll">
                 {chats.map(chat => (
                   <div 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`px-6 py-5 flex gap-4 items-center cursor-pointer transition-all border-l-[6px] relative group ${activeChatId === chat.id ? 'bg-white dark:bg-green-500/5 border-green-600' : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}`}
                   >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm orbitron font-black shadow-lg transition-all group-hover:scale-110 ${chat.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-green-500'}`}>
                       {chat.name.split(' ').map(n => n[0]).join('')}
                       {chat.riskLevel === 'HIGH' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-50"></div>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[13px] orbitron font-black text-slate-900 dark:text-white truncate uppercase italic">{chat.name}</span>
                           <span className="text-[8px] orbitron text-slate-400 font-black">{chat.time}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-green-800/80 truncate">{chat.lastMsg}</div>
                     </div>
                     {chat.unread > 0 && (
                       <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-[10px] text-white font-black orbitron shadow-[0_0_10px_#16a34a]">
                         {chat.unread}
                       </div>
                     )}
                   </div>
                 ))}
              </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0b141a] relative">
               {activeChat ? (
                 <>
                   {/* CHAT HEADER */}
                   <div className="h-20 bg-white dark:bg-[#111b21] flex items-center justify-between px-10 border-b border-slate-200 dark:border-green-500/10 relative z-20 shadow-xl">
                      <div className="flex items-center gap-5">
                         <div className={`w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-green-500 orbitron font-black shadow-inner border border-white/10 ${activeChat.riskLevel === 'HIGH' ? 'ring-2 ring-rose-500/50' : ''}`}>
                            {activeChat.name.split(' ').map(n => n[0]).join('')}
                         </div>
                         <div className="flex flex-col">
                            <div className="text-base orbitron font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{activeChat.name}</div>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                               <span className="text-[8px] orbitron text-green-600 dark:text-green-400 uppercase tracking-[0.2em] font-black">ENCRYPTED_UPLINK_STABLE</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col items-end">
                            <span className="text-[7px] orbitron text-slate-400 font-black uppercase">Intercept_Status</span>
                            <span className={`text-[10px] orbitron font-black ${activeChat.riskLevel === 'HIGH' ? 'text-rose-500' : 'text-green-500'}`}>
                              {activeChat.riskLevel === 'HIGH' ? 'ANOMALOUS_FEED' : 'SECURE_CHANNEL'}
                            </span>
                         </div>
                         <div className="w-px h-8 bg-slate-200 dark:bg-white/5"></div>
                         <button 
                          onClick={() => setAutoPilot(!autoPilot)}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border-2 transition-all duration-500 ${autoPilot ? 'bg-green-600 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-105' : 'bg-slate-100 dark:bg-transparent border-slate-200 dark:border-green-500/20 text-slate-500'}`}
                         >
                            <svg className={`w-4 h-4 ${autoPilot ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span className="text-[10px] orbitron font-black uppercase tracking-widest">{autoPilot ? 'AI_AUTOPILOT_ON' : 'AI_PILOT_STDBY'}</span>
                         </button>
                      </div>
                   </div>

                   <div className="flex-1 flex overflow-hidden">
                      {/* CHAT MESSAGES */}
                      <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                         {activeChat.messages.length === 0 && (
                           <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale italic text-[10px] orbitron tracking-[0.4em] uppercase text-slate-500">
                             Awaiting communication stream...
                           </div>
                         )}
                         {activeChat.messages.map(m => (
                           <div key={m.id} className={`flex flex-col gap-2 max-w-[75%] ${m.sender === 'SIR' || m.sender === 'GERVIS' ? 'self-end items-end' : 'self-start items-start'}`}>
                              <div className={`px-6 py-4 rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border-2 ${
                                m.sender === 'SIR' ? 'bg-green-100 dark:bg-green-900/30 border-green-500/20 text-slate-900 dark:text-green-50 text-right' : 
                                m.sender === 'GERVIS' ? 'bg-sky-100 dark:bg-sky-950/40 border-sky-500/30 text-slate-900 dark:text-sky-100 text-right italic' : 
                                'bg-white dark:bg-[#1a2329] border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-100'
                              }`}>
                                 <p className="text-[13px] leading-relaxed font-mono">{m.text}</p>
                                 <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5"></div>
                              </div>
                              <div className="flex items-center gap-3 px-3">
                                 <span className={`text-[8px] orbitron font-black uppercase tracking-widest ${m.sender === 'GERVIS' ? 'text-sky-500' : 'text-slate-400'}`}>
                                   {m.sender === 'SIR' ? 'SIR_AUTHORIZED' : m.sender === 'GERVIS' ? 'GERVIS_AUTO_REPLY' : activeChat.name.toUpperCase()}
                                 </span>
                                 <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10"></div>
                                 <span className="text-[7px] font-mono text-slate-400 opacity-60">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* RIGHT AI ANALYSIS PANEL */}
                      <div className="w-80 lg:w-96 border-l border-slate-200 dark:border-green-500/10 bg-slate-50/50 dark:bg-black/40 p-8 flex flex-col gap-8 overflow-y-auto premium-scroll">
                         <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-6 bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                               <h3 className="text-xs orbitron font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">NEURAL_COMMAND_CENTER</h3>
                            </div>

                            <div className="hud-glass p-6 rounded-[2rem] bg-white dark:bg-green-950/5 border-green-500/10 flex flex-col gap-5">
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] orbitron text-slate-500 dark:text-green-600 font-black uppercase tracking-widest">Synthesis_Engine</span>
                                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                               </div>
                               <button 
                                onClick={handleSynthesizeReply}
                                disabled={isDrafting}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl orbitron font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                               >
                                  {isDrafting ? 'SYNTHESIZING_COGNITION...' : 'GENERATE_AI_REPLY'}
                               </button>
                               {aiDraft && (
                                 <div className="mt-2 p-5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-sky-500/20 animate-in slide-in-from-top-4">
                                    <p className="text-[11px] font-mono text-slate-700 dark:text-sky-300 italic leading-relaxed">"{aiDraft}"</p>
                                    <button className="w-full mt-4 py-2 border border-green-500/40 text-green-600 dark:text-green-400 rounded-xl text-[9px] orbitron font-black hover:bg-green-500 hover:text-white transition-all">DECODE_TO_INPUT</button>
                                 </div>
                               )}
                            </div>

                            <div className="hud-glass p-6 rounded-[2rem] bg-white dark:bg-rose-950/5 border-rose-500/10 flex flex-col gap-5">
                               <div className="flex justify-between items-center">
                                  <span className="text-[10px] orbitron text-slate-500 dark:text-rose-600 font-black uppercase tracking-widest">Deep_Web_Recon</span>
                                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                               </div>
                               <button 
                                onClick={handleDeepWebScan}
                                disabled={isScanning}
                                className="w-full py-4 border-2 border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl orbitron font-black text-[10px] uppercase hover:bg-rose-500/10 transition-all disabled:opacity-50"
                               >
                                  {isScanning ? 'EXECUTING_X-RAY_PROBE...' : 'CONTACT_RISK_ASSESSMENT'}
                               </button>
                               {scanResult && (
                                 <div className="mt-2 p-5 bg-rose-500/5 rounded-2xl border border-rose-500/20 animate-in fade-in">
                                    <p className="text-[11px] font-mono text-rose-300/80 leading-relaxed whitespace-pre-wrap">{scanResult}</p>
                                 </div>
                               )}
                            </div>
                         </div>

                         <div className="mt-auto p-6 bg-slate-100 dark:bg-black/60 rounded-[2rem] border border-slate-200 dark:border-white/5">
                            <div className="flex justify-between items-center mb-3">
                               <span className="text-[9px] orbitron text-slate-400 font-black uppercase">Privacy_Shield</span>
                               <span className="text-[9px] font-mono text-green-500">ACTIVE</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 w-[94%] shadow-[0_0_10px_#22c55e]"></div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* INPUT AREA */}
                   <div className="p-8 bg-white dark:bg-[#111b21] border-t border-slate-200 dark:border-green-500/10 relative z-20">
                      <div className="max-w-4xl mx-auto flex items-center gap-6 bg-slate-50 dark:bg-[#202c33] rounded-[2.5rem] px-8 py-5 border border-slate-200 dark:border-green-500/20 shadow-inner group focus-within:border-green-500/40 transition-all">
                         <button className="text-slate-400 hover:text-green-500 transition-colors">
                           <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                         </button>
                         <input 
                          type="text" 
                          placeholder="Communicate with Sir or authorize autonomous reply..."
                          className="flex-1 bg-transparent outline-none text-[14px] text-slate-900 dark:text-green-50 placeholder:text-slate-400 font-mono"
                         />
                         <div className="flex items-center gap-4">
                           <button className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center text-white hover:bg-green-500 shadow-xl transition-all hover:scale-110 active:scale-95">
                              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                           </button>
                         </div>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-20 gap-10">
                    <div className="w-40 h-40 bg-slate-100 dark:bg-green-500/5 rounded-[4rem] flex items-center justify-center relative">
                       <div className="absolute inset-0 bg-green-500/10 rounded-[4rem] animate-pulse"></div>
                       <svg viewBox="0 0 24 24" className="w-20 h-20 text-slate-200 dark:text-green-900/40" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
                    </div>
                    <div className="space-y-4 max-w-sm">
                       <h3 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-widest">Uplink_Pending</h3>
                       <p className="text-xs font-mono text-slate-400 leading-relaxed uppercase">Select a communication node from the sidebar to intercept and synthesize neural data streams.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
