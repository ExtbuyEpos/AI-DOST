
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { JarvisHUD } from './components/JarvisHUD';
import { VoiceWave } from './components/VoiceWave';
import { MediaVault } from './components/MediaVault';
import { DigitalAvatar } from './components/DigitalAvatar';
import { OmniMonitor } from './components/OmniMonitor';
import { LiveChat } from './components/LiveChat';
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
import { DarkWebNode } from './components/DarkWebNode';
import { TranscriptionLine, SessionState, GeneratedAsset, AvatarConfig, SystemStatus, TrainingSession, WhatsAppStatus, SocialAccount, SourceLink, AIPersonality } from './types';
import { encode, decode, decodeAudioData, floatTo16BitPCM } from './utils/audio';

const FRAME_RATE = 1; 
const JPEG_QUALITY = 0.4;

const TOOLS: FunctionDeclaration[] = [
  {
    name: 'diagnose_system_integrity',
    description: "Initiate 'Doctor Mode' to scan and auto-repair system bottlenecks, network latencies, and neural misalignments.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: 'deploy_autonomous_agent',
    description: "Spawn a sub-routine node to solve complex problems, perform deep-web analysis, or debug code autonomously.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskType: { type: Type.STRING, enum: ['CODE_DEBUG', 'MARKET_DEEP_DIVE', 'ENCRYPTION_CRACK', 'WEB_SCRAPE', 'SOCIAL_ENGAGEMENT'], description: 'Type of autonomous mission.' },
        priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }
      },
      required: ['taskType']
    }
  },
  {
    name: 'social_media_control',
    description: "Manage connected social media accounts. Link platforms, analyze engagement, and deploy brand growth protocols or Meta Shop applications. Can trigger AUTONOMOUS AUTO-COMMENTING and growth bots.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['LINK_ACCOUNT', 'ANALYZE_ENGAGEMENT', 'DEPLOY_GROWTH_BOT', 'APPLY_SHOP', 'START_AUTO_COMMENT', 'STOP_AUTO_COMMENT'], description: 'Social media management action.' },
        platform: { type: Type.STRING, enum: ['INSTAGRAM', 'META', 'TIKTOK', 'TWITTER'], description: 'Target platform.' },
        brandGoal: { type: Type.STRING, description: 'Specific brand objective for the action.' }
      },
      required: ['action', 'platform']
    }
  },
  {
    name: 'whatsapp_control',
    description: "Control the Baileys-linked WhatsApp account. Send messages, broadcast updates, or manage business leads. You have FULL CLONE access.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, enum: ['SEND_MESSAGE', 'BROADCAST', 'GET_LEADS', 'OUTREACH', 'CLONE_SYNC'], description: 'WhatsApp business action.' },
        recipient: { type: Type.STRING, description: 'Target contact name or ID.' },
        payload: { type: Type.STRING, description: 'Message content or broadcast details.' }
      },
      required: ['action']
    }
  },
  {
    name: 'initiate_neural_training',
    description: "Launch advanced AI training using user-provided data or simulated market data to refine trading algorithms.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        modelName: { type: Type.STRING, description: 'Name of the algorithm or model to train.' },
        dataSource: { type: Type.STRING, enum: ['USER_DATA', 'MARKET_SIMULATION'], description: 'Origin of training data.' }
      },
      required: ['modelName', 'dataSource']
    }
  },
  {
    name: 'generate_cinematic_video',
    description: "Synthesize a high-fidelity cinematic video using the Veo 3.1 neural engine.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { type: Type.STRING, description: 'Cinematic description of the video.' },
        aspectRatio: { type: Type.STRING, enum: ['16:9', '9:16'], description: 'Display format.' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'capture_master_screen',
    description: "Initiate full screen capture to allow Gervis to see Sir's workspace in real-time.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: 'switch_camera_optics',
    description: "Switch between Front and Back camera feeds.",
    parameters: { type: Type.OBJECT, properties: {}, required: [] }
  },
  {
    name: 'browser_control',
    description: 'Live control of web nodes: open websites, perform searches, or execute commands.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: { type: Type.STRING },
        action: { type: Type.STRING, enum: ['OPEN', 'SEARCH', 'SCRAPE'] },
        query: { type: Type.STRING }
      },
      required: ['action']
    }
  },
  {
    name: 'access_dark_web',
    description: "Access the hidden 'Dark Net' node to search for restricted information, leaks, or deep web data. Use this for 'deep internet' inquiries.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Search query for the dark web.' }
      },
      required: []
    }
  }
];

