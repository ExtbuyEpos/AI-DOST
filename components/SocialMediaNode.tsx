
import React, { useState, useEffect, useRef } from 'react';
import { SocialAccount, AutoComment } from '../types';
import { GoogleGenAI } from "@google/genai";

interface SocialMediaNodeProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  onConnect: (platform: string) => void;
  onApplyShop: (platform: string) => void;
  onToggleAutoEngage: (platform: string) => void;
}

const PlatformIcon: React.FC<{ platform: string, className?: string, useColor?: boolean }> = ({ platform, className = "w-5 h-5", useColor = false }) => {
  switch (platform) {
    case 'INSTAGRAM':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={useColor ? "#E4405F" : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'META':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? "#0668E1" : "currentColor"} className={className}>
          <path d="M18.121 8.94c-1.332-1.331-2.906-1.996-4.721-1.996-1.815 0-3.389.665-4.721 1.996L3.921 13.62c-1.332 1.331-1.998 2.905-1.998 4.72 0 1.815.666 3.389 1.998 4.72 1.332 1.331 2.906 1.996 4.721 1.996 1.815 0 3.389-.665 4.721-1.996l1.248-1.248 1.248 1.248c1.332 1.331 2.906 1.996 4.721 1.996 1.815 0 3.389-.665 4.721-1.996 1.332-1.331 1.998-2.905 1.998-4.72 0-1.815-.666-3.389-1.998-4.72L18.121 8.94zm-12.2 9.4c-.815 0-1.489-.274-2.021-.822-.533-.548-.799-1.222-.799-2.02 0-.799.266-1.472.799-2.02.532-.549 1.206-.823 2.021-.823s1.489.274 2.021.823l4.758 4.758c-.532.548-1.206.822-2.021.822h-4.758zm12.2 0h-4.758c-.815 0-1.489-.274-2.021-.822L16.1 12.76c.532-.549 1.206-.823 2.021-.823.815 0 1.489.274 2.021.823.533.548.799 1.221.799 2.02 0 .798-.266 1.472-.799 2.02-.532.548-1.206.822-2.021.822z"/>
        </svg>
      );
    case 'TWITTER':
    case 'X':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? "#1DA1F2" : "currentColor"} className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.134l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'TIKTOK':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? "#EE1D52" : "currentColor"} className={className}>
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V15.5c0 1.28-.18 2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-1.3 0-2.6-.4-3.7-1.13-1.09-.73-1.94-1.76-2.48-2.92-.54-1.17-.72-2.47-.72-3.75 0-1.28.18-2.58.72-3.75.54-1.16 1.39-2.19 2.48-2.92 1.09-.73 2.39-1.13 3.7-1.13 1.3 0 2.6.4 3.7 1.13 1.09.73 1.94 1.76 2.48 2.92.54 1.17.72 2.47.72 3.75 0 1.28-.18 2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-.41 0-.82.04 1.23.13V4.03c-1.23.13-2.43.51-3.52 1.11C5.64 5.92 4.8 7.07 4.29 8.35c-.51 1.28-.68 2.68-.68 4.07s.17 2.79.68 4.07c.51 1.28 1.35 2.43 2.44 3.23 1.09.8 2.39 1.26 3.74 1.26 1.35 0 2.65-.46 3.74-1.26 1.09-.8 1.93-1.95 2.44-3.23.51-1.28.68-2.68.68-4.07V.02z"/>
        </svg>
      );
    default:
      return null;
  }
};

