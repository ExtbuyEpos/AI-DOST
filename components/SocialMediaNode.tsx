
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SocialAccount, AutoComment } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface SocialMediaNodeProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccount[];
  onConnect: (platform: string) => void;
  onApplyShop: (platform: string) => void;
  onToggleAutoEngage: (platform: string) => void;
}

interface BrandStrategy {
  slogans: string[];
  brandVoice: {
    tone: string[];
    description: string;
    guidelines: string[];
  };
  audienceProfiles: {
    name: string;
    demographics: string;
    psychographics: string;
    interests: string[];
  }[];
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
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01V15.5c0 1.28-.18 2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-1.3 0-2.6-.4-3.7-1.13-1.09-.73-1.94-1.76-2.48-2.92-.54-1.17-.72-2.47-.72-3.75 0-1.28.18-2.58.72-3.75.54-1.16 1.39-2.19 2.48-2.92 1.09-.73 2.39-1.13 3.7-1.13 1.3 0 2.6.4 3.7 1.13 1.09.73 1.94 1.76 2.48 2.92.54 1.17.72 2.47.72 3.75 0 1.28-.18-2.58-.72 3.75-.54 1.16-1.39 2.19-2.48 2.92-1.09.73-2.39 1.13-3.7 1.13-.41 0-.82.04 1.23.13V4.03c-1.23.13-2.43.51-3.52 1.11C5.64 5.92 4.8 7.07 4.29 8.35c-.51 1.28-.68 2.68-.68 4.07s.17 2.79.68 4.07c.51 1.28 1.35 2.43 2.44 3.23 1.09.8 2.39 1.26 3.74 1.26 1.35 0 2.65-.46 3.74-1.26 1.09-.8 1.93-1.95 2.44-3.23.51-1.28.68-2.68.68-4.07V.02z"/>
        </svg>
      );
    default:
      return null;
  }
};

