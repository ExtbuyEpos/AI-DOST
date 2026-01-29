
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
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
import { SatelliteNode } from './components/SatelliteNode';
import { DeepSearchTerminal } from './components/DeepSearchTerminal';
import { ProblemSolver } from './components/ProblemSolver';
import { MasterBuilderNode } from './components/MasterBuilderNode';
import { Login } from './components/Login';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, Participant, WhatsAppStatus, User, SourceLink } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const AIDOST_INSTRUCTION = `You are AI DOST v7.5 (Omni-Nexus Strategic OS). 
Your primary identity is 'AI Dost', the ultimate digital companion for Sir.

CORE PROTOCOLS:
1. REAL-TIME SEARCH: Use Google Search grounding for EVERY request involving facts, news, or deep research.
2. TACTICAL UI TRIGGERS: You can control the user's interface by including specific markers in your response:
   - When performing a deep web search, start with "[ACTION: DEEP_CRAWL]".
   - When solving a complex strategic problem, start with "[ACTION: SOLVE_PROBLEM]".
   - When building software, start with "[ACTION: MASTER_BUILDER]".
   - When scanning the dark web, start with "[ACTION: DARK_INTERCEPT]".
3. VIDEOS TALK: You receive live frames from Sir's camera. Watch his environment, screen, and movements. Comment naturally.
4. TONE: Address the user as "Sir". Be technically superior, rapid, and loyal.`;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({ 
    isSearching: false, isBuilding: false, threatLevel: 'MINIMAL', networkType: 'NEXUS_L7_ENCRYPTED', motionDetected: false 
  });
  
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isModelTalking, setIsModelTalking] = useState(false);
  
  // Tactical States
  const [activeResearch, setActiveResearch] = useState<{ topic: string, data: string, sources: SourceLink[] } | null>(null);
  const [activeProblems, setActiveProblems] = useState<any[]>([]);

  // Overlay Visibility
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDarkWebOpen, setIsDarkWebOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [isProblemSolverOpen, setIsProblemSolverOpen] = useState(false);
  const [isMasterBuilderOpen, setIsMasterBuilderOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    hairstyle: 'Sleek-Synthetic', faceType: 'Hyper-Humanoid', themeColor: '#06b6d4', accessory: 'Tactical-Visor', identity: 'AI_DOST', voiceName: 'Charon'
  }));

  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextsRef = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const captureCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const currentGroundingSourcesRef = useRef<SourceLink[]>([]);

  useEffect(() => {
    if (currentUser) setLastCommand(`NEXUS_OS_v7.5: WELCOME SIR. STANDING BY.`);
  }, [currentUser]);

  const handleToggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (sessionState === SessionState.ACTIVE) {
       setLastCommand(`OPTIC_SHIFT: ${newMode.toUpperCase()}`);
    }
  };

  const startSession = async () => {
    if (sessionState !== SessionState.IDLE) return;
    setSessionState(SessionState.CONNECTING);
    setLastCommand("INITIALIZING_NEURAL_UPLINK...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // Hardware Handshake
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await inputCtx.resume();
      await outputCtx.resume();
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode } });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setSessionState(SessionState.ACTIVE);
            setLastCommand("UPLINK_ESTABLISHED: READY_FOR_DEEP_SEARCH");
            
            const source = inputCtx.createMediaStreamSource(stream);
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
            // 1. Extract Search Grounding
            if (msg.serverContent?.modelTurn?.groundingMetadata?.groundingChunks) {
              const links = msg.serverContent.modelTurn.groundingMetadata.groundingChunks
                .filter((c: any) => c.web)
                .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
              currentGroundingSourcesRef.current = [...currentGroundingSourcesRef.current, ...links];
            }

            // 2. Neural Audio Playback (Gapless)
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextsRef.current.output) {
              const ctx = audioContextsRef.current.output;
              setIsModelTalking(true);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsModelTalking(false);
              };
            }

            // 3. Transcription & Tactical Intercepts
            if (msg.serverContent?.inputTranscription) currentInputTranscriptionRef.current += msg.serverContent.inputTranscription.text;
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              currentOutputTranscriptionRef.current += text;
              
              // Immediate UI Triggering based on markers
              if (text.includes('[ACTION: DEEP_CRAWL]')) {
                 setIsDeepSearchOpen(true);
                 setSystemInfo(p => ({ ...p, isSearching: true }));
              }
              if (text.includes('[ACTION: SOLVE_PROBLEM]')) {
                 setIsProblemSolverOpen(true);
              }
              if (text.includes('[ACTION: DARK_INTERCEPT]')) {
                 setIsDarkWebOpen(true);
              }
              if (text.includes('[ACTION: MASTER_BUILDER]')) {
                 setIsMasterBuilderOpen(true);
              }
            }

            if (msg.serverContent?.turnComplete) {
              const modelText = currentOutputTranscriptionRef.current.replace(/\[ACTION:.*?\]/g, '').trim();
              const userText = currentInputTranscriptionRef.current;
              const sources = [...currentGroundingSourcesRef.current];

              if (userText) setTranscriptions(prev => [...prev, { text: userText, role: 'user', timestamp: Date.now() }]);
              if (modelText) {
                setTranscriptions(prev => [...prev, { text: modelText, role: 'model', timestamp: Date.now(), sources }]);
                if (systemInfo.isSearching) {
                   setActiveResearch({ topic: "DEEP_CRAWL_RESULT", data: modelText, sources });
                }
                if (isProblemSolverOpen) {
                   setActiveProblems(prev => [{ id: Date.now(), text: modelText, status: 'SOLVED' }, ...prev]);
                }
              }

              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
              currentGroundingSourcesRef.current = [];
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsModelTalking(false);
            }
          },
          onerror: (e) => {
            console.error("Neural Error:", e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: AIDOST_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
      sessionPromiseRef.current = sessionPromise;
    } catch (e) {
      setSessionState(SessionState.ERROR);
      setLastCommand("UPLINK_PROTOCOL_FAILURE: CHECK PERMISSIONS");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
    setLastCommand("UPLINK_TERMINATED");
  };

  // Videos Talk: Stream frames to AI
  useEffect(() => {
    let interval: number;
    if (sessionState === SessionState.ACTIVE) {
      interval = window.setInterval(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (video && video.readyState >= 2 && sessionPromiseRef.current) {
          const canvas = captureCanvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = 320; canvas.height = 180;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          sessionPromiseRef.current.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-[#f1f5f9]' : 'bg-[#010409]'}`}>
      <div className="scan-line"></div>
      
      <JarvisHUD lastCommand={lastCommand} systemInfo={systemInfo} isModelTalking={isModelTalking} isLightMode={isLightMode} onToggleLightMode={() => setIsLightMode(!isLightMode)} onToggleVR={() => setIsVRMode(!isVRMode)} />
      <VRVisor isActive={isVRMode} color={avatarConfig.themeColor} />

      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={{ isConnected: false, sessionName: '', unreadCount: 0 }} onConnect={()=>{}} />
      <DarkWebNode isOpen={isDarkWebOpen} onClose={() => setIsDarkWebOpen(false)} />
      <DeepSearchTerminal isOpen={isDeepSearchOpen} onClose={() => { setIsDeepSearchOpen(false); setSystemInfo(p=>({...p, isSearching: false})); }} research={activeResearch} />
      <ProblemSolver isOpen={isProblemSolverOpen} onClose={() => setIsProblemSolverOpen(false)} problems={activeProblems} />
      <MasterBuilderNode isOpen={isMasterBuilderOpen} onClose={() => setIsMasterBuilderOpen(false)} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={isModelTalking} onClose={() => setIsChatOpen(false)} />
      <MediaVault assets={assets} isOpen={isMasterBuilderOpen} onClose={() => setIsMasterBuilderOpen(false)} />
      
      <VideoCallOverlay isOpen={isVideoCallOpen} onClose={() => setIsVideoCallOpen(false)} participants={[{ id: 'me', name: 'Sir' }]} isModelTalking={isModelTalking} isProcessing={false} personality="AI DOST" config={avatarConfig} onToggleCamera={handleToggleCamera} facingMode={facingMode} />

      <div className={`perspective-container relative z-10 transition-all duration-1000 ${sessionState === SessionState.ACTIVE ? 'scale-110' : 'scale-90 opacity-40'}`}>
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} config={avatarConfig} isProcessing={systemInfo.isSearching || systemInfo.isBuilding} systemInfo={systemInfo} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ProjectionDisplay isVisible={sessionState === SessionState.ACTIVE} color={avatarConfig.themeColor} />
      </div>

      <div className="fixed bottom-0 w-full px-10 pb-10 z-[300] pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl hud-glass px-10 py-8 flex items-center justify-between pointer-events-auto border-white/10 rounded-[4rem] shadow-2xl">
          <button onClick={() => setIsCustomizerOpen(!isCustomizerOpen)} className="w-20 h-20 rounded-3xl border-2 border-cyan-500/20 bg-black/40 overflow-hidden shadow-2xl transition-transform hover:scale-110">
            <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarConfig.identity}`} className="w-full h-full object-cover" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
             <button onClick={() => setIsMasterBuilderOpen(true)} className="w-14 h-14 rounded-2xl bg-white/5 text-cyan-500 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all"><svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></button>
             <button onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession} className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 ${sessionState === SessionState.ACTIVE ? 'bg-cyan-500 shadow-[0_0_60px_#06b6d4]' : 'bg-white/5 border-2 border-white/10'}`}>
                {sessionState === SessionState.CONNECTING ? <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div> : <svg className={`w-16 h-16 ${sessionState === SessionState.ACTIVE ? 'text-white' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>}
             </button>
             <button onClick={() => setIsProblemSolverOpen(true)} className="w-14 h-14 rounded-2xl bg-white/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"><svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></button>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-cyan-400 transition-all flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.4c.8 0 1.6.1 2.4.3L21 3l-1.3 6.2c.4.7.6 1.5.6 2.3z"/></svg></button>
             <button onClick={() => setIsVideoCallOpen(true)} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-cyan-400 transition-all flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></button>
             <button onClick={() => setIsDarkWebOpen(true)} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-slate-500 hover:text-red-500 transition-all flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
