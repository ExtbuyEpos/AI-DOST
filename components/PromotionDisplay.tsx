
import React, { useEffect, useState } from 'react';
import { AdCampaign } from '../types';

interface PromotionDisplayProps {
  campaign: AdCampaign | null;
  onClose: () => void;
}

export const PromotionDisplay: React.FC<PromotionDisplayProps> = ({ campaign, onClose }) => {
  const [visiblePhases, setVisiblePhases] = useState<number>(0);

  useEffect(() => {
    if (campaign && visiblePhases < campaign.phases.length) {
      const timer = setTimeout(() => {
        setVisiblePhases(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [campaign, visiblePhases]);

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4 md:p-10">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl aspect-video bg-black/80 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] pointer-events-auto flex flex-col md:flex-row">
        {/* Ad Visual Section */}
        <div className="flex-1 relative overflow-hidden group">
          {campaign.visualUrl ? (
            <img 
              src={campaign.visualUrl} 
              alt={campaign.brandName} 
              className="w-full h-full object-cover animate-in zoom-in duration-1000"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
               <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
          
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="text-4xl md:text-6xl orbitron font-black text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] mb-2 uppercase italic tracking-tighter">
              {campaign.brandName}
            </h2>
            <p className="text-xl md:text-2xl orbitron text-cyan-400 font-bold uppercase tracking-widest drop-shadow-md">
              {campaign.slogan}
            </p>
          </div>

          {/* Glitch Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        {/* Campaign Intelligence Side (Step-by-Step) */}
        <div className="w-full md:w-80 border-l border-cyan-500/20 p-6 flex flex-col gap-6 bg-cyan-950/20 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex flex-col">
              <span className="text-[10px] orbitron text-cyan-500 font-black uppercase">Mission_Status</span>
              <span className="text-xs orbitron text-white font-bold">{campaign.status}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-cyan-500/40 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {campaign.phases.map((phase, idx) => (
              <div key={idx} className={`flex items-start gap-4 transition-all duration-700 ${idx < visiblePhases ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <div className={`w-6 h-6 rounded border flex items-center justify-center text-[10px] orbitron font-black ${idx < visiblePhases - 1 ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-cyan-500 text-cyan-400 animate-pulse'}`}>
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                   <span className="text-[11px] orbitron text-white font-bold uppercase tracking-wide">{phase}</span>
                   <span className="text-[8px] orbitron text-cyan-600 uppercase">Complete_Verification_Pass</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-cyan-500/20 flex flex-col gap-2">
            <div className="flex justify-between text-[8px] orbitron text-cyan-500 font-black">
              <span>MARKET_SATURATION</span>
              <span>{Math.min(100, Math.floor((visiblePhases / campaign.phases.length) * 100))}%</span>
            </div>
            <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-1000" 
                style={{ width: `${(visiblePhases / campaign.phases.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
