
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { JarvisHUD } from './components/JarvisHUD';
import { VoiceWave } from './components/VoiceWave';
import { MediaVault } from './components/MediaVault';
import { DigitalAvatar } from './components/DigitalAvatar';
import { OmniMonitor } from './components/OmniMonitor';
import { LiveChat, ChatOptions } from './components/LiveChat';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { InternalBrowser } from './components/InternalBrowser';
import { NeuralTrainingModule } from './components/NeuralTrainingModule';
import { DiagnosticConsole } from './components/DiagnosticConsole';
import { HelpPanel } from './components/HelpPanel';
import { FeedbackForm } from './components/FeedbackForm';
import { OnboardingTour } from './components/OnboardingTour';
import { MiniPopupNode } from './components/MiniPopupNode';
import { WhatsAppNode } from './components/WhatsAppNode';
import { SocialMediaNode } from './components/SocialMediaNode';
import { SatelliteNode } from './components/SatelliteNode';
import { GitHubNode } from './components/GitHubNode';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { LoginPage } from './components/LoginPage';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, TrainingSession, WhatsAppStatus, SocialAccount, SourceLink, AIPersonality } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const TOOLS: FunctionDeclaration[] = [
  { name: 'diagnose_system_integrity', description: "Auto-repair system bottlenecks.", parameters: { type: Type.OBJECT, properties: {}, required: [] } },
  { name: 'deploy_autonomous_agent', description: "Spawn sub-routine for research.", parameters: { type: Type.OBJECT, properties: { taskType: { type: Type.STRING } }, required: ['taskType'] } }
];