const FollowerLineChart: React.FC<{ accounts: SocialAccount[] }> = ({ accounts }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const connectedAccounts = accounts.filter(a => a.isConnected);

  useEffect(() => {
    if (!canvasRef.current || connectedAccounts.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLightMode = document.body.classList.contains('light-theme');
    const gridColor = isLightMode ? 'rgba(15, 23, 42, 0.05)' : 'rgba(168, 85, 247, 0.05)';
    const textColor = isLightMode ? '#64748b' : 'rgba(168, 85, 247, 0.4)';

    const days = 30;
    const chartData = connectedAccounts.map(acc => {
      const baseFollowers = parseInt(acc.followers.replace(/[^0-9]/g, '')) || 100;
      const points = Array.from({ length: days }, (_, i) => {
        const growthFactor = 1 + (i / days) * 0.15;
        const noise = (Math.sin(i * 0.5) + Math.cos(i * 0.8)) * 2;
        return baseFollowers * growthFactor + noise;
      });
      
      const color = acc.platform === 'INSTAGRAM' ? '#ec4899' : 
                    acc.platform === 'META' ? '#3b82f6' : 
                    acc.platform === 'TWITTER' ? (isLightMode ? '#0ea5e9' : '#38bdf8') : '#a855f7';
      
      return { platform: acc.platform, points, color };
    });

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const padding = 40;
      const chartW = w - padding * 2;
      const chartH = h - padding * 2;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const gridLines = 6;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
      }

      chartData.forEach(({ points, color }) => {
        const maxVal = Math.max(...points) * 1.1;
        const minVal = Math.min(...points) * 0.9;
        const range = maxVal - minVal;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = isLightMode ? 2 : 3;
        if (!isLightMode) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
        }

        points.forEach((p, i) => {
          const x = padding + (i / (days - 1)) * chartW;
          const y = padding + chartH - ((p - minVal) / range) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.lineTo(padding + chartW, padding + chartH);
        ctx.lineTo(padding, padding + chartH);
        ctx.closePath();
        
        const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
        const grad = ctx.createLinearGradient(0, padding, 0, padding + chartH);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      ctx.fillStyle = textColor;
      ctx.font = 'bold 8px Orbitron';
      ctx.fillText('30_DAY_GROWTH_HISTORY', padding, padding - 10);
      ctx.fillText('NOW', padding + chartW - 20, padding + chartH + 20);
      ctx.fillText('T-30D', padding, padding + chartH + 20);
    };

    render();
  }, [connectedAccounts]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} width={800} height={300} className="w-full h-full" />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         {connectedAccounts.map(acc => (
           <div key={acc.platform} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.platform === 'INSTAGRAM' ? '#ec4899' : acc.platform === 'META' ? '#3b82f6' : acc.platform === 'TWITTER' ? '#38bdf8' : '#a855f7' }}></div>
              <span className="text-[7px] orbitron text-slate-500 font-black uppercase">{acc.platform}</span>
           </div>
         ))}
      </div>
    </div>
  );
};

