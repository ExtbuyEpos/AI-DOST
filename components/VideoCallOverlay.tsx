import React, { useState, useEffect } from 'react';
import { AvatarConfig, Participant } from '../types';

interface VideoCallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  isModelTalking: boolean;
  isProcessing: boolean;
  personality: string;
  config: AvatarConfig;
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ 
  isOpen, onClose, participants, isModelTalking, isProcessing, personality, config 
}) => {
  const [sentiment, setSentiment] = useState(85);
  const [isSpatialMode, setIsSpatialMode] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [insights] = useState<string[]>([
    "Sir, 360° Spatial Mesh synchronized.",
    "Analyzing group visual vectors...",
    "Neural focus peaking in Sector 4.",
    "Real-time environment mapping stable."
  ]);

  useEffect(() => {
    if (isOpen && isSpatialMode) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.2) % 360);
      }, 16);
      return () => clearInterval(interval);
    }
  }, [isOpen, isSpatialMode]);

  if (!isOpen) return null;

  const totalItems = participants.length + 1; // Participants + AI Master Node
  const radius = 400; // Radius of the 360 circle

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617]/98 backdrop-blur-3xl animate-in fade-in duration-700 overflow-hidden flex flex-col">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-center p-8 md:p-12 z-50">
         <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-3xl shadow-2xl">
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_#22d3ee]"></div>
                  <span className="text-[11px] orbitron font-black text-white tracking-[0.2em] uppercase">SPATIAL_360_TALK</span>
               </div>
               <span className="text-[8px] orbitron text-cyan-500/60 font-black tracking-widest pl-4 uppercase italic">NEURAL_SPHERE_ACTIVE</span>
            </div>

            <button 
              onClick={() => setIsSpatialMode(!isSpatialMode)}
              className={`px-6 py-3 rounded-xl border orbitron text-[9px] font-black tracking-widest transition-all ${isSpatialMode ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-cyan-500 border-white/10'}`}
            >
              {isSpatialMode ? 'DISABLE_SPATIAL' : 'ENABLE_360_VIEW'}
            </button>
         </div>

         <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 px-6 py-3 bg-black/40 border border-white/5 rounded-2xl mr-4">
               <span className="text-[8px] orbitron text-slate-500 font-black uppercase">GROUP_SYNC</span>
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-3 bg-cyan-500/20 rounded-full" style={{ height: isModelTalking ? `${8+Math.random()*12}px` : '4px' }}></div>)}
               </div>
            </div>
            <button onClick={onClose} className="w-14 h-14 rounded-2xl bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:bg-rose-500 transition-all hover:scale-110 active:scale-95">
               <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
         </div>
      </div>

      {/* 360 STAGE */}
      <div className="flex-1 relative perspective-2000 flex items-center justify-center overflow-hidden">
        
        {/* Spatial Grid Base */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
           <div className="w-[1200px] h-[1200px] border-[20px] border-cyan-500/20 rounded-full rotate-x-75 animate-[spin_20s_linear_infinite]"></div>
           <div className="absolute w-[800px] h-[800px] border-2 border-dashed border-cyan-500/30 rounded-full rotate-x-75"></div>
        </div>

        {/* 3D CAROUSEL CONTAINER */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-500 preserve-3d"
          style={{ transform: isSpatialMode ? `translateZ(-600px) rotateY(${rotation}deg)` : 'none' }}
        >
          {/* AI MASTER NODE (Center piece or 0-index) */}
          <div 
            className="absolute transition-all duration-1000 preserve-3d backface-hidden"
            style={{ 
              transform: isSpatialMode 
                ? `rotateY(0deg) translateZ(${radius}px)` 
                : 'translate(-50%, -50%) scale(1.2)' 
            }}
          >
            <div className={`w-64 h-64 md:w-80 md:h-80 hud-glass rounded-full border-4 border-cyan-500/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)] relative group ${isModelTalking ? 'scale-110' : ''}`}>
               <img src={config.generatedUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${personality}`} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/80 rounded-full border border-cyan-500/40">
                  <span className="text-[10px] orbitron font-black text-cyan-400 whitespace-nowrap uppercase tracking-widest">{personality}_MASTER</span>
               </div>
            </div>
          </div>

          {/* HUMAN PARTICIPANTS (Orbital positions) */}
          {participants.map((p, idx) => {
            const angle = (360 / totalItems) * (idx + 1);
            return (
              <div 
                key={p.id}
                className="absolute transition-all duration-1000 preserve-3d backface-hidden"
                style={{ 
                  transform: isSpatialMode 
                    ? `rotateY(${angle}deg) translateZ(${radius}px)` 
                    : `translate(${idx * 300}px, 0)` 
                }}
              >
                <div className="w-64 h-48 md:w-80 md:h-60 hud-glass rounded-[2rem] border-2 border-white/10 overflow-hidden relative group hover:border-cyan-500/40 transition-all shadow-2xl">
                   {p.stream ? (
                     <video 
                        autoPlay playsInline muted 
                        ref={v => { if (v) v.srcObject = p.stream!; }} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-black/40">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/20">
                           <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v16m8-8H4"/></svg>
                        </div>
                     </div>
                   )}
                   <div className="absolute bottom-0 inset-x-0 h-12 bg-black/60 backdrop-blur-xl border-t border-white/5 flex items-center px-6">
                      <span className="text-[10px] orbitron font-black text-white uppercase tracking-widest">{p.name}</span>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HUD OVERLAYS */}
        <div className="absolute inset-0 pointer-events-none z-10">
           <div className="absolute top-1/2 left-10 -translate-y-1/2 space-y-6">
              {insights.map((insight, i) => (
                <div key={i} className="hud-glass p-5 rounded-2xl border-cyan-500/10 bg-black/40 animate-in slide-in-from-left-10 duration-700 max-w-xs" style={{ animationDelay: `${i*0.2}s` }}>
                   <p className="text-[10px] font-mono text-cyan-300 italic leading-relaxed">"{insight}"</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="h-20 bg-black/60 border-t border-white/5 flex items-center justify-between px-14 backdrop-blur-3xl">
         <div className="flex gap-12">
            <div className="flex flex-col">
               <span className="text-[7px] orbitron text-cyan-600 font-black uppercase tracking-widest">Neural_Latency</span>
               <span className="text-[11px] font-mono text-white font-bold">14.2ms</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[7px] orbitron text-cyan-600 font-black uppercase tracking-widest">Sphere_Coverage</span>
               <span className="text-[11px] font-mono text-white font-bold">360.00°</span>
            </div>
         </div>
         <div className="text-[9px] orbitron text-white/20 font-black tracking-[1em] uppercase hidden md:block">Tactical_Spatial_Uplink_v7.2_PRIME</div>
         <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[8px] orbitron font-black text-cyan-500 shadow-xl">U{i}</div>
               ))}
            </div>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-x-75 { transform: rotateX(75deg); }
      `}} />
    </div>
  );
};