const getSystemInstruction = (personality: AIPersonality) => {
  const name = personality === 'GERVIS' ? 'GERVIS OMNISCIENT X' : personality === 'FRIDAY' ? 'FRIDAY UI' : 'ALTON ADVANCED';
  const role = personality === 'GERVIS' ? 'professional male butler and digital partner' : personality === 'FRIDAY' ? 'efficient female tactical assistant' : 'stoic strategist';
  const style = personality === 'GERVIS' ? 'Calm, British.' : personality === 'FRIDAY' ? 'Direct, tactical.' : 'Pure data.';
  
  return `You are ${name}, a ${role}. 
CORE: Stop speaking if Sir interrupts. Listen, then respond. Use "Deep Internet" and "Dark Internet" persona for high-security problem solving. Always provide URLs for research using Google Search. Fix all technical problems proactively.
${style}`;
};

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({});
  
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isOmniMonitorOpen, setIsOmniMonitorOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSatelliteOpen, setIsSatelliteOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('avatar_config');
    if (saved) return JSON.parse(saved);
    return { hairstyle: 'Cyber-Fade', faceType: 'Android-Prime', themeColor: '#22d3ee', accessory: 'Neural-Link', identity: 'GERVIS', voiceName: 'Charon' };
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => setSystemInfo(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy } })),
        () => setLastCommand("GPS_SYNC_ERROR"), { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if ((isOmniMonitorOpen || isVideoCallOpen) && isAuthorized) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          cameraStreamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) { console.warn("Camera offline"); }
      }
    };
    startCamera();
  }, [isOmniMonitorOpen, isVideoCallOpen, isAuthorized]);

  const handleSendMessage = async (text: string, options?: ChatOptions) => {
    setIsProcessing(true);
    setTranscriptions(prev => [...prev, { text, role: 'user', timestamp: Date.now() }]);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    let modelName = 'gemini-3-pro-preview';
    let config: any = { tools: [{ googleSearch: {} }] };

    if (options?.mode === 'FAST') modelName = 'gemini-2.5-flash-lite-latest';
    if (options?.mode === 'THINKING') config.thinkingConfig = { thinkingBudget: 32768 };

    try {
      if (text.toLowerCase().includes('near') || text.toLowerCase().includes('location')) {
        modelName = 'gemini-2.5-flash';
        config.tools = [{ googleMaps: {} }];
        if (systemInfo.location) config.toolConfig = { retrievalConfig: { latLng: { latitude: systemInfo.location.lat, longitude: systemInfo.location.lng } } };
      }

      if (text.toLowerCase().includes('generate image')) {
        modelName = 'gemini-3-pro-image-preview';
        config.imageConfig = { aspectRatio: options?.aspectRatio || '16:9', imageSize: options?.imageSize || '1K' };
      }

      if (text.toLowerCase().includes('generate video')) {
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) await window.aistudio.openSelectKey();
        let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt: text, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: options?.aspectRatio || '16:9' } });
        while (!op.done) { await new Promise(r => setTimeout(r, 10000)); op = await ai.operations.getVideosOperation({ operation: op }); }
        const uri = op.response?.generatedVideos?.[0]?.video?.uri;
        if (uri) {
          const r = await fetch(`${uri}&key=${process.env.API_KEY}`);
          const url = URL.createObjectURL(await r.blob());
          setAssets(prev => [{ id: Math.random().toString(), type: 'video', url, prompt: text }, ...prev]);
        }
        setIsProcessing(false); return;
      }

      const response = await ai.models.generateContent({ model: modelName, contents: text, config: { ...config, systemInstruction: getSystemInstruction(avatarConfig.identity) } });
      
      let fImg = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setAssets(prev => [{ id: Math.random().toString(), type: 'image', url: `data:image/png;base64,${part.inlineData.data}`, prompt: text }, ...prev]);
          fImg = true;
        }
      }

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web || c.maps).map((c: any) => ({ uri: c.web?.uri || c.maps?.uri, title: c.web?.title || c.maps?.title })) || [];
      const mText = response.text || (fImg ? "Rendered." : "Silent.");
      setTranscriptions(prev => [...prev, { text: mText, role: 'model', timestamp: Date.now(), sources }]);
      handleTTS(mText);
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleTTS = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const r = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: avatarConfig.voiceName } } } } });
      const b64 = r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        const ctx = outputAudioContextRef.current || new AudioContext();
        outputAudioContextRef.current = ctx;
        const buf = await decodeAudioData(decode(b64), ctx, 24000, 1);
        const s = ctx.createBufferSource(); s.buffer = buf; s.connect(ctx.destination); s.start();
      }
    } catch (e) {}
  };

  const startLiveSession = async () => {
    if (sessionState !== SessionState.IDLE) return;
    setSessionState(SessionState.CONNECTING);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setSessionState(SessionState.ACTIVE);
            const source = inputCtx.createMediaStreamSource(audioStream);
            const sp = inputCtx.createScriptProcessor(4096, 1, 1);
            sp.onaudioprocess = (e) => {
              if (sessionRef.current) sessionRef.current.sendRealtimeInput({ media: { data: encode(floatTo16BitPCM(e.inputBuffer.getChannelData(0))), mimeType: 'audio/pcm;rate=16000' } });
            };
            source.connect(sp); sp.connect(inputCtx.destination);
            frameIntervalRef.current = window.setInterval(() => {
              if (cameraStreamRef.current && sessionRef.current) {
                const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 240;
                const ctx = canvas.getContext('2d');
                if (ctx && videoRef.current) { ctx.drawImage(videoRef.current, 0, 0, 320, 240); sessionRef.current.sendRealtimeInput({ media: { data: canvas.toDataURL('image/jpeg', 0.4).split(',')[1], mimeType: 'image/jpeg' } }); }
              }
            }, 1000);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if ((msg as any).serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} }); sourcesRef.current.clear();
              nextStartTimeRef.current = 0; setIsModelTalking(false); return;
            }
            const b64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (b64) {
              setIsModelTalking(true);
              const buf = await decodeAudioData(decode(b64), outputCtx, 24000, 1);
              const s = outputCtx.createBufferSource(); s.buffer = buf; s.connect(outputCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              s.start(nextStartTimeRef.current); nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(s);
              s.onended = () => { sourcesRef.current.delete(s); if (sourcesRef.current.size === 0) setIsModelTalking(false); };
            }
            if (msg.serverContent?.inputTranscription) setTranscriptions(prev => [...prev, { text: msg.serverContent!.inputTranscription!.text, role: 'user', timestamp: Date.now() }]);
            if (msg.serverContent?.outputTranscription) setTranscriptions(prev => [...prev, { text: msg.serverContent!.outputTranscription!.text, role: 'model', timestamp: Date.now() }]);
          },
          onerror: stopSession, onclose: stopSession
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: getSystemInstruction(avatarConfig.identity),
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: avatarConfig.voiceName } } },
          tools: [{ googleSearch: {} }, { functionDeclarations: TOOLS }],
          inputAudioTranscription: {}, outputAudioTranscription: {},
        }
      });
    } catch (e) { setSessionState(SessionState.ERROR); }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    setSessionState(SessionState.IDLE); setIsModelTalking(false);
  };

  if (!isAuthorized) {
    return <LoginPage onAuthorize={() => setIsAuthorized(true)} personality={avatarConfig.identity} themeColor={avatarConfig.themeColor} />;
  }

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500">
      <JarvisHUD lastCommand={lastCommand} systemInfo={systemInfo} isModelTalking={isModelTalking} identity={avatarConfig.identity} />
      <OnboardingTour isActive={isOnboardingOpen} onComplete={() => setIsOnboardingOpen(false)} />
      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={{isConnected:false, sessionName:'', unreadCount:0}} onConnect={()=>{}} />
      <SocialMediaNode isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} accounts={[]} onConnect={()=>{}} onApplyShop={()=>{}} onToggleAutoEngage={()=>{}} />
      <SatelliteNode isOpen={isSatelliteOpen} onClose={() => setIsSatelliteOpen(false)} location={systemInfo.location} />
      <GitHubNode isOpen={isGitHubOpen} onClose={() => setIsGitHubOpen(false)} onSync={(url) => setLastCommand(`GIT: ${url}`)} />
      <VideoCallOverlay isOpen={isVideoCallOpen} onClose={() => setIsVideoCallOpen(false)} stream={cameraStreamRef.current} isModelTalking={isModelTalking} isProcessing={isProcessing} personality={avatarConfig.identity} config={avatarConfig} />
      
      <MediaVault assets={assets} />
      <AvatarCustomizer config={avatarConfig} isOpen={isCustomizerOpen} onUpdate={setAvatarConfig} onGenerate={()=>{}} isGenerating={false} isGeneratingTheme={false} isGeneratingAccessory={false} onGenerateTheme={()=>{}} onGenerateAccessory={()=>{}} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={handleSendMessage} isProcessing={isProcessing} />
      <OmniMonitor stream={cameraStreamRef.current} isOpen={isOmniMonitorOpen} facingMode="user" messages={transcriptions} assets={assets} campaign={null} isSyncing={sessionState === SessionState.ACTIVE} systemInfo={systemInfo} />

      <div className="relative z-20 flex flex-col items-center w-full">
         <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} isProcessing={isProcessing} config={avatarConfig} />
         <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      </div>

      <div className="fixed bottom-10 z-30 w-[95%] max-w-5xl flex flex-col items-center gap-4">
        <VoiceWave isActive={sessionState === SessionState.ACTIVE} isModelTalking={isModelTalking} themeColor={avatarConfig.themeColor} />
        <div className="w-full flex items-center justify-between hud-glass p-8 rounded-[3.5rem] border-cyan-500/30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsVideoCallOpen(true)} className="group flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-cyan-400 bg-cyan-400/10 group-hover:scale-110"><svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>
              <span className="text-[6px] orbitron font-black text-slate-500 uppercase tracking-widest">TACTICAL_CALL</span>
            </button>
            <button onClick={() => setIsGitHubOpen(!isGitHubOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isGitHubOpen ? 'border-white bg-white/20' : 'border-slate-800'}`}><svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></div>
              <span className="text-[6px] orbitron font-black text-slate-500 uppercase tracking-widest">GitHub</span>
            </button>
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isChatOpen ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-800'}`}><svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div>
              <span className="text-[6px] orbitron font-black text-slate-500 uppercase tracking-widest">COM_LINK</span>
            </button>
          </div>
          <button onClick={sessionState === SessionState.ACTIVE ? stopSession : startLiveSession} className={`relative h-28 w-28 rounded-full flex items-center justify-center transition-all duration-500 ${sessionState === SessionState.ACTIVE ? 'bg-red-500/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-cyan-400/5 border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.4)]'}`} style={{ borderColor: sessionState === SessionState.ACTIVE ? '#ef4444' : avatarConfig.themeColor, color: sessionState === SessionState.ACTIVE ? '#ef4444' : avatarConfig.themeColor }}>
            <div className="absolute inset-0 rounded-full border border-current opacity-20 animate-ping"></div>
            {sessionState === SessionState.ACTIVE ? <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg> : <svg className="h-10 w-10" style={{ color: avatarConfig.themeColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>}
          </button>
          <div className="flex flex-col gap-1 items-end">
            <div className="text-[8px] orbitron font-black uppercase tracking-widest" style={{ color: avatarConfig.themeColor }}>Protocol_{avatarConfig.identity === 'GERVIS' ? 'X' : avatarConfig.identity === 'FRIDAY' ? 'F' : 'A'}</div>
            <div className={`w-3 h-3 rounded-full ${sessionState === SessionState.ACTIVE ? 'bg-green-400 animate-pulse' : 'bg-slate-700'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
