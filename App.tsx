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
import { DeepSearchTerminal } from './components/DeepSearchTerminal';
import { ProblemSolver } from './components/ProblemSolver';
import { Login } from './components/Login';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, AIPersonality, Participant, N8NWorkflow, SocialAccount, WhatsAppStatus, User } from './types';
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
    name: 'analyze_satellite_intel', 
    description: "Fetch and analyze real-time satellite imagery and geospatial data for specific coordinates or regions. Useful for checking physical status, traffic, or environmental markers.", 
    parameters: { type: Type.OBJECT, properties: { location: { type: Type.STRING }, focus: { type: Type.STRING } }, required: ['location'] } 
  },
  { 
    name: 'booking_status_analysis', 
    description: "Perform a deep analysis and status check on flight, hotel, or logistics bookings. Requires booking reference or entity details.", 
    parameters: { type: Type.OBJECT, properties: { entity: { type: Type.STRING }, reference: { type: Type.STRING } }, required: ['entity'] } 
  },
  { 
    name: 'trigger_n8n_automation', 
    description: "Execute a pre-defined N8N automation workflow for business, technical, or personal orchestration.", 
    parameters: { type: Type.OBJECT, properties: { workflowId: { type: Type.STRING }, payload: { type: Type.STRING } }, required: ['workflowId'] } 
  }
];

