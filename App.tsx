
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { JarvisHUD } from './components/JarvisHUD';
import { VoiceWave } from './components/VoiceWave';
import { MediaVault } from './components/MediaVault';
import { DigitalAvatar } from './components/DigitalAvatar';
import { OmniMonitor } from './components/OmniMonitor';
import { LiveChat } from './components/LiveChat';
import { AvatarCustomizer } from './components/AvatarCustomizer';
import { WhatsAppNode } from './components/WhatsAppNode';
import { SocialMediaNode } from './components/SocialMediaNode';
import { SatelliteNode } from './components/SatelliteNode';
import { VideoCallOverlay } from './components/VideoCallOverlay';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, AIPersonality } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({});
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  // UI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSatelliteOpen, setIsSatelliteOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    hairstyle: 'Cyber-Fade', faceType: 'Android-Prime', themeColor: '#22d3ee', accessory: 'Neural-Link', identity: 'GERVIS', voiceName: 'Charon'
  });

  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Hardware Integration
  useEffect(() => {
    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const update = () => setSystemInfo(prev => ({ ...prev, battery: { level: battery.level * 100, charging: battery.charging } }));
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      });
    }

    // Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((pos) => {
        setSystemInfo(prev => ({ ...prev, location: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy } }));
      });
    }

    // Motion/Orientation
    const handleMotion = (e: DeviceOrientationEvent) => {
      setSystemInfo(prev => ({ ...prev, motion: { x: e.beta || 0, y: e.gamma || 0, z: e.alpha || 0 } }));
    };
    window.addEventListener('deviceorientation', handleMotion);
    return () => window.removeEventListener('deviceorientation', handleMotion);
  }, []);

  const triggerHaptic = (style: number = 50) => {
    if ('vibrate' in navigator) navigator.vibrate(style);
  };

  const startSession = async () => {
    triggerHaptic([30, 10, 30]);
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
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionRef.current) sessionRef.current.sendRealtimeInput({ media: { data: encode(floatTo16BitPCM(e.inputBuffer.getChannelData(0))), mimeType: 'audio/pcm;rate=16000' } });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
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
          },
          onclose: () => setSessionState(SessionState.IDLE),
          onerror: () => setSessionState(SessionState.IDLE),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are GERVIS X. Sir is using a mobile device. 
          Current Device Context: 
          - Battery: ${systemInfo.battery?.level}% ${systemInfo.battery?.charging ? '(Charging)' : ''}
          - Location: ${systemInfo.location?.lat}, ${systemInfo.location?.lng}
          - Orientation: ${systemInfo.motion?.x} (beta), ${systemInfo.motion?.y} (gamma).
          Be proactive about mobile efficiency and hardware commands.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: avatarConfig.voiceName } } }
        }
      });
    } catch (e) {
      setSessionState(SessionState.ERROR);
    }
  };

  const stopSession = () => {
    triggerHaptic(100);
    if (sessionRef.current) sessionRef.current.close();
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
  };

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-between safe-pt safe-pb overflow-hidden transition-all duration-700 ${isLightMode ? 'bg-[#f8fafc]' : 'bg-[#010409]'}`}>
      <JarvisHUD lastCommand={lastCommand} systemInfo={systemInfo} isModelTalking={isModelTalking} identity={avatarConfig.identity} />
      
      {/* Mobile-Optimized Terminal Layout */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4 relative">
        <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} isProcessing={isProcessing} config={avatarConfig} />
        
        {/* Floating Mini Controls for Mobile */}
        <div className="absolute top-1/2 right-4 flex flex-col gap-4 -translate-y-1/2 md:hidden">
          <button onClick={() => { triggerHaptic(20); setIsChatOpen(!isChatOpen); }} className="w-12 h-12 rounded-full hud-glass flex items-center justify-center text-current border border-white/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </button>
          <button onClick={() => { triggerHaptic(20); setIsSatelliteOpen(!isSatelliteOpen); }} className="w-12 h-12 rounded-full hud-glass flex items-center justify-center text-current border border-white/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </button>
        </div>
      </div>

      {/* Main Bottom Controller */}
      <div className="w-full max-w-lg px-6 pb-8 z-50">
        <VoiceWave isActive={sessionState === SessionState.ACTIVE} isModelTalking={isModelTalking} themeColor={avatarConfig.themeColor} />
        
        <div className="hud-glass rounded-[3rem] p-4 flex items-center justify-between border-white/20 shadow-2xl">
          <button 
            onClick={() => { triggerHaptic(20); setIsCustomizerOpen(!isCustomizerOpen); }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </button>

          <button 
            onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative border-4 ${sessionState === SessionState.ACTIVE ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.2)]'}`}
            style={{ color: sessionState === SessionState.ACTIVE ? '#ef4444' : avatarConfig.themeColor }}
          >
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${sessionState === SessionState.ACTIVE ? 'bg-red-500' : 'bg-current'}`}></div>
            {sessionState === SessionState.ACTIVE ? (
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg>
            ) : (
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>
            )}
          </button>

          <button 
            onClick={() => { triggerHaptic(20); setIsWhatsAppOpen(!isWhatsAppOpen); }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-green-500 hover:scale-110 transition-all"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
          </button>
        </div>
      </div>

      {/* Nodes */}
      <WhatsAppNode isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} status={{isConnected:false, sessionName:'', unreadCount:0}} onConnect={()=>{}} />
      <SocialMediaNode isOpen={isSocialOpen} onClose={() => setIsSocialOpen(false)} accounts={[]} onConnect={()=>{}} onApplyShop={()=>{}} onToggleAutoEngage={()=>{}} />
      <SatelliteNode isOpen={isSatelliteOpen} onClose={() => setIsSatelliteOpen(false)} location={systemInfo.location} />
      <MediaVault assets={assets} />
      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={()=>{}} isProcessing={isProcessing} />
    </div>
  );
};

export default App;
