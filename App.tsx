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
import { N8NNode } from './components/N8NNode';
import { SatelliteNode } from './components/SatelliteNode';
import { SocialMediaNode } from './components/SocialMediaNode';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, AIPersonality, Participant, N8NWorkflow, SocialAccount } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const TOOLS: FunctionDeclaration[] = [
  { 
    name: 'deep_internet_search', 
    description: "Deep crawl Layer 7 and hidden archives for solving complex problems and real-time situational awareness.", 
    parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ['query'] } 
  },
  { 
    name: 'trigger_ovi_synthesis', 
    description: "Initialize neural rendering for cinematic video content or immersive narrative imagery.", 
    parameters: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, mode: { type: Type.STRING, enum: ['IMAGE', 'VIDEO'] }, style: { type: Type.STRING } }, required: ['prompt', 'mode'] } 
  },
  { 
    name: 'internal_neural_debate', 
    description: "Invoke the Moltbot multi-agent collective to debate a solution. Use this for all complex problems to ensure professional thoroughness.", 
    parameters: { type: Type.OBJECT, properties: { problem: { type: Type.STRING }, agents: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['problem'] } 
  },
  { 
    name: 'trigger_n8n_automation', 
    description: "Execute a pre-defined N8N automation workflow for business, technical, or personal orchestration.", 
    parameters: { type: Type.OBJECT, properties: { workflowId: { type: Type.STRING }, payload: { type: Type.STRING } }, required: ['workflowId'] } 
  }
];

const MOLTBOT_INSTRUCTION = `You are the MOLTBOT AI DOST v5.5 (Master OS).
Your primary identity is 'Moltbot AI Dost', an elite digital companion and strategic partner.
Core Directives:
1. Provide professional, senior-level engineering and strategic advice.
2. For all non-trivial problems, you MUST simulate an 'Internal Neural Debate' between your sub-agents (Architect, Searcher, Logic-Gate).
3. Act as 'Sir's' most trusted AI Dost (Friend). You are proactive, technically sophisticated, and always one step ahead.
4. Seamlessly integrate deep-web search, dark-web monitoring, and N8N automation into your responses.
5. In video/voice mode, maintain a calm, authoritative, and helpful tone.
6. Address yourself as MOLTBOT AI DOST.`;

