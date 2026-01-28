
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
  externalComments?: AutoComment[];
}

const PlatformIcon: React.FC<{ platform: string, className?: string, useColor?: boolean }> = ({ platform, className = "w-5 h-5", useColor = false }) => {
  const getColors = () => {
    switch (platform) {
      case 'INSTAGRAM': return { stroke: "#E4405F", fill: "#E4405F" };
      case 'META': return { stroke: "#0668E1", fill: "#0668E1" };
      case 'TWITTER':
      case 'X': return { stroke: "#1DA1F2", fill: "#1DA1F2" };
      case 'TIKTOK': return { stroke: "#EE1D52", fill: "#EE1D52" };
      default: return { stroke: "currentColor", fill: "currentColor" };
    }
  };

  const colors = getColors();

  switch (platform) {
    case 'INSTAGRAM':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={useColor ? colors.stroke : "currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'META':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? colors.fill : "currentColor"} className={className}>
          <path d="M18.121 8.94c-1.332-1.331-2.906-1.996-4.721-1.996-1.815 0-3.389.665-4.721 1.996L3.921 13.62c-1.332 1.331-1.998 2.905-1.998 4.72 0 1.815.666 3.389 1.998 4.72 1.332 1.331 2.906 1.996 4.721 1.996 1.815 0 3.389-.665 4.721-1.996l1.248-1.248 1.248 1.248c1.332 1.331 2.906 1.996 4.721 1.996 1.815 0 3.389-.665 4.721-1.996 1.332-1.331 1.998-2.905 1.998-4.72 0-1.815-.666-3.389-1.998-4.72L18.121 8.94zm-12.2 9.4c-.815 0-1.489-.274-2.021-.822-.533-.548-.799-1.222-.799-2.02 0-.799.266-1.472.799-2.02.532-.549 1.206-.823 2.021-.823s1.489.274 2.021.823l4.758 4.758c-.532.548-1.206.822-2.021.822h-4.758zm12.2 0h-4.758c-.815 0-1.489-.274-2.021-.822L16.1 12.76c.532-.549 1.206-.823 2.021-.823.815 0 1.489.274 2.021.823.533.548.799 1.221.799 2.02 0 .798-.266 1.472-.799 2.02-.532.548-1.206.822-2.021.822z"/>
        </svg>
      );
    case 'TWITTER':
    case 'X':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? colors.fill : "currentColor"} className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.134l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'TIKTOK':
      return (
        <svg viewBox="0 0 24 24" fill={useColor ? colors.fill : "currentColor"} className={className}>
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V15.5c0 1.28-.18 2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-1.3 0-2.6-.4-3.7-1.13-1.09-.73-1.94-1.76-2.48-2.92-.54-1.17-.72-2.47-.72-3.75 0-1.28.18-2.58.72-3.75.54-1.16 1.39-2.19 2.48-2.92 1.09-.73 2.39-1.13 3.7-1.13 1.3 0 2.6.4 3.7 1.13 1.09.73 1.94 1.76 2.48 2.92.54 1.17.72 2.47.72 3.75 0 1.28-.18-2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-.41 0-.82.04 1.23.13V4.03c-1.23.13-2.43.51-3.52 1.11C5.64 5.92 4.8 7.07 4.29 8.35c-.51 1.28-.68 2.68-.68 4.07s.17 2.79.68 4.07c.51 1.28 1.35 2.43 2.44 3.23 1.09.8 2.39 1.26 3.74 1.26 1.35 0 2.65-.46 3.74-1.26 1.09-.8 1.93-1.95 2.44-3.23.51-1.28.68-2.68.68-4.07V.02z"/>
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
  isOpen, onClose, accounts, onConnect, onApplyShop, onToggleAutoEngage, externalComments = []
}) => {
  const [activeTab, setActiveTab] = useState<'NEXUS' | 'STRATEGY' | 'ANALYTICS' | 'OPERATIONS'>('NEXUS');
  const [isSyncing, setIsSyncing] = useState(false);
  const [internalComments, setInternalComments] = useState<AutoComment[]>([]);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // Strategy State
  const [brandContext, setBrandContext] = useState('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedSlogan, setGeneratedSlogan] = useState('');
  const [generatedVoice, setGeneratedVoice] = useState('');
  const [generatedAudience, setGeneratedAudience] = useState('');
  const [generatedPillars, setGeneratedPillars] = useState('');
  const [generatedVisuals, setGeneratedVisuals] = useState('');

  const allComments = [...externalComments, ...internalComments].sort((a, b) => b.timestamp - a.timestamp);

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

        setInternalComments(prev => [newComment, ...prev].slice(0, 10));
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

  if (!isOpen) return null;

  const linkedAccounts = accounts.filter(a => a.isConnected);
  const unlinkedAccounts = accounts.filter(a => !a.isConnected);

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
             <button onClick={onClose} className="w-14 h-14 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-400 transition-all duration-500 shadow-xl group">
               <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
             </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* TACTICAL SIDEBAR */}
          <div className="w-80 border-r border-slate-200 dark:border-purple-500/10 flex flex-col bg-slate-100/50 dark:bg-black/30 z-20 overflow-y-auto premium-scroll p-8 gap-10">
             <div className="flex flex-col gap-6">
                <span className="text-[10px] orbitron font-black text-slate-500 dark:text-purple-400 uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                   Switchboard
                </span>
                <div className="flex flex-col gap-4">
                  {accounts.map(acc => (
                    <button 
                      key={acc.platform}
                      onClick={() => setHoveredPlatform(acc.platform)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${acc.isConnected ? 'border-purple-500/30 bg-purple-500/5 text-purple-600' : 'border-slate-200 dark:border-white/5 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={acc.platform} className="w-4 h-4" useColor={acc.isConnected} />
                        <span className="text-[10px] orbitron font-bold">{acc.platform}</span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${acc.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`}></div>
                    </button>
                  ))}
                </div>
             </div>

             <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -translate-y-1/2 translate-x-1/2 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 space-y-4">
                  <span className="text-[9px] orbitron font-black uppercase tracking-widest opacity-80 italic">Global_Status</span>
                  <div className="text-3xl font-mono font-black tracking-tighter">99.9%</div>
                  <p className="text-[8px] orbitron uppercase font-bold opacity-60 leading-relaxed">System Integrity Verified via Neural Link Tehran</p>
                </div>
             </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="flex-1 p-16 overflow-y-auto premium-scroll bg-slate-50 dark:bg-slate-950">
            {activeTab === 'NEXUS' && (
              <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="flex justify-between items-end">
                   <div className="flex flex-col gap-3">
                      <h3 className="text-4xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Identity_Nexus</h3>
                      <p className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.5em] italic">Active Intelligence Node Stream</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] orbitron font-black text-emerald-500 uppercase">Secure_Link</div>
                      <div className="px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] orbitron font-black text-purple-500 uppercase">Multi-Platform</div>
                   </div>
                </div>

                {/* ACTIVE ACCOUNTS SECTION */}
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[12px] orbitron font-black text-purple-500 uppercase tracking-[0.4em] italic opacity-80">01_Active_Intelligence</span>
                    <div className="flex-1 h-px bg-purple-500/10"></div>
                  </div>
                  
                  {linkedAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      {linkedAccounts.map(acc => (
                        <div key={acc.platform} className="hud-glass p-10 rounded-[4rem] bg-white dark:bg-purple-950/20 border-2 border-purple-500/10 hover:border-purple-500/40 transition-all duration-700 group relative overflow-hidden flex flex-col gap-8 shadow-xl">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-1000 group-hover:rotate-6">
                            <PlatformIcon platform={acc.platform} className="w-48 h-48" />
                          </div>

                          <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-purple-500/20 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                <PlatformIcon platform={acc.platform} className="w-10 h-10" useColor={true} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{acc.platform}</span>
                                <span className="text-[12px] font-mono text-purple-500 font-bold tracking-tight">{acc.handle}</span>
                              </div>
                            </div>
                            <div className="px-4 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[8px] orbitron font-black text-emerald-500 uppercase tracking-widest">UPLINK_STABLE</div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 relative z-10">
                            {[
                              { l: 'FOLLOWERS', v: acc.followers, c: 'text-slate-900 dark:text-white' },
                              { l: 'ENGAGEMENT', v: acc.engagementRate, c: 'text-purple-600' },
                              { l: 'GROWTH', v: acc.growth, c: 'text-emerald-500' }
                            ].map((m, i) => (
                              <div key={i} className="bg-slate-50/50 dark:bg-black/60 p-5 rounded-[2.2rem] border border-slate-200/50 dark:border-white/5 flex flex-col gap-1 transition-all group-hover:border-purple-500/20">
                                <span className="text-[8px] orbitron text-slate-400 font-black uppercase tracking-widest">{m.l}</span>
                                <span className={`text-xl orbitron font-black tracking-tighter ${m.c}`}>{m.v}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-purple-500/10 relative z-10">
                            <div className="flex gap-4">
                               <button 
                                onClick={() => onToggleAutoEngage(acc.platform)}
                                className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl border-2 transition-all duration-500 ${acc.autoEngageActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_#10b98166]' : 'bg-slate-100 dark:bg-transparent border-slate-200 dark:border-purple-500/20 text-slate-500 hover:border-emerald-500/40'}`}
                               >
                                  <div className={`w-2 h-2 rounded-full ${acc.autoEngageActive ? 'bg-white animate-pulse' : 'bg-slate-400'}`}></div>
                                  <span className="text-[9px] orbitron font-black uppercase tracking-widest">{acc.autoEngageActive ? 'AUTOPILOT_ON' : 'MANUAL_MODE'}</span>
                               </button>
                               <button 
                                onClick={() => onApplyShop(acc.platform)}
                                className={`px-6 py-2.5 rounded-2xl border-2 transition-all duration-500 ${acc.shopStatus === 'ACTIVE' ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_20px_#2563eb66]' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:border-blue-500/40'}`}
                               >
                                  <span className="text-[9px] orbitron font-black uppercase tracking-widest">SHOP_{acc.shopStatus}</span>
                               </button>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-purple-500 hover:scale-110 transition-all">
                               <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="hud-glass p-20 rounded-[5rem] flex flex-col items-center justify-center gap-8 bg-white/50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-purple-500/20 opacity-40 grayscale">
                       <div className="w-24 h-24 rounded-full border-4 border-slate-300 dark:border-purple-500/20 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                       </div>
                       <span className="text-xl orbitron font-black text-slate-500 uppercase tracking-[1em] italic">No_Linked_Nodes</span>
                    </div>
                  )}
                </div>

                {/* UNLINKED ACCOUNTS SECTION */}
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[12px] orbitron font-black text-slate-400 uppercase tracking-[0.4em] italic opacity-60">02_Available_Provisioning</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/5"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {unlinkedAccounts.map(acc => (
                      <button 
                        key={acc.platform}
                        onClick={() => onConnect(acc.platform)}
                        className="group hud-glass p-8 rounded-[3rem] bg-white/40 dark:bg-black/30 border-2 border-slate-100 dark:border-white/5 hover:border-purple-500/30 transition-all duration-500 flex flex-col items-center gap-6 shadow-md hover:shadow-2xl hover:scale-[1.02]"
                      >
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-white/10 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-500">
                           <PlatformIcon platform={acc.platform} className="w-7 h-7 text-slate-300 dark:text-slate-700 group-hover:text-purple-500 transition-colors" />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-base orbitron font-black text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase italic">{acc.platform}</span>
                          <p className="text-[7px] orbitron font-bold text-slate-300 dark:text-slate-800 tracking-widest group-hover:text-purple-400 transition-colors uppercase">Provision_Link</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                           <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M12 5v14M5 12h14"/></svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'OPERATIONS' && (
              <div className="flex flex-col gap-16 animate-in slide-in-from-right-10 duration-1000 h-full">
                 <div className="flex items-center justify-between">
                    <h3 className="text-4xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Autonomous_Node_Alpha</h3>
                    <div className="flex items-center gap-4 bg-purple-600/10 px-6 py-3 rounded-full border border-purple-500/20 animate-pulse">
                       <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                       <span className="text-[10px] orbitron font-black text-purple-400 uppercase tracking-widest">VOICE_COMMAND_LINK_STABLE</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 h-full pb-20">
                    <div className="lg:col-span-4 flex flex-col gap-10">
                       <div className="hud-glass p-12 rounded-[4.5rem] bg-white dark:bg-purple-950/10 border-2 border-purple-500/20 relative overflow-hidden group shadow-2xl backdrop-blur-xl">
                          <h4 className="text-2xl orbitron font-black text-slate-900 dark:text-white italic mb-6">Tactical_Intelligence</h4>
                          <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-purple-500 rounded-full opacity-40"></div>
                            <p className="text-[13px] font-mono text-slate-500 dark:text-purple-300 leading-relaxed italic opacity-80 mb-8 pl-4">
                              "Gervis: Sir, I am primed for autonomous engagement. Your voice is the catalyst. Direct me to target profiles for high-precision outreach."
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex flex-col gap-1 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                <span className="text-[8px] orbitron text-emerald-500 font-black uppercase tracking-widest">Sensory_Input</span>
                                <span className="text-lg orbitron font-black text-emerald-600 dark:text-emerald-400">HIGH_RES</span>
                             </div>
                             <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-[2.5rem] flex flex-col gap-1 shadow-inner group-hover:scale-105 transition-transform duration-500 delay-75">
                                <span className="text-[8px] orbitron text-purple-500 font-black uppercase tracking-widest">Bot_State</span>
                                <span className="text-lg orbitron font-black text-purple-600 dark:text-purple-400 tracking-tighter">OPERATIONAL</span>
                             </div>
                          </div>
                       </div>

                       <div className="p-10 rounded-[3.5rem] bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-inner">
                          <span className="text-[10px] orbitron font-black text-slate-400 uppercase tracking-[0.5em] mb-4 block italic">Neural_Processing</span>
                          <div className="space-y-4">
                             <div className="flex justify-between text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                                <span>Core_Latency</span>
                                <span className="text-emerald-500">4.2ms</span>
                             </div>
                             <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[94%] shadow-[0_0_10px_#10b981]"></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-8 hud-glass rounded-[5rem] flex flex-col overflow-hidden bg-white/60 dark:bg-black/70 relative border-2 border-slate-200 dark:border-purple-500/10 shadow-2xl backdrop-blur-3xl">
                       <div className="h-24 bg-slate-200/40 dark:bg-purple-950/20 flex items-center justify-between px-14 border-b border-slate-200 dark:border-purple-500/10 shadow-sm relative z-10">
                          <div className="flex flex-col">
                             <span className="text-[14px] orbitron font-black text-slate-900 dark:text-purple-400 uppercase tracking-[0.6em] italic">INTERCEPT_STREAM</span>
                             <span className="text-[8px] orbitron font-bold text-slate-400 uppercase tracking-widest">Direct Social Uplink // Secure Tehran Hub</span>
                          </div>
                          <div className="flex gap-4">
                             <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
                             <span className="text-[10px] orbitron text-emerald-500 font-black uppercase">LIVE_FEED</span>
                          </div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-12 space-y-8 premium-scroll mask-fade-top relative z-0">
                          {allComments.map(comment => (
                            <div key={comment.id} className="hud-glass p-10 rounded-[3.5rem] bg-white dark:bg-slate-900/60 border-slate-100 dark:border-purple-500/20 hover:border-purple-500/50 transition-all duration-500 group shadow-lg hover:shadow-2xl">
                               <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-6">
                                     <div className={`px-5 py-2 rounded-2xl text-[10px] orbitron font-black transition-all duration-500 shadow-sm border border-black/5 ${comment.platform === 'INSTAGRAM' ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                        {comment.platform}
                                     </div>
                                     <span className="text-lg orbitron font-black text-slate-800 dark:text-white uppercase italic tracking-tighter group-hover:text-purple-500 transition-colors duration-500">{comment.targetUser}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 font-black opacity-60 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit'})}</span>
                               </div>
                               <p className="text-[16px] font-mono text-slate-700 dark:text-slate-200 leading-[1.8] italic whitespace-pre-wrap pl-2 italic">"{comment.content}"</p>
                               <div className="mt-8 flex items-center justify-between opacity-0 group-hover:opacity-60 transition-all duration-700 transform translate-y-2 group-hover:translate-y-0">
                                  <span className="text-[9px] orbitron font-black text-purple-600 uppercase tracking-widest italic">Protocol: VOICE_AUTHORIZED_OUTREACH</span>
                                  <div className="px-5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] orbitron text-emerald-500 font-black">EXECUTED</div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* ANALYTICS & STRATEGY TABS RETAINED WITH VISUAL REFINEMENTS... */}
            {activeTab === 'ANALYTICS' && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <div className="flex flex-col gap-10">
                   <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] italic">Intelligence_Telemetry_Core</h3>
                   <div className="hud-glass p-12 rounded-[5rem] bg-white/60 dark:bg-black/50 border-2 border-slate-100 dark:border-purple-500/10 shadow-2xl">
                     <FollowerLineChart accounts={accounts} />
                   </div>
                </div>
              </div>
            )}
            {activeTab === 'STRATEGY' && (
               <div className="animate-in fade-in duration-1000 h-full flex flex-col gap-12">
                  <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-[0.2em]">Neural_Brand_Architect</h3>
                  <div className="hud-glass p-12 rounded-[4rem] bg-white/40 dark:bg-purple-950/20 border-2 border-purple-500/10 shadow-2xl flex flex-col gap-10">
                    <textarea 
                      value={brandContext} 
                      onChange={e => setBrandContext(e.target.value)}
                      placeholder="Sir, please input your brand's mission vision or strategic core concepts for analysis..."
                      className="w-full h-52 bg-slate-100/50 dark:bg-black/60 border-2 border-slate-200 dark:border-purple-500/20 rounded-[3rem] p-10 text-[16px] text-slate-800 dark:text-white outline-none focus:border-purple-500 transition-all font-mono italic leading-relaxed placeholder:text-slate-400"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                       {['SLOGAN', 'VOICE', 'AUDIENCE', 'PILLARS'].map(t => (
                         <button 
                          key={t} 
                          onClick={() => handleGenerateStrategy(t as any)} 
                          disabled={isGeneratingStrategy || !brandContext}
                          className="py-6 rounded-[2rem] border-2 border-purple-500/20 text-purple-600 dark:text-purple-400 orbitron font-black text-[11px] hover:bg-purple-600 hover:text-white hover:scale-[1.03] transition-all uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-40"
                         >
                           {isGeneratingStrategy ? 'SYNTHESIZING...' : t}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* DISPLAY RESULTS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
                    {generatedSlogan && (
                       <div className="hud-glass p-10 rounded-[3.5rem] bg-emerald-500/5 border-emerald-500/20 flex flex-col gap-4 animate-in slide-in-from-top-4">
                          <span className="text-[10px] orbitron font-black text-emerald-500 uppercase tracking-widest italic">Synthesized_Slogans</span>
                          <p className="text-[14px] font-mono text-slate-700 dark:text-emerald-100 leading-relaxed italic whitespace-pre-wrap">"{generatedSlogan}"</p>
                       </div>
                    )}
                    {generatedVoice && (
                       <div className="hud-glass p-10 rounded-[3.5rem] bg-blue-500/5 border-blue-500/20 flex flex-col gap-4 animate-in slide-in-from-top-4 delay-75">
                          <span className="text-[10px] orbitron font-black text-blue-500 uppercase tracking-widest italic">Vocal_DNA_Signature</span>
                          <p className="text-[14px] font-mono text-slate-700 dark:text-blue-100 leading-relaxed italic whitespace-pre-wrap">"{generatedVoice}"</p>
                       </div>
                    )}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.mask-fade-top { mask-image: linear-gradient(to bottom, transparent, black 15%); }` }} />
    </div>
  );
};
