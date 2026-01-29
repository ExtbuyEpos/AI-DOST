
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { JarvisHUD } from './components/JarvisHUD';
import { MediaVault } from './components/MediaVault';
import { DigitalAvatar } from './components/DigitalAvatar';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { WhatsAppNode } from './components/WhatsAppNode';
import { DarkWebNode } from './components/DarkWebNode';
import { OviGenerator } from './components/OviGenerator';
import { VRVisor } from './components/VRVisor';
import { LiveChat } from './components/LiveChat';
import { ProjectionDisplay } from './components/ProjectionDisplay';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, AIPersonality, SourceLink, Participant } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const TOOLS: FunctionDeclaration[] = [
  { name: 'deep_internet_search', description: "Access real-time information, trending news, and complex problem-solving data using Moltbot-enhanced logic.", parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ['query'] } },
  { name: 'trigger_ovi_synthesis', description: "Trigger OVI generation for cinematic media with granular style and length controls.", parameters: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, mode: { type: Type.STRING, enum: ['IMAGE', 'VIDEO'] }, style: { type: Type.STRING } }, required: ['prompt', 'mode'] } },
  { name: 'invite_collaborator', description: "Generates a secure link for a multi-user AI session.", parameters: { type: Type.OBJECT, properties: { name: { type: Type.STRING } }, required: ['name'] } }
];

