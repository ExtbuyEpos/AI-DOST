
import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] animate-in fade-in duration-700 overflow-hidden flex flex-col p-8 md:p-12">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-10 z-20">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-3xl shadow-2xl">
               <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse shadow-[0_0_15px_#e11d48]"></div>
               <span className="text-[11px] orbitron font-black text-white tracking-[0.2em] uppercase">COLLAB_NODE_ACTIVE</span>
            </div>
            <span className="text-[8px] orbitron text-cyan-500/60 font-black tracking-widest pl-4 uppercase">Secure_MultiUser_Uplink</span>
         </div>
         <button onClick={onClose} className="w-16 h-16 rounded-3xl bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:bg-rose-500 transition-all hover:scale-110 active:scale-95">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
         </button>
      </div>

      {/* Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto premium-scroll p-4">
         
         {/* AI MASTER FEED */}
         <div className="relative aspect-video hud-glass rounded-[3rem] border-2 border-cyan-500/30 overflow-hidden group shadow-[0_20px_60px_rgba(6,182,212,0.1)]">
            <div className="absolute inset-0 bg-cyan-900/10 backdrop-blur-sm transition-all duration-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center p-10">
               <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/10 relative overflow-hidden shadow-2xl transition-all duration-700 ${isModelTalking ? 'scale-110 shadow-[0_0_80px_rgba(6,182,212,0.4)]' : ''}`}>
                  <img src={config.generatedUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${personality}`} className="w-full h-full object-cover" alt="AI" />
                  {isModelTalking && <div className="absolute inset-0 bg-cyan-500/20 animate-pulse"></div>}
               </div>
            </div>
            <div className="absolute bottom-6 left-6 flex items-center gap-3">
               <div className={`w-2.5 h-2.5 rounded-full ${isModelTalking ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`}></div>
               <span className="text-[10px] orbitron font-black text-white uppercase tracking-widest">{personality}_X (CORE)</span>
            </div>
         </div>

         {/* HUMAN PARTICIPANTS */}
         {participants.map(p => (
           <div key={p.id} className="relative aspect-video hud-glass rounded-[3rem] border-2 border-white/10 overflow-hidden bg-black/40 group">
              {p.stream ? (
                <video 
                  autoPlay playsInline muted 
                  ref={v => { if (v) v.srcObject = p.stream!; }} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-white flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v16m8-8H4"/></svg>
                   </div>
                </div>
              )}
              <div className="absolute bottom-6 left-6 px-4 py-1.5 bg-black/60 rounded-full border border-white/10 backdrop-blur-md">
                 <span className="text-[9px] orbitron font-black text-white uppercase tracking-widest">{p.name}</span>
              </div>
              <div className="absolute top-6 right-6 flex gap-1">
                 {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
              </div>
           </div>
         ))}

         {/* JOIN SLOT */}
         <div className="relative aspect-video border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
               <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <span className="text-[9px] orbitron font-black text-slate-500 uppercase tracking-[0.3em]">Invite_Collaborator</span>
         </div>
      </div>

      {/* Status Bar */}
      <div className="mt-10 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-between px-10 backdrop-blur-3xl shadow-inner">
         <div className="flex gap-8">
            <div className="flex flex-col">
               <span className="text-[7px] orbitron text-cyan-600 font-black">ACTIVE_NODE</span>
               <span className="text-[11px] font-mono text-white font-bold">MOLT_COLLAB_V4</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[7px] orbitron text-cyan-600 font-black">BITRATE</span>
               <span className="text-[11px] font-mono text-white font-bold">14.2 Mbps</span>
            </div>
         </div>
         <div className="text-[8px] orbitron text-white/20 font-black tracking-[1em] uppercase">Distributed_P2P_Encryption_Active</div>
      </div>
    </div>
  );
};