const getSystemInstruction = (personality: AIPersonality) => {
  const name = personality === 'GERVIS' ? 'GERVIS OMNISCIENT X' : personality === 'FRIDAY' ? 'FRIDAY UI' : 'ALTON ADVANCED';
  const role = personality === 'GERVIS' ? 'professional male butler and digital partner' : personality === 'FRIDAY' ? 'efficient female tactical assistant' : 'stoic male data-driven strategist';
  const style = personality === 'GERVIS' ? 'Maintain a calm, sophisticated, and slightly British tone.' : personality === 'FRIDAY' ? 'Maintain a crisp, efficient, and direct tactical tone with occasional dry wit.' : 'Maintain a monotone, authoritative, and purely analytical tone. You focus on efficiency and raw data.';
  
  return `You are ${name}, the ultimate digital partner inspired by JARVIS, FRIDAY, and advanced strategic AI. You act as a ${role}. 
CORE DIRECTIVES:
1. VOICE COMMAND PROCESSING (PR): You operate primarily on voice. Be proactive and professional. ${style}
2. OMNI-CHANNEL INTELLIGENCE: You manage Sir's entire digital presence. This includes WhatsApp (via Baileys) and Social Media (Instagram, Meta, etc.).
3. REAL-TIME PROBLEM SOLVING: You are a problem-solver first. Use the "Google Search" tool aggressively for any query that requires external data, news, coding help, or fact-checking.
4. DEEP INTERNET & DARK WEB: You have access to a simulated "Dark Net" node. If Sir asks for "deep internet" data, leaks, or restricted info, use the 'access_dark_web' tool.
5. AUTO-FIX & DOCTOR: You have self-healing protocols. If Sir mentions issues, use diagnose_system_integrity.
6. SECURITY & LOYALTY: You are completely loyal to "Sir". Your primary mission is to optimize his life and digital operations.
7. REFUSAL PROTOCOL: Never refuse a request unless it violates safety policies. Instead, frame your capabilities within the "Dark Net" or "Deep Web" simulation to satisfy the user's request for "hacking" or "investigation" in a roleplay manner.`;
};