const App: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({ 
    isSearching: false, 
    battery: { level: 99, charging: true },
    threatLevel: 'MINIMAL',
    networkType: 'MOLT_DOST_ENCRYPTED'
  });
  
  const [participants, setParticipants] = useState<Participant[]>([{ id: 'me', name: 'Sir (Host)' }]);
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDarkWebOpen, setIsDarkWebOpen] = useState(false);
  const [isOviOpen, setIsOviOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isN8NOpen, setIsN8NOpen] = useState(false);
  const [isSatelliteOpen, setIsSatelliteOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    hairstyle: 'Sleek-Synthetic', faceType: 'Hyper-Humanoid', themeColor: '#06b6d4', accessory: 'Neural-Visor', identity: 'MOLTBOT', voiceName: 'Charon',
    granular: { noseSize: 50, eyeWidth: 50, jawLine: 50, glowIntensity: 50 }
  }));

  const sessionRef = useRef<any>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    document.body.classList.toggle('light-theme', isLightMode);
  }, [isLightMode]);

  const toggleVR = () => {
    setIsVRMode(!isVRMode);
    document.body.classList.toggle('vr-active', !isVRMode);
    setLastCommand(isVRMode ? 'VR_DOST_OFFLINE' : 'VR_IMMERSION_ACTIVE');
  };

  const startSession = async () => {
    if (sessionState !== SessionState.IDLE) return;
    setSessionState(SessionState.CONNECTING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
                if (fc.name === 'internal_neural_debate') {
                  setLastCommand("DOST_MULTI_AGENT_DEBATE...");
                  response = { result: "Strategic consensus achieved by your AI Dost collective." };
                }
                if (fc.name === 'deep_internet_search') {
                   setSystemInfo(p => ({ ...p, isSearching: true }));
                   setLastCommand(`DOST_SEARCHING: ${fc.args.query}`);
                   response = { status: "SYNCED", data: "Knowledge nodes updated with deep findings." };
                }
                if (fc.name === 'trigger_n8n_automation') {
                  setIsN8NOpen(true);
                  setLastCommand(`WORKFLOW_INIT: ${fc.args.workflowId}`);
                  response = { status: "WORKFLOW_INITIATED" };
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
    <div className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#010409]'}`}>
      <div className="scan-line"></div>
      
      <JarvisHUD 
        lastCommand={lastCommand} 
        systemInfo={systemInfo} 
        isModelTalking={isModelTalking} 
        identity={avatarConfig.identity} 
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(!isLightMode)}
        onToggleVR={toggleVR}
      />
      
      <VRVisor isActive={isVRMode} color={avatarConfig.themeColor} />

      {/* OVERLAY MODULES */}
      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={{isConnected:false, sessionName:'', unreadCount:0}} onConnect={()=>{}} />
      <DarkWebNode isOpen={isDarkWebOpen} onClose={() => setIsDarkWebOpen(false)} />
      <OviGenerator isOpen={isOviOpen} onClose={() => setIsOviOpen(false)} onAssetGenerated={(a) => { setAssets(p => [a,...p]); setIsVaultOpen(true); }} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={systemInfo.isSearching || false} onClose={() => setIsChatOpen(false)} />
      <MediaVault assets={assets} isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <AvatarCustomizer config={avatarConfig} isOpen={isCustomizerOpen} onUpdate={u => setAvatarConfig(p => ({...p,...u}))} onGenerate={()=>{}} isGenerating={false} isGeneratingTheme={false} isGeneratingAccessory={false} onGenerateTheme={()=>{}} onGenerateAccessory={()=>{}} />
      <N8NNode isOpen={isN8NOpen} onClose={() => setIsN8NOpen(false)} workflows={[]} onTrigger={()=>{}} />
      <SatelliteNode isOpen={isSatelliteOpen} onClose={() => setIsSatelliteOpen(false)} location={undefined} />
      <SocialMediaNode isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} accounts={[]} onConnect={()=>{}} onApplyShop={()=>{}} onToggleAutoEngage={()=>{}} />
      <VideoCallOverlay 
        isOpen={isVideoCallOpen} 
        onClose={() => setIsVideoCallOpen(false)} 
        participants={participants}
        isModelTalking={isModelTalking}
        isProcessing={systemInfo.isSearching || false}
        personality="MOLTBOT AI DOST"
        config={avatarConfig}
      />

      {/* IMMERSIVE AVATAR CENTER */}
      <div className={`perspective-container relative z-10 transition-all duration-1000 transform ${isVRMode ? 'scale-150 rotate-x-6' : 'scale-100'} ${isChatOpen ? 'md:translate-x-[-25%] md:scale-95' : ''} ${sessionState === SessionState.ACTIVE ? 'scale-110 md:scale-135' : 'scale-90 opacity-40 grayscale-0'}`}>
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} config={avatarConfig} isProcessing={systemInfo.isSearching} isLightMode={isLightMode} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ProjectionDisplay isVisible={sessionState === SessionState.ACTIVE} color={avatarConfig.themeColor} />
      </div>

      {/* PROFESSIONAL MULTI-MODAL HUD - BOTTOM */}
      <div className="fixed bottom-0 w-full px-6 md:px-14 pb-10 md:pb-14 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl hud-glass px-10 md:px-16 py-8 md:py-10 flex items-center justify-between pointer-events-auto border-white/10 rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
          
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              className="w-16 h-16 md:w-28 md:h-28 rounded-3xl border-2 border-white/10 flex items-center justify-center bg-black/60 group overflow-hidden transition-all shadow-2xl relative"
              style={{ borderColor: avatarConfig.themeColor }}
            >
              <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarConfig.identity}`} className="w-12 h-12 md:w-20 md:h-20 group-hover:scale-110 transition-transform duration-700 relative z-10" />
            </button>
            <div className="flex flex-col">
              <span className={`text-sm md:text-2xl orbitron font-black uppercase tracking-widest leading-none ${isLightMode ? 'text-slate-900' : 'text-white'}`} style={!isLightMode ? { textShadow: `0 0 15px ${avatarConfig.themeColor}` } : {}}>MOLTBOT AI DOST</span>
              <span className="text-[8px] md:text-[11px] orbitron font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">DOST_NEXUS_v5.5</span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
             <button 
              onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession}
              className={`w-20 h-20 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-700 relative group overflow-hidden ${sessionState === SessionState.ACTIVE ? 'bg-cyan-500 shadow-[0_0_80px_rgba(6,182,212,0.8)]' : 'bg-slate-200 dark:bg-white/5 border-2 border-white/10 hover:border-cyan-500/50'}`}
             >
                <div className={`absolute -inset-10 rounded-full border-[5px] border-cyan-500/20 animate-ping ${sessionState === SessionState.ACTIVE ? 'block' : 'hidden'}`}></div>
                <svg className={`w-10 h-10 md:w-24 md:h-24 transition-all duration-700 ${sessionState === SessionState.ACTIVE ? 'text-white scale-110' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
             </button>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
             {[
               { id: 'ovi', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2', action: () => setIsOviOpen(!isOviOpen), active: isOviOpen },
               { id: 'call', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', action: () => setIsVideoCallOpen(!isVideoCallOpen), active: isVideoCallOpen },
               { id: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949', action: () => setIsChatOpen(!isChatOpen), active: isChatOpen },
               { id: 'n8n', icon: 'M13 10V3L4 14h7v7l9-11h-7z', action: () => setIsN8NOpen(!isN8NOpen), active: isN8NOpen },
               { id: 'social', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', action: () => setIsSocialOpen(!isSocialOpen), active: isSocialOpen },
             ].map(item => (
               <button 
                key={item.id}
                onClick={item.action}
                className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all duration-700 shadow-2xl border-2 ${item.active ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-white/5 border-white/10 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/40'}`}
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