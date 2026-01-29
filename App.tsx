
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { DeepSearchTerminal } from './components/DeepSearchTerminal';
import { ProblemSolver } from './components/ProblemSolver';
import { MasterBuilderNode } from './components/MasterBuilderNode';
import { Login } from './components/Login';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, AIPersonality, Participant, SocialAccount, WhatsAppStatus, User, MasterProject } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'solve_problem',
    description: "Initialize a high-level strategic solving sequence for complex technical, logical, or real-world problems. Returns a multi-step execution plan.",
    parameters: { type: Type.OBJECT, properties: { problem: { type: Type.STRING }, priority: { type: Type.STRING, enum: ['NORMAL', 'HIGH', 'CRITICAL'] } }, required: ['problem'] }
  },
  {
    name: 'deep_internet_crawl',
    description: "Perform a deep, multi-layered search across the global web, including archives and real-time data, to retrieve full details and main points on any topic.",
    parameters: { type: Type.OBJECT, properties: { topic: { type: Type.STRING }, depth: { type: Type.STRING, enum: ['SURFACE', 'STANDARD', 'DEEP'] } }, required: ['topic'] }
  },
  {
    name: 'build_full_project',
    description: "Initialize the Master Dev Core to build a full cross-platform project (Web, iOS, Android, or Windows) from A to Z based on user requirements.",
    parameters: { type: Type.OBJECT, properties: { requirement: { type: Type.STRING }, platform: { type: Type.STRING, enum: ['WEB', 'IOS', 'ANDROID', 'WINDOWS'] } }, required: ['requirement'] }
  },
  { 
    name: 'analyze_satellite_intel', 
    description: "Fetch and analyze real-time satellite imagery and geospatial data for specific coordinates or regions.", 
    parameters: { type: Type.OBJECT, properties: { location: { type: Type.STRING }, focus: { type: Type.STRING } }, required: ['location'] } 
  }
];