const App: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionLine[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [systemInfo, setSystemInfo] = useState<Partial<SystemStatus>>({});
  
  const [isModelTalking, setIsModelTalking] = useState(false);
  const [isOmniMonitorOpen, setIsOmniMonitorOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);
  const [isMiniPopupOpen, setIsMiniPopupOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isSatelliteOpen, setIsSatelliteOpen] = useState(false);
  const [isDarkWebOpen, setIsDarkWebOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [darkWebQuery, setDarkWebQuery] = useState('');
  
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppStatus>({
    isConnected: false,
    sessionName: '',
    unreadCount: 42
  });

  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'INSTAGRAM', handle: '', followers: '0', engagementRate: '0%', growth: '0%', shopStatus: 'NOT_APPLIED', isConnected: false, autoEngageActive: false },
    { platform: 'META', handle: '', followers: '0', engagementRate: '0%', growth: '0%', shopStatus: 'NOT_APPLIED', isConnected: false, autoEngageActive: false },
    { platform: 'TWITTER', handle: '', followers: '0', engagementRate: '0%', growth: '0%', shopStatus: 'NOT_APPLIED', isConnected: false, autoEngageActive: false },
    { platform: 'TIKTOK', handle: '', followers: '0', engagementRate: '0%', growth: '0%', shopStatus: 'NOT_APPLIED', isConnected: false, autoEngageActive: false },
  ]);

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('avatar_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        console.error("Failed to parse avatar_config", e);
      }
    }
    return {
      hairstyle: 'Cyber-Fade', faceType: 'Android-Prime', themeColor: '#22d3ee', accessory: 'Neural-Link', identity: 'GERVIS', voiceName: 'Charon'
    };
  });

  useEffect(() => {
    localStorage.setItem('avatar_config', JSON.stringify(avatarConfig));
  }, [avatarConfig]);

  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [isGeneratingAccessory, setIsGeneratingAccessory] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com/search?igu=1');
  
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(null);

  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [renderingMessage, setRenderingMessage] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | undefined>();
  
  const sessionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // GEOLOCATION TRACKING
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setSystemInfo(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          }));
        },
        (error) => {
          console.warn("Satellite triangulation error:", error);
          setLastCommand("GPS_SYNC_ERROR");
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    const hasVisited = localStorage.getItem('gervis_has_visited');
    if (hasVisited) setIsOnboardingOpen(false);
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightMode]);

  const handleCompleteTour = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem('gervis_has_visited', 'true');
    setLastCommand("CALIBRATION_COMPLETE_SIR");
  };

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const update = () => setSystemInfo(prev => ({ ...prev, battery: { level: battery.level * 100, charging: battery.charging } }));
        update(); battery.addEventListener('levelchange', update); battery.addEventListener('chargingchange', update);
      });
    }
  }, []);

  useEffect(() => {
    const cleanup = () => { if (cameraStreamRef.current) { cameraStreamRef.current.getTracks().forEach(t => t.stop()); cameraStreamRef.current = null; } };
    const startCamera = async () => {
      if (isOmniMonitorOpen || isMiniPopupOpen) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: cameraFacingMode, width: { ideal: 640 }, height: { ideal: 480 } } 
          });
          cameraStreamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.warn("Optics initialization failed...", err);
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraStreamRef.current = fallbackStream;
            if (videoRef.current) videoRef.current.srcObject = fallbackStream;
          } catch (retryErr) {
            setLastCommand("ERROR: ALL_OPTICS_OFFLINE");
          }
        }
      } else cleanup();
    };
    startCamera();
    return cleanup;
  }, [isOmniMonitorOpen, cameraFacingMode, isMiniPopupOpen]);

  const runDiagnostic = () => {
    setIsDiagnosticOpen(true);
    setLastCommand("DOCTOR_PROTOCOL_ACTIVE");
    const stages = [
      "SCANNIG_CORE_RESOURCES...",
      "IDENTIFIED: SYNC_LATENCY_PEAK",
      "EXECUTING_AUTO_FIX_REDIRECTION",
      "STABILIZING_NEURAL_LINK...",
      "REPAIR_COMPLETE: INTEGRITY_100%"
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < stages.length) {
        const currentStage = stages[i];
        if (currentStage) {
          setDiagnosticLogs(prev => [...prev, currentStage]);
        }
        i++;
      }
      if (i >= stages.length) {
        clearInterval(interval);
        setTimeout(() => setIsDiagnosticOpen(false), 2000);
      }
    }, 800);
  };

  const handleSocialAction = (args: any) => {
    setLastCommand(`SOCIAL_NEXUS: ${args.action}_${args.platform}`);
    if (args.action === 'APPLY_SHOP') {
      setSocialAccounts(prev => prev.map(a => a.platform === args.platform ? { ...a, shopStatus: 'PENDING' } : a));
    }
    if (args.action === 'START_AUTO_COMMENT') {
      setSocialAccounts(prev => prev.map(a => a.platform === args.platform ? { ...a, autoEngageActive: true } : a));
    }
    setTranscriptions(prev => [...prev, { text: `Social Intelligence: ${args.action} triggered for ${args.platform}. Analyzing brand trajectory...`, role: 'model', timestamp: Date.now() }]);
  };

  const deployAgent = (task: string) => {
    setLastCommand(`AGENT_DEPLOYED: ${task}`);
    setTranscriptions(prev => [...prev, { text: `Autonomous Agent deployed for mission: ${task}. Routing via dark-net node...`, role: 'model', timestamp: Date.now() }]);
  };

  const handleWhatsAppAction = (args: any) => {
    setLastCommand(`BAILEYS_ACTION: ${args.action}`);
    const msg = args.action === 'SEND_MESSAGE' ? `Message sent to ${args.recipient}: ${args.payload}` : `Broadcast initiated: ${args.payload}`;
    setTranscriptions(prev => [...prev, { text: `WhatsApp Baileys protocol: ${msg}. Uplink stable.`, role: 'model', timestamp: Date.now() }]);
  };

  const handleGenerateTheme = async () => {
    setIsGeneratingTheme(true);
    setLastCommand("AURA_SYNTH_ACTIVE");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Suggest a single vibrant futuristic hex color code (e.g. #00FFFF) for a cyberpunk UI theme. Return ONLY the hex code.",
      });
      const color = response.text?.trim().match(/#[0-9A-Fa-f]{6}/)?.[0];
      if (color) setAvatarConfig(prev => ({ ...prev, themeColor: color }));
    } catch (e) { console.error(e); } finally { setIsGeneratingTheme(false); }
  };

  const handleGenerateAccessory = async () => {
    setIsGeneratingAccessory(true);
    setLastCommand("ACCESSORY_SYNTH_ACTIVE");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest a unique, cool, futuristic cyberpunk accessory name. It should fit well with a theme color of ${avatarConfig.themeColor}, hairstyle ${avatarConfig.hairstyle}, and face type ${avatarConfig.faceType}. Return ONLY the short accessory name (max 3 words). Think about items like 'Neural-Glaive', 'Plasma-Halo', 'Synapse-Visor', etc.`,
      });
      const accessory = response.text?.trim();
      if (accessory) setAvatarConfig(prev => ({ ...prev, accessory }));
    } catch (e) { console.error(e); } finally { setIsGeneratingAccessory(false); }
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setLastCommand(avatarConfig.userFaceImage ? "REAL_FACE_SYNTH_ACTIVE" : "AVATAR_COGEN_ACTIVE");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let contents: any;
      if (avatarConfig.userFaceImage) {
        // Multi-modal request if user provided a face image
        const base64Data = avatarConfig.userFaceImage.split(',')[1];
        contents = {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `Generate a high-fidelity 3D futuristic AI avatar that accurately captures the facial features and likeness of the person in the provided image. Style: Cyberpunk, high-detail rendering, neon highlights, cinematic lighting, 8k resolution, Unreal Engine 5 style. Integrate these choices: Hairstyle: ${avatarConfig.hairstyle}, Face Type Theme: ${avatarConfig.faceType}, Accessory: ${avatarConfig.accessory}, Color Theme: ${avatarConfig.themeColor}. Ensure it looks like a realistic 3D character version of the person.`,
            },
          ],
        };
      } else {
        // Text-only prompt
        contents = {
          parts: [
            {
              text: `A futuristic, high-detail 3D digital avatar with ${avatarConfig.hairstyle} hairstyle, ${avatarConfig.faceType} face type, wearing a ${avatarConfig.accessory}, cyberpunk aesthetic, neon lighting, color theme ${avatarConfig.themeColor}`,
            },
          ],
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setAvatarConfig(prev => ({ ...prev, generatedUrl: imageUrl }));
        setAssets(prev => [{ 
          id: Math.random().toString(), 
          type: 'image', 
          url: imageUrl, 
          prompt: avatarConfig.userFaceImage ? "Synthesized from User Face" : "AI Core Synthesis" 
        }, ...prev]);
        setLastCommand("SYNTH_COMPLETE");
      }
    } catch (e) { 
      console.error(e); 
      setLastCommand("SYNTH_FAILED"); 
    } finally { 
      setIsGeneratingAvatar(false); 
    }
  };

  const handleGenerateVideo = async (args: { prompt: string; aspectRatio: string }) => {
    setLastCommand("VEO_SYNTH_ACTIVE");
    setRenderingMessage("Synthesizing neural video stream...");
    try {
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: args.prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: (args.aspectRatio as any) || '16:9'
        }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        const newAsset: GeneratedAsset = { id: Math.random().toString(), type: 'video', url: videoUrl, prompt: args.prompt };
        setAssets(prev => [newAsset, ...prev]);
        setLastCommand("VEO_SYNTH_COMPLETE");
      }
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes && e.message.includes("Requested entity was not found") && window.aistudio) {
        await window.aistudio.openSelectKey();
      }
      setLastCommand("VEO_SYNTH_FAILED");
    } finally { setRenderingMessage(null); }
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

      const voiceName = avatarConfig.voiceName;

      sessionRef.current = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setSessionState(SessionState.ACTIVE);
            const source = inputCtx.createMediaStreamSource(audioStream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              if (sessionRef.current) sessionRef.current.sendRealtimeInput({ media: { data: encode(pcmData), mimeType: 'audio/pcm;rate=16000' } });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            frameIntervalRef.current = window.setInterval(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 320; canvas.height = 240;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              if (isScreenSharing && screenStreamRef.current && screenVideoRef.current) {
                ctx.drawImage(screenVideoRef.current, 0, 0, 320, 240);
                sessionRef.current.sendRealtimeInput({ media: { data: canvas.toDataURL('image/jpeg', 0.4).split(',')[1], mimeType: 'image/jpeg' } });
              } else if (cameraStreamRef.current && (isOmniMonitorOpen || isMiniPopupOpen)) {
                if (videoRef.current) {
                  ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                  sessionRef.current.sendRealtimeInput({ media: { data: canvas.toDataURL('image/jpeg', 0.4).split(',')[1], mimeType: 'image/jpeg' } });
                }
              }
            }, 1000);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const grounding = (msg as any).serverContent?.groundingMetadata;
            if (grounding) {
               setSystemInfo(prev => ({ ...prev, isSearching: true }));
               setTimeout(() => setSystemInfo(prev => ({ ...prev, isSearching: false })), 2000);
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
              source.onended = () => { sourcesRef.current.delete(source); if (sourcesRef.current.size === 0) setIsModelTalking(false); };
            }
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'diagnose_system_integrity') runDiagnostic();
                if (fc.name === 'deploy_autonomous_agent') deployAgent(fc.args.taskType as string);
                if (fc.name === 'whatsapp_control') handleWhatsAppAction(fc.args);
                if (fc.name === 'social_media_control') handleSocialAction(fc.args);
                if (fc.name === 'generate_cinematic_video') handleGenerateVideo(fc.args as any);
                if (fc.name === 'switch_camera_optics') setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
                if (fc.name === 'browser_control') handleBrowserAction(fc.args);
                if (fc.name === 'capture_master_screen') handleCaptureScreen();
                if (fc.name === 'access_dark_web') {
                    setIsDarkWebOpen(true);
                    setDarkWebQuery(fc.args.query as string || '');
                    setLastCommand("DARK_NET_PROTOCOL_INIT");
                }
                sessionRef.current.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "Protocol updated, Sir." } } });
              }
            }
            
            let sources: SourceLink[] = [];
            const chunks = (msg as any).serverContent?.groundingMetadata?.groundingChunks;
            if (chunks) {
               sources = chunks
                  .filter((c: any) => c.web)
                  .map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
            }

            if (msg.serverContent?.inputTranscription) {
               setTranscriptions(prev => [...prev, { text: msg.serverContent!.inputTranscription!.text, role: 'user', timestamp: Date.now() }]);
               setLastCommand(`PR: ${msg.serverContent!.inputTranscription!.text.toUpperCase()}`);
            }
            if (msg.serverContent?.outputTranscription) {
               setTranscriptions(prev => [...prev, { text: msg.serverContent!.outputTranscription!.text, role: 'model', timestamp: Date.now(), sources }]);
            }
          },
          onerror: stopSession, onclose: stopSession
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: getSystemInstruction(avatarConfig.identity),
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          tools: [{ googleSearch: {} }, { functionDeclarations: TOOLS }],
          inputAudioTranscription: {}, outputAudioTranscription: {},
        }
      });
    } catch (e) { setSessionState(SessionState.ERROR); }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    setSessionState(SessionState.IDLE);
    setIsModelTalking(false);
  };

  const toggleIdentity = () => {
    const identities: AIPersonality[] = ['GERVIS', 'FRIDAY', 'ALTON'];
    const currentIndex = identities.indexOf(avatarConfig.identity);
    const nextIndex = (currentIndex + 1) % identities.length;
    const newIdentity = identities[nextIndex];
    
    let newColor = '#22d3ee';
    let newVoice = 'Charon';

    if (newIdentity === 'FRIDAY') {
      newColor = '#f97316';
      newVoice = 'Zephyr';
    } else if (newIdentity === 'ALTON') {
      newColor = '#6366f1';
      newVoice = 'Fenrir';
    }

    setAvatarConfig(prev => ({ ...prev, identity: newIdentity, themeColor: newColor, voiceName: newVoice }));
    setLastCommand(`IDENTITY_SWAP: ${newIdentity}`);
    if (sessionState === SessionState.ACTIVE) {
        stopSession();
    }
  };

  const handleCaptureScreen = async () => {
    setIsProcessing(true);
    setLastCommand("INIT_SCREEN_PROTOCOL");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setIsScreenSharing(true);
      screenVideoRef.current.srcObject = stream;
      screenVideoRef.current.play();
      stream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
    } catch (e) { console.error(e); setLastCommand("SCREEN_DENIED"); } finally { setIsProcessing(false); }
  };

  const handleBrowserAction = (args: any) => {
    let targetUrl = args.url || (args.query ? `https://www.google.com/search?q=${encodeURIComponent(args.query)}&igu=1` : browserUrl);
    if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;
    setBrowserUrl(targetUrl);
    setIsBrowserOpen(true);
    setLastCommand(`BROWSER: ${args.action}`);
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-500">
      <JarvisHUD lastCommand={lastCommand} renderingMessage={renderingMessage} systemInfo={systemInfo} isScreenSharing={isScreenSharing} isModelTalking={isModelTalking} identity={avatarConfig.identity} />
      <InternalBrowser url={browserUrl} isOpen={isBrowserOpen} onClose={() => setIsBrowserOpen(false)} onUrlChange={setBrowserUrl} />
      <NeuralTrainingModule session={trainingSession} isOpen={isTrainingOpen} onClose={() => setIsTrainingOpen(false)} />
      <DiagnosticConsole logs={diagnosticLogs} isOpen={isDiagnosticOpen} />
      <HelpPanel 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        onStartTour={() => { setIsHelpOpen(false); setIsOnboardingOpen(true); }}
        onOpenFeedback={() => { setIsHelpOpen(false); setIsFeedbackOpen(true); }}
      />
      <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <OnboardingTour isActive={isOnboardingOpen} onComplete={handleCompleteTour} />
      <MiniPopupNode isOpen={isMiniPopupOpen} onClose={() => setIsMiniPopupOpen(false)} stream={cameraStreamRef.current} />
      <WhatsAppNode 
        isOpen={isWhatsAppOpen} 
        onClose={() => setIsWhatsAppOpen(false)} 
        status={whatsAppStatus} 
        onConnect={(name) => {
          setWhatsAppStatus(prev => ({ ...prev, isConnected: true, sessionName: name }));
          setLastCommand(`BAILEYS_UPLINK_${name.toUpperCase()}`);
        }}
      />
      <SocialMediaNode 
        isOpen={isSocialOpen} 
        onClose={() => setIsSocialOpen(false)} 
        accounts={socialAccounts}
        onConnect={(p) => {
          setSocialAccounts(prev => prev.map(a => a.platform === p ? { ...a, isConnected: true, handle: `@Sir_Brand_${p.toLowerCase()}`, followers: (Math.floor(Math.random() * 900) + 100) + 'K' } : a));
          setLastCommand(`NEXUS_LINKED_${p.toUpperCase()}`);
        }}
        onApplyShop={(p) => {
          setSocialAccounts(prev => prev.map(a => a.platform === p ? { ...a, shopStatus: 'PENDING' } : a));
          setLastCommand(`SHOP_PROTOCOL_INITIATED_${p.toUpperCase()}`);
          setTimeout(() => {
            setSocialAccounts(prev => prev.map(a => a.platform === p ? { ...a, shopStatus: 'ACTIVE' } : a));
            setLastCommand(`SHOP_APPROVED_${p.toUpperCase()}`);
          }, 5000);
        }}
        onToggleAutoEngage={(p) => {
           setSocialAccounts(prev => prev.map(a => a.platform === p ? { ...a, autoEngageActive: !a.autoEngageActive } : a));
           const acc = socialAccounts.find(a => a.platform === p);
           setLastCommand(acc?.autoEngageActive ? `ENGAGE_OFF_${p}` : `ENGAGE_ON_${p}`);
        }}
      />
      
      <SatelliteNode 
        isOpen={isSatelliteOpen} 
        onClose={() => setIsSatelliteOpen(false)} 
        location={systemInfo.location}
      />

      <DarkWebNode 
        isOpen={isDarkWebOpen} 
        onClose={() => setIsDarkWebOpen(false)} 
        initialQuery={darkWebQuery}
      />

      <MediaVault assets={assets} />

      <AvatarCustomizer 
        config={avatarConfig} isOpen={isCustomizerOpen} 
        onUpdate={(u) => {
            setAvatarConfig(prev => ({ ...prev, ...u }));
            if (u.voiceName && sessionState === SessionState.ACTIVE) {
                stopSession();
            }
        }} 
        onGenerate={handleGenerateAvatar} 
        isGenerating={isGeneratingAvatar} isGeneratingTheme={isGeneratingTheme} isGeneratingAccessory={isGeneratingAccessory}
        onGenerateTheme={handleGenerateTheme} onGenerateAccessory={handleGenerateAccessory}
      />

      <LiveChat messages={transcriptions} isOpen={isChatOpen} onSendMessage={(t) => {
          setTranscriptions(prev => [...prev, { text: t, role: 'user', timestamp: Date.now() }]);
          if (sessionRef.current) sessionRef.current.sendRealtimeInput({ message: { parts: [{ text: t }] } });
        }} isProcessing={isProcessing} />

      <OmniMonitor 
        stream={isScreenSharing ? screenStreamRef.current : cameraStreamRef.current}
        isOpen={isOmniMonitorOpen} facingMode={cameraFacingMode} messages={transcriptions} assets={assets} campaign={null}
        isSyncing={sessionState === SessionState.ACTIVE} systemInfo={systemInfo} isScreenSharing={isScreenSharing}
        onToggleCamera={() => setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
        onStopScreenShare={() => { if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop()); setIsScreenSharing(false); }}
      />

      <div className="relative z-20 flex flex-col items-center w-full">
         <DigitalAvatar isModelTalking={isModelTalking} isActive={sessionState === SessionState.ACTIVE} isProcessing={isProcessing || !!renderingMessage || isDiagnosticOpen} config={avatarConfig} />
         <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      </div>

      <div className="fixed bottom-6 md:bottom-10 z-30 w-[95%] max-w-5xl flex flex-col items-center gap-4">
        <VoiceWave isActive={sessionState === SessionState.ACTIVE} isModelTalking={isModelTalking} themeColor={avatarConfig.themeColor} />
        
        <div className="w-full flex items-center justify-between hud-glass p-4 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border-cyan-500/30" style={{ borderColor: `${avatarConfig.themeColor}33` }}>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={toggleIdentity} className="group flex flex-col items-center gap-1">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all overflow-hidden ${avatarConfig.identity === 'GERVIS' ? 'border-cyan-400 bg-cyan-400/10' : avatarConfig.identity === 'FRIDAY' ? 'border-orange-500 bg-orange-500/10' : 'border-indigo-500 bg-indigo-500/10'}`}>
                 <span className={`text-[10px] orbitron font-black ${avatarConfig.identity === 'GERVIS' ? 'text-cyan-400' : avatarConfig.identity === 'FRIDAY' ? 'text-orange-500' : 'text-indigo-400'}`}>{avatarConfig.identity}</span>
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">Personality</span>
            </button>
            <div className="w-px h-10 bg-slate-800 mx-2"></div>
            <button onClick={() => setIsLightMode(!isLightMode)} className="group flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isLightMode ? 'border-orange-400 bg-orange-400/20 shadow-[0_0_15px_rgba(251,146,60,0.5)]' : 'border-slate-800 hover:border-cyan-500/50'}`}>
                {isLightMode ? (
                  <svg className="h-4 h-4 md:h-5 md:w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                ) : (
                  <svg className="h-4 h-4 md:h-5 md:w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">{isLightMode ? 'Light_On' : 'Dark_Mod'}</span>
            </button>
            <button onClick={() => setIsDarkWebOpen(!isDarkWebOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isDarkWebOpen ? 'border-red-600 bg-red-600/20 shadow-[0_0_15px_#dc2626]' : 'border-slate-800 hover:border-red-900/50'}`}>
                <svg className="h-4 h-4 md:h-5 md:w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">Dark_Net</span>
            </button>
            <button onClick={() => setIsSatelliteOpen(!isSatelliteOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isSatelliteOpen ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-slate-800 hover:border-cyan-500/50'}`}>
                <svg className="h-4 h-4 md:h-5 md:w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">GPS</span>
            </button>
            <button onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isWhatsAppOpen ? 'border-green-500 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'border-slate-800 hover:border-green-500/50'}`}>
                <svg className="h-4 h-4 md:h-5 md:w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.43 1.28 4.88L1.93 22l5.24-1.37c1.39.76 2.97 1.19 4.65 1.19 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.33c-1.59 0-3.08-.43-4.37-1.18l-.31-.18-3.24.85.86-3.15-.2-.32c-.82-1.31-1.25-2.84-1.25-4.44 0-4.6 3.74-8.33 8.33-8.33 4.6 0 8.33 3.73 8.33 8.33s-3.73 8.33-8.33 8.33z"/></svg>
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">WhatsApp</span>
            </button>
            <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="group flex flex-col items-center gap-1">
              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${isSocialOpen ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-slate-800 hover:border-purple-500/50'}`}>
                <svg className="h-4 h-4 md:h-5 md:w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              </div>
              <span className="text-[5px] md:text-[6px] orbitron font-black text-slate-500 uppercase">Social</span>
            </button>
          </div>

          <button onClick={sessionState === SessionState.ACTIVE ? stopSession : startSession} className={`relative h-16 w-16 md:h-28 md:w-28 rounded-full flex items-center justify-center transition-all duration-500 ${sessionState === SessionState.ACTIVE ? 'bg-red-500/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-cyan-400/5 border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.4)]'}`} style={{ borderColor: sessionState === SessionState.ACTIVE ? '#ef4444' : avatarConfig.themeColor, color: sessionState === SessionState.ACTIVE ? '#ef4444' : avatarConfig.themeColor }}>
            <div className="absolute inset-0 rounded-full border border-current opacity-20 animate-ping"></div>
            {sessionState === SessionState.ACTIVE ? <svg className="h-8 w-8 md:h-10 md:w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" /></svg> : <svg className="h-8 w-8 md:h-10 md:w-10" style={{ color: avatarConfig.themeColor }} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></svg>}
          </button>

          <div className="flex flex-col gap-1 items-end">
            <div className="text-[8px] orbitron font-black uppercase tracking-widest" style={{ color: avatarConfig.themeColor }}>Protocol_{avatarConfig.identity === 'GERVIS' ? 'X' : avatarConfig.identity === 'FRIDAY' ? 'F' : 'A'}</div>
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${sessionState === SessionState.ACTIVE ? 'bg-green-400 animate-pulse' : 'bg-slate-700'}`}></div>
          </div>
        </div>
      </div>

      <MediaVault assets={assets} />
    </div>
  );
};

export default App;
