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
  
  // Refined Strategy Result State
  const [strategyResults, setStrategyResults] = useState<{
    slogan?: string;
    voice?: string;
    audience?: string;
    roadmap?: string;
    positioning?: string;
    visuals?: string;
  }>({});

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

  const handleGenerateStrategy = async (type: keyof typeof strategyResults) => {
    if (!brandContext.trim()) return;
    setIsGeneratingStrategy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const connected = accounts.filter(a => a.isConnected).map(a => `${a.platform} (${a.handle})`).join(', ');
      let contextPrefix = `As Gervis AI (Advanced Digital Branding Architect), analyze the user-provided brand concept: "${brandContext}".`;
      if (connected) {
        contextPrefix += ` Critically integrate current footprint from connected nodes: ${connected}.`;
      }

      const prompts = {
        slogan: `${contextPrefix} Synthesize 3 high-impact, futuristic, and disruptive brand slogans. Ensure they sound like they belong to a premium global leader. Format: Bullet points.`,
        voice: `${contextPrefix} Define a unique 'Vocal Signature' (Brand Voice). Include Tone (e.g., Sophisticated/Tactical), Vocabulary nuances, and how to handle community interactions. Format: Detailed paragraph.`,
        audience: `${contextPrefix} Map the 'High-Density Target Audience'. Detail demographics (age, region), psychographics (values, motivations), and specific behavioral triggers for our connected platforms. Format: Structured list.`,
        roadmap: `${contextPrefix} Architect a '90-Day Content Roadmap'. Suggest 3 content pillars and 5 specific high-performance content ideas (hooks/formats) for immediate deployment. Format: Monthly milestones.`,
        positioning: `${contextPrefix} Calculate 'Strategic Market Positioning'. Who are the key competitors in this niche, and how does this brand conceptually disrupt them? What is the 'Unfair AI Advantage'?`,
        visuals: `${contextPrefix} Render 'Visual DNA Guidelines'. Suggest a dominant 3-color hex palette (futuristic/clean), font type characteristics, and a concept for an iconic, minimal mark.`,
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompts[type as keyof typeof prompts],
      });

      const result = response.text || 'Synthesis protocol failed. Uplink timed out.';
      setStrategyResults(prev => ({ ...prev, [type]: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingStrategy(false);
    }
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
              </div>
              <div className="flex flex-col">
                <h2 className="text-[14px] orbitron font-black text-slate-900 dark:text-white tracking-[0.6em] uppercase italic">OMNI_BRAND_NEXUS</h2>
                <span className="text-[9px] orbitron text-slate-400 dark:text-purple-800 font-black uppercase tracking-widest">Master_V4 // Neural_Orchestration</span>
              </div>
            </div>

            <div className="h-16 flex bg-slate-100/90 dark:bg-slate-900/70 p-2 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner">
              {(['NEXUS', 'ANALYTICS', 'STRATEGY', 'OPERATIONS'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 rounded-2xl text-[10px] orbitron font-black transition-all duration-500 relative overflow-hidden group ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-purple-400'}`}
                >
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={onClose} className="w-14 h-14 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-500 shadow-xl group">
             <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* TACTICAL SIDEBAR */}
          <div className="w-80 border-r border-slate-200 dark:border-purple-500/10 flex flex-col bg-slate-100/50 dark:bg-black/30 z-20">
             <div className="p-6 flex flex-col gap-10 h-full overflow-y-auto premium-scroll">
                
                <div className="space-y-8">
                   <span className="text-[11px] orbitron font-black text-slate-500 dark:text-purple-400 uppercase tracking-[0.3em] flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 animate-[spin_4s_linear_infinite]"></div>
                      Linked_Assets
                   </span>

                   <div className="flex flex-col gap-5">
                      {accounts.map(acc => (
                        <div key={acc.platform} className={`flex flex-col p-4 rounded-[1.8rem] border-2 transition-all duration-500 gap-4 shadow-sm ${acc.isConnected ? 'border-purple-500/30 bg-white dark:bg-purple-500/10' : 'border-slate-200 dark:border-white/5 opacity-40 grayscale scale-95'}`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <PlatformIcon platform={acc.platform} className="w-4 h-4" useColor={acc.isConnected} />
                                <span className={`text-[11px] orbitron font-black tracking-tight ${acc.isConnected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{acc.platform}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${acc.isConnected ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500'}`}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {activeTab === 'STRATEGY' && (
                  <div className="mt-auto p-6 rounded-[2.5rem] bg-purple-600/5 border border-purple-500/20">
                     <p className="text-[9px] font-mono text-purple-700 dark:text-purple-400 italic">"Gervis: Connected nodes will influence strategy weights. Ensure all relevant channels are uplinked for precise synthesis."</p>
                  </div>
                )}
             </div>
          </div>

          {/* MAIN WORKSPACE */}
          <div className="flex-1 p-16 overflow-y-auto premium-scroll">
            
            {activeTab === 'NEXUS' && (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic mb-12">Account_Optimization_Grid</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {accounts.map(acc => (
                     <div key={acc.platform} className={`relative group hud-glass p-10 rounded-[3.5rem] border-2 transition-all duration-700 flex flex-col gap-8 ${acc.isConnected ? 'border-purple-500/20 bg-white dark:bg-purple-950/20 hover:border-purple-500/60' : 'opacity-40 grayscale'}`}>
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-8">
                              <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all shadow-xl border-2 ${acc.isConnected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-100'}`}>
                                 <PlatformIcon platform={acc.platform} className="w-10 h-10" useColor={acc.isConnected} />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <h4 className="text-xl orbitron font-black text-slate-900 dark:text-white uppercase italic">{acc.platform}</h4>
                                 <span className="text-[10px] font-mono text-slate-400 dark:text-purple-400 font-bold">{acc.handle || 'AWAITING_UPLINK'}</span>
                              </div>
                           </div>
                           {acc.isConnected && (
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] orbitron text-emerald-500 font-black tracking-widest animate-pulse">OPTIMIZED</span>
                                <span className="text-xl font-mono text-slate-800 dark:text-white font-black">{acc.followers}</span>
                             </div>
                           )}
                        </div>
                        
                        {acc.isConnected ? (
                          <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-white/5">
                             <div className="flex flex-col gap-2">
                                <span className="text-[9px] orbitron text-slate-400 font-black uppercase">AutoPilot_Engage</span>
                                <button onClick={() => onToggleAutoEngage(acc.platform)} className={`w-14 h-7 rounded-full relative transition-all duration-500 border-2 ${acc.autoEngageActive ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-200 dark:bg-slate-800 border-slate-300'}`}>
                                   <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${acc.autoEngageActive ? 'right-1 bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'left-1 bg-slate-500'}`}></div>
                                </button>
                             </div>
                             <button onClick={() => onApplyShop(acc.platform)} className="px-6 py-3 bg-purple-600 text-white orbitron font-black text-[9px] rounded-2xl shadow-lg hover:scale-105 transition-all">SHOP_SYNC</button>
                          </div>
                        ) : (
                          <button onClick={() => onConnect(acc.platform)} className="w-full py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 orbitron font-black text-[10px] rounded-3xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all uppercase">Establish_Uplink</button>
                        )}
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'ANALYTICS' && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Network_Intelligence_Telemetry</h3>
                <div className="hud-glass p-16 rounded-[5rem] min-h-[500px] flex flex-col gap-10 bg-white dark:bg-black/50 border-2 border-slate-100 dark:border-purple-500/10">
                   <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xl orbitron font-black text-slate-900 dark:text-white uppercase tracking-widest italic">Growth_Vector_Mapping</h4>
                        <p className="text-[10px] font-mono text-purple-600 uppercase tracking-widest opacity-60">Aggregate Performance Index</p>
                      </div>
                      <div className="px-6 py-3 bg-purple-600/10 border border-purple-500/30 rounded-2xl">
                         <span className="text-[11px] orbitron text-purple-600 font-black">SYNC: 99.8% STABLE</span>
                      </div>
                   </div>
                   <div className="flex-1">
                      <FollowerLineChart accounts={accounts} />
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
                   {/* Brand Context Input */}
                   <div className="xl:col-span-4 flex flex-col gap-10">
                      <div className="hud-glass p-10 rounded-[4rem] bg-white dark:bg-purple-950/20 border-2 border-purple-500/20 shadow-2xl flex flex-col gap-8">
                         <div className="flex flex-col gap-4">
                            <span className="text-[11px] orbitron font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.4em] italic opacity-80">Vision_Core_Parameters</span>
                            <textarea 
                               value={brandContext}
                               onChange={(e) => setBrandContext(e.target.value)}
                               placeholder="Describe your brand's core mission, product, or disruptive vision..."
                               className="w-full h-52 bg-slate-100 dark:bg-black/70 border border-slate-200 dark:border-purple-500/40 rounded-[2.5rem] p-8 text-[14px] font-mono text-slate-800 dark:text-white outline-none focus:border-purple-500 transition-all duration-500 resize-none shadow-inner"
                            />
                         </div>

                         <div className="grid grid-cols-1 gap-4">
                            {[
                              { id: 'slogan', label: 'GENERATE_SLOGANS', sub: 'Disruptive Hooks' },
                              { id: 'voice', label: 'VOCAL_SIGNATURE', sub: 'Tonal DNA' },
                              { id: 'audience', label: 'TARGET_DEMOGRAPHICS', sub: 'Behavioral Triggers' },
                              { id: 'roadmap', label: 'CONTENT_ROADMAP', sub: '90-Day Milestones' },
                              { id: 'positioning', label: 'MARKET_DISRUPTION', sub: 'Competitive Intel' },
                              { id: 'visuals', label: 'VISUAL_DNA_RENDER', sub: 'Color/Type Matrix' }
                            ].map(btn => (
                               <button 
                                key={btn.id}
                                onClick={() => handleGenerateStrategy(btn.id as any)}
                                disabled={isGeneratingStrategy || !brandContext}
                                className={`group py-5 px-8 rounded-[2rem] orbitron font-black text-[10px] uppercase transition-all duration-500 flex items-center justify-between border-2 shadow-lg active:scale-95 disabled:opacity-50 ${
                                   strategyResults[btn.id as keyof typeof strategyResults] 
                                     ? 'bg-purple-600 text-white border-purple-500' 
                                     : 'border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white'
                                }`}
                               >
                                  <div className="flex flex-col items-start">
                                     <span>{btn.label}</span>
                                     <span className="text-[7px] opacity-60 tracking-[0.2em]">{btn.sub}</span>
                                  </div>
                                  {isGeneratingStrategy ? (
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                  )}
                                </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Strategy Dossier Display */}
                   <div className="xl:col-span-8 grid grid-cols-1 gap-10 overflow-y-auto premium-scroll pr-6 pb-20">
                      {Object.keys(strategyResults).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-10 opacity-20 grayscale scale-95 select-none pointer-events-none">
                           <div className="w-60 h-60 rounded-full border-4 border-dashed border-purple-500/40 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                              <svg viewBox="0 0 24 24" className="w-32 h-32 text-purple-600" fill="none" stroke="currentColor" strokeWidth="0.5"><path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z"/><path d="M12 8v4l3 3"/></svg>
                           </div>
                           <span className="text-2xl orbitron font-black tracking-[0.8em] uppercase text-slate-500">Awaiting_Neural_Synthesis</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-10 animate-in fade-in zoom-in duration-700">
                           {Object.entries(strategyResults).map(([key, value]) => (
                             <div key={key} className="hud-glass p-12 rounded-[4.5rem] bg-white dark:bg-purple-950/20 border-2 border-purple-500/20 shadow-2xl relative group overflow-hidden transition-all duration-700 hover:border-purple-500/60">
                                <div className="absolute top-0 left-0 w-2 h-full bg-purple-600 opacity-20 group-hover:opacity-60 transition-all duration-700"></div>
                                <div className="flex justify-between items-center mb-8 border-b border-slate-200 dark:border-white/5 pb-6">
                                   <span className="text-[14px] orbitron font-black text-purple-600 uppercase tracking-[0.5em] italic">Dossier: {key.toUpperCase()}</span>
                                   <div className="flex gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                      <span className="text-[8px] orbitron text-slate-400 font-bold uppercase italic tracking-widest">Gervis_Synth_A1</span>
                                   </div>
                                </div>
                                <div className="text-[16px] font-mono text-slate-700 dark:text-slate-200 leading-[1.8] italic whitespace-pre-wrap pl-2">
                                   {value}
                                </div>
                                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center opacity-40">
                                   <span className="text-[8px] orbitron font-bold tracking-[0.4em] uppercase">Security_Protocol: Tactical_Neural_SHA_256</span>
                                   <button className="text-[10px] orbitron font-black text-purple-600 hover:text-purple-400 transition-colors uppercase tracking-widest">Copy_Record</button>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'OPERATIONS' && (
              <div className="flex flex-col gap-16 animate-in slide-in-from-right-10 duration-1000 h-full">
                 <h3 className="text-3xl orbitron font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">Autonomous_Operation_Hub</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full pb-20">
                    <div className="flex flex-col gap-10">
                       <div className="hud-glass p-12 rounded-[5rem] flex flex-col gap-10 bg-white dark:bg-purple-950/20 border-2 border-purple-500/20 shadow-2xl relative overflow-hidden group">
                          <div className="flex items-center gap-10 relative">
                             <div className="w-24 h-24 rounded-[3rem] border-2 border-purple-500/30 flex items-center justify-center bg-purple-500/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
                                <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                             </div>
                             <div className="flex flex-col gap-2">
                                <h3 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Engagement_Bot_V4</h3>
                                <p className="text-[11px] orbitron text-emerald-600 font-black uppercase tracking-[0.4em] italic">Status: Scanning_Network</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <button className="py-6 bg-purple-600 text-white orbitron font-black text-xs rounded-[2rem] hover:bg-purple-700 transition-all shadow-[0_15px_40px_rgba(168,85,247,0.3)] uppercase tracking-widest">DEPLOY_AI_AGENT</button>
                             <button className="py-6 border-2 border-purple-500/20 text-purple-600 dark:text-purple-400 orbitron font-black text-xs rounded-[2rem] hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all uppercase tracking-widest">Analytics_Probe</button>
                          </div>

                          <div className="mt-6 p-8 bg-slate-50 dark:bg-black/60 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-inner">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] orbitron font-black text-slate-500 uppercase tracking-[0.4em] italic opacity-60">Neural_Load</span>
                                <span className="text-[11px] font-mono text-purple-500 font-black uppercase italic">84.2%</span>
                             </div>
                             <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-[84%]"></div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="hud-glass rounded-[5rem] flex flex-col overflow-hidden bg-slate-100/60 dark:bg-black/70 relative border-2 border-slate-200 dark:border-purple-500/10 shadow-2xl backdrop-blur-xl">
                       <div className="h-20 bg-slate-200/50 dark:bg-purple-950/20 flex items-center justify-between px-12 border-b border-slate-200 dark:border-purple-500/10">
                          <span className="text-[12px] orbitron font-black text-slate-900 dark:text-purple-400 uppercase tracking-[0.5em] italic">LIVE_FEED_INTERCEPT</span>
                          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-10 space-y-6 premium-scroll">
                          {liveComments.map(comment => (
                            <div key={comment.id} className="hud-glass p-8 rounded-[3rem] bg-white dark:bg-slate-900/60 border-slate-100 dark:border-purple-500/10 animate-in slide-in-from-right-4 duration-500 shadow-xl group hover:border-purple-500/50 transition-all">
                               <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-4">
                                     <div className={`px-4 py-1.5 rounded-xl text-[10px] orbitron font-black ${comment.platform === 'INSTAGRAM' ? 'bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                        {comment.platform}
                                     </div>
                                     <span className="text-sm orbitron font-black text-slate-800 dark:text-white italic tracking-tighter group-hover:text-purple-500 transition-colors duration-500 uppercase">{comment.targetUser}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest opacity-60 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}</span>
                               </div>
                               <p className="text-[14px] font-mono text-slate-700 dark:text-slate-200 leading-relaxed italic whitespace-pre-wrap pl-2 italic">"{comment.content}"</p>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};