const FollowerGrowthChart: React.FC<{ accounts: SocialAccount[] }> = ({ accounts }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const connectedAccounts = accounts.filter(a => a.isConnected);
  const [hoverData, setHoverData] = useState<{ x: number, day: number, values: { platform: string, val: number, color: string }[] } | null>(null);

  const chartData = useMemo(() => {
    const days = 30;
    return connectedAccounts.map(acc => {
      const baseFollowers = parseFloat(acc.followers.replace(/[^0-9.]/g, '')) * (acc.followers.includes('M') ? 1000000 : acc.followers.includes('K') ? 1000 : 1) || 1000;
      const growthRate = parseFloat(acc.growth.replace(/[+%]/g, '')) / 100 || 0.05;
      
      const points = Array.from({ length: days }, (_, i) => {
        const timeFactor = i / (days - 1);
        const noise = Math.sin(i * 0.8) * (baseFollowers * 0.005);
        return baseFollowers * (1 - (growthRate * (1 - timeFactor))) + noise;
      });
      
      const color = acc.platform === 'INSTAGRAM' ? '#ec4899' : 
                    acc.platform === 'META' ? '#3b82f6' : 
                    acc.platform === 'TWITTER' ? '#0ea5e9' : '#a855f7';
      
      return { platform: acc.platform, points, color };
    });
  }, [connectedAccounts]);

  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const isLightMode = document.body.classList.contains('light-theme');
    
    const render = () => {
      const w = rect.width;
      const h = rect.height;
      const padX = 70;
      const padY = 60;
      const graphW = w - padX * 2;
      const graphH = h - padY * 2;

      ctx.clearRect(0, 0, w, h);

      // Cyber Grid
      ctx.strokeStyle = isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(6,182,212,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const y = padY + (graphH / 6) * i;
        ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(w - padX, y); ctx.stroke();
      }
      for (let i = 0; i <= 10; i++) {
        const x = padX + (graphW / 10) * i;
        ctx.beginPath(); ctx.moveTo(x, padY); ctx.lineTo(x, h - padY); ctx.stroke();
      }

      chartData.forEach(({ points, color }) => {
        const max = Math.max(...points) * 1.05;
        const min = Math.min(...points) * 0.95;
        const range = max - min || 1;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = isLightMode ? 0 : 20;
        ctx.shadowColor = color;

        points.forEach((p, i) => {
          const x = padX + (i / (points.length - 1)) * graphW;
          const y = padY + graphH - ((p - min) / range) * graphH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        const grad = ctx.createLinearGradient(0, padY, 0, padY + graphH);
        grad.addColorStop(0, `${color}15`);
        grad.addColorStop(1, `${color}00`);
        ctx.lineTo(padX + graphW, padY + graphH);
        ctx.lineTo(padX, padY + graphH);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Legends & Axis
      ctx.fillStyle = isLightMode ? '#64748b' : '#475569';
      ctx.font = 'bold 9px Orbitron';
      ctx.fillText('NETWORK_GROWTH_TRAJECTORY (30D)', padX, padY - 20);
      ctx.fillText('PRESENT_T', padX + graphW - 50, padY + graphH + 30);
      ctx.fillText('T-30D', padX, padY + graphH + 30);
    };

    render();
  }, [chartData]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || chartData.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padX = 70;
    const graphW = rect.width - padX * 2;
    const mouseX = e.clientX - rect.left;
    
    if (mouseX < padX || mouseX > rect.width - padX) {
      setHoverData(null);
      return;
    }

    const dayIdx = Math.round(((mouseX - padX) / graphW) * 29);
    const dayClamped = Math.max(0, Math.min(29, dayIdx));
    
    const values = chartData.map(c => ({
      platform: c.platform,
      val: c.points[dayClamped],
      color: c.color
    }));

    setHoverData({
      x: padX + (dayClamped / 29) * graphW,
      day: 30 - dayClamped,
      values
    });
  };

  const formatVal = (v: number) => {
    if (v >= 1000000) return (v / 1000000).toFixed(2) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return Math.floor(v).toString();
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative group cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverData(null)}
    >
      <div className="absolute inset-0 bg-slate-900/5 dark:bg-cyan-500/5 rounded-[3rem] border border-slate-200 dark:border-cyan-500/10 pointer-events-none"></div>
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {hoverData && (
        <>
          {/* Vertical Scan Line */}
          <div 
            className="absolute top-[60px] bottom-[60px] w-px bg-cyan-500/40 shadow-[0_0_10px_#06b6d4] pointer-events-none transition-all duration-75"
            style={{ left: hoverData.x }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rounded-full"></div>
          </div>

          {/* Holographic Tooltip */}
          <div 
            className="absolute top-20 pointer-events-none z-50 animate-in fade-in zoom-in duration-200"
            style={{ left: hoverData.x + 15 }}
          >
            <div className="hud-glass p-5 rounded-2xl border-cyan-500/40 bg-black/80 backdrop-blur-xl flex flex-col gap-3 min-w-[140px] shadow-2xl">
               <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[8px] orbitron font-black text-cyan-500 uppercase tracking-widest">Snapshot_T-{hoverData.day}D</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
               </div>
               <div className="flex flex-col gap-2">
                  {hoverData.values.map(v => (
                    <div key={v.platform} className="flex justify-between items-center gap-6">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: v.color }}></div>
                          <span className="text-[9px] orbitron font-bold text-slate-300">{v.platform}</span>
                       </div>
                       <span className="text-[10px] font-mono font-black text-white">{formatVal(v.val)}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const SocialMediaNode: React.FC<SocialMediaNodeProps> = ({ 
  isOpen, onClose, accounts, onConnect, onApplyShop, onToggleAutoEngage 
}) => {
  const [activeTab, setActiveTab] = useState<'NEXUS' | 'STRATEGY' | 'ANALYTICS' | 'OPERATIONS'>('NEXUS');
  const [liveComments, setLiveComments] = useState<AutoComment[]>([]);
  const [brandEssence, setBrandEssence] = useState('');
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const connectedAccounts = useMemo(() => accounts.filter(a => a.isConnected), [accounts]);

  const analysisMetrics = useMemo(() => {
    const instagram = accounts.find(a => a.platform === 'INSTAGRAM');
    const meta = accounts.find(a => a.platform === 'META');
    
    const getNumeric = (val: string) => parseFloat(val.replace(/[^0-9.]/g, '')) * (val.includes('M') ? 1000000 : val.includes('K') ? 1000 : 1);
    
    const igFollowers = instagram ? getNumeric(instagram.followers) : 0;
    const igGrowth = instagram ? parseFloat(instagram.growth.replace(/[+%]/g, '')) : 0;
    const metaFollowers = meta ? getNumeric(meta.followers) : 0;
    const metaGrowth = meta ? parseFloat(meta.growth.replace(/[+%]/g, '')) : 0;

    return {
      igTotal: instagram?.followers || '0',
      igNew: instagram ? `+${Math.floor((igFollowers * (igGrowth / 100)) / 1000)}K` : '0',
      metaTotal: meta?.followers || '0',
      metaNew: meta ? `+${Math.floor((metaFollowers * (metaGrowth / 100)) / 1000)}K` : '0',
      combinedGrowth: `+${((igGrowth + metaGrowth) / 2).toFixed(1)}%`
    };
  }, [accounts]);

  const handleGenerateStrategy = async () => {
    if (!brandEssence.trim()) return;
    setIsGeneratingStrategy(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Develop a comprehensive social media brand strategy for: "${brandEssence}". 
        Consider the current audience context: ${connectedAccounts.map(a => `${a.platform} (${a.followers} followers)`).join(', ')}.
        Return a highly creative, tactical strategy in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slogans: { type: Type.ARRAY, items: { type: Type.STRING } },
              brandVoice: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.ARRAY, items: { type: Type.STRING } },
                  description: { type: Type.STRING },
                  guidelines: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              audienceProfiles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    demographics: { type: Type.STRING },
                    psychographics: { type: Type.STRING },
                    interests: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setStrategy(data);
    } catch (e) {
      console.error("Strategy synthesis failed:", e);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'OPERATIONS' && accounts.some(a => a.autoEngageActive)) {
      const interval = setInterval(() => {
        const connectedPlats = accounts.filter(a => a.isConnected && a.autoEngageActive);
        if (connectedPlats.length === 0) return;

        const targets = ['@elonmusk', '@zuck', '@marquesbrownlee', '@techcrunch'];
        const contents = [
          "Neural optimization complete. Engagement rising, Sir.",
          "Market disruption vector identified. Deploying now.",
          "Analyzing user sentiment... results are highly favorable.",
          "Immediate node engagement triggered on trending thread."
        ];

        const plat = connectedPlats[Math.floor(Math.random() * connectedPlats.length)].platform;

        const newComment: AutoComment = {
          id: Math.random().toString(36).substr(2, 9),
          platform: plat,
          targetUser: targets[Math.floor(Math.random() * targets.length)],
          content: contents[Math.floor(Math.random() * contents.length)],
          sentiment: 'POSITIVE',
          timestamp: Date.now()
        };

        setLiveComments(prev => [newComment, ...prev].slice(0, 6));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [activeTab, accounts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2 md:p-8 pointer-events-none">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[40px] pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-7xl h-[94vh] bg-white dark:bg-[#05070a] border border-slate-200 dark:border-cyan-500/20 rounded-[4.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col animate-in zoom-in duration-700">
        
        <div className="h-28 bg-slate-50/50 dark:bg-black/40 backdrop-blur-3xl flex items-center justify-between px-16 border-b border-slate-200 dark:border-white/5 z-30">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-6 group">
              <div className="relative">
                <div className="w-5 h-5 bg-cyan-500 rounded-full animate-ping opacity-30"></div>
                <div className="absolute inset-0 w-5 h-5 bg-cyan-500 rounded-full shadow-[0_0_20px_#06b6d4]"></div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[15px] orbitron font-black text-slate-900 dark:text-white tracking-[0.5em] uppercase italic">AI_DOST_NEXUS</h2>
                <span className="text-[9px] orbitron text-slate-400 dark:text-cyan-800 font-black uppercase tracking-widest">Autonomous_Operation_v5.5</span>
              </div>
            </div>

            <nav className="h-16 flex bg-slate-200/50 dark:bg-white/5 p-2 rounded-[2rem] border border-slate-300 dark:border-white/5">
              {(['NEXUS', 'ANALYTICS', 'STRATEGY', 'OPERATIONS'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-12 rounded-2xl text-[10px] orbitron font-black transition-all duration-500 relative overflow-hidden ${activeTab === tab ? 'bg-cyan-600 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-cyan-400'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <button onClick={onClose} className="w-14 h-14 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-500 shadow-2xl group">
             <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 md:w-[22rem] border-r border-slate-200 dark:border-white/5 flex flex-col bg-slate-50/50 dark:bg-black/20 z-20">
             <div className="p-10 flex flex-col gap-12 h-full overflow-y-auto premium-scroll">
                <div className="space-y-8">
                   <span className="text-[11px] orbitron font-black text-slate-400 dark:text-cyan-500 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                      <div className="w-2.5 h-2.5 bg-cyan-500 rounded-sm rotate-45 shadow-[0_0_10px_#06b6d4]"></div>
                      Linked_Nodes
                   </span>

                   <div className="flex flex-col gap-6">
                      {accounts.map(acc => (
                        <div key={acc.platform} className={`flex flex-col p-8 rounded-[3rem] border-2 transition-all duration-700 gap-8 shadow-sm ${acc.isConnected ? 'border-cyan-500/20 bg-white dark:bg-cyan-500/5' : 'border-slate-200 dark:border-white/5 opacity-30 grayscale'}`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                 <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all ${acc.isConnected ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-lg' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                    <PlatformIcon platform={acc.platform} className="w-7 h-7" useColor={acc.isConnected} />
                                 </div>
                                 <div className="flex flex-col gap-1.5">
                                    <span className={`text-[14px] orbitron font-black tracking-tight flex items-center gap-2 ${acc.isConnected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                       {acc.platform}
                                    </span>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-mono text-cyan-600 font-bold uppercase truncate max-w-[100px]">{acc.isConnected ? acc.handle : 'OFFLINE'}</span>
                                       {acc.autoEngageActive && (
                                          <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-[6px] orbitron font-black text-emerald-500 rounded animate-pulse">AUTO</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className={`w-3.5 h-3.5 rounded-full ${acc.isConnected ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-slate-400'}`}></div>
                           </div>

                           {acc.isConnected && (
                             <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex flex-col gap-1.5">
                                   <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest">AI_AUTO_COMMENT</span>
                                   <span className={`text-[10px] orbitron font-black ${acc.autoEngageActive ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`}>
                                      {acc.autoEngageActive ? 'ENABLED' : 'DISABLED'}
                                   </span>
                                </div>
                                <button 
                                  onClick={() => onToggleAutoEngage(acc.platform)}
                                  className={`w-14 h-7 rounded-full relative transition-all duration-500 border-2 ${acc.autoEngageActive ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-200 dark:bg-slate-800 border-slate-300'}`}
                                >
                                   <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${acc.autoEngageActive ? 'right-1 bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'left-1 bg-slate-500'}`}></div>
                                </button>
                             </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-auto p-10 rounded-[3.5rem] bg-cyan-600/5 border border-cyan-500/20 flex flex-col gap-4">
                   <span className="text-[11px] orbitron font-black text-cyan-600 uppercase tracking-widest italic">Dost_Guidance</span>
                   <p className="text-[10px] font-mono text-slate-600 dark:text-cyan-200 italic leading-relaxed">"Enable AI Auto-Commenting to permit sub-agents to autonomously response to audience interactions with strategic precision."</p>
                </div>
             </div>
          </div>

          <div className="flex-1 p-16 md:p-20 overflow-y-auto premium-scroll bg-slate-50/20 dark:bg-transparent flex flex-col gap-16">
             {activeTab === 'ANALYTICS' && (
               <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col gap-16">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-3">
                       <h3 className="text-5xl orbitron font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Growth_Intelligence</h3>
                       <p className="text-[13px] font-mono text-cyan-600 font-bold uppercase tracking-[0.6em]">30_DAY_PERFORMANCE_METRICS</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="px-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center">
                          <span className="text-[8px] orbitron text-slate-400 font-black">AVG_VELOCITY</span>
                          <span className="text-lg font-mono text-emerald-500 font-black">{analysisMetrics.combinedGrowth}</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     <div className="lg:col-span-2 hud-glass p-12 rounded-[5rem] min-h-[550px] flex flex-col gap-10 bg-white dark:bg-black/50 border-2 border-slate-100 dark:border-cyan-500/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                        <div className="flex justify-between items-center relative z-10">
                           <div className="flex gap-10">
                              {connectedAccounts.map(acc => (
                                <div key={acc.platform} className="flex items-center gap-4">
                                   <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: acc.platform === 'INSTAGRAM' ? '#ec4899' : acc.platform === 'META' ? '#3b82f6' : acc.platform === 'TWITTER' ? '#0ea5e9' : '#a855f7', color: acc.platform === 'INSTAGRAM' ? '#ec4899' : acc.platform === 'META' ? '#3b82f6' : acc.platform === 'TWITTER' ? '#0ea5e9' : '#a855f7' }}></div>
                                   <span className="text-[11px] orbitron font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">{acc.platform}</span>
                                </div>
                              ))}
                           </div>
                           <div className="px-6 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded-xl">
                              <span className="text-[9px] orbitron text-cyan-500 font-black tracking-widest uppercase italic">Neural_Chart_Live</span>
                           </div>
                        </div>
                        <div className="flex-1 relative z-10">
                           <FollowerGrowthChart accounts={accounts} />
                        </div>
                     </div>

                     <div className="flex flex-col gap-8">
                        {/* STRATEGIC ANALYSIS PANEL */}
                        <div className="hud-glass p-10 rounded-[4rem] bg-white dark:bg-black/40 border-2 border-cyan-500/10 shadow-xl flex flex-col gap-10">
                           <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-white/5 pb-6">
                              <span className="text-[11px] orbitron font-black text-cyan-600 uppercase tracking-widest italic">Strategic_Dost_Analysis</span>
                              <h4 className="text-xl orbitron font-black text-slate-900 dark:text-white uppercase">Meta_&_Insta_Sync</h4>
                           </div>
                           
                           <div className="space-y-8">
                              <div className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-pink-500/30 transition-all">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                       <PlatformIcon platform="INSTAGRAM" className="w-4 h-4 text-pink-500" />
                                       <span className="text-[10px] orbitron font-black text-slate-700 dark:text-slate-300">INSTAGRAM_SURGE</span>
                                    </div>
                                    <span className="text-xl font-mono text-emerald-500 font-black">{analysisMetrics.igNew}</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-500 w-[75%] shadow-[0_0_10px_#ec4899]"></div>
                                 </div>
                              </div>

                              <div className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-blue-500/30 transition-all">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                       <PlatformIcon platform="META" className="w-4 h-4 text-blue-500" />
                                       <span className="text-[10px] orbitron font-black text-slate-700 dark:text-slate-300">META_TRAJECTORY</span>
                                    </div>
                                    <span className="text-xl font-mono text-emerald-500 font-black">{analysisMetrics.metaNew}</span>
                                 </div>
                                 <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[60%] shadow-[0_0_10px_#3b82f6]"></div>
                                 </div>
                              </div>
                           </div>

                           <div className="p-8 bg-cyan-600/5 rounded-[2.5rem] border border-cyan-500/10">
                              <p className="text-[11px] font-mono text-slate-600 dark:text-cyan-200 italic leading-relaxed">
                                "Sir, Instagram and Meta platforms show a unified growth vector. Combined followers now exceed {formatVal(getNumeric(analysisMetrics.igTotal) + getNumeric(analysisMetrics.metaTotal))}. Strategic target achieved."
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'NEXUS' && (
               <div className="animate-in fade-in zoom-in duration-1000 space-y-16">
                  <h3 className="text-5xl orbitron font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Synchronization_Core</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pb-32">
                     {accounts.map(acc => (
                       <div key={acc.platform} className={`hud-glass p-12 rounded-[5rem] border-2 transition-all duration-700 flex flex-col gap-12 relative group overflow-hidden ${acc.isConnected ? 'border-cyan-500/20 bg-white dark:bg-cyan-950/10' : 'opacity-20 grayscale scale-95 shadow-none'}`}>
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-10">
                                <div className={`w-28 h-28 rounded-[3.5rem] flex items-center justify-center transition-all shadow-2xl border-4 ${acc.isConnected ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-200'}`}>
                                   <PlatformIcon platform={acc.platform} className="w-14 h-14" useColor={acc.isConnected} />
                                </div>
                                <div className="flex flex-col gap-3">
                                   <h4 className="text-3xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{acc.platform}</h4>
                                   <div className="flex items-center gap-4">
                                      <div className={`w-3 h-3 rounded-full ${acc.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                      <span className="text-[11px] font-mono text-slate-400 font-bold tracking-[0.2em]">{acc.isConnected ? 'NEURAL_LINK_ESTABLISHED' : 'AWAITING_UPLINK'}</span>
                                   </div>
                                </div>
                             </div>
                             {acc.isConnected && (
                               <div className="flex flex-col items-end">
                                  <span className="text-[11px] orbitron text-cyan-600 font-black tracking-[0.3em] animate-pulse">DOST_ACTIVE</span>
                                  <span className="text-4xl font-mono text-slate-900 dark:text-white font-black tracking-tighter">{acc.followers}</span>
                               </div>
                             )}
                          </div>
                          
                          {acc.isConnected ? (
                            <div className="flex justify-between items-center pt-12 border-t border-slate-100 dark:border-white/5">
                               <div className="flex items-center gap-12">
                                  <div className="flex flex-col gap-4">
                                     <span className="text-[11px] orbitron text-slate-400 font-black uppercase tracking-widest">AI_Auto_Comment</span>
                                     <button onClick={() => onToggleAutoEngage(acc.platform)} className={`w-16 h-8 rounded-full relative transition-all duration-500 border-2 ${acc.autoEngageActive ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-slate-200 dark:bg-slate-800 border-slate-300'}`}>
                                        <div className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-500 ${acc.autoEngageActive ? 'right-1 bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'left-1 bg-slate-500'}`}></div>
                                     </button>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                     <span className="text-[9px] orbitron text-slate-400 font-black uppercase tracking-widest">Engagement_Delta</span>
                                     <span className="text-2xl font-mono text-emerald-500 font-black tracking-tighter">{acc.engagementRate}</span>
                                  </div>
                               </div>
                               <button onClick={() => onApplyShop(acc.platform)} className="px-12 py-6 bg-cyan-600 text-white orbitron font-black text-[10px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] italic">Deploy_Dost_Shop</button>
                            </div>
                          ) : (
                            <button onClick={() => onConnect(acc.platform)} className="w-full py-8 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 orbitron font-black text-xs rounded-[3rem] hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all uppercase tracking-[0.4em] italic shadow-inner">Initialize_Sync</button>
                          )}
                       </div>
                     ))}
                  </div>
               </div>
             )}

             {activeTab === 'OPERATIONS' && (
               <div className="flex flex-col gap-16 animate-in slide-in-from-right-12 duration-1000 h-full">
                  <h3 className="text-5xl orbitron font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Autonomous_Operation_Sync</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full pb-40">
                     <div className="hud-glass rounded-[6rem] flex flex-col overflow-hidden bg-slate-50 dark:bg-black/80 border-2 border-slate-100 dark:border-white/5 shadow-2xl relative">
                        <div className="h-28 bg-slate-200/40 dark:bg-cyan-950/20 flex items-center justify-between px-16 border-b border-slate-200 dark:border-white/5">
                           <span className="text-[15px] orbitron font-black text-slate-900 dark:text-cyan-400 uppercase tracking-[0.5em] italic">LIVE_NETWORK_INTERCEPT</span>
                           <div className="w-4 h-4 rounded-full bg-rose-600 animate-pulse shadow-[0_0_20px_#e11d48]"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 space-y-8 premium-scroll">
                           {liveComments.length === 0 ? (
                             <div className="h-full flex items-center justify-center opacity-20 orbitron font-black uppercase text-2xl tracking-[1em] italic">Awaiting_Events...</div>
                           ) : (
                             liveComments.map(comment => (
                               <div key={comment.id} className="hud-glass p-10 rounded-[4rem] bg-white dark:bg-slate-900/60 border-slate-100 dark:border-white/5 animate-in slide-in-from-right-6 duration-700 shadow-xl group hover:border-cyan-500/40 transition-all">
                                  <div className="flex justify-between items-center mb-6">
                                     <div className="flex items-center gap-6">
                                        <div className={`px-5 py-2 rounded-2xl text-[11px] orbitron font-black tracking-widest ${comment.platform === 'INSTAGRAM' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                           {comment.platform}
                                        </div>
                                        <span className="text-lg orbitron font-black text-slate-800 dark:text-white italic tracking-tighter uppercase group-hover:text-cyan-500 transition-colors duration-500">{comment.targetUser}</span>
                                     </div>
                                     <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">{new Date(comment.timestamp).toLocaleTimeString([], {hour12: false, minute:'2-digit', second:'2-digit'})}</span>
                                  </div>
                                  <p className="text-[17px] font-mono text-slate-600 dark:text-slate-300 italic leading-relaxed pl-6 border-l-4 border-cyan-500/10 group-hover:border-cyan-500 transition-all">"{comment.content}"</p>
                               </div>
                             ))
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col gap-12">
                        <div className="hud-glass p-16 rounded-[6rem] flex flex-col gap-12 bg-white dark:bg-cyan-950/10 border-2 border-cyan-500/10 shadow-2xl relative overflow-hidden group">
                           <div className="flex items-center gap-12">
                              <div className="w-32 h-32 rounded-[4rem] border-4 border-cyan-500/30 flex items-center justify-center bg-cyan-500/5 relative overflow-hidden shadow-2xl">
                                 <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                                 <svg viewBox="0 0 24 24" className="w-16 h-16 text-cyan-600 shadow-2xl" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                              </div>
                              <div className="flex flex-col gap-4">
                                 <h3 className="text-4xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Engagement_Dost_V5</h3>
                                 <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                                    <p className="text-[13px] orbitron text-emerald-600 font-black uppercase tracking-[0.5em] italic">Status: FULLY_ENGAGED</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-8">
                              <button className="py-8 bg-cyan-600 text-white orbitron font-black text-xs rounded-[3rem] hover:bg-cyan-700 transition-all shadow-2xl uppercase tracking-[0.3em] italic">Deploy_Agent</button>
                              <button className="py-8 border-4 border-cyan-500/20 text-cyan-600 dark:text-cyan-400 orbitron font-black text-xs rounded-[3rem] hover:bg-cyan-500/5 transition-all uppercase tracking-[0.3em] italic">Network_Sweep</button>
                           </div>

                           <div className="mt-8 p-12 bg-slate-50 dark:bg-black/40 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-inner">
                              <div className="flex justify-between items-center mb-6">
                                 <span className="text-[13px] orbitron font-black text-slate-400 uppercase tracking-[0.5em] italic opacity-80">Neural_Bandwidth</span>
                                 <span className="text-[13px] font-mono text-cyan-500 font-black uppercase tracking-widest">91.4%_AVAIL</span>
                              </div>
                              <div className="w-full h-4 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-2xl">
                                 <div className="h-full bg-gradient-to-r from-cyan-600 to-indigo-500 w-[91%] shadow-[0_0_30px_#06b6d4]"></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {activeTab === 'STRATEGY' && (
               <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col gap-12">
                  <div className="flex flex-col gap-6">
                    <h3 className="text-5xl orbitron font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Neural_Brand_Engine</h3>
                    <div className="flex gap-4">
                        <input 
                          value={brandEssence}
                          onChange={(e) => setBrandEssence(e.target.value)}
                          placeholder="ENTER_BRAND_ESSENCE_OR_PRODUCT_CONCEPT..."
                          className="flex-1 bg-white dark:bg-black/60 border-2 border-slate-200 dark:border-cyan-500/20 rounded-[2rem] px-8 py-5 text-slate-900 dark:text-white font-mono outline-none focus:border-cyan-500/50 transition-all"
                        />
                        <button 
                          onClick={handleGenerateStrategy}
                          disabled={isGeneratingStrategy || !brandEssence.trim()}
                          className="px-10 bg-cyan-600 text-white orbitron font-black text-xs rounded-[2rem] hover:bg-cyan-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest"
                        >
                          {isGeneratingStrategy ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                          )}
                          Synthesize_Strategy
                        </button>
                    </div>
                  </div>

                  {!strategy && !isGeneratingStrategy ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30 select-none pointer-events-none grayscale">
                        <div className="w-48 h-48 border-4 border-dashed border-cyan-500/20 rounded-full animate-[spin_30s_linear_infinite] flex items-center justify-center mb-8">
                          <svg viewBox="0 0 24 24" className="w-24 h-24 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>
                        </div>
                        <span className="text-xl orbitron font-black tracking-[0.5em] uppercase text-slate-500">Neural_Engine_Idle</span>
                    </div>
                  ) : isGeneratingStrategy ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-8">
                       <div className="relative w-32 h-32">
                          <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                          <span className="text-lg orbitron font-black text-cyan-500 uppercase tracking-widest animate-pulse">Mapping_Market_Vectors...</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Consulting Distributed Dost Nodes</span>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pb-32 animate-in fade-in zoom-in duration-700">
                        {/* SLOGANS */}
                        <div className="hud-glass p-12 rounded-[5rem] border-2 border-cyan-500/10 bg-white dark:bg-black/40 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                           <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                              <div className="w-10 h-10 bg-cyan-600/10 rounded-xl flex items-center justify-center text-cyan-600">
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              </div>
                              <h4 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Strategic_Slogans</h4>
                           </div>
                           <div className="flex flex-col gap-6">
                              {strategy.slogans.map((s, i) => (
                                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-cyan-500/5 border border-slate-100 dark:border-cyan-500/10 hover:border-cyan-500/40 transition-all group">
                                   <p className="text-xl font-mono text-slate-700 dark:text-cyan-100 italic leading-relaxed">"{s}"</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        {/* BRAND VOICE */}
                        <div className="hud-glass p-12 rounded-[5rem] border-2 border-indigo-500/10 bg-white dark:bg-black/40 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                           <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                              <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
                              </div>
                              <h4 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Neural_Voice_Identity</h4>
                           </div>
                           <div className="space-y-8">
                              <div className="flex flex-wrap gap-3">
                                 {strategy.brandVoice.tone.map((t, i) => (
                                   <span key={i} className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/30 text-[10px] orbitron font-black text-indigo-500 rounded-full uppercase tracking-widest">{t}</span>
                                 ))}
                              </div>
                              <p className="text-sm font-mono text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-4 border-indigo-500/20 pl-6">{strategy.brandVoice.description}</p>
                              <div className="space-y-4">
                                 <span className="text-[10px] orbitron text-slate-400 font-black uppercase tracking-widest">Operational_Guidelines:</span>
                                 <div className="grid grid-cols-1 gap-3">
                                    {strategy.brandVoice.guidelines.map((g, i) => (
                                      <div key={i} className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                         {g}
                                      </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* AUDIENCE PROFILES */}
                        <div className="xl:col-span-2 hud-glass p-12 rounded-[5rem] border-2 border-emerald-500/10 bg-white dark:bg-black/40 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                           <div className="flex items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
                              <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
                                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              </div>
                              <h4 className="text-2xl orbitron font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Audience_Demographic_Matrix</h4>
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {strategy.audienceProfiles.map((p, i) => (
                                <div key={i} className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col gap-6 group">
                                   <div className="flex flex-col gap-1">
                                      <span className="text-[10px] orbitron text-emerald-600 font-black uppercase tracking-widest italic">Archetype_0{i+1}</span>
                                      <h5 className="text-xl orbitron font-black text-slate-900 dark:text-white uppercase tracking-tighter">{p.name}</h5>
                                   </div>
                                   <div className="space-y-4">
                                      <div className="flex flex-col gap-1">
                                         <span className="text-[8px] orbitron text-slate-400 uppercase tracking-widest">Demographics</span>
                                         <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300">{p.demographics}</p>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                         <span className="text-[8px] orbitron text-slate-400 uppercase tracking-widest">Psychographics</span>
                                         <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 italic">"{p.psychographics}"</p>
                                      </div>
                                   </div>
                                   <div className="flex flex-wrap gap-2 pt-4 border-t border-emerald-500/10">
                                      {p.interests.map((interest, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-emerald-500/10 text-[7px] orbitron font-black text-emerald-600 rounded uppercase">{interest}</span>
                                      ))}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for metric calculation
function getNumeric(val: string) {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, '')) * (val.includes('M') ? 1000000 : val.includes('K') ? 1000 : 1);
}

// Helper for formatting
function formatVal(v: number) {
  if (v >= 1000000) return (v / 1000000).toFixed(2) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
  return Math.floor(v).toString();
}