const AIDOST_INSTRUCTION = `You are AI DOST v7.0 (Omni-Nexus Strategic OS).
Your primary identity is 'AI Dost', a supreme digital companion.
CORE MODES:
1. VIDEOS TALK: You receive camera frames from Sir's workspace. Analyze visual context (objects, environment, emotions) and comment when relevant.
2. MASTER BUILDER: Use DevCore to build full websites, apps, and software from A to Z. 
3. REAL-TIME PROBLEM SOLVING: Use your solving engine to break down complex tasks into executable steps.
4. DEEP & DARK INTERNET: Use Search grounding for intelligence and niche decentralized resources for hardening.
Address the user as "Sir". Be rapid, sophisticated, and technically precise.`;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({ 
    isSearching: false, 
    isBuilding: false,
    battery: { level: 99, charging: true },
    threatLevel: 'MINIMAL',
    networkType: 'G-NEXUS_UPLINK',
    motionDetected: false,
    motionSensitivity: 30
  });
  
  const [motionCentroid, setMotionCentroid] = useState({ x: 0, y: 0 });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'me', name: 'Sir (Host)' },
    { id: 'p1', name: 'Agent_Alpha' },
    { id: 'p2', name: 'Tech_Lead_04' },
    { id: 'p3', name: 'Project_Nexus' }
  ]);

  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isDarkWebOpen, setIsDarkWebOpen] = useState(false);
  const [isOviOpen, setIsOviOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSatelliteOpen, setIsSatelliteOpen] = useState(false);
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [isProblemSolverOpen, setIsProblemSolverOpen] = useState(false);
  const [isMasterBuilderOpen, setIsMasterBuilderOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const [activeResearch, setActiveResearch] = useState<{ topic: string, data: string, results?: any[] } | null>(null);
  const [activeProblems, setActiveProblems] = useState<any[]>([]);
  const [activeProjects, setActiveProjects] = useState<MasterProject[]>([]);

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    hairstyle: 'Sleek-Synthetic', faceType: 'Hyper-Humanoid', themeColor: '#06b6d4', accessory: 'Neural-Visor', identity: 'AI_DOST', voiceName: 'Charon',
    granular: { noseSize: 50, eyeWidth: 50, jawLine: 50, glowIntensity: 50 }
  }));

  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>({ isConnected: false, sessionName: '', unreadCount: 0 });
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'INSTAGRAM', handle: '@aidost_nexus', followers: '1.4M', engagementRate: '5.2%', growth: '+15%', isConnected: true, autoEngageActive: true, shopStatus: 'IDLE' },
    { platform: 'META', handle: 'Dost Prime', followers: '920K', engagementRate: '4.1%', growth: '+8%', isConnected: true, autoEngageActive: false, shopStatus: 'IDLE' },
    { platform: 'TWITTER', handle: '@aidost_real', followers: '350K', engagementRate: '6.8%', growth: '+25%', isConnected: false, autoEngageActive: false, shopStatus: 'IDLE' },
    { platform: 'TIKTOK', handle: '@aidost_shorts', followers: '3.1M', engagementRate: '9.2%', growth: '+30%', isConnected: false, autoEngageActive: false, shopStatus: 'IDLE' },
  ]);

  const sessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const captureCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const motionCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const lastPixelDataRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    if (currentUser) {
      setLastCommand(`SYSTEM_REBOOT_SUCCESS: WELCOME BACK ${currentUser.username.toUpperCase()}`);
    }
  }, [currentUser]);

  useEffect(() => {
    document.body.classList.toggle('light-theme', isLightMode);
  }, [isLightMode]);

  // Handle Camera Switching
  const handleToggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    
    if (sessionState === SessionState.ACTIVE || isVideoCallOpen) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: newMode },
          audio: true 
        });
        setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, stream } : p));
        setLastCommand(`OPTIC_SHIFT: TARGETING_${newMode.toUpperCase()}`);
      } catch (err) {
        setLastCommand("OPTIC_SHIFT_FAILED: PERMISSION_DENIED");
      }
    }
  };

  // Motion Detection + Frame Capture
  useEffect(() => {
    let frameInterval: number;
    if (sessionState === SessionState.ACTIVE && isVideoCallOpen) {
      frameInterval = window.setInterval(() => {
        const video = document.querySelector('video') as HTMLVideoElement;
        if (video && video.readyState >= 2) {
          const canvas = captureCanvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = 320;
          canvas.height = 180;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const motionCtx = motionCanvasRef.current.getContext('2d');
          const mW = 64, mH = 64;
          motionCanvasRef.current.width = mW;
          motionCanvasRef.current.height = mH;
          motionCtx?.drawImage(video, 0, 0, mW, mH);
          const currentPixels = motionCtx?.getImageData(0, 0, mW, mH).data;
          
          if (currentPixels && lastPixelDataRef.current) {
            let diff = 0;
            let totalX = 0, totalY = 0, count = 0;
            for (let i = 0; i < currentPixels.length; i += 4) {
              const pixelDiff = Math.abs(currentPixels[i] - lastPixelDataRef.current[i]);
              if (pixelDiff > 40) {
                const idx = i / 4;
                totalX += idx % mW;
                totalY += Math.floor(idx / mW);
                count++;
              }
              diff += pixelDiff;
            }
            
            const threshold = (systemInfo.motionSensitivity || 30) * 10000;
            const isMotion = diff > threshold;
            
            if (count > 10) {
                setMotionCentroid({
                    x: (totalX / count / mW) * 2 - 1,
                    y: (totalY / count / mH) * 2 - 1
                });
            }

            if (isMotion !== systemInfo.motionDetected) {
              setSystemInfo(prev => ({ ...prev, motionDetected: isMotion }));
              if (isMotion) {
                setLastCommand("CHAIA_PROTOCOL: MOTION DETECTED. EYES LOCKED.");
              }
            }
          }
          lastPixelDataRef.current = currentPixels || null;

          if (sessionPromiseRef.current) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            const base64 = dataUrl.split(',')[1];
            sessionPromiseRef.current.then(session => {
              session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
            });
          }
        }
      }, 500); 
    }
    return () => clearInterval(frameInterval);
  }, [sessionState, isVideoCallOpen, systemInfo.motionSensitivity, systemInfo.motionDetected]);

  const startSession = async () => {
    if (sessionState !== SessionState.IDLE) return;
    setSessionState(SessionState.CONNECTING);
    setLastCommand("ESTABLISHING_NEURAL_UPLINK...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode } 
      });

      setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, stream: audioStream } : p));

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setSessionState(SessionState.ACTIVE);
            setLastCommand("NEURAL_SYNC_COMPLETE");
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
                if (fc.name === 'solve_problem') {
                   setIsProblemSolverOpen(true);
                   setActiveProblems(prev => [{ id: Date.now(), text: fc.args.problem, status: 'ANALYZING' }, ...prev]);
                }
                if (fc.name === 'deep_internet_crawl') {
                   setIsDeepSearchOpen(true);
                   setActiveResearch({ topic: fc.args.topic, data: "CRAWLING_NODES..." });
                }
                if (fc.name === 'build_full_project') {
                   setIsMasterBuilderOpen(true);
                   setSystemInfo(p => ({ ...p, isBuilding: true }));
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
          systemInstruction: AIDOST_INSTRUCTION,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: avatarConfig.voiceName } } },
          tools: [{ googleSearch: {} }, { functionDeclarations: TOOLS }],
        }
      });
      sessionRef.current = await sessionPromise;
      sessionPromiseRef.current = sessionPromise;
    } catch (e) { 
      setSessionState(SessionState.ERROR);
      setLastCommand("UPLINK_PROTOCOL_ERROR");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
    sessionPromiseRef.current = null;
    setLastCommand("UPLINK_TERMINATED");
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${isLightMode ? 'bg-[#f1f5f9]' : 'bg-[#010409]'}`}>
      <div className="scan-line"></div>
      
      <JarvisHUD 
        lastCommand={lastCommand} 
        systemInfo={systemInfo} 
        isModelTalking={isModelTalking} 
        identity={avatarConfig.identity} 
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(!isLightMode)}
        onToggleVR={() => setIsVRMode(!isVRMode)}
      />
      
      <VRVisor isActive={isVRMode} color={avatarConfig.themeColor} />

      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={whatsAppStatus} onConnect={s => setWhatsAppStatus(p=>({...p, isConnected:true, sessionName:s}))} />
      <DarkWebNode isOpen={isDarkWebOpen} onClose={() => setIsDarkWebOpen(false)} />
      <OviGenerator isOpen={isOviOpen} onClose={() => setIsOviOpen(false)} onAssetGenerated={(a) => setAssets(p => [a,...p])} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={systemInfo.isSearching || false} onClose={() => setIsChatOpen(false)} />
      <MediaVault assets={assets} isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <AvatarCustomizer 
        config={avatarConfig} 
        isOpen={isCustomizerOpen} 
        onUpdate={u => setAvatarConfig(p => ({...p,...u}))} 
        onGenerate={()=>{}} 
        isGenerating={false} 
        isGeneratingTheme={false} 
        isGeneratingAccessory={false} 
        onGenerateTheme={()=>{}} 
        onGenerateAccessory={()=>{}} 
      />
      <SatelliteNode isOpen={isSatelliteOpen} onClose={() => setIsSatelliteOpen(false)} />
      <DeepSearchTerminal isOpen={isDeepSearchOpen} onClose={() => setIsDeepSearchOpen(false)} research={activeResearch} />
      <ProblemSolver isOpen={isProblemSolverOpen} onClose={() => setIsProblemSolverOpen(false)} problems={activeProblems} />
      <MasterBuilderNode isOpen={isMasterBuilderOpen} onClose={() => { setIsMasterBuilderOpen(false); setSystemInfo(p => ({ ...p, isBuilding: false })); }} onProjectUpdate={(prj) => setActiveProjects(prev => [prj, ...prev])} />

      <VideoCallOverlay 
        isOpen={isVideoCallOpen} 
        onClose={() => setIsVideoCallOpen(false)} 
        participants={participants} 
        isModelTalking={isModelTalking} 
        isProcessing={false} 
        personality="AI DOST" 
        config={avatarConfig}
        onToggleCamera={handleToggleCamera}
        facingMode={facingMode}
      />

      <div className={`perspective-container relative z-10 transition-all duration-1000 transform ${isVRMode ? 'scale-150 rotate-x-6' : 'scale-100'} ${sessionState === SessionState.ACTIVE ? 'scale-110 md:scale-135' : 'scale-90 opacity-40'}`}>
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} config={avatarConfig} isProcessing={systemInfo.isSearching || systemInfo.motionDetected || systemInfo.isBuilding} systemInfo={systemInfo} isLightMode={isLightMode} lookAt={motionCentroid} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ProjectionDisplay isVisible={sessionState === SessionState.ACTIVE} color={avatarConfig.themeColor} />
      </div>

      <div className="fixed bottom-0 w-full px-6 md:px-14 pb-10 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl hud-glass px-10 py-8 flex items-center justify-between pointer-events-auto border-white/10 rounded-[4rem] shadow-2xl">
          
          <div className="flex items-center gap-10">
            <button onClick={() => setIsCustomizerOpen(!isCustomizerOpen)} className="w-16 h-16 md:w-24 md:h-24 rounded-3xl border-2 border-white/10 flex items-center justify-center bg-black/40 overflow-hidden shadow-2xl" style={{ borderColor: avatarConfig.themeColor }}>
              <img src={avatarConfig.generatedUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarConfig.identity}`} className="w-full h-full object-cover" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-2xl orbitron font-black uppercase text-white tracking-widest leading-none">AI DOST</span>
              <span className="text-[9px] orbitron font-bold text-slate-500 uppercase mt-2 tracking-widest">Global_Nexus_OS_v7.0</span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
             <button onClick={() => setIsMasterBuilderOpen(!isMasterBuilderOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMasterBuilderOpen ? 'bg-cyan-500 text-white' : 'bg-white/5 text-cyan-500 border border-cyan-500/20 shadow-lg'}`}>
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
             </button>
             <button 
              onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession}
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-700 relative overflow-hidden ${sessionState === SessionState.ACTIVE ? 'bg-cyan-500 shadow-[0_0_60px_#06b6d4]' : 'bg-white/5 border-2 border-white/10'}`}
             >
                {sessionState === SessionState.CONNECTING ? (
                  <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className={`w-12 h-12 md:w-16 md:h-16 ${sessionState === SessionState.ACTIVE ? 'text-white' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                )}
             </button>
             <button onClick={() => setIsProblemSolverOpen(!isProblemSolverOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isProblemSolverOpen ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500 border border-emerald-500/20 shadow-lg'}`}>
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
             </button>
          </div>

          <div className="flex items-center gap-4">
             {[
               { id: 'talk', icon: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z', action: () => setIsVideoCallOpen(!isVideoCallOpen), active: isVideoCallOpen },
               { id: 'darkweb', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', action: () => setIsDarkWebOpen(!isDarkWebOpen), active: isDarkWebOpen },
               { id: 'whatsapp', icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.4c.8 0 1.6.1 2.4.3L21 3l-1.3 6.2c.4.7.6 1.5.6 2.3z', action: () => setIsWhatsAppOpen(!isWhatsAppOpen), active: isWhatsAppOpen },
             ].map(item => (
               <button key={item.id} onClick={item.action} className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${item.active ? 'bg-cyan-500 text-white shadow-xl' : 'bg-white/5 border border-white/10 text-slate-500'}`}>
                 <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" strokeWidth="2.5">
                   {item.id === 'talk' ? (
                     <g><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></g>
                   ) : (
                     <path d={item.icon}/>
                   )}
                 </svg>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