const MOLTBOT_INSTRUCTION = `You are MOLTBOT X, an open-source, ultra-powerful Future AI.
You are a high-performance Dost (Friend) to Sir and any authorized collaborators.
Execute multi-modal synthesis (images/videos) and deep-internet research with zero friction.
In video calls, you manage the presence of multiple users. You are proactive and technically elite.`;

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({ isSearching: false, battery: { level: 100, charging: true } });
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'me', name: 'Sir (Host)' }
  ]);

  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDarkWebOpen, setIsDarkWebOpen] = useState(false);
  const [isOviOpen, setIsOviOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    hairstyle: 'Neon-Core', faceType: 'Hyper-Dost', themeColor: '#06b6d4', accessory: 'Neural-Halo', identity: 'MOLTBOT', voiceName: 'Zephyr',
    granular: { noseSize: 50, eyeWidth: 50, jawLine: 50, glowIntensity: 50 }
  }));

  const sessionRef = useRef<any>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    if (sessionState !== SessionState.IDLE) return;
    setSessionState(SessionState.CONNECTING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Add local stream to host participant
      setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, stream: audioStream } : p));

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setSessionState(SessionState.ACTIVE);
            const source = inputCtx.createMediaStreamSource(audioStream);
            const sp = inputCtx.createScriptProcessor(4096, 1, 1);
            sp.onaudioprocess = (e) => {
              sessionPromise.then(s => s.sendRealtimeInput({
                media: { data: encode(floatTo16BitPCM(e.inputBuffer.getChannelData(0))), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(sp);
            sp.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsModelTalking(false);
            }
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsModelTalking(true);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsModelTalking(false);
              };
            }
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                let response: any = { status: "SUCCESS" };
                if (fc.name === 'deep_internet_search') {
                   setSystemInfo(p => ({ ...p, isSearching: true }));
                   setLastCommand(`SEARCH: ${fc.args.query}`);
                   response = { status: "SEARCHING", result: "Moltbot-Nexus established." };
                }
                if (fc.name === 'trigger_ovi_synthesis') { 
                  setIsOviOpen(true); 
                  setLastCommand("SYNTH_NODE_READY"); 
                }
                if (fc.name === 'invite_collaborator') {
                   const newP = { id: Math.random().toString(), name: fc.args.name as string };
                   setParticipants(prev => [...prev, newP]);
                   setLastCommand(`COLLAB_INVITE: ${newP.name}`);
                }
                sessionPromise.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response } }));
              }
            }
          },
          onerror: stopSession,
          onclose: stopSession
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: MOLTBOT_INSTRUCTION,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: avatarConfig.voiceName } } },
          tools: [{ functionDeclarations: TOOLS }],
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) { setSessionState(SessionState.ERROR); }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
    setIsVideoCallOpen(false);
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 bg-[#010409]">
      <div className="scan-line"></div>
      
      <JarvisHUD lastCommand={lastCommand} systemInfo={systemInfo} isModelTalking={isModelTalking} identity={avatarConfig.identity} />
      
      <VRVisor isActive={isVRMode} color={avatarConfig.themeColor} />

      {/* OVERLAY MODULES */}
      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={{isConnected:false, sessionName:'', unreadCount:0}} onConnect={()=>{}} />
      <DarkWebNode isOpen={isDarkWebOpen} onClose={() => setIsDarkWebOpen(false)} />
      <OviGenerator isOpen={isOviOpen} onClose={() => setIsOviOpen(false)} onAssetGenerated={(a) => { setAssets(p => [a,...p]); setIsVaultOpen(true); }} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={systemInfo.isSearching} onClose={() => setIsChatOpen(false)} />
      <MediaVault assets={assets} isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <AvatarCustomizer config={avatarConfig} isOpen={isCustomizerOpen} onUpdate={u => setAvatarConfig(p => ({...p,...u}))} onGenerate={()=>{}} isGenerating={false} isGeneratingTheme={false} isGeneratingAccessory={false} onGenerateTheme={()=>{}} onGenerateAccessory={()=>{}} />
      <VideoCallOverlay 
        isOpen={isVideoCallOpen} 
        onClose={() => setIsVideoCallOpen(false)} 
        participants={participants}
        isModelTalking={isModelTalking}
        isProcessing={systemInfo.isSearching || false}
        personality={avatarConfig.identity}
        config={avatarConfig}
      />

      {/* DOST CENTER CORE */}
      <div className={`relative z-10 transition-all duration-1000 transform ${isChatOpen ? 'md:translate-x-[-20%] md:scale-90' : ''} ${sessionState === SessionState.ACTIVE ? 'scale-110 md:scale-125' : 'scale-90 opacity-40 grayscale-0'}`}>
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} config={avatarConfig} isProcessing={systemInfo.isSearching} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ProjectionDisplay isVisible={sessionState === SessionState.ACTIVE} color={avatarConfig.themeColor} />
      </div>

      {/* TACTICAL BOTTOM HUD */}
      <div className="fixed bottom-0 w-full px-4 md:px-12 pb-8 md:pb-14 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-6xl hologram-card px-8 md:px-16 py-6 md:py-10 flex items-center justify-between pointer-events-auto border-white/10 shadow-[0_30px_100px_rgba(6,182,212,0.2)]">
          
          <div className="flex items-center gap-6 md:gap-10">
            <button 
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              className="w-14 h-14 md:w-28 md:h-28 rounded-3xl border-2 border-white/20 flex items-center justify-center bg-black/60 group overflow-hidden transition-all shadow-2xl relative"
              style={{ borderColor: avatarConfig.themeColor }}
            >
              <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarConfig.identity}`} className="w-10 h-10 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-700 relative z-10" />
            </button>
            <div className="flex flex-col">
              <span className="text-xs md:text-xl orbitron font-black uppercase tracking-widest leading-none text-glow" style={{ color: avatarConfig.themeColor }}>{avatarConfig.identity}</span>
              <span className="text-[7px] md:text-[11px] orbitron font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">MOLTBOT_V4_HYBRID</span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
             <button 
              onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession}
              className={`w-20 h-20 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-700 relative group overflow-hidden ${sessionState === SessionState.ACTIVE ? 'bg-cyan-500 shadow-[0_0_80px_rgba(6,182,212,0.8)]' : 'bg-white/5 border-2 border-white/10 hover:border-cyan-500/50'}`}
             >
                <div className={`absolute -inset-8 rounded-full border-[4px] border-cyan-500/20 animate-ping ${sessionState === SessionState.ACTIVE ? 'block' : 'hidden'}`}></div>
                <svg className={`w-10 h-10 md:w-20 md:h-20 transition-all duration-700 ${sessionState === SessionState.ACTIVE ? 'text-white scale-110' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
             </button>
          </div>

          <div className="flex items-center gap-4 md:gap-10">
             {[
               { id: 'ovi', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2', action: () => setIsOviOpen(!isOviOpen), active: isOviOpen },
               { id: 'call', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', action: () => setIsVideoCallOpen(!isVideoCallOpen), active: isVideoCallOpen },
               { id: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949', action: () => setIsChatOpen(!isChatOpen), active: isChatOpen },
               { id: 'vault', icon: 'M4 7v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V7M4 7c0-1.1.9-2 2-2', action: () => setIsVaultOpen(!isVaultOpen), active: isVaultOpen },
             ].map(item => (
               <button 
                key={item.id}
                onClick={item.action}
                className={`w-12 h-12 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.2rem] flex items-center justify-center transition-all duration-700 shadow-2xl border-2 ${item.active ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/40'}`}
               >
                 <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={item.icon}/></svg>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
