
import React, { useState, useEffect, useRef } from 'react';
import { AvatarConfig, Participant } from '../types';
import { VoiceWave } from './VoiceWave';

interface VideoCallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  isModelTalking: boolean;
  isProcessing: boolean;
  personality: string;
  config: AvatarConfig;
  onToggleCamera?: () => void;
  facingMode: 'user' | 'environment';
}

export const VideoCallOverlay: React.FC<VideoCallOverlayProps> = ({ 
  isOpen, onClose, participants, isModelTalking, isProcessing, personality, config, onToggleCamera, facingMode
}) => {
  const [signalStrength, setSignalStrength] = useState(98.4);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Find the primary user stream (Sir)
  const userParticipant = participants.find(p => p.id === 'me');
  const userStream = userParticipant?.stream;

  useEffect(() => {
    if (isOpen && videoRef.current && userStream) {
      videoRef.current.srcObject = userStream;
    }
  }, [isOpen, userStream, facingMode]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSignalStrength(96 + Math.random() * 3.9);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-[#010409] animate-in fade-in duration-700 overflow-hidden flex flex-col font-mono">
      {/* AMBIENT BACKGROUND NEURAL MESH */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#06b6d411,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [transform:perspective(1000px)_rotateX(60deg)]"></div>
      </div>

      {/* TOP HEADER: SYSTEM TELEMETRY */}
      <div className="relative z-50 h-24 px-10 md:px-16 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-10">
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/30 px-5 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                 <span className="text-[12px] orbitron font-black text-white tracking-[0.4em] uppercase italic">OMNI_TALK_LINK_v7.5</span>
              </div>
              <span className="text-[8px] orbitron text-cyan-800 font-black uppercase tracking-widest pl-5">SIGNAL_INTEGRITY: {signalStrength.toFixed(2)}% // SECURE_NODE: L7_GROUNDED</span>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden lg:flex items-center gap-12 mr-10 px-10 py-3 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-xl">
              <div className="flex flex-col">
                 <span className="text-[8px] orbitron text-slate-500 uppercase tracking-widest">OPTIC_DENSITY</span>
                 <span className="text-[11px] font-mono text-cyan-400 font-black tracking-tighter">4K_SYNTH_ACTIVE</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] orbitron text-slate-500 uppercase tracking-widest">SENTIMENT_VECTOR</span>
                 <span className="text-[11px] font-mono text-emerald-500 font-black tracking-tighter">POS_STABLE_0.992</span>
              </div>
           </div>
           <button onClick={onClose} className="w-16 h-16 rounded-[2.5rem] bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:bg-rose-500 transition-all active:scale-90 group">
              <svg viewBox="0 0 24 24" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
        </div>
      </div>

      {/* MAIN VIEWPORT: THE FOCAL FEED */}
      <div className="flex-1 relative flex items-center justify-center p-6 md:p-12 overflow-visible">
         
         {/* THE FOCAL VIDEO FRAME */}
         <div className="relative w-full max-w-6xl aspect-video rounded-[4rem] overflow-hidden border-2 border-cyan-500/20 shadow-[0_0_120px_rgba(6,182,212,0.15)] group bg-black">
            
            {/* Shutter Effect Layer */}
            <div className="absolute inset-0 bg-black z-20 opacity-0 group-active:opacity-100 transition-opacity duration-75"></div>

            {/* Video Feed */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-all duration-700 ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-100'} brightness-110 contrast-[1.05] grayscale-[0.2]`}
            />

            {/* HOLOGRAPHIC HUD OVERLAY ON VIDEO */}
            <div className="absolute inset-0 pointer-events-none z-10">
               {/* Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(transparent_40%,rgba(0,0,0,0.5)_100%)]"></div>
               
               {/* Scanning Line */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/40 animate-[scan_6s_linear_infinite] shadow-[0_0_20px_cyan]"></div>

               {/* Focal Brackets */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-cyan-500/10 rounded-[3rem]">
                  <div className="absolute inset-[-20px] border border-cyan-500/20 rounded-[4rem] animate-ping"></div>
                  {/* Focus Crosshair */}
                  <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-cyan-500/40"></div>
                  <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-cyan-500/40"></div>
                  <div className="absolute top-0 left-1/2 w-[1px] h-8 bg-cyan-500/40"></div>
                  <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-cyan-500/40"></div>
               </div>

               {/* Biometric Analysis Markers */}
               <div className="absolute top-12 left-12 flex flex-col gap-3">
                  <div className="flex items-center gap-4 bg-black/70 px-6 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                     <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                     <span className="text-[10px] orbitron font-black text-white uppercase tracking-[0.2em]">ENTITY_TRACKING: SIR_PRIMARY</span>
                  </div>
                  <div className="text-[8px] orbitron text-cyan-600/60 font-bold uppercase pl-2 tracking-widest italic">Identity_L7_Hash: 0x8F...2A4C</div>
               </div>

               {/* Environmental Data */}
               <div className="absolute bottom-12 right-12 flex flex-col items-end gap-4">
                  <div className="flex gap-1.5 h-10 items-end">
                     {[...Array(15)].map((_, i) => (
                       <div key={i} className="w-1.5 bg-cyan-500/30 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i*0.08}s` }}></div>
                     ))}
                  </div>
                  <span className="text-[9px] orbitron text-cyan-400 font-black uppercase tracking-[0.4em] italic shadow-black drop-shadow-md">Spatial_Noise_Reduction_Active</span>
               </div>
            </div>
         </div>

         {/* FLOATING AI DOST NODE */}
         <div className="absolute bottom-10 left-16 md:bottom-20 md:left-24 z-50 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="relative group">
               <div className="absolute -inset-8 bg-cyan-500/15 rounded-full blur-[60px] group-hover:bg-cyan-500/25 transition-all"></div>
               <div className={`w-36 h-36 md:w-56 md:h-56 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-700 ${isModelTalking ? 'border-cyan-400 scale-110 shadow-[0_0_80px_rgba(6,182,212,0.4)]' : 'border-white/10 hover:border-cyan-500/40 hover:scale-105'}`}>
                  <img src={config.generatedUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${personality}`} className="w-full h-full object-cover brightness-110" alt="AI" />
                  
                  {/* AI Talk Waveform Overlay */}
                  {isModelTalking && (
                    <div className="absolute inset-0 bg-cyan-500/5 flex items-center justify-center gap-1.5">
                       {[...Array(6)].map((_, i) => (
                         <div key={i} className="w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i*0.1}s` }}></div>
                       ))}
                    </div>
                  )}
               </div>
               
               <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-8 py-2 bg-cyan-600 rounded-[1.5rem] border-2 border-cyan-400 shadow-2xl">
                  <span className="text-[11px] orbitron font-black text-white uppercase tracking-[0.3em]">{personality}</span>
               </div>
            </div>
         </div>

         {/* INTELLIGENCE READOUT CLUSTER */}
         <div className="hidden xl:flex absolute right-24 top-1/2 -translate-y-1/2 flex-col gap-8 w-96">
            <div className="hud-glass p-10 rounded-[4rem] border-cyan-500/20 bg-black/60 flex flex-col gap-8 shadow-2xl">
               <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <span className="text-[12px] orbitron text-cyan-600 font-black uppercase tracking-[0.3em] italic">Neural_Analysis_Core</span>
                  <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></div>
               </div>
               
               <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] orbitron text-slate-500 uppercase tracking-widest">Environment_Lock</span>
                     <div className="text-[14px] font-mono text-emerald-400 font-black uppercase italic tracking-tighter">WORKSPACE_CALIBRATED [v4.2]</div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] orbitron text-slate-500 uppercase tracking-widest">AI_Cognitive_State</span>
                     <div className="text-[14px] font-mono text-cyan-100 font-bold italic leading-relaxed">"Sir, multi-modal sensors are synchronized. My reasoning engine is standing by for real-time problem solving."</div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex flex-col items-center">
                     <span className="text-[7px] orbitron text-slate-500 font-bold uppercase">LATENCY</span>
                     <span className="text-xs font-mono text-cyan-400 font-black">4ms</span>
                  </div>
                  <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex flex-col items-center">
                     <span className="text-[7px] orbitron text-slate-500 font-bold uppercase">JITTER</span>
                     <span className="text-xs font-mono text-cyan-400 font-black">0.012%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* BOTTOM CONTROLS: THE INTERACTIVE DOCK */}
      <div className="relative z-50 h-40 md:h-48 bg-black/80 border-t border-white/10 backdrop-blur-[100px] flex items-center justify-between px-16 md:px-24">
         
         <div className="flex items-center gap-12">
            <button 
              onClick={onToggleCamera}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-2xl group active:scale-90"
            >
               <svg viewBox="0 0 24 24" className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
               <span className="text-[7px] orbitron font-black mt-1 uppercase tracking-widest">Switch_Optic</span>
            </button>
            <button className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-xl group active:scale-90">
               <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
            </button>
         </div>

         {/* CENTRAL VOICE FLUX: REAL-TIME USER AUDIO FEEDBACK */}
         <div className="flex-1 max-w-2xl h-32 relative mx-12">
            <div className="absolute inset-0 flex items-center justify-center">
               <VoiceWave isActive={isOpen} isModelTalking={isModelTalking} themeColor="#06b6d4" />
            </div>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-800 animate-ping"></div>
               <span className="text-[9px] orbitron font-black text-cyan-900 uppercase tracking-[0.6em] whitespace-nowrap">Listening_to_Sir_Protocol_Active</span>
            </div>
         </div>

         <div className="flex items-center gap-12">
            <button className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-xl group active:scale-90">
               <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button onClick={onClose} className="w-18 h-18 md:w-24 md:h-24 rounded-[3rem] bg-rose-600 text-white flex items-center justify-center shadow-[0_20px_60px_rgba(225,29,72,0.5)] hover:bg-rose-500 transition-all active:scale-90 group border-4 border-rose-400/20">
               <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67 19.42 19.42 0 0 1-2.67-3.34 19.79 19.79 0 0 1-3.07-8.62A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z" fill="currentColor"/><path d="M22 2L2 22" stroke="currentColor"/></svg>
            </button>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}} />
    </div>
  );
};
