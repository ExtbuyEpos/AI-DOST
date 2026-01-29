
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
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'BIOMETRIC' | 'SPATIAL'>('VISUAL');
  const [signalStrength, setSignalStrength] = useState(98);
  const videoRef = useRef<HTMLVideoElement>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);

  // Find the primary user stream (Sir)
  const userParticipant = participants.find(p => p.id === 'me');
  const userStream = userParticipant?.stream;

  useEffect(() => {
    if (isOpen && videoRef.current && userStream) {
      videoRef.current.srcObject = userStream;
    }
  }, [isOpen, userStream]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignalStrength(95 + Math.random() * 4.9);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#020408] animate-in fade-in duration-700 overflow-hidden flex flex-col font-mono">
      {/* AMBIENT BACKGROUND NEURAL MESH */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#06b6d411,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* TOP HEADER: STATUS & TELEMETRY */}
      <div className="relative z-50 h-24 px-8 md:px-12 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-8">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                 <span className="text-[12px] orbitron font-black text-white tracking-[0.4em] uppercase italic">OMNI_TALK_LINK_L7</span>
              </div>
              <span className="text-[7px] orbitron text-cyan-800 font-black uppercase tracking-widest pl-5">Status: NEURAL_UPLINK_STABLE // SIG: {signalStrength.toFixed(2)}%</span>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden lg:flex items-center gap-10 mr-10 px-8 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
              <div className="flex flex-col">
                 <span className="text-[7px] orbitron text-slate-500 uppercase tracking-widest">FPS_OUTPUT</span>
                 <span className="text-[10px] font-mono text-cyan-400 font-black">60.0_STABLE</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] orbitron text-slate-500 uppercase tracking-widest">RES_SCALE</span>
                 <span className="text-[10px] font-mono text-cyan-400 font-black">2160P_ULTRA</span>
              </div>
           </div>
           <button onClick={onClose} className="w-14 h-14 rounded-[2rem] bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all group">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
        </div>
      </div>

      {/* MAIN VIEWPORT: THE "GEMINI" EXPERIENCE */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-10">
         
         {/* THE FOCAL VIDEO FRAME */}
         <div className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border-2 border-cyan-500/20 shadow-[0_0_100px_rgba(6,182,212,0.1)] group">
            
            {/* Shutter Effect Layer */}
            <div className="absolute inset-0 bg-black z-10 opacity-0 group-active:opacity-100 transition-opacity duration-75"></div>

            {/* Video Feed */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-transform duration-1000 ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-100'} brightness-110 contrast-110`}
            />

            {/* HOLOGRAPHIC HUD OVERLAY ON VIDEO */}
            <div className="absolute inset-0 pointer-events-none">
               {/* Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.4)_100%)]"></div>
               
               {/* Scanning Line */}
               <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/30 animate-[scan_4s_linear_infinite] shadow-[0_0_15px_cyan]"></div>

               {/* Focal Brackets */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-500/10 rounded-full">
                  <div className="absolute inset-[-10px] border border-cyan-500/20 rounded-full animate-ping"></div>
               </div>

               {/* Corner Biometrics */}
               <div className="absolute top-10 left-10 flex flex-col gap-2">
                  <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10">
                     <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                     <span className="text-[9px] orbitron font-black text-white uppercase tracking-widest">Target: SIR_LIKENESS</span>
                  </div>
                  <div className="text-[7px] orbitron text-cyan-600 font-bold uppercase pl-1">Neural_Identity_L7_Verified</div>
               </div>

               <div className="absolute bottom-10 right-10 flex flex-col items-end gap-3">
                  <div className="flex gap-1 h-8 items-end">
                     {[...Array(12)].map((_, i) => (
                       <div key={i} className="w-1 bg-cyan-500/40 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i*0.1}s` }}></div>
                     ))}
                  </div>
                  <span className="text-[8px] orbitron text-cyan-400 font-black uppercase tracking-widest">Ambient_Data_Flux</span>
               </div>
            </div>
         </div>

         {/* FLOATING AI AVATAR NODE */}
         <div className="absolute bottom-20 left-20 z-50 animate-in slide-in-from-bottom-10 duration-1000">
            <div className="relative group">
               <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all"></div>
               <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-700 ${isModelTalking ? 'border-cyan-400 scale-110 shadow-[0_0_50px_#06b6d4]' : 'border-white/10 hover:border-cyan-500/40'}`}>
                  <img src={config.generatedUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${personality}`} className="w-full h-full object-cover brightness-110" alt="AI" />
                  {isModelTalking && (
                    <div className="absolute inset-0 bg-cyan-500/5 flex items-center justify-center">
                       <div className="w-full h-full border-4 border-cyan-500/40 rounded-full animate-ping"></div>
                    </div>
                  )}
               </div>
               <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-cyan-600 rounded-full border border-cyan-400 shadow-xl">
                  <span className="text-[10px] orbitron font-black text-white uppercase tracking-widest">{personality}</span>
               </div>
            </div>
         </div>

         {/* INTELLIGENCE READOUT PANEL */}
         <div className="hidden xl:flex absolute right-16 top-1/2 -translate-y-1/2 flex-col gap-6 w-80">
            <div className="hud-glass p-8 rounded-[3rem] border-cyan-500/20 bg-black/40 flex flex-col gap-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] orbitron text-cyan-600 font-black uppercase italic">Neural_Analysis</span>
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               </div>
               <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[8px] orbitron text-slate-500 uppercase">Sentiment_Vector</span>
                     <div className="text-sm font-mono text-white italic">POS_DOMINANT [0.982]</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <span className="text-[8px] orbitron text-slate-500 uppercase">Environmental_Lock</span>
                     <div className="text-sm font-mono text-emerald-400 uppercase">SAFE_SECTOR_CALIBRATED</div>
                  </div>
               </div>
               <div className="p-5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 text-[9px] font-mono text-cyan-300 italic leading-relaxed">
                  "Sir, my spatial sensors are detecting an optimized workspace configuration. Neural synergy is reaching peak efficiency."
               </div>
            </div>
         </div>
      </div>

      {/* BOTTOM CONTROLS: THE INTERACTIVE DOCK */}
      <div className="relative z-50 h-36 md:h-44 bg-black/60 border-t border-white/5 backdrop-blur-4xl flex items-center justify-center px-12 gap-20">
         
         <div className="flex items-center gap-10">
            <button 
              onClick={onToggleCamera}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-xl group"
            >
               <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
               <span className="text-[7px] orbitron font-black mt-1 uppercase">Switch_Optic</span>
            </button>
            <button className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-xl group">
               <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
            </button>
         </div>

         {/* CENTRAL VOICE WAVE: REACTIVE TO USER SPEECH */}
         <div className="flex-1 max-w-xl h-24 relative">
            <div className="absolute inset-0 flex items-center justify-center">
               <VoiceWave isActive={isOpen} isModelTalking={isModelTalking} themeColor="#06b6d4" />
            </div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] orbitron font-black text-cyan-800 uppercase tracking-[0.6em]">Listening_to_Sir...</div>
         </div>

         <div className="flex items-center gap-10">
            <button className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black transition-all shadow-xl group">
               <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button onClick={onClose} className="w-16 h-16 md:w-20 md:h-20 rounded-[2.5rem] bg-rose-600 text-white flex items-center justify-center shadow-[0_15px_40px_rgba(225,29,72,0.4)] hover:bg-rose-500 transition-all active:scale-90 group">
               <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67 19.42 19.42 0 0 1-2.67-3.34 19.79 19.79 0 0 1-3.07-8.62A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z" fill="currentColor"/><path d="M22 2L2 22" stroke="currentColor"/></svg>
            </button>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(500px); opacity: 0; }
        }
      `}} />
    </div>
  );
};