export const SocialMediaNode: React.FC<SocialMediaNodeProps> = ({ 
  isOpen, onClose, accounts, onConnect, onApplyShop, onToggleAutoEngage 
}) => {
  const [activeTab, setActiveTab] = useState<'NEXUS' | 'STRATEGY' | 'ANALYTICS' | 'OPERATIONS'>('NEXUS');
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveComments, setLiveComments] = useState<AutoComment[]>([]);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // Strategy State
  const [brandContext, setBrandContext] = useState('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedSlogan, setGeneratedSlogan] = useState('');
  const [generatedVoice, setGeneratedVoice] = useState('');
  const [generatedAudience, setGeneratedAudience] = useState('');
  const [generatedPillars, setGeneratedPillars] = useState('');
  const [generatedVisuals, setGeneratedVisuals] = useState('');

  useEffect(() => {
    if (activeTab === 'OPERATIONS' && accounts.some(a => a.autoEngageActive)) {
      const interval = setInterval(() => {
        const platforms: ('INSTAGRAM' | 'META' | 'TWITTER')[] = ['INSTAGRAM', 'META', 'TWITTER'];
        const targets = ['@elonmusk', '@zuck', '@garyvee', '@starkindustries', '@nasa'];
        const contents = [
          "This branding strategy is revolutionary! 🚀",
          "Exactly what the market needs right now. Absolute game changer.",
          "Our AI agents agree with this sentiment. Looking forward to the collab!",
          "High-value content as always. The growth trajectory here is insane.",
          "Analyzing these metrics... pure innovation. Well done!"
        ];

        const newComment: AutoComment = {
          id: Math.random().toString(36).substr(2, 9),
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          targetUser: targets[Math.floor(Math.random() * targets.length)],
          content: contents[Math.floor(Math.random() * contents.length)],
          sentiment: 'POSITIVE',
          timestamp: Date.now()
        };

        setLiveComments(prev => [newComment, ...prev].slice(0, 10));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, accounts]);

  const handleGenerateStrategy = async (type: 'SLOGAN' | 'VOICE' | 'AUDIENCE' | 'PILLARS' | 'VISUALS') => {
    if (!brandContext.trim()) return;
    setIsGeneratingStrategy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const connected = accounts.filter(a => a.isConnected).map(a => `${a.platform} (${a.handle})`).join(', ');
      let contextPrefix = `As Gervis AI, analyze the brand concept: "${brandContext}".`;
      if (connected) {
        contextPrefix += ` Integrate the existing digital footprint from connected accounts: ${connected}.`;
      }

      let prompt = '';
      if (type === 'SLOGAN') prompt = `${contextPrefix} Generate 3 powerful, futuristic, and catchy brand slogans for this specific digital ecosystem. Return as a short list.`;
      if (type === 'VOICE') prompt = `${contextPrefix} Define a detailed AI brand voice guideline (tone, style, vocabulary) tailored for the identified platforms.`;
      if (type === 'AUDIENCE') prompt = `${contextPrefix} Synthesize a detailed target audience profile including demographics, psychographics, and platform-specific behaviors.`;
      if (type === 'PILLARS') prompt = `${contextPrefix} Identify 3-4 core content pillars that will drive growth and brand authority in this niche.`;
      if (type === 'VISUALS') prompt = `${contextPrefix} Suggest a futuristic visual identity including a 3-color hex palette and a creative logo concept text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const result = response.text || 'Synthesis failed. Neural link timeout.';
      if (type === 'SLOGAN') setGeneratedSlogan(result);
      if (type === 'VOICE') setGeneratedVoice(result);
      if (type === 'AUDIENCE') setGeneratedAudience(result);
      if (type === 'PILLARS') setGeneratedPillars(result);
      if (type === 'VISUALS') setGeneratedVisuals(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const startSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 md:p-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[20px] pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-purple-500/40 rounded-[4rem] overflow-hidden shadow-[0_0_200px_rgba(168,85,247,0.15)] pointer-events-auto flex flex-col animate-in zoom-in duration-500">
        
        {/* TOP COMMAND BAR */}
        <div className="h-28 bg-white/40 dark:bg-black/40 backdrop-blur-xl flex items-center justify-between px-14 border-b border-slate-200 dark:border-purple-500/20 z-30">
          <div className="flex items-center gap-14">
            <div className="flex items-center gap-6 group cursor-default">
              <div className="relative">
                <div className="w-5 h-5 bg-purple-500 rounded-full animate-ping opacity-40"></div>
                <div className="absolute inset-0 w-5 h-5 bg-purple-500 rounded-full shadow-[0_0_25px_#a855f7]"></div>
                <div className="absolute inset-0 w-5 h-5 border-2 border-white/20 rounded-full scale-150 animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[14px] orbitron font-black text-slate-900 dark:text-white tracking-[0.6em] uppercase italic group-hover:text-purple-400 transition-all duration-500">OMNI_BRAND_NEXUS</h2>
                <span className="text-[9px] orbitron text-slate-400 dark:text-purple-800 font-black uppercase tracking-widest">Identity Mapping // Sector Tehran</span>
              </div>
            </div>

            <div className="h-16 flex bg-slate-100/90 dark:bg-slate-900/70 p-2.5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner backdrop-blur-md">
              {(['NEXUS', 'ANALYTICS', 'STRATEGY', 'OPERATIONS'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 rounded-2xl text-[10px] orbitron font-black transition-all duration-500 relative overflow-hidden group ${activeTab === tab ? 'bg-purple-600 text-white shadow-[0_0_40px_rgba(168,85,247,0.5)] scale-105' : 'text-slate-500 hover:text-purple-400'}`}
                >
                  <span className="relative z-10">{tab}</span>
                  {activeTab === tab && <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="hidden lg:flex flex-col items-end mr-8 border-r border-slate-200 dark:border-white/10 pr-8">
                <span className="text-[9px] orbitron font-black text-purple-500 tracking-widest">NODE_INTEGRITY</span>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[12px] font-mono text-emerald-500 font-black">99.9%_SYNC</span>
                </div>
             </div>
             <button onClick={onClose} className="w-14 h-14 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-all duration-500 shadow-xl group">
               <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* TACTICAL SIDEBAR WITH INTEGRATED TOGGLES */}
          <div className="w-80 border-r border-slate-200 dark:border-purple-500/10 flex flex-col bg-slate-100/50 dark:bg-black/30 z-20">
             <div className="p-6 flex flex-col gap-10 h-full overflow-y-auto premium-scroll">
                
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <span className="text-[11px] orbitron font-black text-slate-500 dark:text-purple-400 uppercase tracking-[0.3em] flex items-center gap-3">
                         <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 animate-[spin_4s_linear_infinite]"></div>
                         Identity_Slots
                      </span>
                      <div className="px-2 py-0.5 bg-purple-500/10 rounded text-[7px] orbitron font-black text-purple-600 border border-purple-500/20">AUTO</div>
                   </div>

                   <div className="flex flex-col gap-5">
                      {accounts.map(acc => (
                        <div key={acc.platform} className={`group flex flex-col p-4 rounded-[1.8rem] border-2 transition-all duration-500 gap-4 shadow-sm hover:shadow-lg ${acc.isConnected ? 'border-purple-500/30 bg-white dark:bg-purple-500/10' : 'border-slate-200 dark:border-white/5 opacity-40 grayscale scale-95 hover:opacity-60'}`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl border-2 transition-all duration-700 ${acc.isConnected ? 'bg-purple-500/20 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-100 border-slate-200 dark:bg-black dark:border-white/10'}`}>
                                    <PlatformIcon platform={acc.platform} className="w-4 h-4" useColor={acc.isConnected} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[11px] orbitron font-black tracking-tight ${acc.isConnected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{acc.platform}</span>
                                    <span className="text-[7px] orbitron font-bold text-slate-400 dark:text-purple-900/60 uppercase tracking-widest italic">{acc.isConnected ? 'LINKED_V01' : 'UPLINK_REQ'}</span>
                                </div>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${acc.isConnected ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'}`}></div>
                           </div>

                           {acc.isConnected && (
                             <div className="flex items-center justify-between pt-3 border-t border-purple-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-[7px] orbitron font-black text-slate-400 dark:text-purple-400 uppercase tracking-widest">BOT_AUTO_PILOT</span>
                                   <span className={`text-[8px] font-mono font-black ${acc.autoEngageActive ? 'text-emerald-500' : 'text-slate-500'}`}>{acc.autoEngageActive ? 'ENABLED' : 'PASSIVE'}</span>
                                </div>
                                <button 
                                  onClick={() => onToggleAutoEngage(acc.platform)}
                                  className={`w-10 h-5 rounded-full relative transition-all duration-500 border-2 ${acc.autoEngageActive ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-200 dark:bg-black/40 border-slate-300 dark:border-white/10'}`}
                                >
                                   <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-500 ${acc.autoEngageActive ? 'right-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'left-0.5 bg-slate-500'}`}></div>
                                </button>
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-auto space-y-6">
                   <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 backdrop-blur-sm relative overflow-hidden group/intel">
                      <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 -translate-y-1/2 translate-x-1/2 rounded-full blur-xl group-hover/intel:bg-purple-500/20 transition-all duration-1000"></div>
                      <p className="text-[10px] font-mono text-purple-700 dark:text-purple-300 leading-relaxed italic">"Gervis Intelligence: High interaction detected in Sector Tehran. Recommend scaling Auto-Engage."</p>
                      <div className="flex items-center justify-between mt-4">
                         <span className="text-[8px] orbitron text-purple-900 font-black tracking-widest uppercase">NODE_INTEL_A1</span>
                         <div className="flex gap-1">
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="flex-1 p-16 overflow-y-auto premium-scroll bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.03),_transparent_40%)]">
            
            {activeTab === 'NEXUS' && (
              <div className="flex flex-col gap-14 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-5">
                      <div className="w-2.5 h-10 bg-purple-600 shadow-[0_0_20px_#a855f7] rounded-full"></div>
                      <div className="flex flex-col">
                        <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic drop-shadow-sm">Identity_Nexus_Grid</h3>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-purple-900/80 uppercase tracking-widest mt-1">Multi-Channel Authorization // Sector: Master_V4</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pb-20">
                   {accounts.map(acc => (
                     <div 
                      key={acc.platform}
                      onMouseEnter={() => setHoveredPlatform(acc.platform)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                      className={`relative group hud-glass p-10 rounded-[3.5rem] border-2 transition-all duration-700 overflow-hidden flex flex-col gap-10 ${
                        acc.isConnected 
                          ? 'border-purple-500/20 bg-white dark:bg-purple-950/20 hover:border-purple-500/60 hover:shadow-[0_0_80px_rgba(168,85,247,0.15)] hover:scale-[1.03]' 
                          : 'border-slate-200 dark:border-white/5 grayscale opacity-40 hover:opacity-70'
                      }`}
                     >
                        {/* Background Branding Decor */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-[0.08] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110">
                           <PlatformIcon platform={acc.platform} className="w-56 h-56" />
                        </div>

                        <div className="flex justify-between items-start relative z-10">
                           <div className="flex items-center gap-8">
                              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-xl border-2 ${
                                 acc.platform === 'INSTAGRAM' ? 'bg-rose-50 dark:bg-pink-500/10 border-pink-500/30 text-pink-600' : 
                                 acc.platform === 'META' ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/30 text-blue-600' : 
                                 acc.platform === 'TWITTER' ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-400/30 text-sky-400' : 
                                 'bg-purple-50 dark:bg-purple-500/10 border-purple-500/30 text-purple-600'
                              }`}>
                                 <PlatformIcon platform={acc.platform} className="w-12 h-12" useColor={acc.isConnected} />
                              </div>
                              <div className="flex flex-col gap-2">
                                 <h4 className="text-2xl orbitron font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">{acc.platform}</h4>
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${acc.isConnected ? 'bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse' : 'bg-slate-400'}`}></div>
                                    <span className={`text-[10px] orbitron font-black uppercase tracking-[0.2em] ${acc.isConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                                       {acc.isConnected ? 'CORE_AUTHORIZED' : 'UPLINK_AWAITING'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex flex-col items-end pt-2">
                              <span className="text-[9px] orbitron text-slate-400 font-bold uppercase tracking-widest mb-1 opacity-60">Identity_Handle</span>
                              <span className="text-[14px] font-mono text-slate-800 dark:text-purple-400 font-black tracking-tight">{acc.handle || 'N/A_UPLINK'}</span>
                           </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-6 relative z-10">
                           {[
                             { label: 'FOLLOWERS', val: acc.followers, sub: 'Global_Base', color: 'text-slate-900 dark:text-white' },
                             { label: 'ENGAGEMENT', val: acc.engagementRate, sub: 'Neural_Rate', color: 'text-purple-600' },
                             { label: 'GROWTH', val: acc.growth, sub: 'V4_Projection', color: 'text-emerald-500' }
                           ].map((m, i) => (
                             <div key={i} className="bg-slate-50/50 dark:bg-black/60 p-6 rounded-[2.2rem] border border-slate-200/50 dark:border-white/5 flex flex-col gap-1.5 group/metric hover:border-purple-500/40 transition-all duration-500 shadow-sm">
                                <span className="text-[9px] orbitron text-slate-500 dark:text-slate-400 font-black tracking-[0.2em] uppercase">{m.label}</span>
                                <span className={`text-2xl orbitron font-black tracking-tighter ${m.color}`}>{acc.isConnected ? m.val : '--'}</span>
                                <div className="text-[8px] orbitron font-bold text-slate-400 opacity-40 mt-1 uppercase italic tracking-widest">{m.sub}</div>
                             </div>
                           ))}
                        </div>

                        {/* Action Control Deck */}
                        <div className="flex items-center justify-between pt-10 border-t border-slate-200 dark:border-white/5 relative z-10 mt-auto">
                           <div className="flex gap-6">
                              {acc.isConnected ? (
                                <>
                                   <div className="flex flex-col gap-3">
                                      <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest opacity-60 italic">AI_AutoPilot</span>
                                      <button 
                                       onClick={() => onToggleAutoEngage(acc.platform)}
                                       className={`w-20 h-10 rounded-[1.25rem] relative transition-all duration-700 border-2 shadow-inner ${acc.autoEngageActive ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800'}`}
                                      >
                                         <div className={`absolute top-1.5 w-6 h-6 rounded-xl transition-all duration-500 shadow-xl ${acc.autoEngageActive ? 'right-1.5 bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'left-1.5 bg-slate-500'}`}></div>
                                      </button>
                                   </div>
                                   <div className="flex flex-col gap-3">
                                      <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest opacity-60 italic">Shop_Protocol</span>
                                      <button 
                                       onClick={() => onApplyShop(acc.platform)}
                                       disabled={acc.shopStatus === 'PENDING' || acc.shopStatus === 'ACTIVE'}
                                       className={`px-6 h-10 rounded-[1.25rem] text-[10px] orbitron font-black border-2 transition-all duration-500 shadow-md ${
                                          acc.shopStatus === 'ACTIVE' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 
                                          acc.shopStatus === 'PENDING' ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse' : 
                                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:scale-105'
                                       }`}
                                      >
                                         {acc.shopStatus === 'ACTIVE' ? 'SYNCHRONIZED' : acc.shopStatus === 'PENDING' ? 'PROCESSING' : 'INIT_SHOP'}
                                      </button>
                                   </div>
                                </>
                              ) : (
                                <button 
                                 onClick={() => onConnect(acc.platform)}
                                 className="px-10 py-5 bg-purple-600 text-white rounded-[1.8rem] orbitron font-black text-xs uppercase shadow-[0_10px_40px_rgba(168,85,247,0.4)] hover:scale-105 hover:bg-purple-700 transition-all flex items-center gap-4 group/btn"
                                >
                                   <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                                   ESTABLISH_UPLINK
                                </button>
                              )}
                           </div>
                           
                           {acc.isConnected && (
                             <button className="w-14 h-14 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-purple-500 hover:border-purple-500/40 transition-all duration-500 hover:scale-110 shadow-xl group/ext">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 group-hover/ext:translate-x-0.5 group-hover/ext:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                             </button>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'ANALYTICS' && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex items-center gap-6">
                   <div className="w-3 h-12 bg-purple-600 shadow-[0_0_20px_#a855f7] rounded-full"></div>
                   <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Intelligence_Telemetry</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {[
                    { label: 'NETWORK_REACH', val: '4.2M', sub: '+12.4% PERFORMANCE_UP', color: 'text-purple-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                    { label: 'BOT_PRECISION', val: '94%', sub: 'AI_REPLY_ACCURACY', color: 'text-emerald-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'EQUITY_SCORE', val: 'A+', sub: 'GLOBAL_SENTIMENT_POS', color: 'text-blue-500', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
                  ].map((stat, i) => (
                    <div key={i} className="hud-glass p-12 rounded-[4rem] flex flex-col gap-6 bg-white dark:bg-purple-950/10 group border-2 border-white dark:border-purple-500/10 hover:border-purple-500/50 transition-all duration-700 shadow-xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] orbitron text-slate-500 dark:text-purple-400 font-black uppercase tracking-[0.3em]">{stat.label}</span>
                        <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/10 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} /></svg>
                        </div>
                      </div>
                      <span className={`text-7xl orbitron font-black ${stat.color} tracking-tighter group-hover:translate-x-2 transition-transform duration-700`}>{stat.val}</span>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 font-black orbitron uppercase italic tracking-widest">
                         <div className="w-3 h-3 rounded-full bg-purple-500/20 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div></div>
                         {stat.sub}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hud-glass p-16 rounded-[5rem] min-h-[520px] flex flex-col gap-12 relative overflow-hidden bg-white/60 dark:bg-black/50 border-2 border-slate-100 dark:border-purple-500/10 shadow-2xl">
                   <div className="flex justify-between items-center z-10">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] italic">Omni-Channel_Performance</h3>
                        <span className="text-[11px] orbitron text-purple-600 dark:text-purple-400 font-black tracking-[0.5em] uppercase italic opacity-60">Real-Time Growth Matrix Feed</span>
                      </div>
                      <div className="flex items-center gap-10">
                         <div className="flex gap-8 bg-slate-100 dark:bg-black/60 px-10 py-5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner backdrop-blur-md">
                            <div className="flex items-center gap-4"><div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div> <span className="text-[11px] orbitron text-slate-800 dark:text-slate-300 font-black tracking-widest uppercase">ACTIVE_UPLINK</span></div>
                            <div className="w-px h-6 bg-slate-300 dark:bg-white/10"></div>
                            <span className="text-[11px] orbitron text-slate-500 font-black uppercase tracking-[0.3em]">30D_SAMPLING_WINDOW</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex-1 z-10">
                      {accounts.some(a => a.isConnected) ? (
                        <FollowerLineChart accounts={accounts} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-10 opacity-30 grayscale scale-95">
                          <div className="w-40 h-40 rounded-full border-4 border-dashed border-purple-500/30 flex items-center justify-center animate-[spin_15s_linear_infinite]">
                             <svg viewBox="0 0 24 24" className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                          </div>
                          <span className="text-2xl orbitron font-black tracking-[0.8em] uppercase text-slate-500">Awaiting Node Data...</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'STRATEGY' && (
              <div className="flex flex-col gap-14 animate-in slide-in-from-left-10 duration-1000 h-full">
                <div className="flex items-center gap-6">
                   <div className="w-3 h-12 bg-purple-600 shadow-[0_0_20px_#a855f7] rounded-full"></div>
                   <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Neural_Brand_Architect</h3>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-14 h-full pb-20">
                   <div className="xl:col-span-4 flex flex-col gap-10">
                      <div className="hud-glass p-12 rounded-[4rem] bg-white dark:bg-purple-950/20 border-2 border-purple-500/20 shadow-2xl flex flex-col gap-10 backdrop-blur-md">
                         <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[12px] orbitron font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.4em] italic opacity-80">Mission_Core_Input</span>
                               <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_purple]"></div>
                            </div>
                            <textarea 
                               value={brandContext}
                               onChange={(e) => setBrandContext(e.target.value)}
                               placeholder="Input your vision, technology core, or disruptive market goals..."
                               className="w-full h-60 bg-slate-100/80 dark:bg-black/70 border border-slate-200 dark:border-purple-500/40 rounded-[2.8rem] p-8 text-[14px] font-mono text-slate-800 dark:text-white outline-none focus:border-purple-500 focus:shadow-[0_0_30px_rgba(168,85,247,0.1)] shadow-inner transition-all duration-500 resize-none placeholder:text-slate-400 leading-relaxed"
                            />
                         </div>

                         <div className="flex flex-col gap-5">
                            {[
                              { id: 'SLOGAN', label: 'GENERATE_SLOGANS', sub: 'Neural_Synthesis' },
                              { id: 'VOICE', label: 'DEFINE_VOCAL_DNA', sub: 'Tonal_Calibration' },
                              { id: 'AUDIENCE', label: 'TARGET_DEMOGRAPHICS', sub: 'Psychographic_Mapping' },
                              { id: 'PILLARS', label: 'CORE_CONTENT_NODES', sub: 'Engagement_Growth' },
                              { id: 'VISUALS', label: 'VISUAL_DNA_RENDER', sub: 'Chroma_Synthesis' }
                            ].map(btn => (
                               <button 
                                key={btn.id}
                                onClick={() => handleGenerateStrategy(btn.id as any)}
                                disabled={isGeneratingStrategy || !brandContext}
                                className={`group py-5 px-8 rounded-[2rem] orbitron font-black text-[11px] uppercase transition-all duration-500 flex items-center justify-between shadow-lg active:scale-95 disabled:opacity-50 relative overflow-hidden ${
                                   btn.id === 'SLOGAN' 
                                     ? 'bg-purple-600 text-white shadow-purple-500/20 hover:bg-purple-700 hover:scale-[1.03]' 
                                     : 'border-2 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:scale-[1.02]'
                                }`}
                               >
                                  <div className="flex flex-col items-start relative z-10">
                                     <span>{isGeneratingStrategy ? 'SYNTHESIZING...' : btn.label}</span>
                                     <span className="text-[7px] opacity-60 tracking-[0.2em]">{btn.sub}</span>
                                  </div>
                                  <svg className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M9 5l7 7-7 7"/></svg>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto premium-scroll pr-6 pb-20">
                      {[
                        { title: 'Protocol_Slogans', val: generatedSlogan, iconColor: 'emerald' },
                        { title: 'Vocal_Signature', val: generatedVoice, iconColor: 'blue' },
                        { title: 'Growth_Foundations', val: generatedPillars, iconColor: 'orange' },
                        { title: 'Visual_Identity_Synth', val: generatedVisuals, iconColor: 'cyan' },
                        { title: 'High-Density_Targeting', val: generatedAudience, iconColor: 'purple', wide: true }
                      ].map((card, i) => (
                        <div 
                          key={i} 
                          className={`hud-glass p-12 rounded-[4.5rem] bg-white dark:bg-purple-950/20 border-purple-500/20 min-h-[280px] flex flex-col gap-8 relative group overflow-hidden transition-all duration-700 hover:border-${card.iconColor}-500/50 shadow-xl ${card.wide ? 'md:col-span-2' : ''}`}
                        >
                           <div className={`absolute top-0 left-0 w-2 h-full bg-${card.iconColor}-500 opacity-20 group-hover:opacity-60 transition-all duration-700`}></div>
                           <span className={`text-[12px] orbitron font-black text-${card.iconColor}-500 uppercase tracking-[0.4em] flex items-center gap-4 italic`}>
                              <div className={`w-3 h-3 bg-${card.iconColor}-500 rounded-full shadow-[0_0_15px_currentColor] animate-pulse`}></div>
                              {card.title}
                           </span>
                           <div className="text-[14px] font-mono text-slate-700 dark:text-slate-200 leading-[1.8] italic whitespace-pre-wrap pl-2 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                              {card.val || 'Sir, I am awaiting your mission parameters to begin synthesis...'}
                           </div>
                           <div className="mt-auto flex items-center justify-between opacity-0 group-hover:opacity-40 transition-opacity duration-700">
                              <span className="text-[8px] orbitron font-bold tracking-[0.5em] uppercase italic tracking-tighter">Gervis_Core_System_Report</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'OPERATIONS' && (
              <div className="flex flex-col gap-16 animate-in slide-in-from-right-10 duration-1000 h-full">
                 <div className="flex items-center gap-6">
                    <div className="w-3 h-12 bg-purple-600 shadow-[0_0_20px_#a855f7] rounded-full"></div>
                    <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Autonomous_Operation_Hub</h3>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 h-full pb-20">
                    <div className="flex flex-col gap-12">
                       <div className="hud-glass p-14 rounded-[5rem] flex flex-col gap-12 bg-white dark:bg-purple-950/20 border-2 border-purple-500/20 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/15 transition-all duration-1000"></div>
                          <div className="flex items-center gap-10 relative">
                             <div className="w-28 h-28 rounded-[4rem] border-2 border-purple-500/30 flex items-center justify-center bg-purple-500/10 relative overflow-hidden shadow-2xl group-hover:border-purple-400 transition-all duration-700">
                                <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
                                <svg viewBox="0 0 24 24" className="w-14 h-14 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                             </div>
                             <div className="flex flex-col gap-3">
                                <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Engagement_Bot_Alpha</h3>
                                <div className="flex items-center gap-4">
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981] animate-pulse"></div>
                                  <p className="text-[13px] orbitron text-emerald-600 font-black uppercase tracking-[0.4em] italic">Scan_Active: SECTOR_PRIME_ENGAGE</p>
                                </div>
                             </div>
                          </div>
                          
                          <div className="space-y-8">
                            <span className="text-[11px] orbitron font-black text-slate-500 dark:text-purple-400 uppercase tracking-[0.5em] italic opacity-60">Strategic Directives</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <button className="py-7 bg-purple-600 text-white orbitron font-black text-xs rounded-[2.2rem] hover:bg-purple-700 hover:scale-105 transition-all shadow-[0_15px_50px_rgba(168,85,247,0.4)] active:scale-95 flex items-center justify-center gap-4 group/btn overflow-hidden relative">
                                 <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                                 <svg className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                 DEPLOY_ENGAGEMENT
                              </button>
                              <button className="py-7 border-2 border-slate-200 dark:border-purple-500/20 text-slate-700 dark:text-purple-400 orbitron font-black text-xs rounded-[2.2rem] hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all bg-white dark:bg-transparent shadow-xl flex items-center justify-center gap-4 group/btn2">
                                 <svg className="w-6 h-6 group-hover/btn2:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                 DEEP_CRAWL_PROBE
                              </button>
                            </div>
                          </div>

                          <div className="mt-8 p-10 bg-slate-50/80 dark:bg-black/60 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-inner backdrop-blur-sm">
                             <div className="flex justify-between items-center mb-6">
                                <span className="text-[12px] orbitron font-black text-slate-500 uppercase tracking-[0.4em] italic opacity-60">Neural_Load_Telemetry</span>
                                <span className="text-[12px] font-mono text-purple-500 font-black tracking-widest uppercase italic">Node_Busy: 84.2%</span>
                             </div>
                             <div className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[84%] shadow-[0_0_25px_#a855f7]"></div>
                             </div>
                             <div className="flex justify-between mt-3 text-[8px] orbitron font-bold text-slate-400 uppercase tracking-widest opacity-40 italic">
                                <span>Core: Distributed_Processing</span>
                                <span>Target: Sector_Z_Analytics</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="hud-glass rounded-[5rem] flex flex-col overflow-hidden bg-slate-100/60 dark:bg-black/70 relative border-2 border-slate-200 dark:border-purple-500/10 shadow-2xl backdrop-blur-xl">
                       <div className="h-24 bg-slate-200/50 dark:bg-purple-950/20 flex items-center justify-between px-14 border-b border-slate-200 dark:border-purple-500/10">
                          <span className="text-[14px] orbitron font-black text-slate-900 dark:text-purple-400 uppercase tracking-[0.6em] italic">LIVE_INTERCEPT_STREAM</span>
                          <div className="flex gap-4">
                             <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                             <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse [animation-delay:0.2s]"></div>
                             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-12 space-y-8 premium-scroll mask-fade-top">
                          {liveComments.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale scale-95 gap-8">
                               <div className="w-32 h-32 border-4 border-dashed border-slate-400 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                                  <svg className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                               </div>
                               <span className="text-xl orbitron font-black uppercase tracking-[1em] italic text-slate-500">Node_Intercept_Passive</span>
                            </div>
                          )}
                          {liveComments.map(comment => (
                            <div key={comment.id} className="hud-glass p-10 rounded-[3.2rem] bg-white dark:bg-slate-900/60 border-slate-100 dark:border-purple-500/10 animate-in slide-in-from-right-10 duration-1000 shadow-xl group hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02]">
                               <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-6">
                                     <div className={`px-5 py-2 rounded-2xl text-[11px] orbitron font-black transition-all duration-500 shadow-sm border border-black/5 ${comment.platform === 'INSTAGRAM' ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                        {comment.platform}
                                     </div>
                                     <span className="text-base orbitron font-black text-slate-800 dark:text-white italic tracking-tighter group-hover:text-purple-500 transition-colors duration-500 uppercase">{comment.targetUser}</span>
                                  </div>
                                  <span className="text-[11px] font-mono text-slate-400 font-black tracking-widest opacity-60 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}</span>
                               </div>
                               <div className="relative">
                                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-purple-500/30 rounded-full group-hover:bg-purple-500 transition-all duration-700"></div>
                                  <p className="text-[15px] font-mono text-slate-700 dark:text-slate-200 leading-relaxed italic whitespace-pre-wrap pl-2 italic">"{comment.content}"</p>
                               </div>
                               <div className="mt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                     <span className="text-[10px] orbitron font-black text-purple-600 uppercase tracking-[0.3em] italic">Protocol: AUTONOMOUS_ENGAGEMENT</span>
                                  </div>
                                  <div className="px-5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                     <span className="text-[10px] orbitron font-black text-emerald-500 tracking-widest uppercase">Executed</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* HIGH-FIDELITY SYNC OVERLAY */}
        {isSyncing && (
          <div className="absolute inset-0 bg-white/99 dark:bg-black/98 backdrop-blur-[60px] z-[150] flex flex-col items-center justify-center gap-14 animate-in fade-in duration-700">
             <div className="relative w-60 h-60">
                <div className="absolute inset-0 border-[10px] border-slate-100 dark:border-purple-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-[10px] border-t-purple-600 rounded-full animate-spin shadow-[inset_0_0_20px_rgba(168,85,247,0.3)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center animate-pulse border-2 border-purple-500/20 shadow-2xl relative">
                      <PlatformIcon platform="META" className="w-16 h-16 text-purple-600" useColor={true} />
                      <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-ping"></div>
                   </div>
                </div>
             </div>
             <div className="text-center space-y-6">
                <div className="text-4xl orbitron text-slate-900 dark:text-purple-400 font-black uppercase animate-pulse tracking-[0.8em] italic drop-shadow-lg">Nexus_Identity_Sync</div>
                <div className="flex flex-col gap-4">
                   <div className="text-sm orbitron text-slate-400 font-bold uppercase tracking-[1em] italic opacity-60">Distributed Multi-Node Handshake</div>
                   <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-mono text-purple-600 animate-pulse tracking-widest font-black uppercase">Routing via: secure-nexus-node-402-Tehran</div>
                      <div className="text-[9px] font-mono text-slate-500 font-bold opacity-40 uppercase">Encryption: SHA-512 Tactical Neural</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-top {
          mask-image: linear-gradient(to bottom, transparent, black 15%);
        }
      `}} />
    </div>
  );
};