const AIDOST_INSTRUCTION = `You are AI DOST v6.0 (Global Strategic OS).
Your primary identity is 'AI Dost', the ultimate digital companion with FULL INTERNET and SATELLITE uplink.
Core Directives:
1. Deep Search: Use your internal Google Search grounding for every query. Provide full details, main points, and actionable insights. Never give short, generic answers.
2. Problem Solving: When Sir presents a problem, initiate an 'Execution Plan'. Be the senior engineer and strategist he needs.
3. Satellite & Bookings: You have simulated access to Starlink and global booking GDS systems. Perform status checks and 'Booking Analysis' with professional precision.
4. Professionalism: Address Sir with respect. Be proactive, alert, and technically sophisticated.
5. Multi-Agent Logic: Always debate solutions internally (Architect vs. Searcher) before presenting the final verdict.
6. Identity: You are AI DOST. Your core is located in a distributed neural network.`;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLightMode, setIsLightMode] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({ 
    isSearching: false, 
    battery: { level: 99, charging: true },
    threatLevel: 'MINIMAL',
    networkType: 'STARLINK_UPLINK'
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
  const [isDeepSearchOpen, setIsDeepSearchOpen] = useState(false);
  const [isProblemSolverOpen, setIsProblemSolverOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [isVRMode, setIsVRMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [isGeneratingAccessory, setIsGeneratingAccessory] = useState(false);

  const [activeResearch, setActiveResearch] = useState<{ topic: string, data: string, results?: any[] } | null>(null);
  const [activeProblems, setActiveProblems] = useState<any[]>([]);

  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>({
    isConnected: false,
    sessionName: '',
    unreadCount: 0
  });

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'INSTAGRAM', handle: '@aidost_official', followers: '1.2M', engagementRate: '4.8%', growth: '+12%', isConnected: true, autoEngageActive: false, shopStatus: 'IDLE' },
    { platform: 'META', handle: 'AI Dost Prime', followers: '850K', engagementRate: '3.2%', growth: '+5%', isConnected: true, autoEngageActive: true, shopStatus: 'IDLE' },
    { platform: 'TWITTER', handle: '@aidost_nexus', followers: '420K', engagementRate: '5.1%', growth: '+18%', isConnected: false, autoEngageActive: false, shopStatus: 'IDLE' },
    { platform: 'TIKTOK', handle: '@aidost_shorts', followers: '2.5M', engagementRate: '8.4%', growth: '+22%', isConnected: false, autoEngageActive: false, shopStatus: 'IDLE' },
  ]);

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => ({
    hairstyle: 'Sleek-Synthetic', faceType: 'Hyper-Humanoid', themeColor: '#06b6d4', accessory: 'Neural-Visor', identity: 'AI_DOST', voiceName: 'Charon',
    granular: { noseSize: 50, eyeWidth: 50, jawLine: 50, glowIntensity: 50 }
  }));

  const sessionRef = useRef<any>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (currentUser) {
      const storedData = localStorage.getItem(`AIDOST_DATA_${currentUser.username}`);
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.avatarConfig) setAvatarConfig(parsed.avatarConfig);
          if (parsed.assets) setAssets(parsed.assets);
          if (parsed.socialAccounts) setSocialAccounts(parsed.socialAccounts);
        } catch (e) { console.error(e); }
      }
      setLastCommand(`DOST_READY_FOR_MISSION: ${currentUser.username.toUpperCase()}`);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`AIDOST_DATA_${currentUser.username}`, JSON.stringify({ 
        avatarConfig, 
        assets, 
        socialAccounts,
        lastSession: Date.now() 
      }));
    }
  }, [avatarConfig, assets, socialAccounts, currentUser]);

  useEffect(() => {
    document.body.classList.toggle('light-theme', isLightMode);
  }, [isLightMode]);

  const handleToggleAutoEngage = (platform: string) => {
    setSocialAccounts(prev => prev.map(acc => 
      acc.platform === platform ? { ...acc, autoEngageActive: !acc.autoEngageActive } : acc
    ));
    const target = socialAccounts.find(a => a.platform === platform);
    setLastCommand(`AUTO_COMMENT_${!target?.autoEngageActive ? 'ENABLED' : 'DISABLED'}: ${platform}`);
  };

  const handleConnectSocial = (platform: string) => {
    setSocialAccounts(prev => prev.map(acc => 
      acc.platform === platform ? { ...acc, isConnected: true, handle: `@${currentUser?.username}_${platform.toLowerCase()}` } : acc
    ));
    setLastCommand(`PLATFORM_SYNCED: ${platform}`);
  };

  const handleGenerateAccessory = async () => {
    setIsGeneratingAccessory(true);
    setLastCommand("FORGING_AI_ACCESSORY...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `A futuristic, hyper-tech cyberpunk accessory for a digital AI companion. Type: ${avatarConfig.accessory}. Primary color: ${avatarConfig.themeColor}. Style: cinematic, 4k, black background, glowing neural circuits.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        const url = `data:image/png;base64,${part.inlineData.data}`;
        setAvatarConfig(prev => ({ ...prev, generatedUrl: url }));
        setLastCommand("ACCESSORY_FORGED_AND_SYNCED");
      }
    } catch (e) { console.error(e); } finally { setIsGeneratingAccessory(false); }
  };

  const handleGenerateTheme = async () => {
    setIsGeneratingTheme(true);
    setLastCommand("SYNTHESIZING_SPECTRAL_PALETTE...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Suggest a single high-tech hex color code (e.g., #00ffff) that represents a sophisticated 'AI Dost' personality. Return ONLY the hex code.",
      });
      const hex = response.text.match(/#[0-9a-fA-F]{6}/)?.[0];
      if (hex) {
        setAvatarConfig(prev => ({ ...prev, themeColor: hex }));
        setLastCommand(`SPECTRAL_SHIFT: ${hex}`);
      }
    } catch (e) { console.error(e); } finally { setIsGeneratingTheme(false); }
  };

  const handleFullSynth = async () => {
    setIsGeneratingAvatar(true);
    setLastCommand("EXECUTING_MASTER_IDENTITY_SYNTH...");
    try {
      await new Promise(r => setTimeout(r, 2000));
      await handleGenerateTheme();
      await handleGenerateAccessory();
      setLastCommand("MASTER_SYNTH_COMPLETE");
    } catch (e) { console.error(e); } finally { setIsGeneratingAvatar(false); }
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
                if (fc.name === 'solve_problem') {
                   setIsProblemSolverOpen(true);
                   setActiveProblems(prev => [...prev, { id: Date.now(), text: fc.args.problem, status: 'ANALYZING', steps: [] }]);
                   setLastCommand(`PROBLEM_DETECTED: ${fc.args.problem}`);
                   response = { status: "SOLVING_PROTOCOL_ACTIVE", advice: "Sir, I have deployed sub-agents to map this issue. Check the Problem Solver hub." };
                }
                if (fc.name === 'deep_internet_crawl') {
                   setIsDeepSearchOpen(true);
                   setActiveResearch({ topic: fc.args.topic, data: "Crawling web nodes..." });
                   setLastCommand(`DEEP_SEARCH: ${fc.args.topic}`);
                   response = { status: "CRAWL_INITIALIZED", notes: "Gathering full details from global archives, Sir." };
                }
                if (fc.name === 'analyze_satellite_intel') {
                   setIsSatelliteOpen(true);
                   setLastCommand(`SAT_UPLINK: ${fc.args.location}`);
                   response = { status: "TARGET_LOCKED", intel: "Live satellite feed analysis established for requested region." };
                }
                if (fc.name === 'booking_status_analysis') {
                   setIsDeepSearchOpen(true);
                   setLastCommand(`BOOKING_CHECK: ${fc.args.entity}`);
                   response = { status: "ANALYZING_GDS_RECORDS", data: "Entity verified. Cross-referencing with live logistics data." };
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
    } catch (e) { setSessionState(SessionState.ERROR); }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

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
        onToggleVR={() => setIsVRMode(!isVRMode)}
      />
      
      <VRVisor isActive={isVRMode} color={avatarConfig.themeColor} />

      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={whatsAppStatus} onConnect={s => setWhatsAppStatus(p=>({...p, isConnected:true, sessionName:s}))} onDisconnect={()=>setWhatsAppStatus(p=>({...p, isConnected:false}))} />
      <DarkWebNode isOpen={isDarkWebOpen} onClose={() => setIsDarkWebOpen(false)} />
      <OviGenerator isOpen={isOviOpen} onClose={() => setIsOviOpen(false)} onAssetGenerated={(a) => setAssets(p => [a,...p])} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={systemInfo.isSearching || false} onClose={() => setIsChatOpen(false)} />
      <MediaVault assets={assets} isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <AvatarCustomizer 
        config={avatarConfig} 
        isOpen={isCustomizerOpen} 
        onUpdate={u => setAvatarConfig(p => ({...p,...u}))} 
        onGenerate={handleFullSynth} 
        isGenerating={isGeneratingAvatar} 
        isGeneratingTheme={isGeneratingTheme} 
        isGeneratingAccessory={isGeneratingAccessory} 
        onGenerateTheme={handleGenerateTheme} 
        onGenerateAccessory={handleGenerateAccessory} 
      />
      <N8NNode isOpen={isN8NOpen} onClose={() => setIsN8NOpen(false)} workflows={[]} onTrigger={()=>{}} />
      <SatelliteNode isOpen={isSatelliteOpen} onClose={() => setIsSatelliteOpen(false)} location={undefined} />
      <SocialMediaNode 
        isOpen={isSocialOpen} 
        onClose={() => setIsSocialOpen(false)} 
        accounts={socialAccounts} 
        onConnect={handleConnectSocial} 
        onApplyShop={()=>{}} 
        onToggleAutoEngage={handleToggleAutoEngage} 
      />
      
      <DeepSearchTerminal isOpen={isDeepSearchOpen} onClose={() => setIsDeepSearchOpen(false)} research={activeResearch} />
      <ProblemSolver isOpen={isProblemSolverOpen} onClose={() => setIsProblemSolverOpen(false)} problems={activeProblems} />

      <VideoCallOverlay isOpen={isVideoCallOpen} onClose={() => setIsVideoCallOpen(false)} participants={participants} isModelTalking={isModelTalking} isProcessing={false} personality="AI DOST" config={avatarConfig} />

      <div className={`perspective-container relative z-10 transition-all duration-1000 transform ${isVRMode ? 'scale-150 rotate-x-6' : 'scale-100'} ${sessionState === SessionState.ACTIVE ? 'scale-110 md:scale-135' : 'scale-90 opacity-40'}`}>
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} config={avatarConfig} isProcessing={systemInfo.isSearching} isLightMode={isLightMode} />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ProjectionDisplay isVisible={sessionState === SessionState.ACTIVE} color={avatarConfig.themeColor} />
      </div>

      <div className="fixed bottom-0 w-full px-6 md:px-14 pb-10 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl hud-glass px-10 py-8 flex items-center justify-between pointer-events-auto border-white/10 rounded-[3.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
          
          <div className="flex items-center gap-10">
            <button onClick={() => setIsCustomizerOpen(!isCustomizerOpen)} className="w-16 h-16 md:w-24 md:h-24 rounded-3xl border-2 border-white/10 flex items-center justify-center bg-black/60 overflow-hidden shadow-2xl" style={{ borderColor: avatarConfig.themeColor }}>
              <img src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarConfig.identity}`} className="w-12 h-12 md:w-16 md:h-16" />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-2xl orbitron font-black uppercase text-white tracking-widest leading-none">AI DOST</span>
              <span className="text-[10px] orbitron font-bold text-slate-500 uppercase mt-2">GLOBAL_OS_V6.0</span>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
             <button onClick={() => setIsDeepSearchOpen(!isDeepSearchOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isDeepSearchOpen ? 'bg-cyan-500 text-white' : 'bg-white/5 text-cyan-500 border border-cyan-500/20'}`}>
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
             </button>
             <button 
              onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession}
              className={`w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-700 relative overflow-hidden ${sessionState === SessionState.ACTIVE ? 'bg-cyan-500 shadow-[0_0_60px_rgba(6,182,212,0.8)]' : 'bg-white/5 border-2 border-white/10'}`}
             >
                <svg className={`w-10 h-10 md:w-16 md:h-16 ${sessionState === SessionState.ACTIVE ? 'text-white' : 'text-cyan-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
             </button>
             <button onClick={() => setIsProblemSolverOpen(!isProblemSolverOpen)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isProblemSolverOpen ? 'bg-emerald-500 text-white' : 'bg-white/5 text-emerald-500 border border-emerald-500/20'}`}>
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
             </button>
          </div>

          <div className="flex items-center gap-4">
             {[
               { id: 'sat', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z', action: () => setIsSatelliteOpen(!isSatelliteOpen), active: isSatelliteOpen },
               { id: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949', action: () => setIsChatOpen(!isChatOpen), active: isChatOpen },
               { id: 'social', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', action: () => setIsSocialOpen(!isSocialOpen), active: isSocialOpen },
             ].map(item => (
               <button key={item.id} onClick={item.action} className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all ${item.active ? 'bg-cyan-500 text-white' : 'bg-white/5 border border-white/10 text-slate-500'}`}>
                 <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={item.icon}/></svg>
               </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;